import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import type { APIResponse } from '@/types/api'
import { ElMessage } from 'element-plus'
import { storage } from '@/utils/storage'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/locales'

// 扩展 AxiosRequestConfig 类型
interface RequestConfig extends AxiosRequestConfig {
  showMessage?: boolean // true  是否在响应拦截器中弹出消息提示  默认提示
  rawResponse?: boolean // false 是否返回原始响应体 { code: number, data: T, message: string }  默认返回 <T>
}

class HTTPClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.get<string>('token')
        if (token && config.headers) {
          config.headers.Authorization = `${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        const { code, data, message } = response.data
        // 支持每次请求通过 config 指定是否返回完整的 response.data
        const rawResponse = (response.config as RequestConfig)?.rawResponse
        const showMessage = (response.config as RequestConfig)?.showMessage ?? true
        // console.log('------> fetch 返回:', response.data)

        if (code === 200 || code === 0) {
          return rawResponse ? response.data : data
        } else {
          showMessage && ElMessage.error(message || t('common.httpResponseError'))
          return Promise.reject(response)
        }
      },
      error => {
        // console.log('------> fetch 错误 raw:', error)
        console.log('------> fetch 错误 ----> :', error.response)
        const showMessage = (error.response?.config as RequestConfig)?.showMessage ?? true
        if (error.response) {
          this.handleStatusError(error.response, showMessage)
        } else {
          // 网络错误或其他错误
          showMessage && ElMessage.error(t('common.networkOffline'))
        }
        return Promise.reject(error.response)
      }
    )
  }

  /**
   * 创建取消令牌
   */
  createCancelToken() {
    return axios.CancelToken.source()
  }

  /**
   *
   * 错误处理
   */
  // eslint-disable-next-line complexity
  handleStatusError(response: any = {}, showMessage: boolean = true) {
    const { status } = response
    let message = response.data?.message || t('common.httpResponseError')
    switch (status) {
      case 401:
        message = t('common.httpResponse401')
        // Token过期，清除认证信息并跳转登录
        // useAuthStore().clearAuth()
        useAuthStore().clearToLogin()
        break
      case 403:
        message = t('common.httpResponse403')
        break
      case 404:
        message = t('common.httpResponse404')
        break
      case 500:
        message = t('common.httpResponse500')
        break
      case 502:
        message = t('common.httpResponse502')
        break
    }
    showMessage && ElMessage.error(message)
  }

  // GET overloads
  get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig & { rawResponse?: false }
  ): Promise<T>
  get<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig & { rawResponse: true }
  ): Promise<APIResponse<T>>
  get(url: string, params?: any, config: RequestConfig = {}): Promise<any> {
    return this.instance.get(url, { params, ...config } as AxiosRequestConfig)
  }

  // POST overloads
  post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig & { rawResponse?: false }
  ): Promise<T>
  post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig & { rawResponse: true }
  ): Promise<APIResponse<T>>
  post(url: string, data?: any, config: RequestConfig = {}): Promise<any> {
    return this.instance.post(url, data, config)
  }

  // PUT overloads
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig & { rawResponse?: false }
  ): Promise<T>
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig & { rawResponse: true }
  ): Promise<APIResponse<T>>
  put(url: string, data?: any, config: RequestConfig = {}): Promise<any> {
    return this.instance.put(url, data, config)
  }

  // DELETE overloads
  delete<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig & { rawResponse?: false }
  ): Promise<T>
  delete<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig & { rawResponse: true }
  ): Promise<APIResponse<T>>
  delete(url: string, params?: any, config: RequestConfig = {}): Promise<any> {
    return this.instance.delete(url, { params, ...config } as RequestConfig)
  }
}

export const http = new HTTPClient()
export default http
