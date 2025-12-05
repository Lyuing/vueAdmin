import Router from '@koa/router'
import { roleController } from '../controllers/role.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/role' })

router.get('/all', auth, requireAdmin, ctx => roleController.getAllRoles(ctx))
router.get('/:id', auth, requireAdmin, ctx => roleController.getRoleById(ctx))
router.post('/', auth, requireAdmin, ctx => roleController.createRole(ctx))
router.put('/:id', auth, requireAdmin, ctx => roleController.updateRole(ctx))
router.delete('/:id', auth, requireAdmin, ctx => roleController.deleteRole(ctx))
router.get('/:id/menus', auth, requireAdmin, ctx => roleController.getRoleMenus(ctx))
router.post('/:id/menus', auth, requireAdmin, ctx => roleController.saveRoleMenus(ctx))

export default router
