import { networkInterfaces } from 'os'

/**
 * 获取本地 IP 地址
 * @returns 本地 IPv4 地址，如果未找到则返回 'localhost'
 */
export function getLocalIP(): string {
  const nets = networkInterfaces()

  for (const name of Object.keys(nets)) {
    const netList = nets[name]
    if (!netList) continue

    for (const net of netList) {
      // 跳过内部地址和非 IPv4 地址
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}
