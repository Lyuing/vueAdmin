export interface HTTPClientConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
}

export interface APIResponse<T = any> {
  code: number
  data: T
  message: string
}
