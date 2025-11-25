import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()

  const currentTheme = computed(() => themeStore.currentTheme)
  const themeList = computed(() => themeStore.themeList)
  const loadingTheme = computed(() => themeStore.loadingTheme)

  const setTheme = async (themeName: string) => {
    await themeStore.setTheme(themeName)
  }

  const initTheme = () => {
    themeStore.initTheme()
  }

  const getCurrentTheme = () => {
    return themeStore.getCurrentTheme()
  }

  return {
    currentTheme,
    themeList,
    loadingTheme,
    setTheme,
    initTheme,
    getCurrentTheme
  }
}
