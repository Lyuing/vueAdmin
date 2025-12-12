import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem, MenuConfig, BreadcrumbItem } from '@/types/navigation'
import type { RouteConfig } from '@/types/route'
// 移除了 getUserMenus 导入，因为菜单现在从用户信息中获取

export const useNavigationStore = defineStore('navigation', () => {
  // ========== 状态定义 ==========

  /** 完整菜单树 */
  const menuTree = ref<MenuItem[]>([])

  /** 映射: permissionCode -> 路由 path + name + route */
  const permissionRouteMap = ref<Map<string, { path: string; name: string; route: RouteConfig }>>(new Map())
  /** 映射: routeName -> menuItem */
  const routeNameMenuMap = ref<Map<string, MenuItem>>(new Map())
  /** 映射: routeName -> RouteConfig (路由项) */
  const routeNameRouteMap = ref<Map<string, RouteConfig>>(new Map())

  /** 映射: menuId -> menuItem */
  const menuMap = ref<Map<string, MenuItem>>(new Map())
  /** 侧边栏折叠状态 */
  const sidebarCollapsed = ref<boolean>(false)

  // ========== 核心方法 ==========

  // 构建映射   路由权限code - 路由信息(path + name + route)
  function buildPermissionRouteMap(routes: RouteConfig[]): void {
    const codeMap = new Map<string, { path: string; name: string; route: RouteConfig }>()
    const routeNameMap = new Map<string, RouteConfig>()

    function traverse(routes: RouteConfig[], parentPath = '') {
      for (const route of routes) {
        // 构建完整路径
        const fullPath = route.path.startsWith('/')
          ? route.path
          : `${parentPath}/${route.path}`.replace(/\/+/g, '/')
        // 如果路由有权限码，添加到映射（存储 path 和 name）
        if (route.meta?.permissionCode) {
          codeMap.set(route.meta.permissionCode, {
            path: fullPath,
            name: route.name,
            route: route
          })
        }
        // 同时记录 routeName -> route 映射，方便通过 routeName 查找路由配置
        if (route.name) {
          routeNameMap.set(route.name, route)
        }
        // 递归处理子路由
        if (route.children && route.children.length > 0) {
          traverse(route.children, fullPath)
        }
      }
    }
    traverse(routes)
    permissionRouteMap.value = codeMap
    routeNameRouteMap.value = routeNameMap
  }

  // 加载导航菜单
  function loadMenus(menus: any[]) {
    if ( !menus?.length ) {
      menuTree.value = []
      menuMap.value = new Map()
      routeNameMenuMap.value = new Map()
    } else {
      // 设置 菜单树结构、菜单id映射
      // 验证菜单配置
      const validConfigs = menus.filter(menu => {
        console.log('菜单元数据时', menu)
        if ( !menu.id || !menu.title ) return false
        if ( !['top', 'sidebar_directory', 'sidebar_nav'].includes(menu.menuType)) return false
        return true
      })
      // 格式化 菜单配置
      const result = getMenuTree(validConfigs)
      menuTree.value = result.tree
      menuMap.value = result.menuMap
      routeNameMenuMap.value = result.routeNameMenuMap

      console.log('--- [ 导航菜单 ] loaded ---', { ...menuTree.value })
    }
  }

  // 格式化 菜单配置、生成面包屑
  function getMenuTree( configs: MenuConfig[] ): {
    tree: MenuItem[]
    menuMap: Map<string, MenuItem>
    routeNameMenuMap: Map<string, MenuItem>
  } {
    const menuMap = new Map<string, MenuItem>()
    const routeNameMenuMap = new Map<string, MenuItem>()
    function traverseTree(
      configs: MenuConfig[],
      level: number = 1,
      parentBreadcrumbs: BreadcrumbItem[] = [],
      parent: MenuItem | null = null
    ): MenuItem[] {
      return configs.map(config => {
        // 获取路由信息
        const routeInfo = config.permissionCode
          ? permissionRouteMap.value.get(config.permissionCode)
          : undefined

        // 构建当前菜单的面包屑项
        const currentBreadcrumb: BreadcrumbItem = {
          title: config.title,
          icon: config.icon,
          path: routeInfo?.path
        }

        // 合并父级面包屑和当前面包屑
        const breadcrumbPath = [...parentBreadcrumbs, currentBreadcrumb]

        const item: MenuItem = {
          id: config.id,
          title: config.title,
          icon: config.icon,
          permissionCode: config.permissionCode,
          path: routeInfo?.path,
          routeName: routeInfo?.name,
          menuType: config.menuType,
          hidden: config.hidden,
          parent,
          bindMenuId: config.bindMenuId,
          level,
          breadcrumbPath
        }

        // 构建 menuId -> MenuItem 映射
        menuMap.set(item.id, item)
        // 构建 routeName -> MenuItem 映射
        if (item.routeName) {
          routeNameMenuMap.set(item.routeName, item)
        }

        // 递归处理子菜单
        if (config.children && config.children.length > 0) {
          item.children = traverseTree(
            config.children,
            level + 1,
            breadcrumbPath,
            item
          )
        }

        return item
      })
    }
    const tree = traverseTree(configs)
    return {
      tree,
      menuMap,
      routeNameMenuMap
    }
  }

  // ========== 状态管理方法 ==========

  /**
   * 切换侧边栏折叠状态
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }



  // ========== 查询方法 ==========


  /**
   * 通过权限码查找菜单项
   * @param permissionCode 权限码
   * @param menus 菜单列表（可选，默认使用缓存）
   * @returns 找到的菜单项或null
   */
  function findMenuByPermissionCode(permissionCode: string, menus: MenuItem[]): MenuItem | null {
    if (!menus) return null
    function traverse(items: MenuItem[]): MenuItem | null {
      for (const item of items) {
        if (item.permissionCode === permissionCode) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const found = traverse(item.children)
          if (found) return found
        }
      }
      return null
    }
    return traverse(menus)
  }
  /**
   * 根据顶部菜单 获取侧边栏菜单
   */
  function getSidebarMenus(activeTopMenu: MenuItem | null): MenuItem[] {
    if (!activeTopMenu) return []
    if ( activeTopMenu.children ) {
      return filterVisibleMenus(activeTopMenu.children)
    }
    return []
  }
  function filterVisibleMenus(menus: MenuItem[]): MenuItem[] {
    return menus
      .filter(menu => !menu.hidden)
      .map(menu => ({
        ...menu,
        children: menu.children ? filterVisibleMenus(menu.children) : []
      }))
  }

  /**
   * 解析菜单项的默认跳转路径
   * - 优先返回菜单自身的 path
   * - 其次返回第一个可见子菜单的 path（用于顶部导航未绑定路由的场景）
   */
  function resolveMenuPath(menu: MenuItem): string | undefined {
    if (!menu) return undefined
    if (menu.path) return menu.path    // 深度优先查找第一个可见子菜单的 path
    function findFirstPathInChildren(items?: MenuItem[]): string | undefined {
      if (!items) return undefined
      for (const it of items) {
        if (it.path && !it.hidden) return it.path
        if (it.children && it.children.length > 0) {
          const p = findFirstPathInChildren(it.children)
          if (p) return p
        }
      }
      return undefined
    }

    const fromChildren = findFirstPathInChildren(menu.children)
    if (fromChildren) return fromChildren

    return undefined
  }



  return {
    // 状态
    menuTree,
    menuMap,
    routeNameMenuMap,
    routeNameRouteMap,
    permissionRouteMap,
    sidebarCollapsed,

    // 核心方法
    buildPermissionRouteMap,
    loadMenus,

    // 状态管理
    toggleSidebar,

    // 查询方法
    getSidebarMenus,
    findMenuByPermissionCode,
    resolveMenuPath
  }
})
