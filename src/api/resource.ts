import http from './http'
import type { Resource } from '@/types/resource'

/**
 * 获取所有资源列表
 */
export function getAllResources(): Promise<{ data: Resource[] }> {
  return http.get('/resource/list')
}

/**
 * 获取单个资源详情
 */
export function getResourceById(id: string): Promise<{ data: Resource }> {
  return http.post('/resource/detail', { id })
}

/**
 * 创建资源
 */
export function createResource(resource: Partial<Resource>): Promise<{ data: Resource }> {
  return http.post('/resource/create', resource)
}

/**
 * 更新资源
 */
export function updateResource(id: string, resource: Partial<Resource>): Promise<{ data: Resource }> {
  return http.post('/resource/update', { id, ...resource })
}

/**
 * 删除资源
 */
export function deleteResource(id: string): Promise<void> {
  return http.post('/resource/delete', { id })
}
