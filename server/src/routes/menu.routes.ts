import Router from '@koa/router'
import { menuController } from '../controllers/menu.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/menu' })

router.get('/user', auth, ctx => menuController.getUserMenus(ctx))
router.get('/all', auth, requireAdmin, ctx => menuController.getAllMenus(ctx))
router.post('/', auth, requireAdmin, ctx => menuController.createMenu(ctx))
router.put('/:id', auth, requireAdmin, ctx => menuController.updateMenu(ctx))
router.delete('/:id', auth, requireAdmin, ctx => menuController.deleteMenu(ctx))
router.get('/permission-codes', ctx => menuController.getPermissionCodes(ctx))

const roleRouter = new Router({ prefix: '/api/role' })
roleRouter.post('/:roleId/menus', auth, requireAdmin, ctx => menuController.saveRoleMenus(ctx))

export { router as default, roleRouter }
