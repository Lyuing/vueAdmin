import crypto from 'crypto'
import { BusinessError } from '../types/common.types.js'

interface RsaKeyPair {
  publicKey: string
  privateKey: string
  clientId: string
  expiresAt: Date
}

export class RsaService {
  private keyStore: Map<string, RsaKeyPair> = new Map()
  private readonly KEY_EXPIRY_MS = 30 * 60 * 1000 // 30分钟
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // 启动定期清理过期密钥的定时器
    this.startCleanupTimer()
  }

  /**
   * 生成RSA密钥对
   */
  async generateKeyPair(): Promise<RsaKeyPair> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        'rsa',
        {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
          }
        },
        (err, publicKey, privateKey) => {
          if (err) {
            reject(new BusinessError('RSA密钥对生成失败', 'RSA_KEY_GENERATION_FAILED', 500))
            return
          }

          const clientId = `client_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
          const expiresAt = new Date(Date.now() + this.KEY_EXPIRY_MS)

          const keyPair: RsaKeyPair = {
            publicKey,
            privateKey,
            clientId,
            expiresAt
          }

          // 存储密钥对
          this.keyStore.set(clientId, keyPair)

          resolve(keyPair)
        }
      )
    })
  }

  /**
   * 获取公钥
   */
  async getPublicKey(clientId?: string): Promise<{ publicKey: string; clientId: string }> {
    // 如果提供了clientId，尝试获取现有的密钥对
    if (clientId && this.keyStore.has(clientId)) {
      const keyPair = this.keyStore.get(clientId)!

      // 检查密钥是否过期
      if (keyPair.expiresAt > new Date()) {
        return {
          publicKey: keyPair.publicKey,
          clientId: keyPair.clientId
        }
      } else {
        // 密钥已过期，删除并生成新的
        this.keyStore.delete(clientId)
      }
    }

    // 生成新的密钥对
    const keyPair = await this.generateKeyPair()
    return {
      publicKey: keyPair.publicKey,
      clientId: keyPair.clientId
    }
  }

  /**
   * 解密密码
   */
  async decryptPassword(encryptedPassword: string, clientId: string): Promise<string> {
    // 获取密钥对
    const keyPair = this.keyStore.get(clientId)

    if (!keyPair) {
      throw new BusinessError('无效的客户端ID或密钥已过期', 'INVALID_CLIENT_ID', 400)
    }

    // 检查密钥是否过期
    if (keyPair.expiresAt <= new Date()) {
      this.keyStore.delete(clientId)
      throw new BusinessError('密钥已过期，请重新获取公钥', 'KEY_EXPIRED', 400)
    }

    try {
      // 将Base64编码的加密数据转换为Buffer
      const encryptedBuffer = Buffer.from(encryptedPassword, 'base64')

      // 使用私钥解密
      const decryptedBuffer = crypto.privateDecrypt(
        {
          key: keyPair.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        encryptedBuffer
      )

      // 转换为字符串
      const decryptedPassword = decryptedBuffer.toString('utf8')

      return decryptedPassword
    } catch (error) {
      console.error('密码解密失败:', error)
      throw new BusinessError('密码解密失败', 'DECRYPTION_FAILED', 400)
    }
  }

  /**
   * 清理过期的密钥
   */
  cleanExpiredKeys(): void {
    const now = new Date()
    const expiredKeys: string[] = []

    // 找出所有过期的密钥
    this.keyStore.forEach((keyPair, clientId) => {
      if (keyPair.expiresAt <= now) {
        expiredKeys.push(clientId)
      }
    })

    // 删除过期的密钥
    expiredKeys.forEach(clientId => {
      this.keyStore.delete(clientId)
    })

    if (expiredKeys.length > 0) {
      console.log(`清理了 ${expiredKeys.length} 个过期的RSA密钥`)
    }
  }

  /**
   * 启动定期清理定时器
   */
  private startCleanupTimer(): void {
    // 每5分钟清理一次过期密钥
    this.cleanupInterval = setInterval(
      () => {
        this.cleanExpiredKeys()
      },
      5 * 60 * 1000
    )
  }

  /**
   * 停止清理定时器（用于测试或关闭服务）
   */
  stopCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * 获取当前存储的密钥数量（用于监控）
   */
  getKeyCount(): number {
    return this.keyStore.size
  }
}

// 导出单例实例
export const rsaService = new RsaService()
