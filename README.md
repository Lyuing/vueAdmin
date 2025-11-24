# Vue3 + TypeScript 中台管理系统

一个基于 Vue3、TypeScript、Vite 构建的现代化中台前端框架，提供完整的企业级应用基础设施。

## 功能特性

- ✅ **Vue3 + TypeScript** - 使用最新的 Vue3 Composition API 和 TypeScript 5.0+
- ✅ **Vite 构建** - 极速的开发体验和优化的生产构建
- ✅ **Pinia 状态管理** - 轻量级、类型安全的状态管理方案
- ✅ **Vue Router 动态路由** - 基于权限的动态路由注册和访问控制
- ✅ **Element Plus** - 功能丰富的 UI 组件库
- ✅ **HTTP 请求封装** - 基于 Axios 的统一请求处理和拦截器
- ✅ **用户认证** - 完整的登录登出流程和 Token 管理
- ✅ **权限控制** - 细粒度的权限管理和路由守卫
- ✅ **国际化** - 中英文多语言支持
- ✅ **主题切换** - 多套预设主题色方案
- ✅ **响应式布局** - 适配不同屏幕尺寸的响应式设计
- ✅ **代码规范** - ESLint + Prettier 代码格式化

## 技术栈

- **核心框架**: Vue 3.5+
- **开发语言**: TypeScript 5.0+
- **构建工具**: Vite 7.0+
- **状态管理**: Pinia 3.0+
- **路由管理**: Vue Router 4.6+
- **HTTP 客户端**: Axios 1.13+
- **国际化**: Vue I18n 11.1+
- **UI 组件库**: Element Plus 2.11+
- **CSS 预处理器**: SCSS

## 项目结构

```
src/
├── api/                    # API接口定义
│   ├── auth.ts            # 认证相关API
│   └── user.ts            # 用户相关API
├── assets/                # 静态资源
│   └── styles/            # 全局样式
│       ├── variables.scss # CSS变量
│       ├── theme.scss     # 主题样式
│       └── index.scss     # 入口样式
├── components/            # 公共组件
│   └── layout/            # 布局组件
│       ├── TopNav.vue     # 顶部导航
│       ├── Sidebar.vue    # 侧边栏
│       └── MainLayout.vue # 主布局
├── composables/           # 组合式函数
│   ├── useAuth.ts         # 认证逻辑
│   ├── useTheme.ts        # 主题逻辑
│   └── usePermission.ts   # 权限逻辑
├── locales/               # 国际化语言包
│   ├── zh-CN.ts           # 中文
│   ├── en-US.ts           # 英文
│   └── index.ts           # i18n配置
├── router/                # 路由配置
│   ├── index.ts           # 路由实例
│   ├── routes.ts          # 路由定义
│   └── guards.ts          # 路由守卫
├── stores/                # Pinia状态管理
│   ├── auth.ts            # 认证状态
│   ├── user.ts            # 用户状态
│   ├── theme.ts           # 主题状态
│   └── menu.ts            # 菜单状态
├── types/                 # TypeScript类型定义
│   ├── api.ts             # API类型
│   ├── user.ts            # 用户类型
│   ├── route.ts           # 路由类型
│   ├── menu.ts            # 菜单类型
│   └── theme.ts           # 主题类型
├── utils/                 # 工具函数
│   ├── http.ts            # HTTP封装
│   ├── storage.ts         # 本地存储
│   ├── permission.ts      # 权限工具
│   └── route.ts           # 路由工具
├── views/                 # 页面组件
│   ├── login/             # 登录页
│   ├── home/              # 首页
│   ├── dashboard/         # 工作台
│   ├── system/            # 系统管理
│   └── error/             # 错误页面
├── App.vue                # 根组件
└── main.ts                # 入口文件
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 运行开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

**默认登录账号**:
- 用户名: `admin`
- 密码: `123456`

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 开发规范

### 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- TypeScript 严格模式
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### Git 提交规范

遵循 Conventional Commits 规范：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

## 核心功能说明

### 用户认证

系统提供完整的用户认证流程：

1. 用户登录后，Token 存储在 localStorage
2. HTTP 请求自动携带 Token
3. Token 过期自动跳转登录页
4. 支持记住密码功能

### 动态路由

基于用户权限动态注册路由：

1. 系统维护完整的路由配置表
2. 用户登录后根据权限过滤路由
3. 动态注册可访问的路由
4. 路由守卫控制页面访问

### 权限控制

细粒度的权限管理：

- 路由级权限控制
- 菜单级权限过滤
- 按钮级权限指令（可扩展）

### 国际化

支持中英文切换：

- 语言包按模块组织
- 语言偏好持久化存储
- 组件内使用 `$t` 函数访问翻译

### 主题切换

提供多套主题色方案：

- 默认蓝色主题
- 清新绿色主题
- 优雅紫色主题
- 基于 CSS 变量实现
- 主题偏好持久化存储

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

