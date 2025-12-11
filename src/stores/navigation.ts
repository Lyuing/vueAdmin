import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem, MenuConfig, BreadcrumbItem } from '@/types/navigation'
import type { RouteConfig } from '@/types/route'
import { MenuCache } from '@/utils/menu-utils'
// 移除了 getUserMenus 导入，因为菜单现在从用户信息中获取

export const useNavigationStore = defineStore('navigation', () => {
  // ========== 状态定义 ==========

  /** 完整菜单树 */
  const menuTree = ref<MenuItem[]>([])

  /** 映射: menuId -> menuItem */
  const menuMap = ref<Map<string, MenuItem>>(new Map())

  /** 映射: routeName -> menuItem */
  const routeNameMenuMap = ref<Map<string, MenuItem>>(new Map())

  /** 映射: routeName -> RouteConfig (路由项) */
  const routeNameRouteMap = ref<Map<string, RouteConfig>>(new Map())

  /** 映射: permissionCode -> 路由 path + name */
  const permissionRouteMap = ref<Map<string, { path: string; name: string }>>(new Map())

  /** 侧边栏折叠状态 */
  const sidebarCollapsed = ref<boolean>(false)

  /** 菜单缓存实例 */
  const menuCache = new MenuCache()

  // ========== 核心方法 ==========

  // 构建映射   路由权限code - 路由信息(path + name)
  function buildPermissionRouteMap(routes: RouteConfig[]): void {
    const map = new Map<string, { path: string; name: string }>()
    const rNameMap = new Map<string, RouteConfig>()

    function traverse(routes: RouteConfig[], parentPath = '') {
      for (const route of routes) {
        // 构建完整路径
        const fullPath = route.path.startsWith('/')
          ? route.path
          : `${parentPath}/${route.path}`.replace(/\/+/g, '/')
        // 如果路由有权限码，添加到映射（存储 path 和 name）
        if (route.meta?.permissionCode) {
          map.set(route.meta.permissionCode, {
            path: fullPath,
            name: route.name
          })
        }
        // 同时记录 routeName -> route 映射，方便通过 routeName 查找路由配置
        if (route.name) {
          rNameMap.set(route.name, route)
        }
        // 递归处理子路由
        if (route.children && route.children.length > 0) {
          traverse(route.children, fullPath)
        }
      }
    }
    traverse(routes)
    permissionRouteMap.value = map
    routeNameRouteMap.value = rNameMap
  }

  // 从用户信息中加载菜单
  function loadMenusFromUserInfo(menus: any[]) {
    if (menus && menus.length > 0) {
      setMenus(menus)
    } else {
      menuTree.value = []
      menuMap.value = new Map()
      routeNameMenuMap.value = new Map()
    }
  }

  // 设置 菜单树结构、菜单id映射
  function setMenus(configs: MenuConfig[]) {
    // 验证菜单配置
    const validConfigs = configs.filter(config => {
      console.log('菜单元数据时', config)
      if (!config.id || !config.title) {
        console.error('Invalid menu config: missing required fields', config)
        return false
      }
      if (config.menuType !== 'top' && config.menuType !== 'sidebar_nav' && config.menuType !== 'sidebar_directory') {
        console.error('Invalid menu type:', config.menuType)
        return false
      }
      return true
    })
    // 格式化 菜单配置
    menuTree.value = getMenuTree(validConfigs)
    // 重新计算面包屑路径（考虑挂载关系）
    updateBreadcrumbPaths(menuTree.value)
    // 更新菜单缓存
    menuCache.updateCache(menuTree.value)
    // 构建菜单映射（保持向后兼容）
    const maps = buildMenuMap(menuTree.value)
    menuMap.value = maps.menuMap
    routeNameMenuMap.value = maps.routeNameMenuMap

    console.log('--- [ 导航菜单 ] loaded ---', {
      ...menuCache.getStats(),
      tree: menuTree.value
    })
  }

  /**
   * 更新菜单树中所有菜单项的面包屑路径
   * @param menus 菜单列表
   */
  function updateBreadcrumbPaths(menus: MenuItem[]) {
    function traverse(items: MenuItem[]) {
      for (const item of items) {
        // 重新计算面包屑路径
        item.breadcrumbPath = generateBreadcrumbPath(item, menus)
        
        if (item.children && item.children.length > 0) {
          traverse(item.children)
        }
      }
    }
    
    traverse(menus)
  }

  // 格式化 菜单配置、生成面包屑
  function getMenuTree(
    configs: MenuConfig[],
    level = 1,
    parentBreadcrumbs: BreadcrumbItem[] = []
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
        parentMenuCode: config.parentMenuCode,
        level,
        breadcrumbPath
      }

      // 递归处理子菜单
      if (config.children && config.children.length > 0) {
        item.children = getMenuTree(
          config.children,
          level + 1,
          breadcrumbPath
        )
      }

      return item
    })
  }

  // 构建映射 菜单id - 菜单项 和 路由名称 - 菜单项
  function buildMenuMap(menuTree: MenuItem[]): {
    menuMap: Map<string, MenuItem>
    routeNameMenuMap: Map<string, MenuItem>
  } {
    const menuMap = new Map<string, MenuItem>()
    const routeNameMenuMap = new Map<string, MenuItem>()

    function traverse(items: MenuItem[]) {
      for (const item of items) {
        // 构建 menuId -> MenuItem 映射
        menuMap.set(item.id, item)
        // 构建 routeName -> MenuItem 映射
        if (item.routeName) {
          routeNameMenuMap.set(item.routeName, item)
        }

        if (item.children && item.children.length > 0) {
          traverse(item.children)
        }
      }
    }

    traverse(menuTree)
    return { menuMap, routeNameMenuMap }
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
   * 递归过滤可见菜单
   * @param menus 菜单列表
   * @returns 过滤后的可见菜单列表
   */
  function filterVisibleMenus(menus: MenuItem[]): MenuItem[] {
    return menus
      .filter(menu => !menu.hidden)
      .map(menu => ({
        ...menu,
        children: menu.children ? filterVisibleMenus(menu.children) : []
      }))
  }

  /**
   * 查找所有以指定权限码为父级的隐藏菜单
   * @param parentPermissionCode 父级菜单的权限码
   * @returns 隐藏菜单列表
   */
  function findHiddenMenusByParentCode(parentPermissionCode?: string): MenuItem[] {
    if (!parentPermissionCode) return []
    return menuCache.getHiddenMenusByParentCode(parentPermissionCode)
  }

  /**
   * 检查挂载的隐藏菜单是否包含指定路由
   * @param menu 菜单项
   * @param routeName 路由名称
   * @returns 是否包含
   */
  function checkMountedHiddenMenus(menu: MenuItem, routeName: string): boolean {
    // 查找所有以当前菜单权限码为父级的隐藏菜单
    const hiddenMenus = findHiddenMenusByParentCode(menu.permissionCode)
    return hiddenMenus.some(hiddenMenu => 
      hiddenMenu.routeName === routeName || 
      (hiddenMenu.children && checkRouteNameInMenu(hiddenMenu, routeName))
    )
  }

  /**
   * 通过权限码查找菜单项
   * @param permissionCode 权限码
   * @param menus 菜单列表（可选，默认使用缓存）
   * @returns 找到的菜单项或null
   */
  function findMenuByPermissionCode(permissionCode: string, menus?: MenuItem[]): MenuItem | null {
    // 如果提供了特定的菜单列表，使用传统查找方式
    if (menus) {
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
    
    // 使用缓存快速查找
    return menuCache.getMenuByPermissionCode(permissionCode) || null
  }

  /**
   * 增强的面包屑生成逻辑
   * @param menu 菜单项
   * @param allMenus 所有菜单列表（可选）
   * @returns 面包屑路径
   */
  function generateBreadcrumbPath(menu: MenuItem, allMenus?: MenuItem[]): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    const searchMenus = allMenus || menuTree.value
    
    // 如果是隐藏菜单且有挂载父级
    if (menu.hidden && menu.parentMenuCode) {
      const parentMenu = findMenuByPermissionCode(menu.parentMenuCode, searchMenus)
      if (parentMenu) {
        // 递归获取父级面包屑
        breadcrumbs.push(...generateBreadcrumbPath(parentMenu, searchMenus))
      }
    } else {
      // 正常的层级面包屑
      const parentPath = findMenuParentPath(menu.id, searchMenus)
      breadcrumbs.push(...parentPath)
    }
    
    // 添加当前菜单
    breadcrumbs.push({
      title: menu.title,
      icon: menu.icon,
      path: menu.path
    })
    
    return breadcrumbs
  }

  /**
   * 查找菜单的父级路径
   * @param menuId 菜单ID
   * @param menus 菜单列表
   * @returns 父级路径面包屑
   */
  function findMenuParentPath(menuId: string, menus: MenuItem[]): BreadcrumbItem[] {
    const path: BreadcrumbItem[] = []
    
    function findPath(items: MenuItem[], targetId: string, currentPath: BreadcrumbItem[]): boolean {
      for (const item of items) {
        const newPath = [...currentPath, {
          title: item.title,
          icon: item.icon,
          path: item.path
        }]
        
        if (item.id === targetId) {
          // 找到目标，但不包含目标本身
          path.push(...currentPath)
          return true
        }
        
        if (item.children && item.children.length > 0) {
          if (findPath(item.children, targetId, newPath)) {
            return true
          }
        }
      }
      return false
    }
    
    findPath(menus, menuId, [])
    return path
  }

  /**
   * 获取顶部菜单
   */
  function getTopMenus(): MenuItem[] {
    return menuTree.value
      .filter(item => item.menuType === 'top' && !item.hidden)
  }

  /**
   * 通过路由名称查找菜单项及其所有父级菜单
   * @param routeName 路由名称
   * @returns 当前菜单项及其所有父级菜单的ID数组（从根到当前）
   */
  function findMenuPathByRouteName(routeName?: string): string[] {
    if (!routeName) return []
    
    const currentMenu = routeNameMenuMap.value.get(routeName)
    if (!currentMenu) return []

    // 从当前菜单向上查找所有父级菜单
    const path: string[] = []
    let menu: MenuItem | undefined = currentMenu

    // 向上查找父级菜单，优先使用挂载 parentMenuCode（针对隐藏菜单），否则查结构父级
    while (menu) {
      path.unshift(menu.id)
      // 若当前菜单为隐藏并且设置了 parentMenuCode，则将 parent 设置为对应的菜单（按 permissionCode 查找）
      if (menu.hidden && menu.parentMenuCode) {
        const parentByCode = findMenuByPermissionCode(menu.parentMenuCode, menuTree.value) as MenuItem | null
        if (parentByCode) {
          menu = parentByCode
          continue
        }
      }

      // 回退到结构化的父级查找
      menu = findParentMenu(menu.id, menuTree.value)
    }

    return path
  }

  /**
   * 在菜单树中查找指定菜单项的父级菜单
   */
  function findParentMenu(menuId: string, menus: MenuItem[], parent?: MenuItem): MenuItem | undefined {
    for (const menu of menus) {
      if (menu.id === menuId) {
        return parent
      }
      if (menu.children && menu.children.length > 0) {
        const found = findParentMenu(menuId, menu.children, menu)
        if (found !== undefined) {
          return found
        }
      }
    }
    return undefined
  }

  /**
   * 通过菜单ID查找从根到该菜单的ID链
   * @param menuId 菜单ID
   * @param menus 可选菜单树（默认 menuTree.value）
   */
  function findMenuPathByMenuId(menuId: string, menus?: MenuItem[]): string[] {
    const searchMenus = menus || menuTree.value
    const path: string[] = []

    function dfs(items: MenuItem[], currentPath: string[]): boolean {
      for (const item of items) {
        const newPath = [...currentPath, item.id]
        if (item.id === menuId) {
          path.push(...newPath)
          return true
        }
        if (item.children && item.children.length > 0) {
          if (dfs(item.children, newPath)) return true
        }
      }
      return false
    }

    dfs(searchMenus, [])
    return path
  }

  /**
   * 通过路由名称查找当前菜单项所属的顶部菜单
   */
  function findTopMenuByRouteName(routeName?: string): MenuItem | null {
    if (!routeName) return null

    const currentMenu = routeNameMenuMap.value.get(routeName)
    if (!currentMenu) return null

    // 向上查找直到找到顶部菜单
    let menu: MenuItem | undefined = currentMenu
    while (menu) {
      if (menu.menuType === 'top') {
        return menu
      }

      // 优先处理隐藏菜单的挂载父级（parentMenuCode）
      if (menu.hidden && menu.parentMenuCode) {
        const parentByCode = findMenuByPermissionCode(menu.parentMenuCode, menuTree.value) as MenuItem | null
        if (parentByCode) {
          menu = parentByCode
          continue
        }
      }

      menu = findParentMenu(menu.id, menuTree.value)
    }

    return null
  }

  /**
   * 检查菜单项或其子菜单是否包含指定的路由名称
   */
  function checkRouteNameInMenu(menu: MenuItem, routeName: string): boolean {
    // 检查当前菜单
    if (menu.routeName === routeName) {
      return true
    }
    // 递归检查子菜单
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (checkRouteNameInMenu(child, routeName)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * 获取侧边栏菜单（修复隐藏菜单过滤）
   * 根据当前路由名称找到对应的顶部导航，返回其子菜单
   */
  function getSidebarMenus(routeName?: string): MenuItem[] {
    // 如果没有提供路由名称，返回空数组
    if (!routeName) {
      return []
    }

    // 查找当前路由属于哪个顶部导航
    const activeTopMenu = findTopMenuByRouteName(routeName)

    // 如果找到了对应的顶部菜单，返回其过滤后的子菜单
    if (activeTopMenu && activeTopMenu.children) {
      return filterVisibleMenus(activeTopMenu.children)
    }

    return []
  }

  /**
   * 增强的菜单激活检查（考虑挂载关系）
   * @param menu 菜单项
   * @param routeName 当前路由名称
   * @returns 是否激活
   */
  function isMenuActive(menu: MenuItem, routeName?: string): boolean {
    if (!routeName) return false
    
    // 直接匹配
    if (menu.routeName === routeName) {
      return true
    }
    
    // 检查子菜单（包括隐藏的）
    if (checkRouteNameInMenu(menu, routeName)) {
      return true
    }
    
    // 检查挂载的隐藏菜单
    return checkMountedHiddenMenus(menu, routeName)
  }

  /**
   * 解析一个菜单项的默认跳转路径
   * - 优先返回菜单自身的 path
   * - 其次返回第一个可见子菜单的 path（深度优先）
   * - 最后返回挂载到该菜单的隐藏菜单的 path（如果有）
   */
  function resolveMenuPath(menu: MenuItem): string | undefined {
    if (!menu) return undefined

    if (menu.path) return menu.path

    // 深度优先查找第一个可见子菜单的 path
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

    // 查找挂载的隐藏菜单
    if (menu.permissionCode) {
      const hidden = menuCache.getHiddenMenusByParentCode(menu.permissionCode)
      for (const h of hidden) {
        if (h.path) return h.path
        // 如果隐藏菜单本身没有 path，尝试其子项
        const p = findFirstPathInChildren(h.children)
        if (p) return p
      }
    }

    return undefined
  }



  return {
    // 状态
    menuTree,
    menuMap,
    routeNameMenuMap,
    routeNameRouteMap,
    findMenuPathByMenuId,
    permissionRouteMap,
    sidebarCollapsed,
    menuCache,

    // 核心方法
    buildPermissionRouteMap,
    setMenus,
    loadMenusFromUserInfo,

    // 状态管理
    toggleSidebar,

    // 查询方法
    getTopMenus,
    getSidebarMenus,
    findMenuPathByRouteName,
    findTopMenuByRouteName,
    isMenuActive,
    filterVisibleMenus,
    findHiddenMenusByParentCode,
    checkMountedHiddenMenus,
    findMenuByPermissionCode,
    generateBreadcrumbPath
    ,
    resolveMenuPath
  }
})
