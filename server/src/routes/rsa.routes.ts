import Router from '@koa/router'
import { success } from '../utils/response.util.js'
import { rsaService } from '../services/rsa.service.js'
import type { Context } from 'koa'

const router = new Router({ prefix: '/api/rsa' })

// 获取公钥
router.get('/public-key', async (ctx: Context) => {
  const { clientId } = ctx.query
  const result = await rsaService.getPublicKey(clientId as string | undefined)
  success(ctx, result)
})

export default router
