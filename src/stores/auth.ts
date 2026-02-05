import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { currentLocale } from '@/locales'

import { routeMap, getRouter, resetRouter } from '../router'

import type { LoginRequest, LoginResponse, UserInfo } from '@/types/user'
import { storage } from '@/utils/storage'
import { signin as signinApi, logout as logoutApi } from '@/api/auth'
import { getCurrentUser } from '@/api/user'
import { useNavigationStore } from '@/stores/navigation'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const userInfo = ref<UserInfo | null>(null)

  // 仅表示是否已登录，即是否存在有效 token。
  // 权限/角色等细分控制，在其它处进行判断。
  const isLoggedIn = computed(() => !!token.value)

  // 是否辅助模式 - 全部菜单权限
  const isAuxMode = import.meta.env.MODE === 'aux'

  /**
   * 登录
   */
  async function signin(info: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await signinApi({
        ...info,
        preferredLanguage: currentLocale.value || ''
      })
      // 需要修改密码
      if (!('accessToken' in response)) return response
      // 登录成功
      const { accessToken, ...userInfoData } = response || {}
      token.value = accessToken
      userInfo.value = {
        ...userInfoData,
        menus: response.menuTree
      }

      storage.set('token', accessToken)
      storage.set('userInfo', userInfo.value)

      // 设置菜单
      if (userInfo.value?.menus) {
        const navigationStore = useNavigationStore()
        navigationStore.loadMenus(userInfo.value.menus)
      }

      return response
    } catch (error) {
      throw error
    }
  }
  /**
   * 登录
   */
  // async function login(username: string, password: string) {
  //   try {
  //     const response = await loginApi({ username, password })
  //     token.value = response.token
  //     userInfo.value = response.userInfo

  //     storage.set('token', response.token)
  //     storage.set('userInfo', response.userInfo)

  //     // 设置菜单
  //     if (response.userInfo.menus) {
  //       const navigationStore = useNavigationStore()
  //       navigationStore.loadMenus(response.userInfo.menus)
  //     }

  //     return response
  //   } catch (error) {
  //     throw error
  //   }
  // }

  /**
   * 登出
   */
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      clearToLogin()
    }
  }

  /**
   * 清除认证信息（不调用登出API）
   */
  function clearAuth() {
    token.value = null
    userInfo.value = null
    storage.remove('token')
    storage.remove('userInfo')
  }
  /**
   * 重定向到登录
   */
  function clearToLogin() {
    clearAuth() // 清除认证信息
    resetRouter() // 重置路由
    getRouter().push({ path: '/login' })
  }

  /**
   * 从本地存储恢复登录状态
   */
  async function restoreAuth() {
    let cacheToken = storage.get<string>('token')
    let cacheUserInfo = storage.get<UserInfo>('userInfo')
    const navigationStore = useNavigationStore()

    if (isAuxMode) {
      console.warn(
        `/**\n   *\n   * 当前运行环境为 ${import.meta.env.MODE} 模式 \n`,
        `  * 将展示全部菜单和权限`,
        `\n   *\n   */ \n`
      )
      console.log(import.meta.env)
      const { menus, codes } = navigationStore.initDebugPermission(routeMap)
      cacheToken = 'Bearer mock token'
      cacheUserInfo = {
        userId: 1,
        username: 'vAdmin',
        roles: ['admin'],
        realName: '管理员',
        email: '',
        sessionId: '',
        avatar: '',
        menus: [...menus],
        permissions: [...codes],
        departmentId: 1
      }
    }

    // 无有效缓存则不处理，默认进入未登录状态 -> 登录页
    if (!cacheToken || !cacheUserInfo) return

    // token 处理
    token.value = cacheToken

    // 辅助模式处理 -> 缓存用户信息、设置菜单
    if (isAuxMode) {
      userInfo.value = cacheUserInfo
      storage.set('userInfo', userInfo.value)
      navigationStore.loadMenus(cacheUserInfo.menus || [])
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      return await sleep(0)
    }

    // ------
    // 以上可实现缓存登录，但若用户权限有变更，无法及时更新
    // 需重新登录方可
    // 以下逻辑是在每次应用初始化时，立即刷新用户信息
    // 可获取最新的权限和菜单配置
    // ------

    // 异步获取最新的用户信息（包含最新权限和菜单）
    try {
      const response = await getCurrentUser()
      const { id: userId, menuTree: menus, ...userInfoData } = response || {}
      // throw { status: 500 }
      userInfo.value = {
        userId,
        menus,
        ...userInfoData
      }
      storage.set('userInfo', userInfo.value)

      // 更新菜单
      if (userInfo.value.menus) {
        navigationStore.loadMenus(userInfo.value.menus)
      }
    } catch (error: any) {
      console.error('刷新认证失败:', error)
      // const status = error?.status
      // if (status === 500) {
      //   const router = getRouter()
      //   router.push({ path: '/500' })
      // }
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
    signin,
    // login,
    logout,
    clearAuth,
    clearToLogin,
    restoreAuth,
    checkAuth
  }
})
