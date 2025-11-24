import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { APIResponse } from '@/types/api'
import { ElMessage } from 'element-plus'

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
      config => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
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

        if (code === 200 || code === 0) {
          return data
        } else {
          ElMessage.error(message || '请求失败')
          return Promise.reject(new Error(message || '请求失败'))
        }
      },
      error => {
        if (error.response) {
          const { status } = error.response

          switch (status) {
            case 401:
              ElMessage.error('登录已过期，请重新登录')
              localStorage.removeItem('token')
              localStorage.removeItem('userInfo')
              window.location.href = '/login'
              break
            case 403:
              ElMessage.error('无权限访问')
              break
            case 404:
              ElMessage.error('请求的资源不存在')
              break
            case 500:
              ElMessage.error('服务器错误')
              break
            default:
              ElMessage.error(error.response.data?.message || '请求失败')
          }
        } else {
          ElMessage.error('网络错误，请检查网络连接')
        }

        return Promise.reject(error)
      }
    )
  }

  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, { params, ...config })
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, { params, ...config })
  }
}

export const http = new HTTPClient()
export default http
