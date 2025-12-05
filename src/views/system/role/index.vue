<template>
  <div class="role-page">
    <h2>{{ t('role.management') }}</h2>
    
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ t('role.list') }}</span>
          <el-button type="primary" @click="handleCreate">
            {{ t('role.add') }}
          </el-button>
        </div>
      </template>
      
      <el-table :data="roleList" style="width: 100%">
        <el-table-column prop="name" :label="t('role.form.name')" width="150" />
        <el-table-column prop="code" :label="t('role.form.code')" width="150" />
        <el-table-column prop="description" :label="t('role.form.description')" min-width="200" />
        <el-table-column :label="t('role.userCount')" width="100">
          <template #default="{ row }">
            {{ getUserCount(row.id) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('role.form.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? t('common.active') : t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button size="small" type="warning" @click="handlePermission(row)">
              {{ t('role.permission') }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色编辑对话框 -->
    <RoleDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :role-data="currentRole"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <!-- 菜单权限配置对话框 -->
    <MenuPermissionDialog
      v-model:visible="menuPermDialogVisible"
      :role-id="currentRoleForPerm?.id || ''"
      :role-name="currentRoleForPerm?.name || ''"
      @success="handlePermissionSuccess"
      @cancel="handlePermissionCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllRoles, createRole, updateRole, deleteRole, type Role } from '@/api/role'
import { getAllUsers, type User } from '@/api/user'
import RoleDialog from '@/components/role/RoleDialog.vue'
import MenuPermissionDialog from '@/components/role/MenuPermissionDialog.vue'

const { t } = useI18n()

// 状态管理
const roleList = ref<Role[]>([])
const userList = ref<User[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentRole = ref<Role | null>(null)
const menuPermDialogVisible = ref(false)
const currentRoleForPerm = ref<Role | null>(null)

// 初始化
onMounted(() => {
  loadRoleList()
  loadUserList()
})

// 加载角色列表
async function loadRoleList() {
  loading.value = true
  try {
    const response = await getAllRoles()
    roleList.value = response.data
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error(t('role.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 加载用户列表（用于统计用户数）
async function loadUserList() {
  try {
    const response = await getAllUsers()
    userList.value = response.data
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 获取角色的用户数量
function getUserCount(roleId: string): number {
  return userList.value.filter(user => user.roles.includes(roleId)).length
}

// 处理创建角色
function handleCreate() {
  dialogMode.value = 'create'
  currentRole.value = null
  dialogVisible.value = true
}

// 处理编辑角色
function handleEdit(role: Role) {
  dialogMode.value = 'edit'
  currentRole.value = role
  dialogVisible.value = true
}

// 处理删除角色
async function handleDelete(role: Role) {
  const userCount = getUserCount(role.id)
  
  try {
    await ElMessageBox.confirm(
      t('role.deleteConfirm', { count: userCount }),
      t('role.delete'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await deleteRole(role.id)
    ElMessage.success(t('role.message.deleteSuccess'))
    await loadRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error(t('common.deleteFailed'))
    }
  }
}

// 处理配置权限
function handlePermission(role: Role) {
  currentRoleForPerm.value = role
  menuPermDialogVisible.value = true
}

// 处理保存角色
async function handleSave(roleData: Partial<Role>) {
  try {
    if (dialogMode.value === 'create') {
      await createRole(roleData)
      ElMessage.success(t('role.message.createSuccess'))
    } else {
      await updateRole(roleData.id!, roleData)
      ElMessage.success(t('role.message.updateSuccess'))
    }
    
    dialogVisible.value = false
    await loadRoleList()
  } catch (error) {
    console.error('保存角色失败:', error)
    ElMessage.error(t('common.saveFailed'))
  }
}

// 处理取消
function handleCancel() {
  dialogVisible.value = false
}

// 处理权限保存成功
function handlePermissionSuccess() {
  menuPermDialogVisible.value = false
}

// 处理权限配置取消
function handlePermissionCancel() {
  menuPermDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.role-page {
  padding: 20px;
  
  h2 {
    margin: 0 0 20px;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.el-card) {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  :deep(.el-table) {
    .el-button + .el-button {
      margin-left: 8px;
    }
  }

  // 响应式布局
  @media (max-width: 768px) {
    padding: 10px;
    
    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }

    :deep(.el-table) {
      font-size: 12px;

      .el-button {
        padding: 5px 10px;
        font-size: 12px;
      }
    }
  }
}
</style>
