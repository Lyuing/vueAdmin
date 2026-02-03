import { reactive, computed, onUnmounted, toRef, type Ref } from 'vue'
import forge from 'node-forge'

import { fetchPublicKey } from '@/api/auth'
import { t } from '@/locales'

// 错误类型常量
export const RsaErrorType = {
  FETCH_PUBLIC_KEY_FAILED: 'FETCH_PUBLIC_KEY_FAILED',
  IMPORT_KEY_FAILED: 'IMPORT_KEY_FAILED',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  UNSUPPORTED_ENVIRONMENT: 'UNSUPPORTED_ENVIRONMENT',
  INVALID_KEY_FORMAT: 'INVALID_KEY_FORMAT'
} as const

export type RsaErrorType = (typeof RsaErrorType)[keyof typeof RsaErrorType]

// RSA 错误接口
export interface RsaError {
  type: RsaErrorType
  message: string
  originalError?: Error
}

// RSA 状态接口
export interface RsaState {
  publicKey: CryptoKey | string | null
  clientId: string | null
  isLoading: boolean
  error: string | null
  cryptoMethod: 'webcrypto' | 'forge' | null
}

// 加密结果接口
export interface EncryptionResult {
  encryptedData: string
  clientId: string
}

// useRsa Hook 返回类型接口
export interface UseRsaReturn {
  // 响应式状态
  publicKey: Ref<CryptoKey | string | null>
  clientId: Ref<string | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  isWebCryptoSupported: Ref<boolean>
  cryptoMethod: Ref<'webcrypto' | 'forge' | null>

  // 方法
  initializeRsa: () => Promise<boolean>
  encryptPassword: (password: string) => Promise<EncryptionResult | null>
  reset: () => void
}

/**
 * useRsa Composition API Hook
 * 提供 RSA 加密功能的响应式状态管理
 */
export function useRsa(): UseRsaReturn {
  // 响应式状态
  const state = reactive<RsaState>({
    publicKey: null,
    clientId: null,
    isLoading: false,
    error: null,
    cryptoMethod: null
  })

  // 计算属性：检查浏览器是否支持 Web Crypto API
  const isWebCryptoSupported = computed(() => {
    return (
      typeof window !== 'undefined' &&
      typeof window.crypto !== 'undefined' &&
      typeof window.crypto.subtle !== 'undefined'
    )
  })
  const caniuseWebCrypto = computed(() => {
    return isWebCryptoSupported.value && window.isSecureContext
  })

  /**
   * 初始化 RSA 功能
   * 获取公钥并设置加密方式
   */
  const initializeRsa = async (): Promise<boolean> => {
    state.isLoading = true
    state.error = null

    try {
      // 获取公钥数据
      const response = await fetchPublicKey()
      const publicKeyData = (response as any)?.publicKey
      const clientIdData = (response as any)?.clientId

      if (!publicKeyData || !clientIdData) {
        throw { message: t('login.getRsaKeyFailed') }
      }

      // 优先尝试使用 Web Crypto API
      if (caniuseWebCrypto.value) {
        try {
          const cryptoKey = await importPublicKeyWithWebCrypto(publicKeyData)
          state.publicKey = cryptoKey
          state.clientId = clientIdData
          state.cryptoMethod = 'webcrypto'
          return true
        } catch (error) {
          console.warn('Web Crypto API 使用失败，降级到 node-forge', error)
        }
      }

      // 降级使用 node-forge
      console.warn('使用 node-forge 作为加密方案')
      state.publicKey = publicKeyData
      state.clientId = clientIdData
      state.cryptoMethod = 'forge'
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('login.initRsaFailed')
      state.error = errorMessage
      console.error('RSA 初始化失败:', error)
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * 加密密码
   */
  const encryptPassword = async (password: string): Promise<EncryptionResult | null> => {
    if (!state.publicKey || !state.clientId) {
      state.error = t('login.RsaNotInit')
      return null
    }

    try {
      let result: EncryptionResult

      if (state.cryptoMethod === 'webcrypto' && state.publicKey instanceof CryptoKey) {
        result = await encryptWithWebCrypto(password, state.publicKey)
      } else if (state.cryptoMethod === 'forge' && typeof state.publicKey === 'string') {
        result = await encryptWithForge(password, state.publicKey)
      } else {
        throw { message: t('login.encryptFailed') }
      }

      // 设置正确的 clientId
      result.clientId = state.clientId
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('login.encryptFailed')
      state.error = errorMessage
      console.error('密码加密失败:', error)
      return null
    }
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    state.publicKey = null
    state.clientId = null
    state.isLoading = false
    state.error = null
    state.cryptoMethod = null
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    reset()
  })

  return {
    // 响应式状态
    publicKey: toRef(state, 'publicKey'),
    clientId: toRef(state, 'clientId'),
    isLoading: toRef(state, 'isLoading'),
    error: toRef(state, 'error'),
    isWebCryptoSupported,
    cryptoMethod: toRef(state, 'cryptoMethod'),

    // 方法
    initializeRsa,
    encryptPassword,
    reset
  }
}

/**
 * 使用 Web Crypto API 导入 PEM 格式的公钥
 */
async function importPublicKeyWithWebCrypto(pem: string): Promise<CryptoKey> {
  try {
    // 移除 PEM 头尾和换行符
    const pemHeader = `-----BEGIN PUBLIC KEY-----`
    const pemFooter = `-----END PUBLIC KEY-----`
    const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '')

    // 将 Base64 字符串转换为 ArrayBuffer
    const binaryDerString = atob(pemContents)
    const binaryDer = new Uint8Array(binaryDerString.length)
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i)
    }

    // 导入公钥
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' }
      },
      true,
      ['encrypt']
    )
  } catch (error) {
    console.error('使用 Web Crypto API 导入公钥失败:', error)
    throw error
  }
}

// 使用 Web Crypto API 进行加密
async function encryptWithWebCrypto(data: string, cryptoKey: CryptoKey): Promise<EncryptionResult> {
  try {
    // 将字符串转换为 ArrayBuffer
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // 使用 RSA-OAEP 加密数据
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      cryptoKey,
      dataBuffer
    )

    // 将加密结果转换为 Base64 字符串
    const encryptedArray = new Uint8Array(encryptedBuffer)
    let binary = ''
    for (let i = 0; i < encryptedArray.length; i++) {
      binary += String.fromCharCode(encryptedArray[i] ?? 0)
    }
    const encryptedData = btoa(binary)

    return { encryptedData, clientId: '' } // clientId 将在调用处设置
  } catch (error) {
    console.error('使用 Web Crypto API 加密失败:', error)
    throw error
  }
}

/**
 * 使用 node-forge 导入公钥 进行加密
 */
async function encryptWithForge(data: string, publicKeyPem: string): Promise<EncryptionResult> {
  try {
    // 导入公钥
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
    // 使用 OAEP 填充进行加密
    const encryptedBytes = publicKey.encrypt(data, 'RSA-OAEP', {
      md: forge.md.sha256.create()
    })

    // 将加密结果转换为 Base64 字符串
    const encryptedData = forge.util.encode64(encryptedBytes)

    return { encryptedData, clientId: '' } // clientId 将在调用处设置
  } catch (error) {
    console.error('使用 node-forge 加密失败:', error)
    throw error
  }
}
