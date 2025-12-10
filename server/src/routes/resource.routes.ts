import Router from '@koa/router'
import { resourceController } from '../controllers/resource.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/resource' })

router.get('/list', auth, ctx => resourceController.getAllResources(ctx))
router.post('/detail', auth, ctx => resourceController.getResourceById(ctx))
router.post('/create', auth, requireAdmin, ctx => resourceController.createResource(ctx))
router.post('/update', auth, requireAdmin, ctx => resourceController.updateResource(ctx))
router.post('/delete', auth, requireAdmin, ctx => resourceController.deleteResource(ctx))

export default router
