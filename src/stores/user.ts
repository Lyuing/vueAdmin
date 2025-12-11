import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'
import { getCurrentUser as getUserInfoApi, updateUser as updateUserInfoApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  /**
   * 获取用户信息
   */
  async function getUserInfo() {
    try {
      const response = await getUserInfoApi()
      // API 返回 { data: User }
      userInfo.value = response.data as UserInfo
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * 更新用户信息
   */
  async function updateUserInfo(data: Partial<UserInfo>) {
    try {
      const userId = userInfo.value?.id
      if (!userId) throw new Error('No current user id')
      const response = await updateUserInfoApi(userId, data as any)
      userInfo.value = response.data as UserInfo
      return response.data
    } catch (error) {
      throw error
    }
  }

  return {
    userInfo,
    getUserInfo,
    updateUserInfo
  }
})
