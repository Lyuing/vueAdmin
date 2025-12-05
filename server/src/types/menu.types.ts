export interface MenuConfig {
  id: string
  title: string
  icon?: string
  permissionCode?: string
  position: 'top' | 'sidebar'
  order: number
  hidden: boolean
  children?: MenuConfig[]
}

export interface RoleMenuConfig {
  roleId: string
  roleName: string
  menuIds: string[]
}
