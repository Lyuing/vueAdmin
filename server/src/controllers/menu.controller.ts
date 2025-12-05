import type { Context } from 'koa'
import { menuService } from '../services/menu.service.js'
import { success } from '../utils/response.util.js'
import type { MenuConfig } from '../types/menu.types.js'

export class MenuController {
  async getUserMenus(ctx: Context): Promise<void> {
    const userId = ctx.state.user.userId
    const menus = await menuService.getUserMenus(userId)
    success(ctx, { data: menus })
  }

  async getAllMenus(ctx: Context): Promise<void> {
    const menus = await menuService.getAllMenus()
    success(ctx, { data: menus })
  }

  async createMenu(ctx: Context): Promise<void> {
    const menu = ctx.request.body as Partial<MenuConfig>
    const created = await menuService.createMenu(menu)
    success(ctx, { data: created })
  }

  async updateMenu(ctx: Context): Promise<void> {
    const { id } = ctx.params
    const menu = ctx.request.body as Partial<MenuConfig>
    const updated = await menuService.updateMenu(id, menu)
    success(ctx, { data: updated })
  }

  async deleteMenu(ctx: Context): Promise<void> {
    const { id } = ctx.params
    await menuService.deleteMenu(id)
    success(ctx, null, '删除成功')
  }

  async getPermissionCodes(ctx: Context): Promise<void> {
    const codes = await menuService.getPermissionCodes()
    success(ctx, { data: codes })
  }

  async saveAllMenus(ctx: Context): Promise<void> {
    const menus = ctx.request.body as MenuConfig[]
    await menuService.saveAllMenus(menus)
    success(ctx, null, '保存成功')
  }
}

export const menuController = new MenuController()
