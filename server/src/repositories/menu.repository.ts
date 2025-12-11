import { BaseRepository } from './base.repository.js'
import type { MenuConfig } from '../types/menu.types.js'

export class MenuRepository extends BaseRepository<MenuConfig> {
  constructor() {
    super('menus.json')
  }

  async getAllPermissionCodes(): Promise<string[]> {
    const codes: string[] = []
    
    const extractCodes = (menus: MenuConfig[]) => {
      for (const menu of menus) {
        if (menu.permissionCode) {
          codes.push(menu.permissionCode)
        }
        if (menu.children && menu.children.length > 0) {
          extractCodes(menu.children)
        }
      }
    }
    
    extractCodes(this.data)
    return codes
  }

  // 通过权限码查找菜单
  async findByPermissionCode(permissionCode: string): Promise<MenuConfig | null> {
    const findInTree = (menus: MenuConfig[]): MenuConfig | null => {
      for (const menu of menus) {
        if (menu.permissionCode === permissionCode) {
          return menu
        }
        if (menu.children && menu.children.length > 0) {
          const found = findInTree(menu.children)
          if (found) return found
        }
      }
      return null
    }
    
    return findInTree(this.data)
  }

  // 递归查找菜单（包括子菜单）
  async findById(id: string): Promise<MenuConfig | null> {
    const findInTree = (menus: MenuConfig[]): MenuConfig | null => {
      for (const menu of menus) {
        if (menu.id === id) {
          return menu
        }
        if (menu.children && menu.children.length > 0) {
          const found = findInTree(menu.children)
          if (found) return found
        }
      }
      return null
    }
    
    return findInTree(this.data)
  }

  // 递归删除菜单（包括子菜单）
  async delete(id: string): Promise<boolean> {
    // 首先找到要删除的菜单，获取其权限码
    const menuToDelete = await this.findById(id)
    const permissionCodeToDelete = menuToDelete?.permissionCode
    
    const deleteFromTree = (menus: MenuConfig[]): boolean => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === id) {
          menus.splice(i, 1)
          return true
        }
        if (menus[i].children && menus[i].children!.length > 0) {
          if (deleteFromTree(menus[i].children!)) {
            return true
          }
        }
      }
      return false
    }
    
    const deleted = deleteFromTree(this.data)
    
    if (deleted && permissionCodeToDelete) {
      // 清理相关的挂载引用
      this.clearMountingReferences(permissionCodeToDelete)
      await this.save()
    }
    
    return deleted
  }

  // 清理挂载引用
  private clearMountingReferences(deletedPermissionCode: string): void {
    const clearReferences = (menus: MenuConfig[]) => {
      for (const menu of menus) {
        if (menu.parentMenuCode === deletedPermissionCode) {
          console.warn(`清理菜单 ${menu.id} 的无效挂载引用: ${deletedPermissionCode}`)
          menu.parentMenuCode = undefined
        }
        if (menu.children && menu.children.length > 0) {
          clearReferences(menu.children)
        }
      }
    }
    
    clearReferences(this.data)
  }

  // 递归更新菜单
  async update(id: string, updates: Partial<MenuConfig>): Promise<MenuConfig | null> {
    const updateInTree = (menus: MenuConfig[]): MenuConfig | null => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === id) {
          menus[i] = { ...menus[i], ...updates, id: menus[i].id }
          return menus[i]
        }
        if (menus[i].children && menus[i].children!.length > 0) {
          const updated = updateInTree(menus[i].children!)
          if (updated) return updated
        }
      }
      return null
    }
    
    const updated = updateInTree(this.data)
    if (updated) {
      await this.save()
    }
    return updated
  }
}

export const menuRepository = new MenuRepository()
