import type { Context } from 'koa'
import type { ApiResponse } from '../types/common.types.js'

export function success<T>(ctx: Context, data: T, message = 'success'): void {
  const response: ApiResponse<T> = {
    code: 0,
    message,
    data
  }
  ctx.body = response
}

export function error(ctx: Context, code: string, message: string, statusCode = 500): void {
  ctx.status = statusCode
  const response: ApiResponse = {
    code,
    message,
    data: null
  }
  ctx.body = response
}
