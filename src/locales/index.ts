import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'
import zhTW from './zh-TW'
import jaJP from './ja-JP'
import { storage } from '@/utils/storage'

// 语言选项配置
export interface LanguageOption {
  code: string        // 语言代码，如 'zh-CN'
  label: string       // 显示名称，如 '简体中文'
  icon?: string       // 可选的图标标识
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'ja-JP', label: '日本語' }
]

export const DEFAULT_LANGUAGE = 'zh-CN'

// 根据语言代码获取显示名称
export function getLanguageLabel(code: string): string {
  const option = LANGUAGE_OPTIONS.find(opt => opt.code === code)
  return option?.label || code
}

// 验证语言代码是否有效
export function isValidLanguage(code: string): boolean {
  return LANGUAGE_OPTIONS.some(opt => opt.code === code)
}

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'zh-TW': zhTW,
  'ja-JP': jaJP
}

// 获取存储的语言偏好，验证有效性
const storedLocale = storage.get<string>('locale')
const initialLocale = storedLocale && isValidLanguage(storedLocale) 
  ? storedLocale 
  : DEFAULT_LANGUAGE

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: DEFAULT_LANGUAGE,
  messages
})

export default i18n
