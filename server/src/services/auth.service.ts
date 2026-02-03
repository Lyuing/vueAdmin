import { userRepository } from '../repositories/user.repository.js'
import { roleRepository } from '../repositories/role.repository.js'
import { menuService } from './menu.service.js'
import { rsaService } from './rsa.service.js'
import { generateToken } from '../utils/token.js'
import { BusinessError } from '../types/common.types.js'
import type { LoginRequest, LoginResponse } from '../types/auth.types.js'

export class AuthService {
  /**
   * 登录（支持RSA加密密码）
   */
  async signin(input: any): Promise<LoginResponse> {
    const { usernameOrEmail, password, clientId } = input

    // 查找用户（支持用户名或邮箱）
    let user = await userRepository.findByUsername(usernameOrEmail)
    if (!user) {
      user = await userRepository.findByEmail(usernameOrEmail)
    }

    if (!user) {
      throw new BusinessError('用户不存在', 40101, 200)
    }

    // 使用RSA解密密码
    let decryptedPassword: string
    try {
      decryptedPassword = await rsaService.decryptPassword(password, clientId)
    } catch (error) {
      console.error('密码解密失败:', error)
      throw new BusinessError('密码验证失败，请重新登录', 40102, 200)
    }

    // 验证密码
    if (user.password !== decryptedPassword) {
      throw new BusinessError('用户名或密码错误', 40102, 200)
    }

    // 检查用户状态
    if (user.status === 'INACTIVE') {
      throw new BusinessError('账号已被禁用', 40103, 200)
    }

    if (user.status === 'LOCKED') {
      throw new BusinessError('账号已被锁定', 40104, 200)
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
    const menuTree = await menuService.getUserMenus(user.id)

    // 生成 token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      roles: roleNames
    })

    return {
      accessToken: token,
      userId: parseInt(user.id),
      username: user.username,
      permissions: Array.from(permissionSet),
      menuTree,
      roles: roleNames,
      realName: user.nickname,
      email: user.email,
      sessionId: `session_${Date.now()}`
    }
  }

  /**
   * 登录（普通密码）
   */
  async login(input: LoginRequest): Promise<LoginResponse> {
    // 查找用户
    const user = await userRepository.findByUsername(input.username)

    if (!user) {
      throw new BusinessError('用户名不存在', 'USER_NOT_FOUND', 40101)
    }

    // 验证密码（简单比对，实际应该使用加密）
    if (user.password !== input.password) {
      throw new BusinessError('用户名或密码错误', 'AUTH_FAILED', 40102)
    }

    // 检查用户状态
    if (user.status === 'INACTIVE') {
      throw new BusinessError('账号已被禁用', 'ACCOUNT_DISABLED', 40103)
    }

    if (user.status === 'LOCKED') {
      throw new BusinessError('账号已被锁定', 'ACCOUNT_LOCKED', 40104)
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
    const menuTree = await menuService.getUserMenus(user.id)

    // 生成 token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      roles: roleNames
    })

    return {
      accessToken: token,
      userId: parseInt(user.id),
      username: user.username,
      permissions: Array.from(permissionSet),
      menuTree,
      roles: roleNames,
      realName: user.nickname,
      email: user.email,
      sessionId: `session_${Date.now()}`
    }
  }

  async generateCaptcha(identifier?: string): Promise<{ image: string; captchaId: string }> {
    // 简单的验证码生成（实际应该使用图形验证码库）
    const captchaId = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const captchaText = Math.random().toString(36).substr(2, 6).toUpperCase()

    // 这里应该生成图片，暂时返回文本
    const image = `data:image/svg+xml;base64,${Buffer.from(
      `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">
        <text x="10" y="25" font-size="20" fill="#333">${captchaText}</text>
      </svg>
    `
    ).toString('base64')}`

    // 实际应该存储到缓存中，这里简化处理
    return { image, captchaId }
  }

  async validateCaptcha(captchaText: string, captchaId: string): Promise<boolean> {
    // 简化处理，实际应该从缓存中验证
    return true
  }
}

export const authService = new AuthService()
