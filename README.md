# Vue3 + TypeScript 中台管理系统

一个基于 Vue3、TypeScript 构建的现代化中台管理系统。为保证统一的开发体验和高效使用，运行前请务必阅读以下规范！

## 规范约束

### 文件归置
- 页面文件 放置在 `src/views` 目录下
- 组件文件 放置在 `src/components` 目录下
  - 文件命名需遵循大坨峰规则，如：`UserCard.vue`
- 图片资源 放置在 `src/assets/images` 目录下
  - 作为图片插入时，命名需遵循 `img-{模块/功能}.{扩展名}`
  - 作为背景图插入时，命名需遵循 `bg-{模块/功能}.{扩展名}`
  - 作为图标插入时，命名需遵循 `icon-{模块/功能}.{扩展名}`
- 多语言文件 放置在 `src/locales` 目录下
- hooks 文件 放置在 `src/composables` 目录下
  - 文件命名需遵循 `use{功能}`
- 接口文件 放置在 `src/api` 目录下
- ts类型文件 放置在 `src/types` 目录下
- 工具函数文件 放置在 `src/utils` 目录下

### 分支命名/使用
- 分支命名需遵循 `(dev|feature|release|hotfix)_(版本号)_(功能描述)`
- 测试流水线，使用`release_{版本号}`

## 功能特性

### 请求封装
- `get/post/put/delete` 参数：url, params, config
  ```ts
  (
    url: string,
    params?: any,
    config: AxiosRequestConfig & { rawResponse?: boolean, showMessage?: boolean }
  )
  ```
  - 配置参数 `rawResponse` 设置为 `true`，将返回**原始响应数据**，而不是摘取后的`data`
  - 配置参数 `showMessage` 设置为 `false`，将取消**响应拦截里**的轻提示 `ELMessage.error`


### 通用组件
#### 选择器
- `zk-select` 增加下拉箭头自定义图标、宽度110px

#### Empty 占位
- `zk-empty` 自定义占位图标

#### 文本标签，超出显示气泡
- `text-label` 容器内容超出外部限制的宽度时，超出显示省略号，鼠标移入时弹出气泡


### hooks
#### 分页
- `src/composables/usePagination.ts` 分页封装：遵守单一职责，仅封装分页数据，请求参数、响应数据处理需在`onChange`回调中处理，能适配所有分页应用，省去分页器的重复逻辑
- `src/composables/usePaginationPro.ts` 分页拓展：继承前者，并纳入请求参数、响应数据处理逻辑，能适配常见的分页场景，极大缩减分页查询相关的重复代码

#### RSA加密
- `src/composables/useRsa.ts` RSA封装：内置公钥获取、字段加密流程；加密方式采用优先 `Web Crypto API`，其次 `node-forge`


### 辅助模式
- 执行`pnpm dev:aux` 启动辅助模式：显示**全部菜单权限**

### 权限控制
- `dev` 环境下，菜单可编辑
  - 菜单类型分为： 顶部导航、侧栏目录、侧栏导航
  - 顶部导航、侧栏目录可设置为父级菜单
  - 顶部导航、侧栏导航可设置为绑定导航(当前导航隐藏时显示)
- `prod` 环境下，菜单仅可预览

### 主题样式
- `variables.scss` 基础样式变量
- `theme.scss` 主题样式文件，继承`variables.scss`
- `tailwind.css` 原子css样式
- `reset.scss` 重置样式

### 工具函数
- `utils/icon.ts` el-icon 组件封装
- `utils/storage.ts` storage缓存读取
- `utils/util.ts` **防抖**、**节流**函数封装


### vue模板
  新建页面时可以使用以下模板快速生成页面
- `src/views/Template.vue` 


## 技术栈

### 技术栈
- **核心框架**: Vue 3.5.24
- **开发语言**: TypeScript 5.9.3
- **构建工具**: Vite 7.2.4
- **状态管理**: Pinia 3.0.4
- **路由管理**: Vue Router 4.6.3
- **HTTP 客户端**: Axios 1.13.2
- **国际化**: Vue I18n 11.1.12
- **UI 组件库**: Element Plus 2.11.8
- **CSS 框架**: Tailwind CSS 4.1.18 + SCSS
- **代码规范**: ESLint + Prettier + Husky

