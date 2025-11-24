import http from '@/utils/http'
import type { LoginRequest, LoginResponse } from '@/types/user'

/**
 * 登录 - Mock实现
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  // Mock登录逻辑，实际项目中应该调用真实API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.username === 'admin' && data.password === '123456') {
        resolve({
          token: 'mock-token-' + Date.now(),
          expiresIn: 7200,
          userInfo: {
            id: '1',
            username: 'admin',
            nickname: '管理员',
            avatar: '',
            email: 'admin@example.com',
            phone: '13800138000',
            roles: ['admin'],
            permissions: [
              'home:view',
              'dashboard:view',
              'system:view',
              'system:user:view',
              'system:role:view',
              'system:menu:view'
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 1000)
  })
  // 真实API调用
  // return http.post<LoginResponse>('/auth/login', data)
}

/**
 * 登出 - Mock实现
 */
export function logout(): Promise<void> {
  // Mock登出逻辑
  return Promise.resolve()
  // 真实API调用
  // return http.post('/auth/logout')
}

/**
 * 刷新token
 */
export function refreshToken(refreshToken: string) {
  return http.post<{ token: string }>('/auth/refresh', { refreshToken })
}
