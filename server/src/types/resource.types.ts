/**
 * 资源管理类型定义
 */

export interface Resource {
  /** 资源唯一标识 */
  id: string
  /** 资源名称 */
  name: string
  /** 资源类型 */
  type: string
  /** 资源描述 */
  description?: string
  /** 资源状态 */
  status: 'active' | 'inactive'
  /** 创建时间 (ISO 8601) */
  createdAt: string
  /** 更新时间 (ISO 8601) */
  updatedAt: string
  /** 创建人 */
  createdBy?: string
  /** 扩展元数据 */
  metadata?: Record<string, any>
}
