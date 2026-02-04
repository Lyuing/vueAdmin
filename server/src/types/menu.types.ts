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
  /** 挂载父级菜单的权限码，用于隐藏菜单指定其应该关联的父级菜单（待废弃） */
  parentMenuCode?: string
  children?: MenuConfig[]
}

export interface RoleMenuConfig {
  roleId: string
  roleName: string
  permissionCodes: string[]
}
