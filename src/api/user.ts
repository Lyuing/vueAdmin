import type { UserInfo } from '@/types/user'

/**
 * 获取用户信息 - Mock实现
 */
export function getUserInfo(): Promise<UserInfo> {
  // Mock实现
  return Promise.resolve({
    id: '1',
    username: 'admin',
    nickname: '管理员',
    avatar: '',
    email: 'admin@example.com',
    phone: '13800138000',
    roles: ['admin'],
    permissions: ['home:view', 'dashboard:view', 'system:view'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  // 真实API调用
  // return http.get<UserInfo>('/user/info')
}

/**
 * 更新用户信息 - Mock实现
 */
export function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  // Mock实现
  return Promise.resolve({
    id: '1',
    username: 'admin',
    nickname: '管理员',
    ...data,
    roles: ['admin'],
    permissions: ['home:view', 'dashboard:view', 'system:view'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as UserInfo)
  // 真实API调用
  // return http.put<UserInfo>('/user/info', data)
}
