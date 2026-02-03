import { menuRepository } from '../repositories/menu.repository.js'
import { roleRepository } from '../repositories/role.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { MenuConfig } from '../types/menu.types.js'

export class MenuService {
  /**
   * 将扁平菜单列表构建为树结构
   */
  private buildMenuTree(flatMenus: MenuConfig[], parentId: string | null = null): MenuConfig[] {
    return flatMenus
      .filter(menu => {
        // 查找menus.json中的parentId字段
        const menuParentId = (menu as any).parentId
        if (parentId === null) {
          // 顶级菜单：parentId为null或undefined
          return menuParentId === null || menuParentId === undefined
        }
        // 子菜单：parentId匹配
        return menuParentId === parentId
      })
      .map(menu => ({
        ...menu,
        children: this.buildMenuTree(flatMenus, menu.id)
      }))
  }

  /**
   * 过滤用户有权限的菜单（扁平列表）
   */
  private filterMenusByPermissions(flatMenus: MenuConfig[], permissions: string[]): MenuConfig[] {
    return flatMenus.filter(menu => {
      if (!menu.permissionCode) return true
      return permissions.includes(menu.permissionCode)
    })
  }

  async getUserMenus(userId: string): Promise<MenuConfig[]> {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 动态计算用户权限
    const permissionSet = new Set<string>()
    for (const userRole of user.roles) {
      try {
        const role = await roleRepository.findByIdNumber(userRole.id)
        if (role && role.permissions) {
          role.permissions.forEach(p => permissionSet.add(p.permissionCode))
        }
      } catch (error) {
        console.error(`获取角色 ${userRole.id} 权限失败:`, error)
      }
    }
    const permissions = Array.from(permissionSet)

    // 获取所有菜单（扁平结构）
    const allMenus = await menuRepository.findAll()

    // 过滤用户有权限的菜单
    const filteredMenus = this.filterMenusByPermissions(allMenus, permissions)

    // 构建树结构
    return this.buildMenuTree(filteredMenus)
  }

  async getAllMenus(): Promise<MenuConfig[]> {
    const flatMenus = await menuRepository.findAll()
    return this.buildMenuTree(flatMenus)
  }

  async createMenu(menu: Partial<MenuConfig>): Promise<MenuConfig> {
    if (!menu.id || !menu.title) {
      throw new BusinessError('菜单ID和标题不能为空', 'VALIDATION_ERROR', 400)
    }

    const newMenu: MenuConfig = {
      id: menu.id,
      title: menu.title,
      icon: menu.icon,
      permissionId: menu.permissionId,
      permissionCode: menu.permissionCode,
      buttonPermissions: menu.buttonPermissions,
      menuType: menu.menuType || 'sidebar_nav',
      hidden: menu.hidden || false,
      bindMenuId: menu.bindMenuId,
      parentMenuCode: menu.parentMenuCode
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
    // 直接保存菜单数据（扁平结构）
    await menuRepository.saveAll(menus)
  }

  /**
   * 获取可绑定的菜单选项（返回树结构）
   * @param excludeMenuId 要排除的菜单ID（通常是当前编辑的菜单）
   * @returns 可绑定的菜单选项列表
   */
  async getBindableMenuOptions(excludeMenuId?: string): Promise<MenuConfig[]> {
    const allMenus = await menuRepository.findAll()

    // 过滤出可用于绑定的菜单选项
    const bindableMenus = allMenus.filter(menu => {
      // 排除指定的菜单ID（避免自己绑定自己）
      if (excludeMenuId && menu.id === excludeMenuId) {
        return false
      }

      // 排除隐藏的菜单（隐藏菜单不能作为绑定目标）
      if (menu.hidden) {
        return false
      }

      return true
    })

    // 构建树结构
    return this.buildMenuTree(bindableMenus)
  }
}

export const menuService = new MenuService()
