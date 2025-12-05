import { createRouter, createWebHistory, type RouteRecordRaw, type Router } from 'vue-router'
import { staticRoutes, routeMap } from './routes'
import { setupRouterGuards } from './guards'
import { filterAccessRoutes } from './permission'

let router: Router | null = null

let dynamicRoutesAdded = false

/**
 * 初始化路由实例。将路由创建推迟到 main 流程中调用，避免与守卫注册顺序冲突。
 * 调用后返回 `router` 实例，后续模块可继续使用 `addDynamicRoutes` 等方法。
 */
export function initRouter() {
  if (router) return router

  router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: staticRoutes as RouteRecordRaw[]
  })
  // 注册路由守卫
  setupRouterGuards(router)
  return router
}

function ensureRouter(): Router {
  if (!router) throw new Error('Router not initialized. Call initRouter() before using router.')
  return router
}

/**
 * 添加动态路由
 */
export async function addDynamicRoutes(permissions: string[], force = false) {
  const r = ensureRouter()

  if (dynamicRoutesAdded && !force) return

  // 根据权限过滤路由
  const accessibleRoutes = filterAccessRoutes(routeMap, permissions)

  // 添加路由到 router
  accessibleRoutes.forEach(route => {
    r.addRoute(route as RouteRecordRaw)
  })

  // 添加404路由（必须在最后）
  r.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'NotFound'
  })

  dynamicRoutesAdded = true
}

/**
 * 重置路由
 * 清除所有动态添加的路由，恢复到初始状态
 */
export function resetRouter() {
  const r = ensureRouter()

  dynamicRoutesAdded = false

  // 获取所有已注册的路由
  const routes = r.getRoutes()

  // 移除所有动态添加的路由（保留静态路由）
  routes.forEach(route => {
    // 只移除动态添加的路由，保留静态路由（login, 403, 404）
    if (route.name && !['Login', 'Forbidden', 'NotFound'].includes(route.name as string)) {
      try {
        r.removeRoute(route.name)
      } catch {
        // 忽略可能的异常
      }
    }
  })

  // 确保404路由被移除（如果存在）
  try {
    r.removeRoute('NotFound')
  } catch {
    // 忽略错误，路由可能不存在
  }
}

export function getRouter() {
  return ensureRouter()
}

export default initRouter
