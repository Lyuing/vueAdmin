import type { Context } from 'koa'
import { roleService } from '../services/role.service.js'
import { success } from '../utils/response.util.js'
import type { Role } from '../types/role.types.js'

export class RoleController {
  async getAllRoles(ctx: Context): Promise<void> {
    const roles = await roleService.getAllRoles()
    success(ctx, { data: roles })
  }

  async getRoleById(ctx: Context): Promise<void> {
    const { id } = ctx.params
    const role = await roleService.getRoleById(id)
    success(ctx, { data: role })
  }

  async createRole(ctx: Context): Promise<void> {
    const role = ctx.request.body as Partial<Role>
    const created = await roleService.createRole(role)
    success(ctx, { data: created })
  }

  async updateRole(ctx: Context): Promise<void> {
    const { id } = ctx.params
    const role = ctx.request.body as Partial<Role>
    const updated = await roleService.updateRole(id, role)
    success(ctx, { data: updated })
  }

  async deleteRole(ctx: Context): Promise<void> {
    const { id } = ctx.params
    await roleService.deleteRole(id)
    success(ctx, null, '删除成功')
  }

  async getRoleMenus(ctx: Context): Promise<void> {
    const { id } = ctx.params
    const roleMenus = await roleService.getRoleMenus(id)
    success(ctx, { data: roleMenus })
  }

  async saveRoleMenus(ctx: Context): Promise<void> {
    const { id } = ctx.params
    console.log('Controller - 接收到的请求体:', JSON.stringify(ctx.request.body))
    console.log('Controller - body 类型:', typeof ctx.request.body)
    console.log('Controller - body 的 keys:', Object.keys(ctx.request.body || {}))
    
    const body = ctx.request.body as any
    const permissionCodes = body.permissionCodes || body['permissionCodes']
    
    console.log('Controller - 提取的 permissionCodes:', permissionCodes)
    console.log('Controller - permissionCodes 类型:', typeof permissionCodes)
    console.log('Controller - permissionCodes 是数组吗:', Array.isArray(permissionCodes))
    
    await roleService.saveRoleMenus(id, permissionCodes)
    success(ctx, null, '保存成功')
  }
}

export const roleController = new RoleController()
