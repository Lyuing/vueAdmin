import http from './http'

export interface Role {
  id: string
  name: string
  code: string
  description?: string
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface RoleMenuRelation {
  roleId: string
  roleName: string
  permissionCodes: string[]
}

/**
 * 获取所有角色
 */
export function getAllRoles(): Promise<{ data: Role[] }> {
  return http.get('/role/allRole')
}

/**
 * 创建角色
 */
export function createRole(role: Partial<Role>): Promise<{ data: Role }> {
  return http.post('/role', role)
}

/**
 * 更新角色
 */
export function updateRole(id: string, role: Partial<Role>): Promise<{ data: Role }> {
  return http.post('/role/update', { id, ...role })
}

/**
 * 删除角色
 */
export function deleteRole(id: string): Promise<void> {
  return http.post('/role/delete', { id })
}

/**
 * 获取角色的菜单权限
 */
export function getRoleMenus(roleId: string): Promise<{ data: RoleMenuRelation }> {
  return http.post('/role/roleMenus', { roleId })
}

/**
 * 保存角色的菜单权限
 */
export function saveRoleMenus(roleId: string, permissionCodes: string[]): Promise<void> {
  return http.post('/role/saveRoleMenus', { roleId, permissionCodes })
}
