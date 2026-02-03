export interface Role {
  id: number
  name: string
  code: string
}

export interface User {
  id: string
  username: string
  password: string
  realName: string
  avatar?: string
  email?: string
  phone?: string
  roles: Role[]
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  createdTime: string
  updateTime: string
}

export interface UserCreateInput {
  username: string
  password: string
  realName: string
  avatar?: string
  email?: string
  phone?: string
  roles?: Role[]
  roleIds?: number[] // 支持前端传递角色ID数组
}

export interface UserUpdateInput {
  id: string
  username?: string
  realName?: string
  avatar?: string
  email?: string
  phone?: string
  roles?: Role[]
  roleIds?: number[] // 支持前端传递角色ID数组
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
}

export interface CurrentUserResponse {
  id: number
  username: string
  permissions: string[]
  roles: string[]
  allMenuTree?: any[]
  departmentId?: number
  email?: string
  realName?: string
  phone?: string
  status?: string
  createTime?: string
  updateTime?: string
}
