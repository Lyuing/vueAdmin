import type { RouteConfig } from '@/types/route'

/**
 * 静态路由 - 始终可访问
 */
export const staticRoutes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
      hidden: true
    }
  }
]

/**
 * 完整路由配置表 - 根据权限动态加载
 */
export const routeMap: RouteConfig[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/layout/MainLayout.vue'),
    redirect: '/home',
    meta: {
      title: '主页',
      requiresAuth: true,
      hidden: true
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          requiresAuth: true,
          permissions: ['home:view'],
          order: 1
        }
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '工作台',
          icon: 'DataLine',
          requiresAuth: true,
          permissions: ['dashboard:view'],
          order: 2
        }
      },
      {
        path: '/system',
        name: 'System',
        component: () => import('@/components/common/RouterView.vue'),
        redirect: '/system/user',
        meta: {
          title: '系统管理',
          icon: 'Setting',
          requiresAuth: true,
          permissions: ['system:view'],
          order: 3
        },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('@/views/system/user/index.vue'),
            meta: {
              title: '用户管理',
              icon: 'User',
              requiresAuth: true,
              permissions: ['system:user:view'],
              parent: 'System',
              order: 1
            }
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('@/views/system/role/index.vue'),
            meta: {
              title: '角色管理',
              icon: 'UserFilled',
              requiresAuth: true,
              permissions: ['system:role:view'],
              parent: 'System',
              order: 2
            }
          },
          {
            path: 'menu',
            name: 'SystemMenu',
            component: () => import('@/views/system/menu/index.vue'),
            meta: {
              title: '菜单管理',
              icon: 'Menu',
              requiresAuth: true,
              permissions: ['system:menu:view'],
              parent: 'System',
              order: 3
            }
          }
        ]
      }
    ]
  }
]
