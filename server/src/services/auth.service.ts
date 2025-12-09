import { userRepository } from '../repositories/user.repository.js'
import { roleMenuRepository } from '../repositories/role-menu.repository.js'
import { generateToken, removeToken } from '../utils/token.util.js'
import { BusinessError } from '../types/common.types.js'
import type { LoginResponse } from '../types/user.types.js'

export class AuthService {
  // 根据角色计算用户权限
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
      }
    }
    
    return Array.from(permissionSet)
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const user = await userRepository.findByUsername(username)

    if (!user || user.password !== password) {
      throw new BusinessError('用户名或密码错误', 'AUTH_FAILED', 401)
    }

    const token = generateToken(user.id, user.username, user.roles)

    // 动态计算权限
    const permissions = await this.calculatePermissions(user.roles)

    const { password: _, ...userInfo } = user

    return {
      token,
      expiresIn: 7200,
      userInfo: {
        ...userInfo,
        permissions
      }
    }
  }

  async logout(token: string): Promise<void> {
    removeToken(token)
  }
}

export const authService = new AuthService()
