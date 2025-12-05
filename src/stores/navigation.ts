import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem, MenuConfig, BreadcrumbItem } from '@/types/navigation'
import type { RouteConfig } from '@/types/route'
import { getUserMenus } from '@/api/menu'
import { ElMessage } from 'element-plus'

export const useNavigationStore = defineStore('navigation', () => {
  // ========== 状态定义 ==========

  /** 完整菜单树 */
  const menuTree = ref<MenuItem[]>([])

  /** 映射: menuId -> menuItem */
  const menuMap = ref<Map<string, MenuItem>>(new Map())

  /** 映射: routeName -> menuItem */
  const routeNameMenuMap = ref<Map<string, MenuItem>>(new Map())

  /** 映射: permissionCode -> 路由 path + name */
  const permissionRouteMap = ref<Map<string, { path: string; name: string }>>(new Map())

  /** 侧边栏折叠状态 */
  const sidebarCollapsed = ref<boolean>(false)

  /** 面包屑 */
  const breadcrumbs = ref<BreadcrumbItem[]>([])

  // ========== 核心方法 ==========

  // 构建映射   权限码code - 路由信息(path + name)
  function buildPermissionRouteMap(routes: RouteConfig[]): void {
    const map = new Map<string, { path: string; name: string }>()

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
        // 递归处理子路由
        if (route.children && route.children.length > 0) {
          traverse(route.children, fullPath)
        }
      }
    }
    traverse(routes)
    permissionRouteMap.value = map
  }

  // API 加载菜单
  async function loadMenus() {
    try {
      const response = await getUserMenus()
      setMenus(response.data)
    } catch (error) {
      menuTree.value = []
      menuMap.value = new Map()

      console.error('菜单加载失败:', error)
      ElMessage.error('菜单加载失败，请刷新页面重试')
    }
  }

  // 设置 菜单树结构、菜单id映射
  function setMenus(configs: MenuConfig[]) {
    // 验证菜单配置
    const validConfigs = configs.filter(config => {
      if (!config.id || !config.title) {
        console.error('Invalid menu config: missing required fields', config)
        return false
      }
      if (config.position !== 'top' && config.position !== 'sidebar') {
        console.error('Invalid menu position:', config.position)
        return false
      }
      return true
    })
    // 格式化 菜单配置
    menuTree.value = getMenuTree(validConfigs)
    // 构建菜单映射
    const maps = buildMenuMap(menuTree.value)
    menuMap.value = maps.menuMap
    routeNameMenuMap.value = maps.routeNameMenuMap

    console.log('--- [ 导航菜单 ] loaded ---', {
      totalMenus: menuMap.value.size,
      routeNameMappings: routeNameMenuMap.value.size,
      tree: menuTree.value
    })
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
        position: config.position,
        order: config.order,
        hidden: config.hidden,
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
   * 根据菜单ID 更新面包屑
   */
  function updateBreadcrumbs(menuId: string) {
    const menu = menuMap.value.get(menuId)
    if (menu) {
      breadcrumbs.value = menu.breadcrumbPath
    }
  }

  /**
   * 切换侧边栏折叠状态
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }



  // ========== 查询方法 ==========

  /**
   * 获取顶部菜单
   */
  function getTopMenus(): MenuItem[] {
    return menuTree.value
      .filter(item => item.position === 'top' && !item.hidden)
      .sort((a, b) => a.order - b.order)
  }

  /**
   * 获取侧边栏菜单
   */
  function getSidebarMenus(): MenuItem[] {
    return menuTree.value
      .filter(item => item.position === 'sidebar' && !item.hidden)
      .sort((a, b) => a.order - b.order)
  }



  return {
    // 状态
    menuTree,
    menuMap,
    routeNameMenuMap,
    permissionRouteMap,
    sidebarCollapsed,
    breadcrumbs,

    // 核心方法
    buildPermissionRouteMap,
    setMenus,
    loadMenus,

    // 状态管理
    updateBreadcrumbs,
    toggleSidebar,

    // 查询方法
    getTopMenus,
    getSidebarMenus
  }
})
