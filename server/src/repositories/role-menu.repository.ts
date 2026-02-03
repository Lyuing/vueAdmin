import { BaseRepository } from './base.repository.js'
import type { RoleMenuConfig } from '../types/role.types.js'

export class RoleMenuRepository extends BaseRepository<RoleMenuConfig> {
  constructor() {
    super('roles.json')
  }

  async findByRoleId(roleId: number): Promise<RoleMenuConfig | null> {
    const role = this.data.find((r: any) => r.id === roleId)
    if (!role) return null

    return {
      roleId: (role as any).id,
      roleName: (role as any).name,
      permissionCodes: (role as any).permissionCodes || []
    }
  }

  async saveRolePermissions(roleId: number, permissionCodes: string[]): Promise<void> {
    const index = this.data.findIndex((r: any) => r.id === roleId)
    if (index === -1) {
      throw new Error('角色不存在')
    }

    ;(this.data[index] as any).permissionCodes = permissionCodes
    ;(this.data[index] as any).updateTime = new Date().toISOString()
    await this.save()
  }
}

export const roleMenuRepository = new RoleMenuRepository()
