export interface Role {
  id: string
  name: string
  code: string
  description?: string
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}
