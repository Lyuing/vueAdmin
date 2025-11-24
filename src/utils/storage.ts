class Storage {
  get<T = any>(key: string): T | null {
    const value = localStorage.getItem(key)
    if (!value) return null

    try {
      return JSON.parse(value) as T
    } catch {
      return value as T
    }
  }

  set(key: string, value: any): void {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, stringValue)
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }

  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

export const storage = new Storage()
export default storage
