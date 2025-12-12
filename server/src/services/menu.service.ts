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
   * 通过菜单ID查找菜单项
   */
  private findMenuByMenuId(menuId: string, menus: MenuConfig[]): MenuConfig | null {
    function traverse(items: MenuConfig[]): MenuConfig | null {
      for (const item of items) {
        if (item.id === menuId) {
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
   * 检查是否形成循环引用（基于菜单ID）
   */
  private isCircularReference(menuId: string, bindMenuId: string, allMenus: MenuConfig[]): boolean {
    if (menuId === bindMenuId) {
      return true
    }
    
    const bindMenu = this.findMenuByMenuId(bindMenuId, allMenus)
    if (!bindMenu || !bindMenu.bindMenuId) {
      return false
    }
    
    return this.isCircularReference(menuId, bindMenu.bindMenuId, allMenus)
  }

  /**
   * 检查是否形成循环引用（兼容旧的权限码方式）
   * @deprecated 使用 isCircularReference 替代
   */
  private isCircularReferenceByPermissionCode(menuPermissionCode: string, parentPermissionCode: string, allMenus: MenuConfig[]): boolean {
    if (menuPermissionCode === parentPermissionCode) {
      return true
    }
    
    const parentMenu = this.findMenuByPermissionCode(parentPermissionCode, allMenus)
    if (!parentMenu || !parentMenu.parentMenuCode) {
      return false
    }
    
    return this.isCircularReferenceByPermissionCode(menuPermissionCode, parentMenu.parentMenuCode, allMenus)
  }

  /**
   * 验证菜单绑定关系
   */
  private validateMenuBinding(menu: MenuConfig, allMenus: MenuConfig[]): ValidationResult {
    // 如果菜单不是隐藏的，或者没有绑定菜单ID，则验证通过
    if (!menu.hidden || !menu.bindMenuId) {
      return { valid: true }
    }
    
    // 检查绑定的菜单是否存在
    const bindMenu = this.findMenuByMenuId(menu.bindMenuId, allMenus)
    if (!bindMenu) {
      return { 
        valid: false, 
        error: '指定的绑定菜单不存在' 
      }
    }
    
    // 检查是否形成循环引用
    if (this.isCircularReference(menu.id, menu.bindMenuId, allMenus)) {
      return { 
        valid: false, 
        error: '不能将菜单绑定到自身或其子菜单' 
      }
    }
    
    // 检查绑定的菜单是否可见
    if (bindMenu.hidden) {
      return { 
        valid: false, 
        error: '不能绑定到隐藏的菜单' 
      }
    }
    
    return { valid: true }
  }

  /**
   * 验证菜单挂载关系（兼容旧版本）
   * @deprecated 使用 validateMenuBinding 替代
   */
  private validateMenuMounting(menu: MenuConfig, allMenus: MenuConfig[]): ValidationResult {
    // 优先使用新的绑定验证
    if (menu.bindMenuId) {
      return this.validateMenuBinding(menu, allMenus)
    }
    
    // 兼容旧的 parentMenuCode 验证
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
    if (menu.permissionCode && this.isCircularReferenceByPermissionCode(menu.permissionCode, menu.parentMenuCode, allMenus)) {
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
      let recoveredMenu = { ...menu }
      
      // 检查新的绑定关系
      if (menu.hidden && menu.bindMenuId) {
        const validation = this.validateMenuBinding(menu, menus)
        if (!validation.valid) {
          console.warn(`菜单 ${menu.id} 绑定配置无效: ${validation.error}`)
          recoveredMenu.bindMenuId = undefined
        }
      }
      
      // 兼容性处理：检查旧的挂载关系
      if (menu.hidden && menu.parentMenuCode) {
        const validation = this.validateMenuMounting(menu, menus)
        if (!validation.valid) {
          console.warn(`菜单 ${menu.id} 挂载配置无效: ${validation.error}`)
          recoveredMenu.parentMenuCode = undefined
        }
      }
      
      // 递归处理子菜单
      if (recoveredMenu.children) {
        recoveredMenu.children = this.recoverFromMenuErrors(recoveredMenu.children)
      }
      
      return recoveredMenu
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
      menuType: menu.menuType || 'sidebar_nav',
      hidden: menu.hidden || false,
      bindMenuId: menu.bindMenuId,
      parentMenuCode: menu.parentMenuCode, // 兼容性保留
      children: menu.children || []
    }

    // 验证绑定关系
    const allMenus = await menuRepository.findAll()
    const validation = this.validateMenuBinding(newMenu, allMenus)
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
    
    // 验证绑定关系
    const allMenus = await menuRepository.findAll()
    const validation = this.validateMenuBinding(updatedMenu, allMenus)
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

  /**
   * 获取可绑定的菜单选项
   * @param excludeMenuId 要排除的菜单ID（通常是当前编辑的菜单）
   * @returns 可绑定的菜单选项列表
   */
  async getBindableMenuOptions(excludeMenuId?: string): Promise<MenuConfig[]> {
    const allMenus = await menuRepository.findAll()
    
    // 过滤出可用于绑定的菜单选项
    const filterBindableMenus = (menus: MenuConfig[]): MenuConfig[] => {
      return menus
        .filter(menu => {
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
        .map(menu => ({
          ...menu,
          // 递归过滤子菜单
          children: menu.children ? filterBindableMenus(menu.children) : []
        }))
    }
    
    return filterBindableMenus(allMenus)
  }
}

export const menuService = new MenuService()
