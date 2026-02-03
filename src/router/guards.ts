import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { t } from '@/locales'
import { useAuthStore } from '@/stores/auth'
import { useNavigationStore } from '@/stores/navigation'
import { usePermission } from '@/composables/usePermission'
import { addDynamicRoutes } from './index'

export function setupRouterGuards(router: Router) {
  const authStore = useAuthStore()

  router.beforeEach(async (to, _from, next) => {
    // console.warn('路由守卫触发:', to.path)
    // 如果是登录页，直接放行
    if (to.path === '/login') {
      if (authStore.isLoggedIn) {
        next('/home')
      } else {
        next()
      }
      return
    }

    // 如果路由不存在，检查是否需要动态加载路由
    // 应对页面原地刷新的状态
    if (to.matched.length === 0) {
      // console.warn('路由匹配不到:', to.matched)
      if (!authStore.isLoggedIn) {
        // 未登录用户访问不存在的路由，跳转到登录页
        next('/login')
        return
      } else {
        // 已登录用户访问不存在的路由，尝试加载动态路由
        return resolveRoute(authStore.userInfo?.permissions, router, to, next)
      }
    }

    // 常规页面访问
    // 检查权限
    if (to.meta.requiresAuth) {
      // console.warn('路由匹配-常规页面访问', to.path, to.matched)
      // 检查登录
      if (!authStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        next('/login')
        return
      }

      // 使用usePermission检查路由权限
      const { checkRoutePermission } = usePermission()
      if (!checkRoutePermission(to)) {
        ElMessage.error('无权限访问')
        next('/403')
        return
      }
    }

    // 放行
    next()
  })

  router.afterEach(to => {
    // 设置页面标题
    const pageTitle = t('basic.title')
    document.title = to.meta.title ? `${to.meta.title} - ${pageTitle}` : `${pageTitle}`
  })

  router.onError(error => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败')
  })
}

async function resolveRoute(permissions: string[] | undefined, router: Router, to: any, next: any) {
  const navigationStore = useNavigationStore()
  try {
    await addDynamicRoutes(permissions)

    // 重新检查路由是否存在，避免死循环
    const resolvedRoute = router.resolve(to.path)
    if (resolvedRoute.matched.length > 0) {
      // 路由已注册且已匹配到，重新导航到目标路由
      // console.log('路由已注册且已匹配到！', to.path, resolvedRoute)
      next({ ...to, replace: true })
      return
    } else {
      // 检查路由映射表中是否存在该路径的路由
      const routeExistsInConfig = [...navigationStore.routeNameRouteMap.values()].some(
        route => route.path === to.path
      )
      if (routeExistsInConfig) {
        // 路由在配置中存在，判定为无权限
        next('/403')
        return
      } else {
        // 路由不存在，跳转到404页面
        next('/404')
        return
      }
    }
  } catch (error) {
    console.error('动态路由加载失败，跳转到 login:', error)
    next('/login')
    return
  }
}
