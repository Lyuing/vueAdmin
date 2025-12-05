import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'
import { useNavigation } from '@/composables/useNavigation'
import { addDynamicRoutes } from './index'

export function setupRouterGuards(router: Router) {
  const authStore = useAuthStore()

  router.beforeEach(async (to, _from, next) => {
    // 如果是登录页，直接放行
    if (to.path === '/login') {
      if (authStore.isLoggedIn) {
        next('/home')
      } else {
        next()
      }
      return
    }

    // 如果路由不存在（404），检查是否需要动态加载路由
    // 应对页面原地刷新的状态
    if (to.matched.length === 0) {
      if (!authStore.isLoggedIn) {
        // 未登录用户访问不存在的路由，跳转到登录页
        next('/login')
        return
      } else {
        // 已登录用户访问不存在的路由，尝试加载动态路由
        if (authStore.userInfo) {
          try {
            await addDynamicRoutes(authStore.userInfo.permissions)
            // 路由已注册，重新导航到目标路由
            next({ ...to, replace: true })
            return
          } catch (error) {
            console.error('动态路由加载失败:', error)
          }
        }
        // 如果还是找不到，跳转到404页面
        next('/404')
        return
      }
    }

    // 常规页面访问
    if (to.meta.requiresAuth) {
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
    document.title = to.meta.title ? `${to.meta.title} - 中台管理系统` : '中台管理系统'

    // 同步菜单与路由状态
    const { syncMenuWithRoute } = useNavigation()
    syncMenuWithRoute()
  })

  router.onError(error => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败')
  })
}
