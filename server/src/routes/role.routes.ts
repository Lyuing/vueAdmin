import Router from '@koa/router'
import { roleController } from '../controllers/role.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/role' })

router.get('/allRole', auth, requireAdmin, ctx => roleController.getAllRoles(ctx))
router.post('/detail', auth, requireAdmin, ctx => roleController.getRoleById(ctx))
router.post('/create', auth, requireAdmin, ctx => roleController.createRole(ctx))
router.post('/update', auth, requireAdmin, ctx => roleController.updateRole(ctx))
router.post('/delete', auth, requireAdmin, ctx => roleController.deleteRole(ctx))
router.post('/roleMenus', auth, requireAdmin, ctx => roleController.getRoleMenus(ctx))
router.post('/saveRoleMenus', auth, requireAdmin, ctx => roleController.saveRoleMenus(ctx))

export default router
