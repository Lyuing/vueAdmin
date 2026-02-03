import http from './http'
import type { CurrentResponse, User } from '@/types/user'
import type { PageRequest, PageResponse } from '@/types/api'

/**
 * 用户接口
 */
// 账号用户信息
export function getCurrentUser(): Promise<CurrentResponse> {
  return http.get('/users/v1/me')
}

// 获取所有用户（管理员）
export function getAllUsers(): Promise<User[]> {
  return http.get('/users/v1')
}

// 查询所有用户-分页（管理员）
export function getUsersList(
  options?: PageRequest<{
    keyword?: string
    departmentId?: number
  }>
): Promise<PageResponse<User>> {
  return http.get('/users/v1/page', options)
}
// 获取部门用户（管理员）
export function getRegionUsers(departmentId: number): Promise<User[]> {
  return http.get('/users/v1/by-department', { departmentId })
}
// 删除用户（管理员）
export function deleteUser(id: number): Promise<void> {
  return http.post('/users/v1/delete?id=' + id)
}

// 创建用户（管理员）
export function createUser(user: Partial<User>): Promise<User> {
  return http.post('/users/v1', user)
}

// 更新用户（管理员）
export function updateUser(user: Partial<User>): Promise<User> {
  return http.post(`/users/v1/update`, user)
}

// 更新用户状态（管理员）
export function updateUserStatus(id: number, status: boolean): Promise<User> {
  const path = status ? `/users/v1/enable?id=${id}` : `/users/v1/disable?id=${id}`
  return http.post(path)
}

// 重置密码（管理员）
export function resetPassword(id: number): Promise<User> {
  return http.post(`/users/v1/reset-password?id=${id}`)
}

// 修改密码（管理员）
export function changePassword(id: number, newPassword: string, clientId: string): Promise<User> {
  return http.post(
    `/users/v1/change-password`,
    {
      id,
      newPassword,
      clientId
    },
    { showMessage: false }
  )
}

// 更新多语言
export function changeLanguage(language: string): Promise<any> {
  return http.post(`/users/v1/change-language?language=${language}`, { language })
}
