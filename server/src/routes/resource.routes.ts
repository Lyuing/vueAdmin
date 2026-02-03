import Router from '@koa/router'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'
import { success } from '../utils/response.util.js'

const router = new Router({ prefix: '/api/resource' })

// 资源管理相关路由（暂时返回空数据）
router.get('/', auth, requireAdmin, ctx => {
  success(ctx, [])
})

router.get('/page', auth, requireAdmin, ctx => {
  success(ctx, {
    list: [],
    currentPage: 1,
    pageSize: 10,
    totalPage: 0,
    totalElements: 0
  })
})

export default router
