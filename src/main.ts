import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import './styles/tailwind.css'

import App from './App.vue'
import i18n from './locales'
import initRouter, { addDynamicRoutes, setupRouterGuards } from './router'
import { useAuthStore } from './stores/auth'
import { useNavigationStore } from './stores/navigation'
import { routeMap } from './router/routes'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'

const app = createApp(App)
const pinia = createPinia()

// 注册Pinia
app.use(pinia)

// 注册I18n
app.use(i18n)

// 注册Element Plus
app.use(ElementPlus)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 添加全局组件
app.component('Breadcrumb', Breadcrumb)
// 初始化应用
async function initApp() {
  // 全量路由 - 权限映射
  const navigationStore = useNavigationStore()
  navigationStore.buildPermissionRouteMap(routeMap)

  // 初始化Router - 静态路由 login, 404等
  const router = initRouter()
  app.use(router)

  // 恢复认证
  const authStore = useAuthStore()
  await authStore.restoreAuth()
  // console.warn('恢复认证')

  // 注册路由守卫 - 并触发路由跳转
  setupRouterGuards(router)
  router.replace(router.currentRoute.value)

  // 已登录，恢复动态路由
  // 未登录，则保持静态路由，并在路由守卫中跳转登录页
  if (authStore.isLoggedIn && authStore.userInfo) {
    await addDynamicRoutes(authStore.userInfo.permissions)
  }
  // 等待路由准备好
  await router.isReady()

  // 全局错误处理
  app.config.errorHandler = (err, _instance, info) => {
    console.error('全局错误:', err, info)
  }

  // 挂载应用
  app.mount('#app')
}

initApp()
