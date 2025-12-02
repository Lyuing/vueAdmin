import type { RouteConfig } from '@/types/route'

/**
 * 检查用户是否拥有指定权限
 */
export function hasPermission(
  requiredPermissions: string[] | undefined,
  userPermissions: string[]
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }

  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

/**
 * 根据权限过滤路由配置表
 */
export function filterAccessRoutes(
  routes: RouteConfig[],
  permissions: string[]
): RouteConfig[] {
  return routes
    .filter(route => {
      const hasAuth = hasPermission(route.meta.permissions, permissions)
      if (hasAuth && route.children) {
        route.children = filterAccessRoutes(route.children, permissions)
      }
      return hasAuth
    })
    .map(route => ({ ...route }))
}

/**
 * 检查当前用户是否有权限访问路由
 */
export function checkPermission(
  requiredPermissions: string[] | undefined,
  userPermissions: string[]
): boolean {
  return hasPermission(requiredPermissions, userPermissions)
}
