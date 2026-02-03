import { BaseRepository } from './base.repository.js'
import type { User } from '../types/user.types.js'

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users.json')
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.data.find(user => user.username === username) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.data.find(user => user.email === email) || null
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.data.some(user => user.username === username)
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.data.some(user => user.email === email)
  }

  async findByDepartmentId(departmentId: number): Promise<User[]> {
    // 暂时返回空数组，因为当前数据结构中没有 departmentId
    return []
  }

  async updatePassword(userId: string, newPassword: string): Promise<User | null> {
    const user = await this.findById(userId)
    if (!user) return null

    return await this.update(userId, { password: newPassword })
  }

  async updateStatus(
    userId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  ): Promise<User | null> {
    return await this.update(userId, { status })
  }
}

export const userRepository = new UserRepository()
