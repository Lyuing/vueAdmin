import { BaseRepository } from './base.repository.js'
import type { RoleMenuConfig } from '../types/menu.types.js'

type RoleMenuConfigWithId = RoleMenuConfig & { id: string }

export class RoleMenuRepository extends BaseRepository<RoleMenuConfigWithId> {
  constructor() {
    super('role-menus.json')
  }

  async findByRoleId(roleId: string): Promise<RoleMenuConfig | null> {
    return this.data.find(rm => rm.roleId === roleId) || null
  }

  async saveRoleMenus(roleId: string, roleName: string, menuIds: string[]): Promise<RoleMenuConfig> {
    const existing = await this.findByRoleId(roleId)
    
    if (existing) {
      const updated = await this.update(roleId, { menuIds })
      return updated!
    } else {
      const newRoleMenu: RoleMenuConfigWithId = { id: roleId, roleId, roleName, menuIds }
      return await this.create(newRoleMenu)
    }
  }
}

export const roleMenuRepository = new RoleMenuRepository()
