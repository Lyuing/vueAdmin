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

// 分页请求参数
interface BasePageRequest {
  currentPage?: number
  pageSize?: number
  needTotal?: boolean
  orders?: any[]
}
export type PageRequest<T = Record<string, any>> = BasePageRequest & T

// 分页返回参数
interface BasePageResponse {
  currentPage: number
  pageSize: number
  totalPage: number
  totalElements: number
}
export type PageResponse<T = Record<string, any>> = BasePageResponse & { list: T[] }
