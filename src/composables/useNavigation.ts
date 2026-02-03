import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNavigationStore } from '@/stores/navigation'
import type { BreadcrumbItem, MenuItem } from '@/types/navigation'

export function useNavigation() {
  const route = useRoute()
  const navigationStore = useNavigationStore()

  // 从store获取状态
  const { sidebarCollapsed } = storeToRefs(navigationStore)

  // 获取顶部菜单
  const topNavs = computed(() => navigationStore.menuTree.filter(item => item.menuType === 'top'))
  // 激活的顶部导航
  const activeTopNav = computed<MenuItem | null>(() => {
    let topNav = null
    if (route?.name) {
      topNav = navigationStore.routeNameMenuMap.get(route.name as string) || null
    }
    while (topNav?.parent) {
      topNav = topNav.parent
    }
    return topNav
  })

  // 获取侧边栏菜单（根据当前路由名称）
  const sidebarMenus = computed(() => navigationStore.getSidebarMenus(activeTopNav.value))

  // 导航链路 - 完整链路
  const links = computed(() => {
    let links = []
    let menu = null
    if (route.name) {
      menu = navigationStore.routeNameMenuMap.get(route.name as string) || null
    }
    while (menu) {
      /**
       * 链路追踪
       *  完全显示每个路由的链路
       *  导航菜单、面包屑使用时自行筛选
       */
      links.unshift(menu)
      if (menu.bindMenuId) {
        const shadowMenus = getShadowMenus(menu.bindMenuId)
        // console.warn('绑定菜单', shadowMenus)
        if (shadowMenus?.length) {
          links.unshift(...shadowMenus)
        }
      }
      // console.log('导航链路', links)
      menu = menu.parent
    }
    return links
  })
  // 获取某个菜单的綁定导航链路
  function getShadowMenus(menuId: number): MenuItem[] {
    const links = []
    let shadowMenu: MenuItem | null = navigationStore.menuMap.get(menuId) as MenuItem
    while (shadowMenu && links.length < 10) {
      links.unshift({ ...shadowMenu })
      if (shadowMenu.hidden && shadowMenu.bindMenuId) {
        shadowMenu = navigationStore.menuMap.get(shadowMenu.bindMenuId) as MenuItem
      } else {
        shadowMenu = null
      }
    }
    return links
  }

  // 获取当前激活的菜单路径（用于侧边栏激活）
  const activeMenuIds = computed(() => {
    const navsLink = links.value.filter(item => !item.hidden).map(item => item.id)
    // console.warn('导航路径:', navsLink)
    return navsLink
  })

  // 获取面包屑：根据路由响应式计算
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const breadcrumbsList = links.value
      .map(item => {
        return {
          ...item,
          title: item.title,
          path: item.path,
          icon: item.icon,
          isDirectory: item.menuType === 'sidebar_directory'
        }
      })
      .filter(item => item.menuType !== 'top' && item.level > 2)
    // console.log('面包屑', breadcrumbsList)
    return breadcrumbsList
  })

  return {
    // 状态
    breadcrumbs,
    topNavs,
    activeTopNav,
    sidebarMenus,
    sidebarCollapsed,
    activeMenuIds,

    // Store方法
    toggleSidebar: navigationStore.toggleSidebar
  }
}
