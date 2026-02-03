import Router from '@koa/router'
import { authController } from '../controllers/auth.controller.js'

const router = new Router({ prefix: '/api/auth' })

router.post('/signin', ctx => authController.signin(ctx))
router.post('/login', ctx => authController.login(ctx))
router.post('/logout', ctx => authController.logout(ctx))
router.post('/captcha/generate', ctx => authController.generateCaptcha(ctx))
router.post('/captcha/validate', ctx => authController.validateCaptcha(ctx))

export default router
