import Router from '@koa/router'
import { userController } from '../controllers/user.controller.js'
import { auth } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/user' })

router.get('/info', auth, ctx => userController.getUserInfo(ctx))
router.put('/info', auth, ctx => userController.updateUserInfo(ctx))

export default router
