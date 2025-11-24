# 使用说明

## 登录系统

1. 启动开发服务器：`pnpm dev`
2. 访问 http://localhost:3000
3. 使用默认账号登录：
   - 用户名：`admin`
   - 密码：`123456`

## 功能演示

### 1. 用户认证

- 登录后，Token 会自动存储在 localStorage
- 刷新页面会自动恢复登录状态
- 点击右上角用户头像可以登出

### 2. 动态路由

登录后，系统会根据用户权限动态注册以下路由：

- 首页 (`/`)
- 工作台 (`/dashboard`)
- 系统管理 (`/system`)
  - 用户管理 (`/system/user`)
  - 角色管理 (`/system/role`)
  - 菜单管理 (`/system/menu`)

### 3. 导航系统

- **顶部导航**：显示一级菜单（首页、工作台、系统管理）
- **侧边栏**：显示当前一级菜单下的二级菜单
- 点击顶部导航切换不同模块
- 侧边栏支持折叠/展开

### 4. 国际化

点击右上角的语言切换按钮，可以在中文和英文之间切换。

### 5. 主题切换

点击右上角的主题切换按钮，可以选择不同的主题色：

- 默认蓝
- 清新绿
- 优雅紫

## 开发指南

### 添加新页面

1. 在 `src/views` 目录下创建页面组件
2. 在 `src/router/routes.ts` 的 `routeMap` 中添加路由配置
3. 配置路由的 `meta.permissions` 字段设置访问权限
4. 配置 `meta.parent` 字段设置父级路由（用于多级菜单）

示例：

```typescript
{
  path: '/example',
  name: 'Example',
  component: () => import('@/views/example/index.vue'),
  meta: {
    title: '示例页面',
    icon: 'Document',
    requiresAuth: true,
    permissions: ['example:view'],
    order: 4
  }
}
```

### 添加API接口

1. 在 `src/api` 目录下创建API文件
2. 使用 `http` 工具发起请求
3. 定义请求和响应的TypeScript类型

示例：

```typescript
import http from '@/utils/http'

export function getList() {
  return http.get('/example/list')
}

export function create(data: any) {
  return http.post('/example/create', data)
}
```

### 添加状态管理

1. 在 `src/stores` 目录下创建store文件
2. 使用 Pinia 的 `defineStore` 定义store
3. 使用 Composition API 风格编写

示例：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExampleStore = defineStore('example', () => {
  const data = ref([])

  function setData(newData: any[]) {
    data.value = newData
  }

  return {
    data,
    setData
  }
})
```

### 权限控制

#### 路由级权限

在路由配置中设置 `meta.permissions`：

```typescript
meta: {
  permissions: ['user:view', 'user:edit']
}
```

#### 组件内权限判断

使用 `usePermission` 组合式函数：

```typescript
import { usePermission } from '@/composables/usePermission'

const { hasPermission } = usePermission()

if (hasPermission('user:delete')) {
  // 显示删除按钮
}
```

### 国际化

#### 添加翻译

在 `src/locales/zh-CN.ts` 和 `src/locales/en-US.ts` 中添加翻译：

```typescript
export default {
  example: {
    title: '示例标题',
    description: '示例描述'
  }
}
```

#### 使用翻译

```vue
<template>
  <div>{{ t('example.title') }}</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
```

## 注意事项

### Mock数据

当前项目使用Mock数据进行演示，实际开发时需要：

1. 修改 `src/api/auth.ts` 和 `src/api/user.ts`，使用真实的API调用
2. 配置 `.env.development` 和 `.env.production` 中的 `VITE_API_BASE_URL`
3. 根据后端API返回的数据格式调整类型定义

### 路由配置

- 静态路由（登录页、错误页）在 `staticRoutes` 中定义
- 动态路由（业务页面）在 `routeMap` 中定义
- 用户登录后，系统会根据权限从 `routeMap` 中过滤并注册路由

### 菜单层级

- `level: 1` - 顶部导航
- `level: 2` - 侧边栏一级菜单
- `level: 3` - 侧边栏二级菜单

通过 `meta.parent` 字段建立父子关系。

## 常见问题

### Q: 如何修改默认端口？

A: 在 `vite.config.ts` 中修改 `server.port` 配置。

### Q: 如何添加新的主题色？

A: 在 `src/stores/theme.ts` 的 `themes` 数组中添加新的主题配置。

### Q: 如何禁用某个路由的权限检查？

A: 在路由配置的 `meta` 中设置 `requiresAuth: false`。

### Q: 如何实现按钮级权限控制？

A: 使用 `usePermission` 组合式函数的 `hasPermission` 方法进行判断。

## 技术支持

如有问题，请查看：

- [Vue3 官方文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
