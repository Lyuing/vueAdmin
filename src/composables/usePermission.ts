import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { hasPermission as checkHasPermission } from '@/router/permission'

export function usePermission() {
  const authStore = useAuthStore()

  const permissions = computed(() => authStore.userInfo?.permissions || [])
  const roles = computed(() => authStore.userInfo?.roles || [])

  const hasPermission = (requiredPermissions: string | string[]): boolean => {
    const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
    return checkHasPermission(perms, permissions.value)
  }

  const hasRole = (requiredRoles: string | string[]): boolean => {
    const roleList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roleList.some(role => roles.value.includes(role))
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.value.includes(permission))
  }

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.value.includes(permission))
  }

  return {
    permissions,
    roles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions
  }
}
