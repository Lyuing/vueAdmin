export function generateToken(payload: any): string {
  // 此处为示例实现，实际应用中应使用 JWT
  const token = Buffer.from(JSON.stringify(payload)).toString('base64')
  return token
}

export function verifyToken(token: string): any | null {
  // 此处为示例实现，实际应用中应使用 JWT 或其他方式验证令牌
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    return decoded
  } catch (error) {
    return null
  }
}
