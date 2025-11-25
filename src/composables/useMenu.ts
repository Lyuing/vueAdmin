import { computed } from 'vue'
import { useMenuStore } from '@/stores/menu'
import type { RouteConfig } from '@/types/route'
import type { MenuItem } from '@/types/menu'
import { hasPermission } from '@/router/permission'

/**
 * 菜单管理 Composable
 *
 * 主要功能：
 * - 从路由配置生成菜单数据
 * - 管理菜单的激活状态和展开状态
 * - 控制侧边栏的折叠/展开
 *
 * 使用场景：
 * - Sidebar.vue - 侧边栏菜单显示
 * - TopNav.vue - 顶部导航菜单
 * - MainLayout.vue - 判断是否显示侧边栏
 * - router/guards.ts - 路由守卫自动展开菜单
 * - router/index.ts - 动态路由加载后生成菜单
 */
export function useMenu() {
  const menuStore = useMenuStore()

  /**
   * 状态
   */

  const menuList = computed(() => menuStore.menuList)
  const activeMenu = computed(() => menuStore.activeMenu)
  const openedMenus = computed(() => menuStore.openedMenus)
  const collapsed = computed(() => menuStore.collapsed)

  /**
   * 方法
   */

  // 路由提取菜单，并暂存store -- router/index.ts
  function setMenus(routes: RouteConfig[], permissions: string[], allRoutes: RouteConfig[]) {
    const menus = generateMenus(routes, permissions, allRoutes)
    menuStore.setMenuList(menus)
  }

  // 设置当前激活的一级菜单 -- TopNav.vue
  function setActiveMenu(menuName: string) {
    menuStore.setActiveMenu(menuName)
  }


  // 根据当前路由自动展开侧栏父级菜单 --  Sidebar.vue, router/guards.ts
  function autoExpandMenus(routeName: string) {
    const breadcrumb = getBreadcrumb(routeName, menuList.value)
    const menuNames = breadcrumb.map(item => item.name)
    menuStore.setOpenedMenus(menuNames)

    // 设置激活的一级菜单
    if (breadcrumb.length > 0) {
      const topMenu = breadcrumb[0]
      if (topMenu) {
        menuStore.setActiveMenu(topMenu.name)
      }
    }
  }


  // 获取当前一级菜单的下级菜单，渲染侧栏 -- Sidebar.vue, MainLayout.vue
  function getActiveMenuChildren(): MenuItem[] {
    const activeMenuItem = menuList.value.find(item => item.name === activeMenu.value)
    return activeMenuItem?.children || []
  }
  
  // 切换侧边栏折叠状态 -- Sidebar.vue
  function toggleCollapse() {
    menuStore.toggleCollapse()
  }
  
  // 切换侧栏菜单的展开状态 -- 预留功能
  function toggleSubmenu(menuName: string) {
    const index = openedMenus.value.indexOf(menuName)
    const newOpenedMenus = [...openedMenus.value]

    if (index > -1) {
      newOpenedMenus.splice(index, 1)
    } else {
      newOpenedMenus.push(menuName)
    }

    menuStore.setOpenedMenus(newOpenedMenus)
  }

  return {
    // 状态
    menuList,
    activeMenu,
    openedMenus,
    collapsed,
    // 方法
    setMenus,
    setActiveMenu,
    toggleSubmenu,
    autoExpandMenus,
    toggleCollapse,
    getActiveMenuChildren
  }
}

// ============================================
// 导出的辅助函数
// ============================================

/**
 * 根据菜单name查找菜单项
 * @使用位置 Sidebar.vue
 */
export function findMenuByName(name: string, menus: MenuItem[]): MenuItem | null {
  for (const menu of menus) {
    if (menu.name === name) {
      return menu
    }
    if (menu.children) {
      const found = findMenuByName(name, menu.children)
      if (found) return found
    }
  }
  return null
}

// ============================================
// 内部辅助函数
// ============================================

/**
 * 根据路由name查找路由配置
 */
function findRouteByName(name: string, routes: RouteConfig[]): RouteConfig | null {
  for (const route of routes) {
    if (route.name === name) {
      return route
    }
    if (route.children) {
      const found = findRouteByName(name, route.children)
      if (found) return found
    }
  }
  return null
}

/**
 * 计算菜单层级
 */
function calculateLevel(route: RouteConfig, allRoutes: RouteConfig[]): number {
  if (!route.meta.parent) return 1 // 顶部导航

  const parent = findRouteByName(route.meta.parent, allRoutes)
  if (!parent?.meta.parent) return 2 // 侧边栏一级

  return 3 // 侧边栏二级或更深
}

/**
 * 从路由配置生成菜单数据
 */
function generateMenus(
  routes: RouteConfig[],
  permissions: string[],
  allRoutes: RouteConfig[]
): MenuItem[] {
  const menus: MenuItem[] = []

  for (const route of routes) {
    // 跳过隐藏的路由
    if (route.meta?.hidden) {
      // 但是要处理它的children
      if (route.children) {
        menus.push(...generateMenus(route.children, permissions, allRoutes))
      }
      continue
    }

    // 检查权限
    if (!hasPermission(route.meta?.permissions, permissions)) {
      continue
    }

    const menuItem: MenuItem = {
      id: route.name,
      name: route.name,
      title: route.meta.title,
      icon: route.meta.icon,
      path: route.path,
      parent: route.meta.parent,
      level: calculateLevel(route, allRoutes),
      order: route.meta.order || 0,
      permissions: route.meta.permissions,
      hidden: route.meta.hidden
    }

    // 处理子菜单
    if (route.children) {
      menuItem.children = generateMenus(route.children, permissions, allRoutes)
    }

    menus.push(menuItem)
  }

  return menus.sort((a, b) => (a.order || 0) - (b.order || 0))
}

/**
 * 根据当前路由获取面包屑路径
 */
function getBreadcrumb(routeName: string, menuList: MenuItem[]): MenuItem[] {
  const breadcrumb: MenuItem[] = []
  let current = findMenuByName(routeName, menuList)

  while (current) {
    breadcrumb.unshift(current)
    if (current.parent) {
      current = findMenuByName(current.parent, menuList)
    } else {
      break
    }
  }

  return breadcrumb
}
