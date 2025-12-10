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
    const { id } = ctx.request.body as { id: string }
    const role = await roleService.getRoleById(id)
    success(ctx, { data: role })
  }

  async createRole(ctx: Context): Promise<void> {
    const role = ctx.request.body as Partial<Role>
    const created = await roleService.createRole(role)
    success(ctx, { data: created })
  }

  async updateRole(ctx: Context): Promise<void> {
    const { id, ...role } = ctx.request.body as Partial<Role> & { id: string }
    const updated = await roleService.updateRole(id, role)
    success(ctx, { data: updated })
  }

  async deleteRole(ctx: Context): Promise<void> {
    const { id } = ctx.request.body as { id: string }
    await roleService.deleteRole(id)
    success(ctx, null, '删除成功')
  }

  async getRoleMenus(ctx: Context): Promise<void> {
    const { roleId } = ctx.request.body as { roleId: string }
    const roleMenus = await roleService.getRoleMenus(roleId)
    success(ctx, { data: roleMenus })
  }

  async saveRoleMenus(ctx: Context): Promise<void> {
    const { roleId, permissionCodes } = ctx.request.body as { roleId: string, permissionCodes: string[] }
    await roleService.saveRoleMenus(roleId, permissionCodes)
    success(ctx, null, '保存成功')
  }
}

export const roleController = new RoleController()
