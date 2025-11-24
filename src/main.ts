/*
 * @Author: luyu luyu1547@dingtalk.com
 * @Date: 2025-11-21 15:53:23
 * @LastEditors: luyu luyu1547@dingtalk.com
 * @LastEditTime: 2025-11-24 11:29:06
 * @FilePath: \vueMainKiro\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import { setupRouterGuards } from './router/guards'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import './assets/styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

// 注册Pinia
app.use(pinia)

// 注册Router
app.use(router)

// 注册I18n
app.use(i18n)

// 注册Element Plus
app.use(ElementPlus)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化应用
async function initApp() {
  // 初始化认证状态
  const authStore = useAuthStore()
  authStore.restoreAuth()

  // 设置路由守卫（必须在路由注册前设置，这样守卫可以处理动态路由加载）
  setupRouterGuards(router)

  // 如果已登录，恢复动态路由
  if (authStore.isAuthenticated && authStore.userInfo) {
    const { addDynamicRoutes } = await import('./router')
    await addDynamicRoutes(authStore.userInfo.permissions)
  }

  // 初始化主题
  const themeStore = useThemeStore()
  themeStore.initTheme()

  // 全局错误处理
  app.config.errorHandler = (err, _instance, info) => {
    console.error('全局错误:', err, info)
  }

  // 等待路由准备好
  await router.isReady()

  // 挂载应用
  app.mount('#app')
}

initApp()
