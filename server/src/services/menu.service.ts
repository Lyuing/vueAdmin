import { menuRepository } from '../repositories/menu.repository.js'
import { roleMenuRepository } from '../repositories/role-menu.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { MenuConfig, ValidationResult } from '../types/menu.types.js'

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

  /**
   * 通过权限码查找菜单项
   */
  private findMenuByPermissionCode(permissionCode: string, menus: MenuConfig[]): MenuConfig | null {
    function traverse(items: MenuConfig[]): MenuConfig | null {
      for (const item of items) {
        if (item.permissionCode === permissionCode) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const found = traverse(item.children)
          if (found) return found
        }
      }
      return null
    }
    
    return traverse(menus)
  }

  /**
   * 检查是否形成循环引用
   */
  private isCircularReference(menuPermissionCode: string, parentPermissionCode: string, allMenus: MenuConfig[]): boolean {
    if (menuPermissionCode === parentPermissionCode) {
      return true
    }
    
    const parentMenu = this.findMenuByPermissionCode(parentPermissionCode, allMenus)
    if (!parentMenu || !parentMenu.parentMenuCode) {
      return false
    }
    
    return this.isCircularReference(menuPermissionCode, parentMenu.parentMenuCode, allMenus)
  }

  /**
   * 验证菜单挂载关系
   */
  private validateMenuMounting(menu: MenuConfig, allMenus: MenuConfig[]): ValidationResult {
    if (!menu.hidden || !menu.parentMenuCode) {
      return { valid: true }
    }
    
    // 检查父级菜单是否存在
    const parentMenu = this.findMenuByPermissionCode(menu.parentMenuCode, allMenus)
    if (!parentMenu) {
      return { 
        valid: false, 
        error: '指定的挂载父级菜单不存在' 
      }
    }
    
    // 检查是否形成循环引用
    if (menu.permissionCode && this.isCircularReference(menu.permissionCode, menu.parentMenuCode, allMenus)) {
      return { 
        valid: false, 
        error: '不能将菜单挂载到自身或其子菜单' 
      }
    }
    
    // 检查父级菜单是否可见
    if (parentMenu.hidden) {
      return { 
        valid: false, 
        error: '不能挂载到隐藏的父级菜单' 
      }
    }
    
    return { valid: true }
  }

  /**
   * 菜单配置错误恢复
   */
  private recoverFromMenuErrors(menus: MenuConfig[]): MenuConfig[] {
    return menus.map(menu => {
      // 如果挂载关系无效，清除挂载配置
      if (menu.hidden && menu.parentMenuCode) {
        const validation = this.validateMenuMounting(menu, menus)
        if (!validation.valid) {
          console.warn(`菜单 ${menu.id} 挂载配置无效: ${validation.error}`)
          return { ...menu, parentMenuCode: undefined }
        }
      }
      
      // 递归处理子菜单
      if (menu.children) {
        return {
          ...menu,
          children: this.recoverFromMenuErrors(menu.children)
        }
      }
      
      return menu
    })
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
      menuType: menu.menuType || 'sidebar',
      hidden: menu.hidden || false,
      parentMenuCode: menu.parentMenuCode,
      children: menu.children || []
    }

    // 验证挂载关系
    const allMenus = await menuRepository.findAll()
    const validation = this.validateMenuMounting(newMenu, allMenus)
    if (!validation.valid) {
      throw new BusinessError(validation.error!, 'VALIDATION_ERROR', 400)
    }

    return await menuRepository.create(newMenu)
  }

  async updateMenu(menuId: string, menu: Partial<MenuConfig>): Promise<MenuConfig> {
    const existing = await menuRepository.findById(menuId)
    
    if (!existing) {
      throw new BusinessError('菜单不存在', 'NOT_FOUND', 404)
    }

    // 合并更新数据
    const updatedMenu = { ...existing, ...menu }
    
    // 验证挂载关系
    const allMenus = await menuRepository.findAll()
    const validation = this.validateMenuMounting(updatedMenu, allMenus)
    if (!validation.valid) {
      throw new BusinessError(validation.error!, 'VALIDATION_ERROR', 400)
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
    // 应用错误恢复机制
    const recoveredMenus = this.recoverFromMenuErrors(menus)
    // 替换整个菜单数据
    await menuRepository.saveAll(recoveredMenus)
  }
}

export const menuService = new MenuService()
