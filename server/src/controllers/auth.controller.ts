import type { Context } from 'koa'
import { authService } from '../services/auth.service.js'
import { success } from '../utils/response.util.js'
import { BusinessError } from '../types/common.types.js'

export class AuthController {
  async login(ctx: Context): Promise<void> {
    const { username, password } = ctx.request.body as { username: string; password: string }

    if (!username || !password) {
      throw new BusinessError('用户名和密码不能为空', 'VALIDATION_ERROR', 400)
    }

    const result = await authService.login(username, password)
    success(ctx, result)
  }

  async logout(ctx: Context): Promise<void> {
    const authorization = ctx.headers.authorization
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      await authService.logout(token)
    }

    success(ctx, null, '登出成功')
  }
}

export const authController = new AuthController()
