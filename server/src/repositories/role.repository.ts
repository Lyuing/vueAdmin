import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Role, Permission } from '../types/role.types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class RoleRepository {
  private dataPath: string
  protected data: Role[] = []

  constructor() {
    this.dataPath = path.join(__dirname, '../../data/roles.json')
  }

  async init(): Promise<void> {
    await this.load()
  }

  private async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.dataPath, 'utf-8')
      this.data = JSON.parse(content)
    } catch (error) {
      console.error('Failed to load roles data:', error)
      this.data = []
    }
  }

  protected async save(): Promise<void> {
    await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  async findAll(): Promise<Role[]> {
    return this.data
  }

  async findByIdNumber(id: number): Promise<Role | null> {
    return this.data.find(role => role.id === id) || null
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.data.find(role => role.code === code) || null
  }

  async existsByCode(code: string): Promise<boolean> {
    return this.data.some(role => role.code === code)
  }

  async existsByName(name: string): Promise<boolean> {
    return this.data.some(role => role.name === name)
  }

  async updateByIdNumber(id: number, updates: Partial<Role>): Promise<Role | null> {
    const index = this.data.findIndex(role => role.id === id)
    if (index === -1) return null

    this.data[index] = { ...this.data[index], ...updates, updateTime: new Date().toISOString() }
    await this.save()
    return this.data[index]
  }

  async deleteByIdNumber(id: number): Promise<boolean> {
    const index = this.data.findIndex(role => role.id === id)
    if (index === -1) return false

    this.data.splice(index, 1)
    await this.save()
    return true
  }

  async createWithAutoId(role: Omit<Role, 'id' | 'createdTime' | 'updateTime'>): Promise<Role> {
    const maxId = this.data.length > 0 ? Math.max(...this.data.map(r => r.id)) : 0
    const newRole: Role = {
      ...role,
      id: maxId + 1,
      userCount: role.userCount || 0,
      permissions: role.permissions || [],
      createdTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }

    this.data.push(newRole)
    await this.save()
    return newRole
  }
}

export const roleRepository = new RoleRepository()
