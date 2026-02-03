import http from './http'
import type { Region } from '@/types/region'

/**
 * 组织结构
 */

// 获取组织架构部门
export function getRegions(): Promise<Region[]> {
  return http.get('/departments/v1')
}
// 获取组织架构部门树
export function getRegionsTree(): Promise<Region[]> {
  return http.get('/departments/v1/tree')
}
