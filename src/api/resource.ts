import http from './http'
import type { Resource } from '@/types/resource'

/**
 * 获取所有资源列表
 */
export function getAllResources(): Promise<{ data: Resource[] }> {
  return http.get('/resource')
}

/**
 * 获取单个资源详情
 */
export function getResourceById(id: string): Promise<{ data: Resource }> {
  return http.get(`/resource/${id}`)
}

/**
 * 创建资源
 */
export function createResource(resource: Partial<Resource>): Promise<{ data: Resource }> {
  return http.post('/resource', resource)
}

/**
 * 更新资源
 */
export function updateResource(id: string, resource: Partial<Resource>): Promise<{ data: Resource }> {
  return http.put(`/resource/${id}`, resource)
}

/**
 * 删除资源
 */
export function deleteResource(id: string): Promise<void> {
  return http.delete(`/resource/${id}`)
}
