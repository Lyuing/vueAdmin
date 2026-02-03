import Router from '@koa/router'
import { userController } from '../controllers/user.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/users/v1' })

// 获取当前用户信息
router.get('/me', auth, ctx => userController.getCurrentUser(ctx))

// 管理员接口
router.get('/', auth, requireAdmin, ctx => userController.getAllUsers(ctx))
router.get('/page', auth, requireAdmin, ctx => userController.getUsersList(ctx))
router.get('/by-department', auth, requireAdmin, ctx => userController.getUsersByDepartment(ctx))
router.post('/', auth, requireAdmin, ctx => userController.createUser(ctx))
router.post('/update', auth, requireAdmin, ctx => userController.updateUser(ctx))
router.post('/delete', auth, requireAdmin, ctx => userController.deleteUser(ctx))
router.post('/enable', auth, requireAdmin, ctx => userController.enableUser(ctx))
router.post('/disable', auth, requireAdmin, ctx => userController.disableUser(ctx))
router.post('/reset-password', auth, requireAdmin, ctx => userController.resetPassword(ctx))
router.post('/change-password', auth, ctx => userController.changePassword(ctx))
router.post('/change-language', auth, ctx => userController.changeLanguage(ctx))

export default router
