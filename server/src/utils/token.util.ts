interface TokenData {
  userId: string
  username: string
  roles: string[]
}

const tokenStore = new Map<string, TokenData>()

export function generateToken(userId: string, username: string, roles: string[]): string {
  const token = `token-${userId}-${Date.now()}`
  tokenStore.set(token, { userId, username, roles })
  return token
}

export function verifyToken(token: string): TokenData | null {
  return tokenStore.get(token) || null
}

export function removeToken(token: string): void {
  tokenStore.delete(token)
}
