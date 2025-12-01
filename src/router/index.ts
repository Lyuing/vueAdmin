import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { staticRoutes, routeMap } from './routes'
import { filterRoutesByPermission } from './permission'
import { useMenu } from '@/composables/useMenu'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes as RouteRecordRaw[]
})

// 存储已添加的动态路由
let dynamicRoutesAdded = false

/**
 * 添加动态路由
 */
export async function addDynamicRoutes(permissions: string[], force = false) {
  if (dynamicRoutesAdded && !force) return

  // 根据权限过滤路由
  const accessibleRoutes = filterRoutesByPermission(routeMap, permissions)

  // 添加路由到router
  accessibleRoutes.forEach(route => {
    router.addRoute(route as RouteRecordRaw)
  })

  // 添加404路由（必须在最后）
  router.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  })

  dynamicRoutesAdded = true

  // 生成菜单 - 展开Layout的children作为顶级菜单
  const { setMenus } = useMenu()
  // 如果第一个路由是Layout，展开它的children
  const menuRoutes =
    accessibleRoutes.length > 0 && accessibleRoutes[0]?.name === 'Layout'
      ? accessibleRoutes[0]?.children || []
      : accessibleRoutes
  setMenus(menuRoutes, permissions, menuRoutes)
}

/**
 * 重置路由
 * 清除所有动态添加的路由，恢复到初始状态
 */
export function resetRouter() {
  dynamicRoutesAdded = false
  
  // 获取所有已注册的路由
  const routes = router.getRoutes()
  
  // 移除所有动态添加的路由（保留静态路由）
  routes.forEach(route => {
    // 只移除动态添加的路由，保留静态路由（login, 403, 404）
    if (route.name && !['Login', 'Forbidden', 'NotFound'].includes(route.name as string)) {
      router.removeRoute(route.name)
    }
  })
  
  // 确保404路由被移除（如果存在）
  try {
    router.removeRoute('NotFound')
  } catch {
    // 忽略错误，路由可能不存在
  }
}

export default router
