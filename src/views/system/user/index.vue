<template>
  <div class="user-page">
    <h2>{{ t('user.management') }}</h2>
    
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ t('user.list') }}</span>
          <el-button type="primary" @click="handleCreate">
            {{ t('user.add') }}
          </el-button>
        </div>
      </template>
      
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="username" :label="t('user.form.username')" width="150" />
        <el-table-column :label="t('user.form.roles')" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="roleId in row.roles"
              :key="roleId"
              size="small"
              style="margin-right: 5px"
            >
              {{ getRoleName(roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('user.form.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? t('common.active') : t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('common.createdAt')" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户编辑对话框 -->
    <UserDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :user-data="currentUser"
      :role-list="roleList"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllUsers, createUser, updateUser, deleteUser, type User } from '@/api/user'
import { getAllRoles, type Role } from '@/api/role'
import UserDialog from '@/components/user/UserDialog.vue'

const { t } = useI18n()

// 状态管理
const userList = ref<User[]>([])
const roleList = ref<Role[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentUser = ref<User | null>(null)

// 初始化
onMounted(() => {
  loadUserList()
  loadRoleList()
})

// 加载用户列表
async function loadUserList() {
  loading.value = true
  try {
    const response = await getAllUsers()
    userList.value = response.data
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error(t('user.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 加载角色列表
async function loadRoleList() {
  try {
    const response = await getAllRoles()
    roleList.value = response.data
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 获取角色名称
function getRoleName(roleId: string): string {
  const role = roleList.value.find(r => r.id === roleId)
  return role ? role.name : roleId
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理创建用户
function handleCreate() {
  dialogMode.value = 'create'
  currentUser.value = null
  dialogVisible.value = true
}

// 处理编辑用户
function handleEdit(user: User) {
  dialogMode.value = 'edit'
  currentUser.value = user
  dialogVisible.value = true
}

// 处理删除用户
async function handleDelete(user: User) {
  try {
    await ElMessageBox.confirm(
      t('user.deleteConfirm'),
      t('user.delete'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await deleteUser(user.id)
    ElMessage.success(t('user.message.deleteSuccess'))
    await loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(t('common.deleteFailed'))
    }
  }
}

// 处理保存用户
async function handleSave(userData: Partial<User>) {
  try {
    if (dialogMode.value === 'create') {
      await createUser(userData)
      ElMessage.success(t('user.message.createSuccess'))
    } else {
      await updateUser(userData.id!, userData)
      ElMessage.success(t('user.message.updateSuccess'))
    }
    
    dialogVisible.value = false
    await loadUserList()
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error(t('common.saveFailed'))
  }
}

// 处理取消
function handleCancel() {
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.user-page {
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
