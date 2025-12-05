import type { Context, Next } from 'koa'
import { BusinessError } from '../types/common.types.js'
import { error } from '../utils/response.util.js'
import { config } from '../config/index.js'

export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (err: any) {
    console.error('Error:', err)

    if (err instanceof BusinessError) {
      error(ctx, err.code, err.message, err.statusCode)
    } else {
      const message = config.env === 'production' 
        ? 'Internal server error' 
        : err.message || 'Unknown error'
      
      error(ctx, 'INTERNAL_ERROR', message, 500)
    }
  }
}
