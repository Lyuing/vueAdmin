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
}

export const menuRepository = new MenuRepository()
