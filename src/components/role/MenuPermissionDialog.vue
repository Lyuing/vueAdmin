<template>
  <el-dialog
    :model-value="visible"
    :title="`${t('role.permission')} - ${roleName}`"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <div v-loading="loading" class="menu-tree-container">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :check-strictly="true"
      >
        <template #default="{ node, data }">
          <span class="tree-node-label">
            <el-icon v-if="data.isButton" class="button-icon">
              <Operation />
            </el-icon>
            <span>{{ node.label }}</span>
            <el-tag v-if="data.permissionCode" size="small" type="info" class="permission-tag">
              {{ data.permissionCode }}
            </el-tag>
          </span>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        {{ t('common.save') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElTree } from 'element-plus'
import { Operation } from '@element-plus/icons-vue'
import { getAllMenus } from '@/api/menu'
import { getRoleMenus, saveRoleMenus } from '@/api/role'
import type { MenuConfig, TreeNode } from '@/types/navigation'

const { t } = useI18n()

interface Props {
  visible: boolean
  roleId: string
  roleName: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const treeRef = ref<InstanceType<typeof ElTree>>()
const treeData = ref<TreeNode[]>([])
const loading = ref(false)
const saving = ref(false)

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 将菜单数据转换为树形结构（包含按钮权限点）
function transformMenusToTree(menus: MenuConfig[]): TreeNode[] {
  return menus.map(menu => {
    const node: TreeNode = {
      id: menu.id,
      label: menu.title,
      permissionCode: menu.permissionCode,
      children: []
    }
    
    // 添加按钮权限点作为子节点
    if (menu.buttonPermissions && menu.buttonPermissions.length > 0) {
      const buttonNodes = menu.buttonPermissions.map(btn => ({
        id: btn.code,
        label: btn.name,
        permissionCode: btn.code,
        isButton: true
      }))
      node.children = buttonNodes
    }
    
    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      const childMenuNodes = transformMenusToTree(menu.children)
      node.children = [...(node.children || []), ...childMenuNodes]
    }
    
    return node
  })
}

// 监听对话框打开，加载数据
watch(() => props.visible, async (newVal) => {
  if (newVal && props.roleId) {
    await loadData()
  }
})

// 加载菜单树和角色权限
async function loadData() {
  loading.value = true
  try {
    // 并行加载菜单树和角色权限
    const [menusResponse, roleMenusResponse] = await Promise.all([
      getAllMenus(),
      getRoleMenus(props.roleId)
    ])

    // 转换为树形结构
    treeData.value = transformMenusToTree(menusResponse.data)
    
    console.log('角色权限数据:', roleMenusResponse.data)
    console.log('树形数据:', treeData.value)
    
    // 设置选中的节点（根据权限码）
    if (roleMenusResponse.data.permissionCodes && roleMenusResponse.data.permissionCodes.length > 0) {
      // 使用 nextTick 确保树已渲染
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 收集所有需要选中的节点ID（包括页面和按钮权限点）
      const nodesToCheck = collectNodesToCheck(treeData.value, roleMenusResponse.data.permissionCodes)
      console.log('需要选中的节点:', nodesToCheck)
      
      // 父子节点独立，直接设置所有匹配的节点
      treeRef.value?.setCheckedKeys(nodesToCheck, false)
    }
  } catch (error) {
    console.error('加载菜单权限失败:', error)
    ElMessage.error(t('role.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 收集需要选中的节点ID
function collectNodesToCheck(nodes: TreeNode[], permissionCodes: string[]): string[] {
  const nodeIds: string[] = []
  
  function traverse(items: TreeNode[]) {
    for (const item of items) {
      if (item.permissionCode && permissionCodes.includes(item.permissionCode)) {
        nodeIds.push(item.id)
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  
  traverse(nodes)
  return nodeIds
}

// 更新显示状态
function handleUpdateVisible(value: boolean) {
  emit('update:visible', value)
}

// 关闭对话框
function handleClose() {
  // 清空选中状态
  treeRef.value?.setCheckedKeys([], false)
  treeData.value = []
}

// 取消
function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

// 提交保存
async function handleSubmit() {
  if (!treeRef.value) return

  saving.value = true
  try {
    // 获取所有选中的节点（父子节点独立，不需要获取半选中）
    const checkedKeys = treeRef.value.getCheckedKeys() as string[]

    console.log('选中的节点ID:', checkedKeys)

    // 提取权限码（包括页面权限点和按钮权限点）
    const permissionCodes = extractPermissionCodes(treeData.value, checkedKeys)
    
    console.log('转换后的权限码:', permissionCodes)

    // 保存角色菜单权限
    await saveRoleMenus(props.roleId, permissionCodes)
    
    ElMessage.success(t('role.message.permissionSaveSuccess'))
    emit('success')
    emit('update:visible', false)
  } catch (error) {
    console.error('保存菜单权限失败:', error)
    ElMessage.error(t('common.saveFailed'))
  } finally {
    saving.value = false
  }
}

// 提取权限码
function extractPermissionCodes(nodes: TreeNode[], selectedIds: string[]): string[] {
  const permissionCodes: string[] = []
  
  function traverse(items: TreeNode[]) {
    for (const item of items) {
      if (selectedIds.includes(item.id) && item.permissionCode) {
        permissionCodes.push(item.permissionCode)
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  
  traverse(nodes)
  return permissionCodes
}
</script>

<style scoped lang="scss">
.menu-tree-container {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 15px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background-color: var(--el-fill-color-blank);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color-dark);
    border-radius: 3px;
  }
}

.tree-node-label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.button-icon {
  color: var(--el-color-success);
}

.permission-tag {
  margin-left: auto;
}

:deep(.el-tree) {
  background-color: transparent;

  .el-tree-node {
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .el-tree-node__content {
    height: 36px;
    line-height: 36px;
    padding: 0 8px;
    border-radius: 4px;
  }

  .el-tree-node__label {
    font-size: 14px;
    flex: 1;
  }
}

:deep(.el-dialog) {
  border-radius: 8px;
  
  .el-dialog__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

// 响应式布局
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;
  }

  .menu-tree-container {
    max-height: 400px;
    padding: 10px;
  }
}
</style>
