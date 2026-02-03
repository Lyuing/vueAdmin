import Router from '@koa/router'
import { roleController } from '../controllers/role.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api' })

// 角色接口
router.get('/roles/v1', auth, requireAdmin, ctx => roleController.getAllRoles(ctx))
router.get('/roles/v1/page', auth, requireAdmin, ctx => roleController.getRolesList(ctx))
router.post('/roles/v1', auth, requireAdmin, ctx => roleController.createRole(ctx))
router.post('/roles/v1/update', auth, requireAdmin, ctx => roleController.updateRole(ctx))
router.post('/roles/v1/delete', auth, requireAdmin, ctx => roleController.deleteRole(ctx))

// 权限接口
router.get('/permissions/v1/tree', auth, requireAdmin, ctx => roleController.getAllPermissions(ctx))
router.get('/permissions/v1/fetchByRole', auth, requireAdmin, ctx =>
  roleController.getRolePermissions(ctx)
)
router.post('/permissions/v1/batch-save', auth, requireAdmin, ctx =>
  roleController.saveRolePermissions(ctx)
)

export default router
