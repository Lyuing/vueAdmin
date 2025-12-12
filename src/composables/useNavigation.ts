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
  const topMenus = computed(() => navigationStore.menuTree.filter(item => item.menuType === 'top'))
  // 激活的顶部导航
  const activeTopMenu = computed<MenuItem | null>(() => {
    let topNav = null
    if (route?.name) {
      topNav = navigationStore.routeNameMenuMap.get(route.name as string) || null
    }
    while (topNav?.parent) {
      topNav = topNav.parent
    }
    // console.warn('追溯父级 Active Top Menu:', topNav)
    return topNav
  })

  // 获取侧边栏菜单（根据当前路由名称）
  const sidebarMenus = computed(() => navigationStore.getSidebarMenus(activeTopMenu.value))

  const links = computed(() => {
    let links = []
    let menu = null
    if (route.name) {
      menu = navigationStore.routeNameMenuMap.get(route.name as string) || null
    }
    while (menu) {
      if (!menu.hidden) {
        links.unshift(menu)
      } else if (menu.bindMenuId) {
        const shadowMenu = navigationStore.menuMap.get(menu.bindMenuId)
        if (shadowMenu) {
          links.unshift(shadowMenu)
        }
      }
      console.log('导航链路', links)
      menu = menu.parent
    }
    return links
  })

  // 获取当前激活的菜单路径（用于侧边栏激活）
  const activeMenuIds = computed(() => {
    const navsLink = links.value.map(item => item.id)
    console.warn('导航路径:', navsLink)
    return navsLink
  })


  // 面包屑：根据路由响应式计算
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const breadcrumbsList = links.value.map(item => {
      return {
        title: item.title,
        path: item.path,
        icon: item.icon,
      }
    })
    console.log('面包屑', breadcrumbsList)
    return breadcrumbsList
  })

  // 开发环境下打印调试信息：顶部菜单、侧栏菜单、面包屑
  if (import.meta.env.DEV) {}

  return {
    // 状态
    breadcrumbs,
    topMenus,
    activeTopMenu,
    sidebarMenus,
    sidebarCollapsed,
    activeMenuIds,

    // Store方法
    toggleSidebar: navigationStore.toggleSidebar,
  }
}
