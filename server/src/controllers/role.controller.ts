import type { Context } from 'koa'
import { roleService } from '../services/role.service.js'
import { success } from '../utils/response.util.js'
import type { RoleCreateInput, RoleUpdateInput } from '../types/role.types.js'

export class RoleController {
  async getAllRoles(ctx: Context): Promise<void> {
    const roles = await roleService.getAllRoles()
    success(ctx, roles)
  }

  async getRolesList(ctx: Context): Promise<void> {
    const { currentPage = 1, pageSize = 10, keyword } = ctx.query

    let roles = await roleService.getAllRoles()

    // 关键词搜索
    if (keyword) {
      const kw = String(keyword).toLowerCase()
      roles = roles.filter(
        role =>
          role.name.toLowerCase().includes(kw) ||
          role.code.toLowerCase().includes(kw) ||
          (role.description && role.description.toLowerCase().includes(kw))
      )
    }

    // 分页
    const total = roles.length
    const page = Number(currentPage)
    const size = Number(pageSize)
    const start = (page - 1) * size
    const end = start + size
    const list = roles.slice(start, end)

    success(ctx, {
      list,
      currentPage: page,
      pageSize: size,
      totalPage: Math.ceil(total / size),
      totalElements: total
    })
  }

  async createRole(ctx: Context): Promise<void> {
    const input = ctx.request.body as RoleCreateInput
    const role = await roleService.createRole(input)
    success(ctx, role)
  }

  async updateRole(ctx: Context): Promise<void> {
    const input = ctx.request.body as RoleUpdateInput
    const role = await roleService.updateRole(input)
    success(ctx, role)
  }

  async deleteRole(ctx: Context): Promise<void> {
    const { id } = ctx.query
    await roleService.deleteRole(Number(id))
    success(ctx, null, '删除成功')
  }

  async getAllPermissions(ctx: Context): Promise<void> {
    const permissions = await roleService.getAllPermissions()
    success(ctx, permissions)
  }

  async getRolePermissions(ctx: Context): Promise<void> {
    const { roleId } = ctx.query
    const permissionIds = await roleService.getRolePermissions(Number(roleId))
    success(ctx, permissionIds)
  }

  async saveRolePermissions(ctx: Context): Promise<void> {
    const { roleId, permissionIds } = ctx.request.body as {
      roleId: number
      permissionIds: number[]
    }
    await roleService.saveRolePermissions(roleId, permissionIds)
    success(ctx, null, '保存成功')
  }
}

export const roleController = new RoleController()
