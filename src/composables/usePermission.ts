import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { RouteLocationNormalized } from 'vue-router'

const ReservedPermission = ['menu:welcome', 'menu:system_menu']
// 检查是否自留权限
export function checkKeepPermission(permissionCode?: string): boolean {
  return ReservedPermission.includes(permissionCode || '')
}

export function usePermission() {
  const authStore = useAuthStore()

  // 获取当前用户权限列表
  const permissions = computed(() => authStore.userInfo?.permissions || [])

  // 获取当前用户角色列表
  const roles = computed(() => authStore.userInfo?.roles || [])

  /**
   * 检查是否拥有指定权限码
   * @param permissionCode 权限码或权限码数组
   * @param requireAll 是否需要全部权限（默认false，只需一个）
   */
  function hasPermission(permissionCode: string | string[], requireAll = false): boolean {
    if (!authStore.isLoggedIn) {
      return false
    }

    const userPermissions = permissions.value

    // 超级管理员拥有所有权限
    if (roles.value.includes('admin') || roles.value.includes('super_admin')) {
      return true
    }

    // 如果没有权限列表，返回false
    if (!userPermissions || userPermissions.length === 0) {
      return false
    }

    // 处理单个权限码
    if (typeof permissionCode === 'string') {
      return userPermissions.includes(permissionCode)
    }

    // 处理权限码数组
    if (requireAll) {
      // 需要全部权限
      return permissionCode.every(code => userPermissions.includes(code))
    } else {
      // 只需一个权限
      return permissionCode.some(code => userPermissions.includes(code))
    }
  }

  /**
   * 检查是否拥有指定角色
   * @param role 角色或角色数组
   * @param requireAll 是否需要全部角色（默认false，只需一个）
   */
  function hasRole(role: string | string[], requireAll = false): boolean {
    if (!authStore.isLoggedIn) {
      return false
    }

    const userRoles = roles.value

    if (!userRoles || userRoles.length === 0) {
      return false
    }

    // 处理单个角色
    if (typeof role === 'string') {
      return userRoles.includes(role)
    }

    // 处理角色数组
    if (requireAll) {
      // 需要全部角色
      return role.every(r => userRoles.includes(r))
    } else {
      // 只需一个角色
      return role.some(r => userRoles.includes(r))
    }
  }

  /**
   * 检查路由权限
   * @param route 路由对象
   */
  function checkRoutePermission(route: RouteLocationNormalized): boolean {
    // 如果路由不需要认证，直接通过
    if (!route.meta?.requiresAuth) {
      return true
    }

    // 检查是否已登录
    if (!authStore.isLoggedIn) {
      return false
    }

    // 检查权限码
    if (route.meta?.permissionCode) {
      if (!hasPermission(route.meta.permissionCode as string)) {
        return false
      }
    }

    return true
  }

  return {
    permissions,
    roles,
    hasPermission,
    hasRole,
    checkRoutePermission
  }
}
