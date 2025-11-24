import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()

  const currentTheme = computed(() => themeStore.currentTheme)
  const themeList = computed(() => themeStore.themeList)

  const setTheme = (themeName: string) => {
    themeStore.setTheme(themeName)
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
    setTheme,
    initTheme,
    getCurrentTheme
  }
}
