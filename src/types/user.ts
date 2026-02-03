import type { Role } from './role'

// 账号用户 信息
export interface UserInfo {
  userId: number
  username: string
  permissions: string[]
  menus?: any[] // 用户菜单配置
  roles: string[]
  departmentId?: number
  email?: string
  realName?: string
  sessionId?: string
  avatar?: string // 用户头像 - 暂无
}
// 用户列表 信息
export interface User {
  id: number
  username: string
  realName: string
  buttonPermissions: null
  creator?: string
  departmentId?: number
  menus?: null
  password?: string
  passwordExpireTime?: string
  roles?: Role[]
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  createTime?: string
  updateTime?: string
  updator?: string
  phone?: string
  email?: string
  avatar?: string
}

export interface LoginRequest {
  usernameOrEmail: string
  password: string
  clientId: string
  preferredLanguage?: string
}

// 登录返回数据
export type LoginResponse = {
  accessToken: string
  userId: number
  username: string
  permissions: string[]
  menuTree: any[] // 用户菜单配置
  roles: string[]
  realName?: string
  departmentId?: number
  email?: string
  sessionId?: string
}

// 获取当前用户接口返回数据
export interface CurrentResponse {
  id: number
  username: string
  permissions: string[]
  roles: string[]
  allMenuTree?: any[] // 用户菜单配置
  departmentId?: number
  email?: string
  realName?: string
  phone?: string
  status?: string
  createTime?: string
  updateTime?: string
}
