import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ThemeConfig } from '@/types/theme'

const themes: ThemeConfig[] = [
  {
    name: 'default',
    label: '默认蓝',
    cssFile: '/src/assets/styles/themes/theme_default.scss'
  },
  {
    name: 'green',
    label: '清新绿',
    cssFile: '/src/assets/styles/themes/theme_green.scss'
  },
  {
    name: 'purple',
    label: '优雅紫',
    cssFile: '/src/assets/styles/themes/theme_purple.scss'
  }
]

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<string>('default')
  const themeList = ref<ThemeConfig[]>(themes)
  const loadingTheme = ref<boolean>(false)

  function setCurrentTheme(themeName: string) {
    currentTheme.value = themeName
  }

  function setLoadingTheme(loading: boolean) {
    loadingTheme.value = loading
  }

  function getCurrentThemeConfig(): ThemeConfig | undefined {
    return themes.find(t => t.name === currentTheme.value)
  }

  return {
    currentTheme,
    themeList,
    loadingTheme,
    setCurrentTheme,
    setLoadingTheme,
    getCurrentThemeConfig
  }
})
