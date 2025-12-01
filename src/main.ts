
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router, { addDynamicRoutes } from './router'
import i18n from './locales'
import { setupRouterGuards } from './router/guards'
import { useAuthStore } from './stores/auth'
import { useTheme } from './composables/useTheme'
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
  // 恢复缓存认证
  const authStore = useAuthStore()
  authStore.restoreAuth()

  // 设置路由守卫（必须在路由注册前设置，这样守卫可以处理动态路由加载）
  setupRouterGuards(router)

  // 如果已登录，恢复动态路由
  if (authStore.isAuthenticated && authStore.userInfo) {
    await addDynamicRoutes(authStore.userInfo.permissions)
  }

  // 初始化主题
  const { initTheme } = useTheme()
  await initTheme()

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
