import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'
import { storage } from '@/utils/storage'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { getCurrentUser } from '@/api/user'
import { useNavigationStore } from '@/stores/navigation'

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

      // 设置菜单
      if (response.userInfo.menus) {
        const navigationStore = useNavigationStore()
        navigationStore.loadMenus(response.userInfo.menus)
      }

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
  async function restoreAuth() {
    const cacheToken = storage.get<string>('token')
    const cacheUserInfo = storage.get<UserInfo>('userInfo')
    // 无有效缓存则不处理，默认进入未登录状态 -> 登录页
    if (!cacheToken || !cacheUserInfo) return;

    const navigationStore = useNavigationStore()

    token.value = cacheToken
    userInfo.value = cacheUserInfo

    // 如果缓存的用户信息包含菜单，先设置菜单
    // if (cacheUserInfo.menus) {
    //   navigationStore.loadMenus(cacheUserInfo.menus)
    // }

    // ------
    // 以上可实现缓存登录，但若用户权限有变更，无法及时更新
    // 需重新登录方可
    // 以下逻辑是在每次应用初始化时，立即刷新用户信息
    // 可获取最新的权限和菜单配置
    // ------


    // 异步获取最新的用户信息（包含最新权限和菜单）
    try {
      const response = await getCurrentUser()
      userInfo.value = response.data as UserInfo
      storage.set('userInfo', response.data)
      
      // 更新菜单
      if (response.data.menus) {
        navigationStore.loadMenus(response.data.menus)
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error)
      // 如果获取失败，继续使用缓存的用户信息
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
