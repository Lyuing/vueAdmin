<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <!-- <div class="menu-top">
      <el-radio-group v-model="showAll">
        <el-radio :value="0">{{ t('role.showAll') }}</el-radio>
        <el-radio :value="1">{{ t('role.showNavOnly') }}</el-radio>
      </el-radio-group>
    </div> -->
    <div v-loading="loading" class="menu-tree-container">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :check-strictly="false"
      >
        <template #default="{ node, data }">
          <span class="tree-node-label">
            <el-icon v-if="data.isButton" class="button-icon">
              <Open />
            </el-icon>
            <el-icon v-else-if="data.isApi" class="button-icon">
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
      <el-popover
        title=""
        :content="t('role.unshownPermissionTip')"
        placement="top"
        :disabled="!showAll || readOnly"
      >
        <template #reference>
          <el-button
            type="primary"
            :loading="saveLoading"
            :disabled="readOnly"
            @click="handleSubmit"
          >
            {{ t('common.save') }}
          </el-button>
        </template>
      </el-popover>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElTree } from 'element-plus'
import { Open, Operation } from '@element-plus/icons-vue'
import { getAllPermissions, getRolePermissions, saveRolePermissions } from '@/api/role'
import type { TreeNode, RolePermission } from '@/types/role'
import { checkKeepPermission } from '@/composables/usePermission'

const { t } = useI18n()

interface Props {
  visible: boolean
  roleId: number
  roleName: string
  readOnly: boolean
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
const saveLoading = ref(false)

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'label'
}

/**
 * 展示条件 - 当前版本仅支持菜单权限点
 * 0: 显示所有
 * 1: 显示导航
 */
const showAll = ref<0 | 1>(1)

// 标题
const title = computed(() => {
  const pre = props.readOnly ? t('role.viewPermission') : t('role.permission')
  return `${pre} - ${props.roleName}`
})

// 监听对话框打开，加载数据
watch(
  () => [props.visible, showAll.value],
  async newVal => {
    if (newVal && props.roleId) {
      await loadData()
    }
  }
)

// 加载菜单树和角色权限
async function loadData() {
  loading.value = true
  try {
    // 并行加载菜单树和角色权限
    const [treeResponse, rolePermissionsResponse] = await Promise.all([
      getAllPermissions(),
      getRolePermissions(props.roleId)
    ])
    // console.log('获取所有权限树:', treeResponse)

    // 格式化权限树为树形结构
    treeData.value = formatTree(treeResponse)
    // 使用 nextTick 确保树已渲染
    await new Promise(resolve => setTimeout(resolve, 0))
    // 父子节点独立，直接设置所有匹配的节点
    rolePermissionsResponse.forEach(permissionData => {
      treeRef.value?.setChecked(permissionData.id, true, false)
    })
  } catch (error) {
    console.error('加载菜单权限失败:', error)
    // ElMessage.error(t('role.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 将权限数据转换为树形结构（包含按钮权限点）
function formatTree(permissions: RolePermission[]): TreeNode[] {
  return permissions
    .map(permission => {
      const node: TreeNode = {
        ...permission,
        label: permission.name,
        permissionCode: permission.code,
        disabled: props.readOnly || checkKeepPermission(permission.code),
        isButton: permission.type === 'BUTTON',
        isApi: permission.type === 'API',
        children: permission.children?.length ? formatTree(permission.children) : undefined
      }
      if (showAll.value && (node.isApi || node.isButton)) return
      return node
    })
    .filter(i => !!i)
}

// 更新对话框状态
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

  saveLoading.value = true
  try {
    // 获取所有选中的节点（父子节点独立，不需要获取半选中）
    const checkedKeys = treeRef.value.getCheckedKeys() as number[]
    const checkedHalfKeys = treeRef.value.getHalfCheckedKeys() as number[]
    // console.log('选中权限ID:', checkedKeys)
    // console.log('路径上的权限ID:', checkedHalfKeys)
    const keys = new Set([...checkedKeys, ...checkedHalfKeys])

    // 保存角色菜单权限
    await saveRolePermissions(props.roleId, [...keys])

    ElMessage.success(t('role.permissionSaveSuccess'))
    emit('success')
    emit('update:visible', false)
  } catch (error) {
    console.error('保存菜单权限失败:', error)
    // ElMessage.error(t('common.saveFailed'))
  } finally {
    saveLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.menu-top {
  display: flex;
  justify-content: flex-end;
  margin-top: -12px;
  margin-bottom: 4px;
  padding-right: 8px;
}
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
</style>
