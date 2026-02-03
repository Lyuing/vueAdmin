import http from './http'
import type { Role, RolePermission } from '@/types/role'
import type { PageRequest, PageResponse } from '@/types/api'

/**
 * 角色
 */
// 获取所有角色
export function getAllRoles(): Promise<Role[]> {
  return http.get('/roles/v1')
}
// 查询所有角色-分页
export function getRolesList(
  options?: PageRequest<{
    keyword?: string
  }>
): Promise<PageResponse<Role>> {
  return http.get('/roles/v1/page', options)
}

// 创建
export function createRole(role: Partial<Role>): Promise<Role> {
  return http.post('/roles/v1', role)
}

// 更新
export function updateRole(id: number, role: Partial<Role>): Promise<{ data: Role }> {
  return http.post('/roles/v1/update', { id, ...role })
}

// 删除
export function deleteRole(id: number): Promise<void> {
  return http.post('/roles/v1/delete?id=' + id)
}

// 获取完整权限
export function getAllPermissions(): Promise<RolePermission[]> {
  return http.get('/permissions/v1/tree')
}
// 获取角色权限
export function getRolePermissions(roleId: number): Promise<RolePermission[]> {
  return http.get('/permissions/v1/fetchByRole', { roleId })
}
// 保存角色权限
export function saveRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
  return http.post('/permissions/v1/batch-save', { roleId, permissionIds })
}
