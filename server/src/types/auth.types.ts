export interface LoginRequest {
  username: string
  password: string
  captchaText?: string
  captchaId?: string
}

export interface LoginResponse {
  accessToken: string
  userId: number
  username: string
  permissions: string[]
  menuTree: any[]
  roles: string[]
  realName?: string
  departmentId?: number
  email?: string
  sessionId?: string
}

export interface TokenPayload {
  userId: string
  username: string
  roles: string[]
}

export interface CaptchaGenerateRequest {
  identifier?: string
  scene?: string
}

export interface CaptchaValidateRequest {
  captchaText: string
  captchaId: string
  identifier?: string
}
