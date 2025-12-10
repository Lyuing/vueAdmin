import type { Context } from 'koa'
import { resourceService } from '../services/resource.service.js'
import { success } from '../utils/response.util.js'
import type { Resource } from '../types/resource.types.js'

export class ResourceController {
  async getAllResources(ctx: Context): Promise<void> {
    const resources = await resourceService.getAllResources()
    success(ctx, { data: resources })
  }

  async getResourceById(ctx: Context): Promise<void> {
    const { id } = ctx.params
    const resource = await resourceService.getResourceById(id)
    success(ctx, { data: resource })
  }

  async createResource(ctx: Context): Promise<void> {
    const resource = ctx.request.body as Partial<Resource>
    const created = await resourceService.createResource(resource)
    success(ctx, { data: created }, '创建成功')
  }

  async updateResource(ctx: Context): Promise<void> {
    const { id } = ctx.params
    const updates = ctx.request.body as Partial<Resource>
    const updated = await resourceService.updateResource(id, updates)
    success(ctx, { data: updated }, '更新成功')
  }

  async deleteResource(ctx: Context): Promise<void> {
    const { id } = ctx.params
    await resourceService.deleteResource(id)
    success(ctx, null, '删除成功')
  }
}

export const resourceController = new ResourceController()
