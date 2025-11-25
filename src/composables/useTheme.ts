import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { storage } from '@/utils/storage'

export function useTheme() {
  const themeStore = useThemeStore()

  const currentTheme = computed(() => themeStore.currentTheme)
  const themeList = computed(() => themeStore.themeList)
  const loadingTheme = computed(() => themeStore.loadingTheme)

  
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
    const theme = themeList.value.find(t => t.name === themeName)
    if (!theme) {
      console.warn(`主题 "${themeName}" 不存在`)
      return
    }

    // 初始化时也需要加载主题
    const needLoad =
      currentTheme.value !== themeName || !document.querySelector('link[data-theme]')

    if (!needLoad) {
      return
    }

    themeStore.setLoadingTheme(true)
    try {
      await loadThemeCSS(theme.cssFile, theme.name)
      themeStore.setCurrentTheme(themeName)
      storage.set('theme', themeName)
    } catch (error) {
      console.error('加载主题失败:', error)
    } finally {
      themeStore.setLoadingTheme(false)
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
  function getCurrentTheme() {
    return themeStore.getCurrentThemeConfig()
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
