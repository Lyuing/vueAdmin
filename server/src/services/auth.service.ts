import { userRepository } from '../repositories/user.repository.js'
import { generateToken, removeToken } from '../utils/token.util.js'
import { BusinessError } from '../types/common.types.js'
import type { LoginResponse } from '../types/user.types.js'

export class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const user = await userRepository.findByUsername(username)

    if (!user || user.password !== password) {
      throw new BusinessError('用户名或密码错误', 'AUTH_FAILED', 401)
    }

    const token = generateToken(user.id, user.username, user.roles)

    const { password: _, ...userInfo } = user

    return {
      token,
      expiresIn: 7200,
      userInfo
    }
  }

  async logout(token: string): Promise<void> {
    removeToken(token)
  }
}

export const authService = new AuthService()
