import { menuRepository } from '../repositories/menu.repository.js'
import { roleMenuRepository } from '../repositories/role-menu.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { MenuConfig } from '../types/menu.types.js'

export class MenuService {
  private filterMenusByPermissions(menus: MenuConfig[], permissions: string[]): MenuConfig[] {
    return menus
      .filter(menu => {
        if (!menu.permissionCode) return true
        return permissions.includes(menu.permissionCode)
      })
      .map(menu => ({
        ...menu,
        children: menu.children 
          ? this.filterMenusByPermissions(menu.children, permissions)
          : []
      }))
  }

  async getUserMenus(userId: string): Promise<MenuConfig[]> {
    const user = await userRepository.findById(userId)
    
    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 动态计算用户权限
    const permissionSet = new Set<string>()
    for (const roleId of user.roles) {
      try {
        const roleMenus = await roleMenuRepository.findByRoleId(roleId)
        if (roleMenus && roleMenus.permissionCodes) {
          roleMenus.permissionCodes.forEach(code => permissionSet.add(code))
        }
      } catch (error) {
        console.error(`获取角色 ${roleId} 权限失败:`, error)
      }
    }
    const permissions = Array.from(permissionSet)

    const allMenus = await menuRepository.findAll()
    return this.filterMenusByPermissions(allMenus, permissions)
  }

  async getAllMenus(): Promise<MenuConfig[]> {
    return await menuRepository.findAll()
  }

  async createMenu(menu: Partial<MenuConfig>): Promise<MenuConfig> {
    if (!menu.id || !menu.title) {
      throw new BusinessError('菜单ID和标题不能为空', 'VALIDATION_ERROR', 400)
    }

    const newMenu: MenuConfig = {
      id: menu.id,
      title: menu.title,
      icon: menu.icon,
      permissionCode: menu.permissionCode,
      buttonPermissions: menu.buttonPermissions,
      position: menu.position || 'sidebar',
      hidden: menu.hidden || false,
      children: menu.children || []
    }

    return await menuRepository.create(newMenu)
  }

  async updateMenu(menuId: string, menu: Partial<MenuConfig>): Promise<MenuConfig> {
    const existing = await menuRepository.findById(menuId)
    
    if (!existing) {
      throw new BusinessError('菜单不存在', 'NOT_FOUND', 404)
    }

    const updated = await menuRepository.update(menuId, menu)
    
    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async deleteMenu(menuId: string): Promise<void> {
    const success = await menuRepository.delete(menuId)
    
    if (!success) {
      throw new BusinessError('菜单不存在', 'NOT_FOUND', 404)
    }
  }

  async getPermissionCodes(): Promise<string[]> {
    return await menuRepository.getAllPermissionCodes()
  }

  async saveAllMenus(menus: MenuConfig[]): Promise<void> {
    // 直接替换整个菜单数据
    await menuRepository.saveAll(menus)
  }
}

export const menuService = new MenuService()
