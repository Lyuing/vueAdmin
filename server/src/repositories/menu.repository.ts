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

  // 通过菜单ID查找菜单 - 优化的递归算法
  async findByMenuId(menuId: string): Promise<MenuConfig | null> {
    if (!menuId) return null
    
    // 使用深度优先搜索，提前终止优化
    const findInTree = (menus: MenuConfig[]): MenuConfig | null => {
      for (const menu of menus) {
        // 直接匹配当前菜单ID
        if (menu.id === menuId) {
          return menu
        }
        
        // 递归搜索子菜单
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
    
    if (deleted) {
      // 清理相关的绑定引用
      this.clearBindingReferences(id)
      await this.save()
    }
    
    return deleted
  }

  // 清理绑定引用
  private clearBindingReferences(deletedMenuId: string): void {
    const clearReferences = (menus: MenuConfig[]) => {
      for (const menu of menus) {
        // 清理新的 bindMenuId 字段
        if (menu.bindMenuId === deletedMenuId) {
          console.warn(`清理菜单 ${menu.id} 的无效绑定引用: ${deletedMenuId}`)
          menu.bindMenuId = undefined
        }
        
        // 兼容性处理：同时清理旧的 parentMenuCode 字段（如果存在）
        if (menu.parentMenuCode) {
          // 通过权限码查找对应的菜单，如果该菜单的ID是被删除的ID，则清理引用
          const referencedMenu = this.data.find(m => this.findMenuByPermissionCodeSync(m, menu.parentMenuCode!))
          if (referencedMenu?.id === deletedMenuId) {
            console.warn(`清理菜单 ${menu.id} 的无效权限码引用: ${menu.parentMenuCode}`)
            menu.parentMenuCode = undefined
          }
        }
        
        if (menu.children && menu.children.length > 0) {
          clearReferences(menu.children)
        }
      }
    }
    
    clearReferences(this.data)
  }

  // 同步版本的权限码查找（用于清理引用时的辅助方法）
  private findMenuByPermissionCodeSync(menu: MenuConfig, permissionCode: string): MenuConfig | null {
    if (menu.permissionCode === permissionCode) {
      return menu
    }
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        const found = this.findMenuByPermissionCodeSync(child, permissionCode)
        if (found) return found
      }
    }
    return null
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

  // 数据迁移：将 parentMenuCode 转换为 bindMenuId
  async migrateParentMenuCodeToBindMenuId(): Promise<{ success: boolean; migratedCount: number; errors: string[] }> {
    const errors: string[] = []
    let migratedCount = 0
    
    const migrateInTree = (menus: MenuConfig[]) => {
      for (const menu of menus) {
        // 如果菜单有 parentMenuCode 但没有 bindMenuId，进行迁移
        if (menu.parentMenuCode && !menu.bindMenuId) {
          try {
            // 通过权限码查找对应的菜单
            const referencedMenu = this.findMenuByPermissionCodeInData(menu.parentMenuCode)
            
            if (referencedMenu) {
              // 找到对应菜单，设置 bindMenuId
              menu.bindMenuId = referencedMenu.id
              migratedCount++
              console.log(`迁移菜单 ${menu.id}: ${menu.parentMenuCode} -> ${referencedMenu.id}`)
            } else {
              // 没找到对应菜单，记录错误但不阻止迁移
              const error = `菜单 ${menu.id} 的 parentMenuCode "${menu.parentMenuCode}" 未找到对应菜单`
              errors.push(error)
              console.warn(error)
            }
          } catch (error) {
            const errorMsg = `迁移菜单 ${menu.id} 时发生错误: ${error}`
            errors.push(errorMsg)
            console.error(errorMsg)
          }
        }
        
        // 递归处理子菜单
        if (menu.children && menu.children.length > 0) {
          migrateInTree(menu.children)
        }
      }
    }
    
    try {
      migrateInTree(this.data)
      
      // 保存迁移结果
      if (migratedCount > 0) {
        await this.save()
        console.log(`数据迁移完成，共迁移 ${migratedCount} 个菜单`)
      }
      
      return {
        success: true,
        migratedCount,
        errors
      }
    } catch (error) {
      const errorMsg = `数据迁移过程中发生严重错误: ${error}`
      errors.push(errorMsg)
      console.error(errorMsg)
      
      return {
        success: false,
        migratedCount,
        errors
      }
    }
  }

  // 在当前数据中通过权限码查找菜单（同步版本，用于迁移）
  private findMenuByPermissionCodeInData(permissionCode: string): MenuConfig | null {
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
}

export const menuRepository = new MenuRepository()
