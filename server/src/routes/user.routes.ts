import Router from '@koa/router'
import { userController } from '../controllers/user.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/user' })

// 当前用户相关
router.get('/userInfo', auth, ctx => userController.getUserInfo(ctx))
router.put('/userInfo', auth, ctx => userController.updateUserInfo(ctx))

// 管理员用户管理
router.get('/allUsers', auth, requireAdmin, ctx => userController.getAllUsers(ctx))
router.post('/create', auth, requireAdmin, ctx => userController.createUser(ctx))
router.post('/update', auth, requireAdmin, ctx => userController.updateUser(ctx))
router.post('/delete', auth, requireAdmin, ctx => userController.deleteUser(ctx))

export default router
