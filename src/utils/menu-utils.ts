/**
 * Consolidated menu utilities
 * Combines MenuCache and menu helper functions into a single module.
 */

import type { MenuConfig, MenuItem, ValidationResult } from '@/types/navigation'

export interface TreeSelectNode {
  value: string
  label: string
  disabled?: boolean
  children?: TreeSelectNode[]
}

export class MenuCache {
  private menuMap = new Map<string, MenuItem>()
  private permissionCodeMap = new Map<string, MenuItem>()
  private parentChildMap = new Map<string, string[]>()
  private hiddenMenuMap = new Map<string, MenuItem[]>()
  private routeNameMap = new Map<string, MenuItem>()

  updateCache(menus: MenuItem[]): void {
    this.clearCache()
    this.buildCache(menus)
  }

  private clearCache(): void {
    this.menuMap.clear()
    this.permissionCodeMap.clear()
    this.parentChildMap.clear()
    this.hiddenMenuMap.clear()
    this.routeNameMap.clear()
  }

  private buildCache(menus: MenuItem[], parentId?: string): void {
    menus.forEach(menu => {
      this.menuMap.set(menu.id, menu)

      if (menu.permissionCode) {
        this.permissionCodeMap.set(menu.permissionCode, menu)
      }

      if (menu.routeName) {
        this.routeNameMap.set(menu.routeName, menu)
      }

      if (parentId) {
        const siblings = this.parentChildMap.get(parentId) || []
        siblings.push(menu.id)
        this.parentChildMap.set(parentId, siblings)
      }

      if (menu.hidden && menu.parentMenuCode) {
        const hiddenMenus = this.hiddenMenuMap.get(menu.parentMenuCode) || []
        hiddenMenus.push(menu)
        this.hiddenMenuMap.set(menu.parentMenuCode, hiddenMenus)
      }

      if (menu.children && menu.children.length > 0) {
        this.buildCache(menu.children, menu.id)
      }
    })
  }

  getMenuById(menuId: string): MenuItem | undefined {
    return this.menuMap.get(menuId)
  }

  getMenuByPermissionCode(permissionCode: string): MenuItem | undefined {
    return this.permissionCodeMap.get(permissionCode)
  }

  getMenuByRouteName(routeName: string): MenuItem | undefined {
    return this.routeNameMap.get(routeName)
  }

  getChildMenuIds(parentId: string): string[] {
    return this.parentChildMap.get(parentId) || []
  }

  getHiddenMenusByParentCode(parentPermissionCode: string): MenuItem[] {
    return this.hiddenMenuMap.get(parentPermissionCode) || []
  }

  hasMenu(menuId: string): boolean {
    return this.menuMap.has(menuId)
  }

  hasPermissionCode(permissionCode: string): boolean {
    return this.permissionCodeMap.has(permissionCode)
  }

  getAllMenus(): MenuItem[] {
    return Array.from(this.menuMap.values())
  }

  getAllPermissionCodes(): string[] {
    return Array.from(this.permissionCodeMap.keys())
  }

  getStats(): {
    totalMenus: number
    permissionCodeMappings: number
    routeNameMappings: number
    parentChildMappings: number
    hiddenMenuMappings: number
  } {
    return {
      totalMenus: this.menuMap.size,
      permissionCodeMappings: this.permissionCodeMap.size,
      routeNameMappings: this.routeNameMap.size,
      parentChildMappings: this.parentChildMap.size,
      hiddenMenuMappings: this.hiddenMenuMap.size
    }
  }
}

export function findMenuByPermissionCode(permissionCode: string, menus: MenuConfig[] | MenuItem[]): MenuConfig | MenuItem | null {
  function traverse(items: MenuConfig[] | MenuItem[]): MenuConfig | MenuItem | null {
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

export function isCircularReference(menuPermissionCode: string, parentPermissionCode: string, allMenus: MenuConfig[]): boolean {
  if (menuPermissionCode === parentPermissionCode) {
    return true
  }

  const parentMenu = findMenuByPermissionCode(parentPermissionCode, allMenus) as MenuConfig
  if (!parentMenu || !parentMenu.parentMenuCode) {
    return false
  }

  return isCircularReference(menuPermissionCode, parentMenu.parentMenuCode, allMenus)
}

export function validateMenuMounting(menu: MenuConfig, allMenus: MenuConfig[]): ValidationResult {
  if (!menu.hidden || !menu.parentMenuCode) {
    return { valid: true }
  }

  const parentMenu = findMenuByPermissionCode(menu.parentMenuCode, allMenus) as MenuConfig
  if (!parentMenu) {
    return {
      valid: false,
      error: '指定的挂载父级菜单不存在'
    }
  }

  if (menu.permissionCode && isCircularReference(menu.permissionCode, menu.parentMenuCode, allMenus)) {
    return {
      valid: false,
      error: '不能将菜单挂载到自身或其子菜单'
    }
  }

  if (parentMenu.hidden) {
    return {
      valid: false,
      error: '不能挂载到隐藏的父级菜单'
    }
  }

  return { valid: true }
}

export function recoverFromMenuErrors(menus: MenuConfig[]): MenuConfig[] {
  return menus.map(menu => {
    if (menu.hidden && menu.parentMenuCode) {
      const validation = validateMenuMounting(menu, menus)
      if (!validation.valid) {
        console.warn(`菜单 ${menu.id} 挂载配置无效: ${validation.error}`)
        return { ...menu, parentMenuCode: undefined }
      }
    }

    if (menu.children) {
      return {
        ...menu,
        children: recoverFromMenuErrors(menu.children)
      }
    }

    return menu
  })
}

export function getAvailableParentMenus(allMenus: MenuConfig[], currentMenuId?: string): MenuConfig[] {
  const availableMenus: MenuConfig[] = []

  function traverse(menus: MenuConfig[], excludeIds: Set<string> = new Set()) {
    for (const menu of menus) {
      if (!menu.hidden && !excludeIds.has(menu.id)) {
        availableMenus.push(menu)
      }

      if (menu.id === currentMenuId) {
        collectChildMenuIds(menu, excludeIds)
      }

      if (menu.children && menu.children.length > 0) {
        traverse(menu.children, excludeIds)
      }
    }
  }

  function collectChildMenuIds(menu: MenuConfig, excludeIds: Set<string>) {
    excludeIds.add(menu.id)
    if (menu.children) {
      menu.children.forEach(child => collectChildMenuIds(child, excludeIds))
    }
  }

  traverse(allMenus)
  return availableMenus
}

export function buildMenuTreeSelectData(menus: MenuConfig[], currentMenuId?: string): TreeSelectNode[] {
  const availableMenus = getAvailableParentMenus(menus, currentMenuId)

  return availableMenus.map(menu => ({
    value: menu.permissionCode || menu.id,
    label: menu.title,
    disabled: !menu.permissionCode,
    children: menu.children ? buildMenuTreeSelectData(menu.children, currentMenuId) : undefined
  }))
}
