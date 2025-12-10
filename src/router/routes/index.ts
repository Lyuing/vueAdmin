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
 * 路由仅包含路由相关属性，UI展示由菜单配置控制
 */
export const routeMap: RouteConfig[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/layout/Layout.vue'),
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
          requiresAuth: true,
          permissionCode: 'home'
        }
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '工作台',
          requiresAuth: true,
          permissionCode: 'dashboard'
        }
      },
      {
        path: '/system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          permissionCode: 'system_user'
        }
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          requiresAuth: true,
          permissionCode: 'system_role'
        }
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          requiresAuth: true,
          permissionCode: 'system_menu'
        }
      },
      {
        path: '/system/resource',
        name: 'SystemResource',
        component: () => import('@/views/system/resource/index.vue'),
        meta: {
          title: '资源管理',
          requiresAuth: true,
          permissionCode: 'system_resource'
        }
      },
      {
        path: '/system/resource/:id',
        name: 'SystemResourceDetail',
        component: () => import('@/views/system/resource/detail.vue'),
        meta: {
          title: '资源详情',
          requiresAuth: true,
          permissionCode: 'system_resource_detail'
        }
      },
      {
        path: '/system/resource/:id/edit',
        name: 'SystemResourceEdit',
        component: () => import('@/views/system/resource/edit.vue'),
        meta: {
          title: '编辑资源',
          requiresAuth: true,
          permissionCode: 'system_resource_edit'
        }
      }
    ]
  }
]
