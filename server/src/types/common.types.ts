export interface ApiResponse<T = any> {
  code: number | string
  message: string
  data: T | null
}

export interface ApiError {
  code: string
  message: string
  statusCode: number
}

export class BusinessError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'BusinessError'
  }
}
