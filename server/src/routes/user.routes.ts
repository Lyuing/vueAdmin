import Router from '@koa/router'
import { userController } from '../controllers/user.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/user' })

// 当前用户相关
router.get('/info', auth, ctx => userController.getUserInfo(ctx))
router.put('/info', auth, ctx => userController.updateUserInfo(ctx))

// 管理员用户管理
router.get('/all', auth, requireAdmin, ctx => userController.getAllUsers(ctx))
router.post('/', auth, requireAdmin, ctx => userController.createUser(ctx))
router.put('/:id', auth, requireAdmin, ctx => userController.updateUser(ctx))
router.delete('/:id', auth, requireAdmin, ctx => userController.deleteUser(ctx))

export default router
