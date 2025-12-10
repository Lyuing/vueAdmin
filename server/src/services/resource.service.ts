import { resourceRepository } from '../repositories/resource.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { Resource } from '../types/resource.types.js'

export class ResourceService {
  async getAllResources(): Promise<Resource[]> {
    return await resourceRepository.findAll()
  }

  async getResourceById(id: string): Promise<Resource> {
    const resource = await resourceRepository.findById(id)
    
    if (!resource) {
      throw new BusinessError('资源不存在', 'NOT_FOUND', 404)
    }

    return resource
  }

  async createResource(resource: Partial<Resource>): Promise<Resource> {
    if (!resource.name || !resource.type || !resource.status) {
      throw new BusinessError('资源名称、类型和状态不能为空', 'VALIDATION_ERROR', 400)
    }

    if (resource.status !== 'active' && resource.status !== 'inactive') {
      throw new BusinessError('资源状态只能是 active 或 inactive', 'VALIDATION_ERROR', 400)
    }

    const now = new Date().toISOString()
    const newResource: Resource = {
      id: resource.id || `res_${Date.now()}`,
      name: resource.name,
      type: resource.type,
      description: resource.description,
      status: resource.status,
      createdAt: now,
      updatedAt: now,
      createdBy: resource.createdBy,
      metadata: resource.metadata || {}
    }

    return await resourceRepository.create(newResource)
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    const existing = await resourceRepository.findById(id)
    
    if (!existing) {
      throw new BusinessError('资源不存在', 'NOT_FOUND', 404)
    }

    if (updates.status && updates.status !== 'active' && updates.status !== 'inactive') {
      throw new BusinessError('资源状态只能是 active 或 inactive', 'VALIDATION_ERROR', 400)
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const updated = await resourceRepository.update(id, updatedData)
    
    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async deleteResource(id: string): Promise<void> {
    const success = await resourceRepository.delete(id)
    
    if (!success) {
      throw new BusinessError('资源不存在', 'NOT_FOUND', 404)
    }
  }
}

export const resourceService = new ResourceService()
