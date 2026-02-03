import { type User } from './user'

export const RoleType = {
  SYSTEM: 'SYSTEM',
  CUSTOM: 'CUSTOM'
} as const

export type RoleType = (typeof RoleType)[keyof typeof RoleType]

// 角色
export interface Role {
  id: number
  name: string
  code?: string | number
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  users?: User[]
  userCount?: number
  childRoles?: Role[]
  description?: string
  parentRole?: Role
  parentRoleId?: Role['id']
  permissions?: string[]
  roleType?: RoleType
  sort?: number
  createTime?: string
  updateTime?: string
}
// 角色权限
export interface RolePermission {
  id: number
  code: string
  name: string
  category: 'FUNCTION' | 'DATA'
  children: RolePermission[]
  type: 'API' | 'BUTTON' | 'MENU'
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  parentId?: number
  createTime?: string
  description?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  sort?: number
  updateTime?: string
  url?: string
}
/**
 * 权限树节点（用于角色权限分配界面）
 */
export interface TreeNode {
  /** 节点ID */
  id: number
  /** 节点标签 */
  label: string
  /** 禁用 */
  disabled?: boolean
  /** 权限码 */
  code?: string
  permissionCode?: string
  /** 是否为按钮权限点 */
  isButton?: boolean
  /** 是否为API权限点 */
  isApi?: boolean
  /** 子节点 */
  children?: TreeNode[]
  /** 数据 */
  data?: any
}
