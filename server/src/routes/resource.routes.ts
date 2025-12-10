import Router from '@koa/router'
import { resourceController } from '../controllers/resource.controller.js'
import { auth, requireAdmin } from '../middlewares/auth.middleware.js'

const router = new Router({ prefix: '/api/resource' })

router.get('/', auth, ctx => resourceController.getAllResources(ctx))
router.get('/:id', auth, ctx => resourceController.getResourceById(ctx))
router.post('/', auth, requireAdmin, ctx => resourceController.createResource(ctx))
router.put('/:id', auth, requireAdmin, ctx => resourceController.updateResource(ctx))
router.delete('/:id', auth, requireAdmin, ctx => resourceController.deleteResource(ctx))

export default router
