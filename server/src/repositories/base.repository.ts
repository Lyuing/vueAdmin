import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class BaseRepository<T extends { id: string }> {
  protected filePath: string
  protected data: T[] = []

  constructor(filename: string) {
    this.filePath = path.join(__dirname, '../../data', filename)
  }

  async init(): Promise<void> {
    try {
      await fs.access(this.filePath)
      await this.load()
      console.log(`✓ 加载数据文件: ${path.basename(this.filePath)}`)
    } catch {
      throw new Error(`数据文件不存在: ${this.filePath}，请确保 data 目录下有对应的 JSON 文件`)
    }
  }

  async load(): Promise<void> {
    const content = await fs.readFile(this.filePath, 'utf-8')
    this.data = JSON.parse(content)
  }

  async save(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  async findAll(): Promise<T[]> {
    return this.data
  }

  async findById(id: string): Promise<T | null> {
    return this.data.find(item => item.id === id) || null
  }

  async create(item: T): Promise<T> {
    this.data.push(item)
    await this.save()
    return item
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) return null

    this.data[index] = { ...this.data[index], ...updates }
    await this.save()
    return this.data[index]
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) return false

    this.data.splice(index, 1)
    await this.save()
    return true
  }

  async saveAll(data: T[]): Promise<void> {
    this.data = data
    await this.save()
  }
}
