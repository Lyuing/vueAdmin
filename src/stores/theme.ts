import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ThemeConfig } from '@/types/theme'
import { storage } from '@/utils/storage'

const themes: ThemeConfig[] = [
  {
    name: 'default',
    label: '默认蓝',
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399'
    }
  },
  {
    name: 'green',
    label: '清新绿',
    colors: {
      primary: '#00C853',
      success: '#4CAF50',
      warning: '#FF9800',
      danger: '#F44336',
      info: '#9E9E9E'
    }
  },
  {
    name: 'purple',
    label: '优雅紫',
    colors: {
      primary: '#9C27B0',
      success: '#4CAF50',
      warning: '#FF9800',
      danger: '#F44336',
      info: '#9E9E9E'
    }
  }
]

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<string>('default')
  const themeList = ref<ThemeConfig[]>(themes)

  /**
   * 应用主题
   */
  function applyTheme(theme: ThemeConfig) {
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }

  /**
   * 设置主题
   */
  function setTheme(themeName: string) {
    const theme = themes.find(t => t.name === themeName)
    if (theme) {
      currentTheme.value = themeName
      applyTheme(theme)
      storage.set('theme', themeName)
    }
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    const savedTheme = storage.get<string>('theme') || 'default'
    setTheme(savedTheme)
  }

  /**
   * 获取当前主题配置
   */
  function getCurrentTheme(): ThemeConfig | undefined {
    return themes.find(t => t.name === currentTheme.value)
  }

  return {
    currentTheme,
    themeList,
    setTheme,
    initTheme,
    getCurrentTheme
  }
})
