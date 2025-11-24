import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { staticRoutes, routeMap } from './routes'
import { filterRoutesByPermission } from '@/utils/permission'
import { useMenuStore } from '@/stores/menu'

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
  const menuStore = useMenuStore()
  // 如果第一个路由是Layout，展开它的children
  const menuRoutes =
    accessibleRoutes.length > 0 && accessibleRoutes[0]?.name === 'Layout'
      ? accessibleRoutes[0]?.children || []
      : accessibleRoutes
  menuStore.setMenus(menuRoutes, permissions, menuRoutes)
}

/**
 * 重置路由
 */
export function resetRouter() {
  dynamicRoutesAdded = false
  // 重新创建router实例来清除动态路由
  const newRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: staticRoutes as RouteRecordRaw[]
  })
  ;(router as any).matcher = (newRouter as any).matcher
}

export default router
