/**
 * 导航系统类型定义
 * 用于路由与菜单解耦的类型系统
 */

/**
 * 路由元信息配置
 * 仅包含路由相关的属性,不包含UI展示相关属性
 */
export interface RouteMetaConfig {
  /** 路由标题 */
  title: string
  /** 是否需要认证 */
  requiresAuth: boolean
  /** 权限码,用于权限验证和菜单关联 */
  permissionCode?: string
  /** 是否完全隐藏该路由 */
  hidden?: boolean
  /** 是否缓存页面 */
  keepAlive?: boolean
}

/**
 * 后端返回的菜单配置结构
 * 树形结构,包含所有菜单配置信息
 */
export interface MenuConfig {
  /** 菜单唯一标识 */
  id: string
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 关联的权限码 */
  permissionCode?: string
  /** 显示位置: 顶部导航或侧边栏 */
  position: 'top' | 'sidebar'
  /** 排序序号 */
  order: number
  /** 是否隐藏 */
  hidden: boolean
  /** 子菜单列表 */
  children?: MenuConfig[]
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /** 面包屑标题 */
  title: string
  /** 关联的路由路径 */
  path?: string
  /** 图标 */
  icon?: string
}

/**
 * 前端使用的菜单项
 * 包含预计算的面包屑路径和其他派生属性
 */
export interface MenuItem {
  /** 菜单唯一标识 */
  id: string
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 关联的权限码 */
  permissionCode?: string
  /** 关联的路由路径(通过permissionCode查找) */
  path?: string
  /** 关联的路由名称 */
  routeName?: string
  /** 显示位置: 顶部导航或侧边栏 */
  position: 'top' | 'sidebar'
  /** 排序序号 */
  order: number
  /** 是否隐藏 */
  hidden: boolean
  /** 子菜单列表 */
  children?: MenuItem[]
  /** 菜单层级(自动计算) */
  level: number
  /** 预计算的面包屑路径 */
  breadcrumbPath: BreadcrumbItem[]
}

/**
 * 角色菜单配置
 */
export interface RoleMenuConfig {
  /** 角色ID */
  roleId: string
  /** 角色名称 */
  roleName: string
  /** 该角色可访问的菜单ID列表 */
  menuIds: string[]
}
