import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ThemeConfig } from '@/types/theme'
import { storage } from '@/utils/storage'

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

  /**
   * 初始化主题
   */
  async function initTheme() {
    const savedTheme = storage.get<string>('theme') || 'default'
    await setTheme(savedTheme)
  }

  /**
   * 设置主题
   */
  async function setTheme(themeName: string) {
    const theme = themes.find(t => t.name === themeName)
    if (!theme) {
      console.warn(`主题 "${themeName}" 不存在`)
      return
    }

    // 初始化时也需要加载主题
    const needLoad = currentTheme.value !== themeName || !document.querySelector('link[data-theme]')
    
    if (!needLoad) {
      return
    }

    loadingTheme.value = true
    try {
      await loadThemeCSS(theme.cssFile, theme.name)
      currentTheme.value = themeName
      storage.set('theme', themeName)
    } catch (error) {
      console.error('加载主题失败:', error)
    } finally {
      loadingTheme.value = false
    }
  }

  /**
   * 动态加载主题 CSS 文件
   */
  function loadThemeCSS(cssFile: string, themeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingLink = document.querySelector('link[data-theme]')
      if (existingLink) {
        existingLink.remove()
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = cssFile
      link.setAttribute('data-theme', themeName)

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`加载主题文件失败: ${cssFile}`))

      document.head.appendChild(link)
    })
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
    loadingTheme,
    setTheme,
    initTheme,
    getCurrentTheme
  }
})
