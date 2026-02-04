import { userRepository } from '../repositories/user.repository.js'
import { roleRepository } from '../repositories/role.repository.js'
import { menuService } from './menu.service.js'
import { BusinessError } from '../types/common.types.js'
import type {
  User,
  UserCreateInput,
  UserUpdateInput,
  CurrentUserResponse
} from '../types/user.types.js'

export class UserService {
  /**
   * 将角色ID数组转换为完整的角色对象数组
   * @param roleIds 角色ID数组
   * @returns 完整的角色对象数组
   */
  private async convertRoleIdsToRoles(
    roleIds: number[]
  ): Promise<Array<{ id: number; name: string; code: string }>> {
    const roles: Array<{ id: number; name: string; code: string }> = []

    for (const roleId of roleIds) {
      const role = await roleRepository.findByIdNumber(roleId)
      if (role) {
        roles.push({
          id: role.id,
          name: role.name,
          code: role.code
        })
      }
    }

    return roles
  }

  async getAllUsers(): Promise<User[]> {
    return await userRepository.findAll()
  }

  async getUserById(id: string): Promise<User | null> {
    return await userRepository.findById(id)
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await userRepository.findByUsername(username)
  }

  async getCurrentUser(userId: string): Promise<CurrentUserResponse> {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 获取用户权限
    const permissionSet = new Set<string>()
    const roleNames: string[] = []

    for (const userRole of user.roles) {
      roleNames.push(userRole.code)

      // 从角色表中获取完整的角色信息（包含权限）
      const role = await roleRepository.findByIdNumber(userRole.id)
      if (role && role.permissions) {
        role.permissions.forEach(p => permissionSet.add(p.permissionCode))
      }
    }

    // 获取用户菜单树
    const allMenuTree = await menuService.getUserMenus(userId)

    return {
      id: parseInt(user.id),
      username: user.username,
      permissions: Array.from(permissionSet),
      roles: roleNames,
      allMenuTree,
      email: user.email,
      realName: user.realName,
      phone: user.phone,
      status: user.status || 'ACTIVE',
      createTime: user.createdTime,
      updateTime: user.updateTime
    }
  }

  // eslint-disable-next-line complexity
  async createUser(input: UserCreateInput): Promise<User> {
    // 验证用户名是否已存在
    if (await userRepository.existsByUsername(input.username)) {
      throw new BusinessError('用户名已存在', 'DUPLICATE_USERNAME', 400)
    }

    // 处理密码：如果提供了clientId，说明密码是RSA加密的，需要解密
    let actualPassword = input.password
    if (input.clientId) {
      const { rsaService } = await import('./rsa.service.js')
      try {
        actualPassword = await rsaService.decryptPassword(input.password, input.clientId)
      } catch (error) {
        console.error('密码解密失败:', error)
        throw new BusinessError('密码解密失败', 'DECRYPTION_FAILED', 400)
      }
    }

    // 处理角色信息：如果传了roleIds，需要转换为完整的角色对象
    let roles: any[] = []
    if (input.roleIds && input.roleIds.length > 0) {
      roles = await this.convertRoleIdsToRoles(input.roleIds)
    } else if (input.roles) {
      roles = input.roles
    }

    // 生成新的用户ID
    const allUsers = await userRepository.findAll()
    const maxId = allUsers.length > 0 ? Math.max(...allUsers.map(u => parseInt(u.id) || 0)) : 0
    const newId = String(maxId + 1)

    const newUser: User = {
      id: newId,
      username: input.username,
      password: actualPassword, // 保存解密后的明文密码
      realName: input.realName,
      avatar: input.avatar || '',
      email: input.email || '',
      phone: input.phone || '',
      roles: roles,
      status: 'ACTIVE',
      createdTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }

    return await userRepository.create(newUser)
  }

  async updateUser(input: UserUpdateInput): Promise<User> {
    const existing = await userRepository.findById(input.id)

    if (!existing) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 如果更新了用户名，检查是否与其他用户冲突
    if (input.username && input.username !== existing.username) {
      if (await userRepository.existsByUsername(input.username)) {
        throw new BusinessError('用户名已存在', 'DUPLICATE_USERNAME', 400)
      }
    }

    // 处理角色信息：如果传了roleIds，需要转换为完整的角色对象
    let roles: any[] | undefined = undefined
    if (input.roleIds && input.roleIds.length > 0) {
      roles = await this.convertRoleIdsToRoles(input.roleIds)
    } else if (input.roles !== undefined) {
      roles = input.roles
    }

    const updated = await userRepository.update(input.id, {
      username: input.username,
      realName: input.realName,
      avatar: input.avatar,
      email: input.email,
      phone: input.phone,
      roles: roles,
      status: input.status,
      updateTime: new Date().toISOString()
    })

    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async deleteUser(id: string): Promise<void> {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 不允许删除管理员账号
    if (user.username === 'admin') {
      throw new BusinessError('不能删除管理员账号', 'CANNOT_DELETE_ADMIN', 400)
    }

    const success = await userRepository.delete(id)

    if (!success) {
      throw new BusinessError('删除失败', 'INTERNAL_ERROR', 500)
    }
  }

  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'): Promise<User> {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 不允许禁用管理员账号
    if (user.username === 'admin' && status !== 'ACTIVE') {
      throw new BusinessError('不能禁用管理员账号', 'CANNOT_DISABLE_ADMIN', 400)
    }

    const updated = await userRepository.updateStatus(id, status)

    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async resetPassword(id: string): Promise<User> {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 重置为默认密码
    const defaultPassword = '123456'
    const updated = await userRepository.updatePassword(id, defaultPassword)

    if (!updated) {
      throw new BusinessError('重置密码失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async changePassword(id: string, newPassword: string, clientId?: string): Promise<User> {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 如果提供了clientId，说明密码是RSA加密的，需要解密
    let actualPassword = newPassword
    if (clientId) {
      const { rsaService } = await import('./rsa.service.js')
      try {
        actualPassword = await rsaService.decryptPassword(newPassword, clientId)
      } catch (error) {
        console.error('密码解密失败:', error)
        throw new BusinessError('密码解密失败', 'DECRYPTION_FAILED', 400)
      }
    }

    const updated = await userRepository.updatePassword(id, actualPassword)

    if (!updated) {
      throw new BusinessError('修改密码失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async getUsersByDepartment(departmentId: number): Promise<User[]> {
    return await userRepository.findByDepartmentId(departmentId)
  }

  async changeLanguage(userId: string, language: string): Promise<void> {
    // 暂时不实现，因为当前数据结构中没有语言字段
    console.log(`用户 ${userId} 切换语言为 ${language}`)
  }
}

export const userService = new UserService()
