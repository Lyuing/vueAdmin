export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
}

export interface ApiError {
  code: number
  errorCode: string
  message: string
  statusCode: number
}

export class BusinessError extends Error {
  errorCode: string | number
  statusCode: number

  constructor(message: string, errorCode: string | number, statusCode: number) {
    super(message)
    this.errorCode = errorCode
    this.statusCode = statusCode
    this.name = 'BusinessError'
  }
}
