import { userRepository } from '../repositories/user.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { UserInfo } from '../types/user.types.js'

export class UserService {
  async getUserById(userId: string): Promise<Omit<UserInfo, 'password'> | null> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      return null
    }

    const { password, ...userInfo } = user
    return userInfo
  }

  async updateUser(userId: string, data: Partial<UserInfo>): Promise<Omit<UserInfo, 'password'>> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    const allowedFields: (keyof UserInfo)[] = ['nickname', 'avatar', 'email', 'phone']
    const updates: any = {}
    
    for (const field of allowedFields) {
      if (field in data) {
        updates[field] = data[field]
      }
    }

    updates.updatedAt = new Date().toISOString()

    const updated = await userRepository.update(userId, updates)
    
    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    const { password, ...userInfo } = updated
    return userInfo
  }
}

export const userService = new UserService()
