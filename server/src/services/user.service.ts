import { userRepository } from '../repositories/user.repository.js'
import { roleRepository } from '../repositories/role.repository.js'
import { roleMenuRepository } from '../repositories/role-menu.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { UserInfo, UserInfoResponse } from '../types/user.types.js'

export class UserService {
  // 根据角色计算用户权限（支持多角色权限合并和去重）
  private async calculatePermissions(roles: string[]): Promise<string[]> {
    const permissionSet = new Set<string>()
    
    for (const roleId of roles) {
      try {
        const roleMenus = await roleMenuRepository.findByRoleId(roleId)
        if (roleMenus && roleMenus.permissionCodes) {
          roleMenus.permissionCodes.forEach(code => permissionSet.add(code))
        }
      } catch (error) {
        console.error(`获取角色 ${roleId} 权限失败:`, error)
        // 继续处理其他角色，不阻断流程
      }
    }
    
    return Array.from(permissionSet)
  }

  async getUserById(userId: string): Promise<UserInfoResponse | null> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      return null
    }

    // 动态计算权限
    const permissions = await this.calculatePermissions(user.roles)
    
    const { password, ...userInfo } = user
    return {
      ...userInfo,
      permissions
    }
  }

  // 获取当前用户信息（包含最新的权限）
  async getCurrentUser(userId: string): Promise<UserInfoResponse> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 动态计算权限，确保获取最新的权限
    const permissions = await this.calculatePermissions(user.roles)

    const { password, ...userInfo } = user
    return {
      ...userInfo,
      permissions
    }
  }

  async getAllUsers(): Promise<UserInfoResponse[]> {
    const users = await userRepository.findAll()
    
    // 为每个用户动态计算权限
    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        const permissions = await this.calculatePermissions(user.roles)
        const { password, ...userInfo } = user
        return {
          ...userInfo,
          permissions
        }
      })
    )
    
    return usersWithPermissions
  }

  async createUser(userData: Partial<UserInfo>): Promise<UserInfoResponse> {
    if (!userData.username || !userData.password) {
      throw new BusinessError('用户名和密码不能为空', 'VALIDATION_ERROR', 400)
    }

    if (!userData.roles || userData.roles.length === 0) {
      throw new BusinessError('请选择角色', 'VALIDATION_ERROR', 400)
    }

    // 检查用户名是否已存在
    const existing = await userRepository.findByUsername(userData.username)
    if (existing) {
      throw new BusinessError('用户名已存在', 'DUPLICATE_USERNAME', 400)
    }

    // 验证角色是否存在
    for (const roleId of userData.roles) {
      const role = await roleRepository.findById(roleId)
      if (!role) {
        throw new BusinessError(`角色 ${roleId} 不存在`, 'INVALID_ROLE', 400)
      }
    }

    // 不再存储permissions字段
    const newUser: UserInfo = {
      id: Date.now().toString(),
      username: userData.username,
      password: userData.password, // 明文存储（仅用于演示）
      nickname: userData.nickname || userData.username,
      roles: userData.roles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const created = await userRepository.create(newUser)
    
    // 返回时动态计算权限
    const permissions = await this.calculatePermissions(created.roles)
    const { password, ...userInfo } = created
    return {
      ...userInfo,
      permissions
    }
  }

  async updateUser(userId: string, data: Partial<UserInfo>): Promise<UserInfoResponse> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    }

    // 允许更新密码
    if (data.password) {
      updates.password = data.password
    }

    // 允许更新角色
    if (data.roles) {
      if (data.roles.length === 0) {
        throw new BusinessError('请选择角色', 'VALIDATION_ERROR', 400)
      }

      // 验证角色是否存在
      for (const roleId of data.roles) {
        const role = await roleRepository.findById(roleId)
        if (!role) {
          throw new BusinessError(`角色 ${roleId} 不存在`, 'INVALID_ROLE', 400)
        }
      }

      updates.roles = data.roles
      // 不再更新permissions字段
    }

    const updated = await userRepository.update(userId, updates)
    
    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    // 返回时动态计算权限
    const permissions = await this.calculatePermissions(updated.roles)
    const { password, ...userInfo } = updated
    return {
      ...userInfo,
      permissions
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const success = await userRepository.delete(userId)
    if (!success) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }
  }

  // 保留原有的更新当前用户信息方法
  async updateCurrentUser(userId: string, data: Partial<UserInfo>): Promise<UserInfoResponse> {
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

    // 返回时动态计算权限
    const permissions = await this.calculatePermissions(updated.roles)
    const { password, ...userInfo } = updated
    return {
      ...userInfo,
      permissions
    }
  }
}

export const userService = new UserService()
