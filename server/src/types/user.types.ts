export interface UserInfo {
  id: string
  username: string
  password: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  roles: string[]
  // 移除 permissions 字段，权限通过角色动态计算
  createdAt: string
  updatedAt: string
}

// 用户信息响应类型，包含动态计算的权限
export interface UserInfoResponse extends Omit<UserInfo, 'password'> {
  permissions: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresIn: number
  userInfo: UserInfoResponse
}
