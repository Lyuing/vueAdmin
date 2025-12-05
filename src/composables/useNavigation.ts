import { computed } from 'vue'
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

  // 获取侧边栏菜单
  const sidebarMenus = computed(() => navigationStore.getSidebarMenus())

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

  /**
   * 初始化菜单
   */
  async function initMenus() {
    // 映射 permissionCode -> {path, name}
    navigationStore.buildPermissionRouteMap(routeMap)
    // API 加载菜单
    await navigationStore.loadMenus()
  }


  return {
    // 状态
    breadcrumbs,
    topMenus,
    sidebarMenus,
    sidebarCollapsed,

    // 方法
    initMenus,

    // Store方法
    toggleSidebar: navigationStore.toggleSidebar
  }
}
