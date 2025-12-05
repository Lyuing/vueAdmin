import type Koa from 'koa'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import menuRoutes, { roleRouter } from './menu.routes.js'

export function registerRoutes(app: Koa): void {
  app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
  app.use(userRoutes.routes()).use(userRoutes.allowedMethods())
  app.use(menuRoutes.routes()).use(menuRoutes.allowedMethods())
  app.use(roleRouter.routes()).use(roleRouter.allowedMethods())
}
