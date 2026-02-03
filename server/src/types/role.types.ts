export interface Permission {
  permissionId: number
  permissionCode: string
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  userCount?: number
  createdTime: string
  updateTime: string
  permissions: Permission[]
}

export interface RoleCreateInput {
  name: string
  code: string
  description?: string
  permissions?: Permission[]
}

export interface RoleUpdateInput {
  id: number
  name?: string
  code?: string
  description?: string
  permissions?: Permission[]
}

export interface RoleMenuConfig {
  roleId: number
  roleName: string
  permissions: Permission[]
}

export interface RolePermission {
  id: number
  code: string
  name: string
  category: 'FUNCTION' | 'DATA'
  children: RolePermission[]
  type: 'API' | 'BUTTON' | 'MENU'
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  parentId?: number
  createTime?: string
  description?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  sort?: number
  updateTime?: string
  url?: string
}
