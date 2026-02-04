import type Koa from 'koa'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import menuRoutes from './menu.routes.js'
import roleRoutes from './role.routes.js'
import rsaRoutes from './rsa.routes.js'

export function registerRoutes(app: Koa): void {
  app.use(rsaRoutes.routes()).use(rsaRoutes.allowedMethods())
  app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
  app.use(userRoutes.routes()).use(userRoutes.allowedMethods())
  app.use(menuRoutes.routes()).use(menuRoutes.allowedMethods())
  app.use(roleRoutes.routes()).use(roleRoutes.allowedMethods())
}
