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
  menuType: 'top' | 'sidebar'
  // 移除 order 字段，菜单顺序由数组位置决定
  hidden: boolean
  /** 挂载父级菜单的权限码，用于隐藏菜单指定其应该关联的父级菜单 */
  parentMenuCode?: string
  children?: MenuConfig[]
}

export interface RoleMenuConfig {
  roleId: string
  roleName: string
  permissionCodes: string[]
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
