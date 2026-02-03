<template>
  <div class="role-page-container">
    <div class="role-page">
      <h2 class="flex flex-between">
        <span>{{ t('role.management') }}</span>
        <el-button type="primary" @click="handleCreate">
          {{ t('role.add') }}
        </el-button>
      </h2>
      <div class="filter-header">
        <el-input
          v-model.trim="searchKeyword"
          class="search-input"
          :maxlength="20"
          :placeholder="t('role.searchPlaceholder')"
          @keyup.enter="handleSearch"
        />
        <div>
          <el-button type="info" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button type="info" @click="handleReset">{{ t('common.reset') }}</el-button>
        </div>
      </div>
      <div v-loading="loading" class="card-wrap">
        <el-table :data="roleList" class="flex-1">
          <el-table-column prop="name" :label="t('role.name')" width="150" show-overflow-tooltip />
          <!-- <el-table-column prop="code" :label="t('role.code')" width="150" /> -->
          <el-table-column
            prop="description"
            :label="t('role.description')"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column prop="userCount" :label="t('role.userCount')" width="100" />
          <!-- <el-table-column prop="status" :label="t('common.status')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
                {{ row.status === 'ACTIVE' ? t('common.active') : t('common.disabled') }}
              </el-tag>
            </template>
          </el-table-column> -->
          <el-table-column prop="roleType" :label="t('role.type')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.roleType === RoleType.SYSTEM ? 'info' : 'primary'">
                {{ row.roleType === RoleType.SYSTEM ? t('role.systemRole') : t('role.customRole') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('common.actions')" width="250" fixed="right">
            <template #default="{ row }">
              <template v-if="row.roleType !== RoleType.SYSTEM">
                <el-button size="small" type="primary" link @click="handleEdit(row)">
                  {{ t('common.edit') }}
                </el-button>
                <el-button size="small" type="warning" link @click="handlePermission(row)">
                  {{ t('role.permission') }}
                </el-button>
                <el-popover title="" placement="top" :disabled="!row.userCount">
                  <p>{{ t('role.userBindTip', { count: row.userCount }) }}</p>
                  <template #reference>
                    <el-button
                      size="small"
                      type="danger"
                      link
                      :disabled="!!row.userCount"
                      @click="handleDelete(row)"
                    >
                      {{ t('common.delete') }}
                    </el-button>
                  </template>
                </el-popover>
              </template>
              <template v-else>
                <el-button size="small" type="primary" link disabled>
                  {{ t('common.edit') }}
                </el-button>
                <el-button size="small" type="warning" link @click="handlePermission(row, true)">
                  {{ t('role.viewPermission') }}
                </el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          background
          class="paginationer"
          :current-page="pagination.currentPage"
          :total="pagination.totalElements"
          :page-sizes="pagination.pageSizes"
          :page-size="pagination.pageSize"
          :layout="pagination.layout"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>

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
        :role-id="currentRoleForPerm?.id || 0"
        :role-name="currentRoleForPerm?.name || ''"
        :read-only="readonlyPermissions"
        @success="handlePermissionSuccess"
        @cancel="handlePermissionCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRolesList, createRole, updateRole, deleteRole } from '@/api/role'
import { type Role, RoleType } from '@/types/role'
import { usePagination } from '@/composables/usePagination'

import RoleDialog from '@/components/role/RoleDialog.vue'
import MenuPermissionDialog from '@/components/role/MenuPermissionDialog.vue'

const { t } = useI18n()
const {
  pagination,
  serializeParams,
  handleCurrentChange,
  handleSizeChange,
  updatePagination,
  resetPagination
} = usePagination({
  onChange: fetchRoleList
})

// 状态管理
const roleList = ref<Role[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentRole = ref<Role | null>(null)
const menuPermDialogVisible = ref(false)
const currentRoleForPerm = ref<Role | null>(null)
// 角色权限 - 只读
const readonlyPermissions = ref<boolean>(false)

// 初始化
onMounted(() => {
  fetchRoleList()
})

// 查询
const searchKeyword = ref('')
function handleSearch() {
  fetchRoleList()
}
function handleReset() {
  searchKeyword.value = ''
  resetPagination()
}
// 加载角色列表
async function fetchRoleList() {
  loading.value = true
  try {
    const response = await getRolesList({
      keyword: searchKeyword.value,
      ...serializeParams()
    })
    roleList.value = response.list
    updatePagination(response)
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    loading.value = false
  }
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
  const userCount = role.userCount || 0

  try {
    await ElMessageBox.confirm(t('role.deleteConfirm', { count: userCount }), t('role.delete'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })

    await deleteRole(role.id)
    ElMessage.success(t('role.deleteSuccess'))
    await fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
    }
  }
}

// 处理配置权限
function handlePermission(role: Role, readonly?: boolean) {
  currentRoleForPerm.value = role
  menuPermDialogVisible.value = true
  readonlyPermissions.value = !!readonly
}

// 处理保存角色
async function handleSave(roleData: Partial<Role>) {
  try {
    if (dialogMode.value === 'create') {
      await createRole(roleData)
      ElMessage.success(t('role.createSuccess'))
    } else {
      await updateRole(roleData.id!, roleData)
      ElMessage.success(t('role.updateSuccess'))
    }

    dialogVisible.value = false
    await fetchRoleList()
  } catch (error) {
    console.error('保存角色失败:', error)
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
.role-page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: $spacing-8 $spacing-20 $spacing-20;
}
.role-page {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  h2 {
    margin: $spacing-12 0;
    font-size: 24px;
    font-weight: var(--font-weight-bold);
    color: var(--text-color-base);
  }
}
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-16;
}

.card-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  :deep(.el-card__body) {
    padding: $spacing-16;
    height: 100%;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.search-input {
  width: 400px;
}

.paginationer {
  margin-top: $spacing-16;
  // justify-content: flex-end;
}
</style>
