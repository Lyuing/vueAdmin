import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'

import { config } from './config/index.js'
import { getLocalIP } from './utils/network.util.js'
import { errorHandler } from './middlewares/error.middleware.js'
import { logger } from './middlewares/logger.middleware.js'
import { registerRoutes } from './routes/index.js'
import { userRepository } from './repositories/user.repository.js'
import { menuRepository } from './repositories/menu.repository.js'
import { roleMenuRepository } from './repositories/role-menu.repository.js'

const app = new Koa()

// 注册中间件
app.use(errorHandler)
app.use(logger)
app.use(cors({ origin: config.corsOrigin }))
app.use(bodyParser())

// 注册路由
registerRoutes(app)

start()

// 启动服务器
async function start() {
  try {
    await loadData()

    app.listen(config.port, () => {
      const localIP = getLocalIP()
      console.log(`${config.env} 服务器运行:`)
      console.log(`➜  Local: http://localhost:${config.port}`)
      console.log(`➜  Network: http://${localIP}:${config.port}`)
      // console.log(`环境: ${config.env}`)
      // console.log(`✓ CORS 允许来源: ${config.corsOrigin}`)
    })
  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

// 加载数据文件
async function loadData() {
  await userRepository.init()
  await menuRepository.init()
  await roleMenuRepository.init()
}

