import { createRouter, createWebHistory, type RouteRecordRaw, type Router } from 'vue-router'
import { staticRoutes, routeMap } from './routes'
import { filterAccessRoutes } from './permission'

export { setupRouterGuards } from './guards'
export { routeMap }

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
  return router
}

function ensureRouter(): Router {
  if (!router) throw new Error('路由未初始化')
  return router
}

/**
 * 添加动态路由
 */
export async function addDynamicRoutes(permissions?: string[], force = false) {
  const r = ensureRouter()

  if (dynamicRoutesAdded && !force) return
  let effectivePermissions: string[] = permissions?.filter(i => i.includes('menu:')) || []

  if (!effectivePermissions?.length) {
    console.warn('无权限码')
  }

  // 根据权限过滤路由（优先匹配 route.meta.permissionCode）
  const accessibleRoutes = filterAccessRoutes(routeMap, effectivePermissions)
  console.log('--- [动态路由] 下发权限', JSON.parse(JSON.stringify(effectivePermissions)))
  console.log('--- [动态路由] 下发权限的路由', JSON.parse(JSON.stringify(accessibleRoutes)))
  // 添加路由到 router
  accessibleRoutes.forEach(route => {
    r.addRoute(route as RouteRecordRaw)
    // console.log('--- [动态路由] 正在添加的路由', route.path)
  })

  // 不能添加通配路由，否则路由守卫会匹配到并反复跳转
  // 添加404路由
  // r.addRoute({
  //   path: '/:pathMatch(.*)*',
  //   redirect: '/404',
  //   name: 'NotFound'
  // })

  dynamicRoutesAdded = true
  console.log('--- [动态路由] 加载完成', r.getRoutes())
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
    // 只移除动态添加的路由，保留静态路由（login, 403, 404, 500）
    if (
      route.name &&
      !['Login', 'Forbidden', 'NotFound', 'ServerError'].includes(route.name as string)
    ) {
      try {
        r.removeRoute(route.name)
      } catch {
        // 忽略可能的异常
      }
    }
  })

  // // 确保404路由被移除（如果存在）
  // try {
  //   r.removeRoute('NotFound')
  // } catch {
  //   // 忽略错误，路由可能不存在
  // }
}

export function getRouter() {
  return ensureRouter()
}

export default initRouter
