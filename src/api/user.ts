import http from './http'

export interface User {
  id: string
  username: string
  password?: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  roles: string[]
  permissions: string[]
  status?: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

/**
 * 获取所有用户（管理员）
 */
export function getAllUsers(): Promise<{ data: User[] }> {
  return http.get('/user/allUsers')
}

/**
 * 创建用户（管理员）
 */
export function createUser(user: Partial<User>): Promise<{ data: User }> {
  return http.post('/user', user)
}

/**
 * 更新用户（管理员）
 */
export function updateUser(id: string, user: Partial<User>): Promise<{ data: User }> {
  return http.post('/user/update', { id, ...user })
}

/**
 * 删除用户（管理员）
 */
export function deleteUser(id: string): Promise<void> {
  return http.post('/user/delete', { id })
}

/**
 * 获取当前用户信息（包含最新权限）
 */
export function getCurrentUser(): Promise<{ data: User }> {
  return http.get('/user/userInfo')
}
