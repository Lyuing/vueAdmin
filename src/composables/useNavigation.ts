import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNavigationStore } from '@/stores/navigation'
import { routeMap } from '@/router/routes'
import type { BreadcrumbItem } from '@/types/navigation'

export function useNavigation() {
  const route = useRoute()
  const navigationStore = useNavigationStore()

  // 从store获取状态
  const { sidebarCollapsed } = storeToRefs(navigationStore)

  // 获取顶部菜单
  const topMenus = computed(() => navigationStore.getTopMenus())

  // 获取侧边栏菜单（根据当前路由名称）
  const sidebarMenus = computed(() => navigationStore.getSidebarMenus(route.name as string))

  // 获取当前激活的菜单路径（用于侧边栏激活）
  // 如果当前路径的最后一项是隐藏菜单，则回退到最近的可见祖先，保证侧栏高亮显示为可见菜单
  const activeMenuIds = computed(() => {
    const ids = navigationStore.findMenuPathByRouteName(route.name as string)
    if (!ids || ids.length === 0) return ids

    // 若当前最后一项为隐藏菜单且设置了 parentMenuCode（挂载关系），
    // 则使用挂载父菜单对应的 ID 链作为激活链（显示为挂载的可见导航）。
    const lastId = ids[ids.length - 1]
    const lastMenu = lastId ? navigationStore.menuMap.get(lastId) : undefined
    if (lastMenu && lastMenu.hidden && lastMenu.parentMenuCode) {
      const parentByCode = navigationStore.findMenuByPermissionCode(lastMenu.parentMenuCode, navigationStore.menuTree)
      if (parentByCode) {
        // 若挂载父菜单存在，返回挂载父菜单的路径
        const parentPath = navigationStore.findMenuPathByMenuId(parentByCode.id)
        if (parentPath && parentPath.length > 0) return parentPath
      }
    }

    // 默认返回原始 ids（若末尾不是隐藏或未找到挂载父）
    return ids
  })

  // 面包屑：根据路由响应式计算
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    let menu = null
    if (route.name) {
      menu = navigationStore.routeNameMenuMap.get(route.name as string) || null
    }
    if (!menu && route.path) {
      for (const [, item] of navigationStore.menuMap) {
        if (item.path === route.path) {
          menu = item
          break
        }
      }
    }
    return menu?.breadcrumbPath || []
  })

  // 开发环境下打印调试信息：顶部菜单、侧栏菜单、面包屑
  if (import.meta.env.DEV) {
    const activeTopMenu = computed(() => navigationStore.findTopMenuByRouteName(route.name as string))
    const activeMenuIdsLocal = computed(() => navigationStore.findMenuPathByRouteName(route.name as string))
    const activeMenuItem = computed(() => {
      const ids = activeMenuIdsLocal.value
      const lastId = ids.length > 0 ? ids[ids.length - 1] : undefined
      return lastId ? navigationStore.menuMap.get(lastId) : undefined
    })

    watch(
      [activeTopMenu, activeMenuIdsLocal, activeMenuItem, breadcrumbs],
      ([top, ids, item, b]) => {
        try {
          console.group('%cNavigation Active Debug', 'color: #67C23A; font-weight: bold;')
          console.log('Active Top Menu:', top ? JSON.parse(JSON.stringify(top)) : null)
          console.log('Active Menu IDs:', JSON.parse(JSON.stringify(ids)))
          console.log('Active Menu Item:', item ? JSON.parse(JSON.stringify(item)) : null)
          console.log('Breadcrumbs:', JSON.parse(JSON.stringify(b)))
          console.groupEnd()
        } catch (e) {
          console.log('Navigation Active Debug:', { top, ids, item, breadcrumbs: b })
        }
      },
      { immediate: true }
    )
  }

  /**
   * 初始化路由权限映射
   */
  function initRoutePermissionMap() {
    // 映射 permissionCode -> {path, name}
    navigationStore.buildPermissionRouteMap(routeMap)
  }

  return {
    // 状态
    breadcrumbs,
    topMenus,
    sidebarMenus,
    sidebarCollapsed,
    activeMenuIds,

    // 方法
    initRoutePermissionMap,

    // Store方法
    toggleSidebar: navigationStore.toggleSidebar,
    isMenuActive: navigationStore.isMenuActive
  }
}
