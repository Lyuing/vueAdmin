export interface ButtonPermission {
  code: string
  name: string
  description?: string
}

export interface MenuConfig {
  id: number
  title: string
  icon?: string
  permissionId?: number
  permissionCode?: string
  buttonPermissions?: ButtonPermission[]
  menuType: 'top' | 'sidebar_nav' | 'sidebar_directory'
  // 移除 order 字段，菜单顺序由数组位置决定
  hidden: boolean
  /** 绑定父级菜单的ID，用于隐藏菜单指定其应该关联的父级菜单 */
  bindMenuId?: number
  /** 父级菜单ID，用于构建菜单树结构 */
  parentId?: number | null
  /** 挂载父级菜单的权限码，用于隐藏菜单指定其应该关联的父级菜单（待废弃） */
  parentMenuCode?: string
  /** 菜单排序 */
  sort?: number
  /** 是否缓存页面 */
  keepAlive?: boolean
  /** 创建时间 */
  createdTime?: string
  /** 更新时间 */
  updateTime?: string
  children?: MenuConfig[]
}

export interface RoleMenuConfig {
  roleId: string
  roleName: string
  permissionCodes: string[]
}
