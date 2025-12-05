import Router from '@koa/router'
import { authController } from '../controllers/auth.controller.js'

const router = new Router({ prefix: '/api/auth' })

router.post('/login', ctx => authController.login(ctx))
router.post('/logout', ctx => authController.logout(ctx))

export default router
