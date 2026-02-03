import { computed } from 'vue'
import { createI18n } from 'vue-i18n'
import { storage } from '@/utils/storage'

// 自定义 语言包
import zhCN from './zh-CN'
import enUS from './en-US'
import zhTW from './zh-TW'
import jaJP from './ja-JP'

// Element Plus 语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import zhTw from 'element-plus/es/locale/lang/zh-tw'
import ja from 'element-plus/es/locale/lang/ja'

// 语种选项
export const LANGUAGE_OPTIONS: {
  code: string
  label: string
}[] = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' }
  // { code: 'zh-TW', label: '繁體中文' },
  // { code: 'ja-JP', label: '日本語' }
]

// 自定义语言包 映射
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  en: enUS,
  'zh-TW': zhTW,
  'ja-JP': jaJP
}

// ElementPlus语言包 映射
export const elementLocaleMap = {
  'zh-CN': zhCn,
  'en-US': en,
  en: en,
  'zh-TW': zhTw,
  'ja-JP': ja
}

const validLanguage = (lang?: string) => LANGUAGE_OPTIONS.some(opt => opt.code === lang)

// 默认语言
export const DEFAULT_LANGUAGE = 'zh-CN'
// 浏览器默认语言
const browserLocale = navigator.language
// 缓存的语言偏好
const storedLocale = storage.get<string>('locale') || ''
// console.warn('浏览器语言：', browserLocale, '缓存语言：', storedLocale)

const initialLocale = validLanguage(storedLocale)
  ? storedLocale
  : validLanguage(browserLocale)
    ? browserLocale
    : DEFAULT_LANGUAGE

/**
 * i18n 配置
 */
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: DEFAULT_LANGUAGE,
  messages
})

// 切换语言函数
export const setLocale = (locale: string) => {
  if (LANGUAGE_OPTIONS.some(opt => opt.code === locale)) {
    i18n.global.locale.value = locale as any
    storage.set('locale', locale)
  }
}

// 获取当前语种
export const currentLocale = computed(() => {
  return i18n.global.locale.value
})

// 获取当前语种下 ElementPlus语言包
export const currentElementLocale = computed(() => {
  return (
    elementLocaleMap[i18n.global.locale.value as keyof typeof elementLocaleMap] ||
    elementLocaleMap['zh-CN']
  )
})

// 翻译函数
export const t = i18n.global.t

export default i18n
