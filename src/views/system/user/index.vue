<template>
  <div class="user-page-container">
    <div class="user-page">
      <h2 class="flex flex-between">
        <span>{{ t('user.management') }}</span>
        <el-button type="primary" @click="handleCreate">
          <el-icon size="16" class="mr-1"><User /></el-icon>
          {{ t('user.add') }}
        </el-button>
      </h2>
      <div class="filter-header">
        <div class="flex gap-4 flex-1">
          <el-tree-select
            v-model="filter.departmentId"
            class="region-select"
            :data="regionTree"
            :placeholder="t('user.pleaseSelectDepartment')"
            clearable
            check-strictly
            :render-after-expand="false"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
          />
          <el-input
            v-model.trim="filter.keyword"
            class="search-input"
            :placeholder="t('user.pleaseSearchName')"
            :maxlength="20"
            @keyup.enter="handleSearch"
          />
        </div>
        <div>
          <el-button type="info" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button type="info" @click="handleReset">{{ t('common.reset') }}</el-button>
        </div>
      </div>

      <div v-loading="loading" class="card-wrap">
        <el-table :data="userList" class="flex-1">
          <el-table-column
            prop="username"
            :label="t('basic.username')"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column
            prop="realName"
            :label="t('basic.realName')"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="phone" :label="t('basic.phone')" width="150" />
          <el-table-column
            prop="departmentId"
            :label="t('basic.department')"
            min-width="180"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ getRegionName(row.departmentId) || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="type" :label="t('user.userType')" width="120" />
          <el-table-column :label="t('basic.role')" width="180">
            <template #default="{ row }">
              <el-tag
                v-for="role in row.roles"
                :key="role.id"
                size="small"
                class="tag-role"
                disable-transitions
              >
                {{ role.name || '--' }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="status" :label="t('common.status')" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
                {{ row.status === 'ACTIVE' ? t('common.active') : t('common.disabled') }}
              </el-tag>
            </template>
          </el-table-column> -->
          <el-table-column prop="updateTime" :label="t('common.updateTime')" width="180">
            <template #default="{ row }">
              {{ formatDate(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('user.ifEnabled')" width="150" fixed="right">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                size="small"
                active-value="ACTIVE"
                inactive-value="INACTIVE"
                @change="changeUserStatus(row)"
              />
              <el-tag
                size="small"
                class="cell-gap"
                :type="row.status === 'ACTIVE' ? 'success' : 'info'"
                @click="handleEdit(row)"
              >
                {{ row.status === 'ACTIVE' ? t('common.isActive') : t('common.isDisabled') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('common.actions')" width="220" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="warning" link @click="handleResetPassword(row)">
                {{ t('user.resetPassword') }}
              </el-button>
              <more-popover>
                <el-button type="primary" link @click="handleEdit(row)">
                  {{ t('common.edit') }}
                </el-button>
                <el-button type="danger" link @click="handleDelete(row)">
                  {{ t('common.delete') }}
                </el-button>
              </more-popover>
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

      <!-- 用户编辑对话框 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :user-data="currentUser"
        :role-list="roleList"
        :region-tree="regionTree"
        @save="handleSave"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, ElPagination } from 'element-plus'
import {
  getUsersList,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  resetPassword
} from '@/api/user'
import { getAllRoles } from '@/api/role'
// import { getRegionsTree } from '@/api/region'

import { type User } from '@/types/user'
import { type Role } from '@/types/role'
import { type RegionTreeNode } from '@/types/region'
import { usePaginationWithSearch } from '@/composables/usePaginationPro'

import UserDialog from '@/components/user/UserDialog.vue'
import MorePopover from '@/components/common/MorePopover.vue'

const { t } = useI18n()

// 查询
interface UserSearchParams {
  departmentId?: number
  keyword?: string
}
const filter = reactive<UserSearchParams>({
  departmentId: undefined,
  keyword: ''
})
// 分页
const {
  pagination,
  loading,
  dataList: userList,
  handleCurrentChange,
  handleSizeChange,
  handleSearch,
  handleReset,
  refreshData
} = usePaginationWithSearch<UserSearchParams, User>({
  searchParams: filter,
  fetchFunction: getUsersList
})

// 状态管理
// const userList = ref<User[]>([])   // 分页hooks 获取
const roleList = ref<Role[]>([])
const regionTree = ref<RegionTreeNode[]>([])
const regionIdMap = ref<Record<number, RegionTreeNode>>({})

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentUser = ref<User | null>(null)

// 初始化
onMounted(() => {
  loadRoleList()
  // loadRegionTree()
})

// 加载角色列表
async function loadRoleList() {
  try {
    const response = await getAllRoles()
    roleList.value = response
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// // 获取部门组织树
// async function loadRegionTree() {
//   try {
//     const response = await getRegionsTree()
//     const { map, nodes } = formatRegionTree(response)
//     regionTree.value = nodes || []
//     regionIdMap.value = map
//     // console.log('读取部门节点树', {...nodes}, {...map})
//   } catch (error) {
//     console.error('加载部门列表失败:', error)
//   }
// }
// // 构建组织id映射
// function formatRegionTree(
//   tree: RegionTreeNode[],
//   parent?: RegionTreeNode
// ): { map: Record<number, RegionTreeNode>; nodes: RegionTreeNode[] } {
//   const map: Record<number, RegionTreeNode> = {}
//   let nodes = tree.map(region => {
//     const node: RegionTreeNode = {
//       ...region,
//       parent
//     }
//     if (region.children?.length) {
//       const { map: subMap, nodes: subNodes } = formatRegionTree(region.children, node)
//       node.children = subNodes
//       Object.assign(map, subMap)
//     }
//     map[region.id] = node
//     return node
//   })

//   // 屏蔽根节点
//   if (!nodes[0]?.parentId) {
//     nodes = [...(nodes[0]?.children || [])]
//   }
//   return { map, nodes }
// }
// 获取部门名称
function getRegionLink(regionId: number): RegionTreeNode[] {
  const region = regionIdMap.value[regionId]
  if (!region) return []

  const regionLink = [region]
  let parent = region.parent
  while (parent) {
    regionLink.unshift(parent)
    parent = parent.parent
  }
  // 屏蔽根部门
  if (!regionLink[0]?.parentId) {
    regionLink.shift()
  }
  return regionLink
}

// 获取部门名称
function getRegionName(regionId: number): string {
  return getRegionLink(regionId)
    .map(region => region.name)
    .join(' / ')
}
// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
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

// 处理用户状态更新
async function changeUserStatus(user: User) {
  try {
    console.warn('更新用户状态:', user.id, user.status)
    await updateUserStatus(user.id, user.status === 'ACTIVE')
    ElMessage.success(t('user.updateSuccess'))
  } catch (error) {
    console.error('更新用户状态失败:', error)
    // ElMessage.error(t('user.updateStatusFailed'))
  }
  await refreshData()
}

// 处理删除用户
async function handleDelete(user: User) {
  try {
    await ElMessageBox.confirm(t('user.deleteConfirm'), t('user.delete'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })

    await deleteUser(user.id)
    ElMessage.success(t('user.deleteSuccess'))
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      // ElMessage.error(t('common.deleteFailed'))
    }
  }
}

// 处理保存用户
async function handleSave(userData: Partial<User>) {
  try {
    if (dialogMode.value === 'create') {
      await createUser(userData)
      ElMessage.success(t('user.createSuccess'))
    } else {
      await updateUser(userData)
      ElMessage.success(t('user.updateSuccess'))
    }

    dialogVisible.value = false
    await refreshData()
  } catch (error) {
    console.error('保存用户失败:', error)
    // ElMessage.error(t('common.saveFailed'))
  }
}

// 处理用户弹框取消
function handleCancel() {
  dialogVisible.value = false
}

/**
 * 处理重置密码
 */
async function handleResetPassword(user: User) {
  try {
    await ElMessageBox.confirm(t('user.resetPasswordConfirm'), t('user.resetPassword'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })

    await resetPassword(user.id)
    ElMessage.success(t('user.resetPasswordSuccess'))
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('密码重置失败:', error)
      // ElMessage.error(t('user.resetPasswordFailed'))
    }
  }
}
</script>

<style scoped lang="scss">
.user-page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: $spacing-8 $spacing-20 $spacing-20;
}
.user-page {
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
  flex: 1;
  display: flex;
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

.region-select {
  width: 120px;
}
.search-input {
  width: 400px;
}
.cell-gap {
  margin: 0 $spacing-8;
}
.tag-role {
  margin-right: $spacing-4;
  // max-width: 120px;
}

.paginationer {
  margin-top: $spacing-16;
  // justify-content: flex-end;
}
</style>
