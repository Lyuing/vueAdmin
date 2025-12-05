import type { Context, Next } from 'koa'
import { verifyToken } from '../utils/token.util.js'
import { BusinessError } from '../types/common.types.js'

export async function auth(ctx: Context, next: Next): Promise<void> {
  const authorization = ctx.headers.authorization
  
  if (!authorization) {
    throw new BusinessError('未提供认证令牌', 'AUTH_FAILED', 401)
  }

  const token = authorization.replace('Bearer ', '')
  const tokenData = verifyToken(token)

  if (!tokenData) {
    throw new BusinessError('无效的认证令牌', 'AUTH_FAILED', 401)
  }

  ctx.state.user = tokenData
  await next()
}

export async function requireAdmin(ctx: Context, next: Next): Promise<void> {
  if (!ctx.state.user?.roles.includes('admin')) {
    throw new BusinessError('权限不足', 'FORBIDDEN', 403)
  }
  await next()
}
