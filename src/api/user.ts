import http from './http'
import type { UserInfo } from '@/types/user'

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return http.get<UserInfo>('/user/info')
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return http.put<UserInfo>('/user/info', data)
}
