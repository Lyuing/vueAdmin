import http from './http'
import type { LoginRequest, LoginResponse } from '@/types/user'

/**
 * 获取公钥
 */
export function fetchPublicKey(): Promise<LoginResponse> {
  return http.get<LoginResponse>('/rsa/public-key')
}
/**
 * 登录
 */
export function signin(data: LoginRequest): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/signin', data, { showMessage: false })
}

/**
 * 登录
 */
export function login(data: { username: string; password: string }): Promise<LoginResponse> {
  return http.post<LoginResponse>('/auth/login', data)
}

/**
 * 登出
 */
export function logout(): Promise<void> {
  return http.post('/auth/logout')
}

/**
 * 获取验证码
 */
export function generateCaptcha(account?: string) {
  return http.post<{ image: string; captchaId: string }>('/auth/captcha/generate', {
    identifier: account || '',
    scene: 'login'
  })
}
/**
 * 验证验证码
 */
export function validateCaptcha(captchaText: string, captchaId: string, account?: string) {
  return http.post<{ valid: boolean }>('/auth/captcha/validate', {
    captchaText,
    captchaId,
    identifier: account || ''
  })
}
