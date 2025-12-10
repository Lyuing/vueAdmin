import type Koa from 'koa'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import menuRoutes from './menu.routes.js'
import roleRoutes from './role.routes.js'
import resourceRoutes from './resource.routes.js'

export function registerRoutes(app: Koa): void {
  app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
  app.use(userRoutes.routes()).use(userRoutes.allowedMethods())
  app.use(menuRoutes.routes()).use(menuRoutes.allowedMethods())
  app.use(roleRoutes.routes()).use(roleRoutes.allowedMethods())
  app.use(resourceRoutes.routes()).use(resourceRoutes.allowedMethods())
}
