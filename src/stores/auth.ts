import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'
import { storage } from '@/utils/storage'
import { login as loginApi, logout as logoutApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const userInfo = ref<UserInfo | null>(null)

  // 仅表示是否已登录，即是否存在有效 token。
  // 权限/角色等细分控制，在其它处进行判断。
  const isLoggedIn = computed(() => !!token.value)

  /**
   * 登录
   */
  async function login(username: string, password: string) {
    try {
      const response = await loginApi({ username, password })
      token.value = response.token
      userInfo.value = response.userInfo

      storage.set('token', response.token)
      storage.set('userInfo', response.userInfo)

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      token.value = null
      userInfo.value = null
      storage.remove('token')
      storage.remove('userInfo')

      // 清除动态路由和跳转登录页将在路由守卫中处理
      window.location.href = '/login'
    }
  }

  /**
   * 从本地存储恢复登录状态
   */
  function restoreAuth() {
    const savedToken = storage.get<string>('token')
    const savedUserInfo = storage.get<UserInfo>('userInfo')

    if (savedToken && savedUserInfo) {
      token.value = savedToken
      userInfo.value = savedUserInfo
    }
  }

  /**
   * 检查当前登录状态
   */
  function checkAuth(): boolean {
    return isLoggedIn.value
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    restoreAuth,
    checkAuth
  }
})
