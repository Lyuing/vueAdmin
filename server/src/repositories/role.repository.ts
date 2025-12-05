import { BaseRepository } from './base.repository.js'
import type { Role } from '../types/role.types.js'

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super('roles.json')
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.data.find(role => role.code === code) || null
  }
}

export const roleRepository = new RoleRepository()
