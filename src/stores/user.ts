import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'
import { getUserInfo as getUserInfoApi, updateUserInfo as updateUserInfoApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  /**
   * 获取用户信息
   */
  async function getUserInfo() {
    try {
      const data = await getUserInfoApi()
      userInfo.value = data
      return data
    } catch (error) {
      throw error
    }
  }

  /**
   * 更新用户信息
   */
  async function updateUserInfo(data: Partial<UserInfo>) {
    try {
      const updated = await updateUserInfoApi(data)
      userInfo.value = updated
      return updated
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
