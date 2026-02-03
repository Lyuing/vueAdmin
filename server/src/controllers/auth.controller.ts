import type { Context } from 'koa'
import { authService } from '../services/auth.service.js'
import { success } from '../utils/response.util.js'
import type {
  LoginRequest,
  CaptchaGenerateRequest,
  CaptchaValidateRequest
} from '../types/auth.types.js'

export class AuthController {
  async signin(ctx: Context): Promise<void> {
    const input = ctx.request.body as any
    const result = await authService.signin(input)
    success(ctx, result)
  }

  async login(ctx: Context): Promise<void> {
    const input = ctx.request.body as LoginRequest
    const result = await authService.login(input)
    success(ctx, result)
  }

  async logout(ctx: Context): Promise<void> {
    // 简单实现，实际应该清除 token
    success(ctx, null, '登出成功')
  }

  async generateCaptcha(ctx: Context): Promise<void> {
    const input = ctx.request.body as CaptchaGenerateRequest
    const result = await authService.generateCaptcha(input.identifier)
    success(ctx, result)
  }

  async validateCaptcha(ctx: Context): Promise<void> {
    const input = ctx.request.body as CaptchaValidateRequest
    const valid = await authService.validateCaptcha(input.captchaText, input.captchaId)
    success(ctx, { valid })
  }
}

export const authController = new AuthController()