### 后端技术栈 **弃用**
- **Web 框架**: Koa 2.15.3
- **开发语言**: TypeScript 5.7.2
- **运行时**: tsx 4.19.2 (开发热重载)
- **数据存储**: JSON 文件
- **跨域处理**: @koa/cors 5.0.0

## 项目结构

```
├── server/                 # 后端服务
│   ├── src/
│   │   ├── controllers/    # 控制器层
│   │   ├── services/       # 服务层
│   │   ├── repositories/   # 数据访问层
│   │   ├── middlewares/    # 中间件
│   │   ├── routes/         # 路由定义
│   │   ├── types/          # TypeScript 类型
│   │   ├── utils/          # 工具函数
│   │   └── app.ts          # 应用入口
│   ├── data/               # JSON 数据存储
│   └── package.json
├── src/                    # 前端源码
│   ├── api/                # API接口定义
│   │   ├── http.ts         # HTTP封装
│   │   ├── ...
│   │   └── auth.ts         # 认证相关API
│   ├── assets/             # 静态资源
│   │   └── icons/          # 图标资源
│   ├── components/         # 公共组件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   └── ...
│   ├── composables/        # 组合式函数
│   │   ├── useAuth.ts      # 认证逻辑
│   │   ├── useNavigation.ts # 导航逻辑
│   │   └── usePermission.ts # 权限逻辑
│   ├── locales/            # 国际化语言包
│   │   ├── zh-CN.ts        # 简体中文
│   │   ├── zh-TW.ts        # 繁体中文
│   │   ├── en-US.ts        # 英文
│   │   ├── ja-JP.ts        # 日文
│   │   └── index.ts        # i18n配置
│   ├── router/             # 路由配置
│   │   ├── routes/         # 路由定义
│   │   ├── index.ts        # 路由实例
│   │   ├── guards.ts       # 路由守卫
│   │   └── permission.ts   # 权限路由
│   ├── stores/             # Pinia状态管理
│   │   ├── auth.ts         # 认证状态
│   │   ├── user.ts         # 用户状态
│   │   └── navigation.ts   # 导航状态
│   ├── styles/             # 样式文件
│   │   ├── variables.scss  # SCSS变量
│   │   ├── theme.scss      # 主题样式
│   │   ├── index.scss      # 入口样式
│   │   └── tailwind.css    # Tailwind CSS
│   ├── types/              # TypeScript类型定义
│   │   ├── index.ts        # 类型文件统一导出
│   │   ├── api.ts          # API类型
│   │   └── ...
│   ├── utils/              # 工具函数
│   │   ├── util.ts         # 工具
│   │   ├── storage.ts      # 本地存储
│   │   └── icon.ts         # 图标工具
│   ├── views/              # 页面组件
│   │   ├── login/          # 登录页
│   │   ├── home/           # 首页
│   │   ├── system/         # 系统管理
│   │   │   ├── user/       # 用户管理
│   │   │   ├── role/       # 角色管理
│   │   │   ├── menu/       # 菜单管理
│   │   │   └── resource/   # 资源管理
│   │   └── error/          # 错误页面
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── package.json            # 前端依赖配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── eslint.config.js        # ESLint 配置
└── README.md               # 项目说明
```

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
# 安装前端依赖
pnpm install

```

### 启动开发环境

1. **启动后端服务** **弃用**
```bash
cd server
pnpm dev
```
后端服务将在 `http://localhost:3000` 启动

2. **启动前端服务**
```bash
# 新开终端窗口
pnpm dev
```
前端服务将在 `http://localhost:5173` 启动

### 访问系统

访问 http://localhost:5173


### 构建生产版本

```bash
# 构建前端
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

## 部署说明

### Docker 部署

```dockerfile
# 前端 Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 5173
CMD ["pnpm", "preview"]
```


