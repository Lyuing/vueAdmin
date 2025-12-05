import { userRepository } from '../repositories/user.repository.js'
import { roleRepository } from '../repositories/role.repository.js'
import { roleMenuRepository } from '../repositories/role-menu.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { UserInfo } from '../types/user.types.js'

export class UserService {
  // 根据角色计算用户权限
  private async calculatePermissions(roles: string[]): Promise<string[]> {
    const permissionSet = new Set<string>()
    
    for (const roleId of roles) {
      const roleMenus = await roleMenuRepository.findByRoleId(roleId)
      if (roleMenus && roleMenus.permissionCodes) {
        roleMenus.permissionCodes.forEach(code => permissionSet.add(code))
      }
    }
    
    return Array.from(permissionSet)
  }

  async getUserById(userId: string): Promise<Omit<UserInfo, 'password'> | null> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      return null
    }

    const { password, ...userInfo } = user
    return userInfo
  }

  // 获取当前用户信息（包含最新的权限）
  async getCurrentUser(userId: string): Promise<Omit<UserInfo, 'password'>> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 重新计算权限，确保获取最新的权限
    const permissions = await this.calculatePermissions(user.roles)
    
    // 如果权限有变化，更新用户数据
    if (JSON.stringify(permissions.sort()) !== JSON.stringify(user.permissions.sort())) {
      await userRepository.update(userId, { permissions })
      user.permissions = permissions
    }

    const { password, ...userInfo } = user
    return userInfo
  }

  async getAllUsers(): Promise<Omit<UserInfo, 'password'>[]> {
    const users = await userRepository.findAll()
    return users.map(({ password, ...userInfo }) => userInfo)
  }

  async createUser(userData: Partial<UserInfo>): Promise<Omit<UserInfo, 'password'>> {
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

    // 计算权限
    const permissions = await this.calculatePermissions(userData.roles)

    const newUser: UserInfo = {
      id: Date.now().toString(),
      username: userData.username,
      password: userData.password, // 明文存储（仅用于演示）
      nickname: userData.nickname || userData.username,
      roles: userData.roles,
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const created = await userRepository.create(newUser)
    const { password, ...userInfo } = created
    return userInfo
  }

  async updateUser(userId: string, data: Partial<UserInfo>): Promise<Omit<UserInfo, 'password'>> {
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
      // 重新计算权限
      updates.permissions = await this.calculatePermissions(data.roles)
    }

    const updated = await userRepository.update(userId, updates)
    
    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    const { password, ...userInfo } = updated
    return userInfo
  }

  async deleteUser(userId: string): Promise<void> {
    const success = await userRepository.delete(userId)
    if (!success) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }
  }

  // 保留原有的更新当前用户信息方法
  async updateCurrentUser(userId: string, data: Partial<UserInfo>): Promise<Omit<UserInfo, 'password'>> {
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
