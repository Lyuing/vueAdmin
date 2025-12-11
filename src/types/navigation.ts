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
 * 按钮权限点
 */
export interface ButtonPermission {
  /** 按钮权限点唯一标识 */
  code: string
  /** 按钮权限点名称 */
  name: string
  /** 描述 */
  description?: string
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
  /** 按钮权限点列表 */
  buttonPermissions?: ButtonPermission[]
  /** 菜单类型: 顶部导航、侧栏导航或侧栏目录 */
  menuType: 'top' | 'sidebar_nav' | 'sidebar_directory'
  /** 是否隐藏 */
  hidden: boolean
  /** 挂载父级菜单的权限码，用于隐藏菜单指定其应该关联的父级菜单 */
  parentMenuCode?: string
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
  /** 按钮权限点列表 */
  buttonPermissions?: ButtonPermission[]
  /** 关联的路由路径(通过permissionCode查找) */
  path?: string
  /** 关联的路由名称 */
  routeName?: string
  /** 菜单类型: 顶部导航、侧栏导航或侧栏目录 */
  menuType: 'top' | 'sidebar_nav' | 'sidebar_directory'
  /** 是否隐藏 */
  hidden: boolean
  /** 挂载父级菜单的权限码，用于隐藏菜单指定其应该关联的父级菜单 */
  parentMenuCode?: string
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
  /** 该角色可访问的权限码列表 */
  permissionCodes: string[]
}

/**
 * 权限树节点（用于角色权限分配界面）
 */
export interface TreeNode {
  /** 节点ID */
  id: string
  /** 节点标签 */
  label: string
  /** 权限码 */
  permissionCode?: string
  /** 是否为按钮权限点 */
  isButton?: boolean
  /** 子节点 */
  children?: TreeNode[]
}

/**
 * 菜单挂载关系验证结果
 */
export interface ValidationResult {
  /** 验证是否通过 */
  valid: boolean
  /** 错误信息（验证失败时） */
  error?: string
}
