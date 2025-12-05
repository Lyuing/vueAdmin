import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNavigationStore } from '@/stores/navigation'
import type { MenuItem } from '@/types/navigation'
import { routeMap } from '@/router/routes'

export function useNavigation() {
  const route = useRoute()
  const navigationStore = useNavigationStore()

  // 从store获取状态
  const {
    menuMap,
    breadcrumbs,
    sidebarCollapsed
  } = storeToRefs(navigationStore)

  // 获取顶部菜单
  const topMenus = computed(() => navigationStore.getTopMenus())

  // 获取侧边栏菜单
  const sidebarMenus = computed(() => navigationStore.getSidebarMenus())

  /**
   * 初始化菜单
   */
  async function initMenus() {
    // 映射 code -> fullPath
    navigationStore.buildPermissionRouteMap(routeMap)
    // API 加载菜单
    await navigationStore.loadMenus()

    // 路由守卫里会执行同步，但是页面刷新时路由规则未生成，获取不到路由信息
    // 会跳过面包屑的查询，故此处需重复执行
    // 同步当前路由与菜单状态
    syncMenuWithRoute()
  }

  /**
   * 根据路由更新面包屑
   */
  function syncMenuWithRoute() {
    let menu: MenuItem | null = null
    
    // 优先通过 route.name 查找
    if (route.name) {
      menu = navigationStore.routeNameMenuMap.get(route.name as string) || null
    }
    
    // 降级：通过 path 查找
    if (!menu && route.path) {
      for (const [, item] of menuMap.value) {
        if (item.path === route.path) {
          menu = item
          break
        }
      }
    }
    
    console.warn('根据路由更新面包屑', menu)
    // 更新面包屑
    if (menu) {
      navigationStore.updateBreadcrumbs(menu.id)
    }
  }



  return {
    // 状态
    breadcrumbs,
    sidebarCollapsed,
    topMenus,
    sidebarMenus,

    // 方法
    initMenus,
    syncMenuWithRoute,

    // Store方法
    toggleSidebar: navigationStore.toggleSidebar
  }
}
