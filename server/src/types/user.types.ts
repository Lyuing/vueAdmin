export interface UserInfo {
  id: string
  username: string
  password: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresIn: number
  userInfo: Omit<UserInfo, 'password'>
}
