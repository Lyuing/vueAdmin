import type { RouteConfig } from '@/types/route'

/**
 * 检查用户是否拥有指定权限
 */
export function hasPermission(
  required: string | string[] | undefined,
  userPermissions: string[]
): boolean {
  if (!required) return true

  // 支持单字符串或字符串数组
  const requiredList = Array.isArray(required) ? required : [required]
  if (requiredList.length === 0) return true

  return requiredList.some(permission => userPermissions.includes(permission))
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
      // 优先使用单一的 permissionCode（与菜单配置对齐），回退到 meta.permissions
      const required = (route.meta && (route.meta.permissionCode || route.meta.permissions)) as
        | string
        | string[]
        | undefined

      const hasAuth = hasPermission(required, permissions)
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
