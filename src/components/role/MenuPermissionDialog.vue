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
        :data="menuTreeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :check-strictly="false"
      />
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
import { getAllMenus } from '@/api/menu'
import { getRoleMenus, saveRoleMenus } from '@/api/role'
import type { MenuConfig } from '@/types/navigation'

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
const menuTreeData = ref<MenuConfig[]>([])
const loading = ref(false)
const saving = ref(false)

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'title'
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

    menuTreeData.value = menusResponse.data
    
    console.log('角色权限数据:', roleMenusResponse.data)
    
    // 设置选中的菜单节点（根据权限码）
    if (roleMenusResponse.data.permissionCodes && roleMenusResponse.data.permissionCodes.length > 0) {
      // 使用 nextTick 确保树已渲染
      await new Promise(resolve => setTimeout(resolve, 0))
      // 根据权限码找到对应的菜单ID，只设置叶子节点为选中状态
      const menuIds = getMenuIdsByPermissionCodes(menuTreeData.value, roleMenusResponse.data.permissionCodes)
      console.log('权限码:', roleMenusResponse.data.permissionCodes)
      console.log('转换后的菜单ID:', menuIds)
      const leafMenuIds = getLeafMenuIds(menuTreeData.value, menuIds)
      console.log('叶子节点ID:', leafMenuIds)
      treeRef.value?.setCheckedKeys(leafMenuIds, false)
    }
  } catch (error) {
    console.error('加载菜单权限失败:', error)
    ElMessage.error(t('role.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 根据权限码获取菜单ID列表
function getMenuIdsByPermissionCodes(menus: MenuConfig[], permissionCodes: string[]): string[] {
  const menuIds: string[] = []
  
  function traverse(items: MenuConfig[]) {
    for (const item of items) {
      if (item.permissionCode && permissionCodes.includes(item.permissionCode)) {
        menuIds.push(item.id)
      }
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  
  traverse(menus)
  return menuIds
}

// 获取叶子节点的菜单ID
function getLeafMenuIds(menus: MenuConfig[], checkedIds: string[]): string[] {
  const leafIds: string[] = []
  
  function traverse(items: MenuConfig[]) {
    for (const item of items) {
      if (checkedIds.includes(item.id)) {
        // 如果没有子节点或子节点为空，则为叶子节点
        if (!item.children || item.children.length === 0) {
          leafIds.push(item.id)
        }
      }
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  
  traverse(menus)
  return leafIds
}

// 更新显示状态
function handleUpdateVisible(value: boolean) {
  emit('update:visible', value)
}

// 关闭对话框
function handleClose() {
  // 清空选中状态
  treeRef.value?.setCheckedKeys([], false)
  menuTreeData.value = []
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
    // 获取所有选中的节点（包括半选中的父节点）
    const checkedKeys = treeRef.value.getCheckedKeys() as string[]
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys() as string[]
    const allSelectedMenuIds = [...checkedKeys, ...halfCheckedKeys]

    console.log('选中的菜单ID:', allSelectedMenuIds)

    // 将菜单ID转换为权限码
    const permissionCodes = getPermissionCodesByMenuIds(menuTreeData.value, allSelectedMenuIds)
    
    console.log('转换后的权限码:', permissionCodes)

    // 保存角色菜单权限（传递权限码）
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

// 根据菜单ID获取权限码列表
function getPermissionCodesByMenuIds(menus: MenuConfig[], menuIds: string[]): string[] {
  const permissionCodes: string[] = []
  
  function traverse(items: MenuConfig[]) {
    for (const item of items) {
      if (menuIds.includes(item.id) && item.permissionCode) {
        permissionCodes.push(item.permissionCode)
      }
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  
  traverse(menus)
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
