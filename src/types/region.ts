/**
 * 组织结构
 */

import type { User } from './user'

// 组织架构部门
export interface Region {
  id: number
  code?: string
  name?: string
  parentId?: number
  parentDepartment?: string
  childDepartments?: string[]
  permissions?: number[]
  description?: string
  sort?: number
  status?: 'ACTIVE' | 'INACTIVE'
  createTime?: string
  updateTime?: string
  users?: User[]
}

// 组织架构部门
export interface RegionTreeNode {
  id: number
  code?: string
  name?: string
  parentId?: number
  parent?: RegionTreeNode
  children?: RegionTreeNode[]
  customerCount?: number
  description?: string
  sort?: number
  status?: 'ACTIVE' | 'INACTIVE'
  createTime?: string
  updateTime?: string
}
