import http from './http'
import type { LoginRequest, LoginResponse } from '@/types/user'

/**
 * 登录
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/login', data)
}

/**
 * 登出
 */
export function logout(): Promise<void> {
  return http.post('/auth/logout')
}

/**
 * 刷新token
 */
export function refreshToken(refreshToken: string) {
  return http.post<{ token: string }>('/auth/refresh', { refreshToken })
}
