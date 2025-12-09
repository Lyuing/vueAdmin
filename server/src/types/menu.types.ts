export interface ButtonPermission {
  code: string
  name: string
  description?: string
}

export interface MenuConfig {
  id: string
  title: string
  icon?: string
  permissionCode?: string
  buttonPermissions?: ButtonPermission[]
  position: 'top' | 'sidebar'
  // 移除 order 字段，菜单顺序由数组位置决定
  hidden: boolean
  children?: MenuConfig[]
}

export interface RoleMenuConfig {
  roleId: string
  roleName: string
  permissionCodes: string[]
}
