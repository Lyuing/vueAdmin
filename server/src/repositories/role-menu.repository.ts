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

  async saveRoleMenus(roleId: string, roleName: string, permissionCodes: string[]): Promise<RoleMenuConfig> {
    const existing = await this.findByRoleId(roleId)

    console.log('Repository - saveRoleMenus:', { roleId, roleName, permissionCodes, existing })

    if (existing) {
      const updated = await this.update(roleId, { permissionCodes })
      console.log('Repository - 更新后的数据:', updated)
      return updated!
    } else {
      const newRoleMenu: RoleMenuConfigWithId = { id: roleId, roleId, roleName, permissionCodes }
      const created = await this.create(newRoleMenu)
      console.log('Repository - 创建的数据:', created)
      return created
    }
  }
}

export const roleMenuRepository = new RoleMenuRepository()
