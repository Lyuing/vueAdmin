import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const userInfo = computed(() => authStore.userInfo)
  const token = computed(() => authStore.token)

  const login = async (username: string, password: string) => {
    return await authStore.login(username, password)
  }

  const logout = async () => {
    return await authStore.logout()
  }

  const checkAuth = () => {
    return authStore.checkAuth()
  }

  return {
    isLoggedIn,
    userInfo,
    token,
    login,
    logout,
    checkAuth
  }
}
