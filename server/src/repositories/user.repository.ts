import { BaseRepository } from './base.repository.js'
import type { UserInfo } from '../types/user.types.js'

export class UserRepository extends BaseRepository<UserInfo> {
  constructor() {
    super('users.json')
  }

  async findByUsername(username: string): Promise<UserInfo | null> {
    return this.data.find(user => user.username === username) || null
  }
}

export const userRepository = new UserRepository()
