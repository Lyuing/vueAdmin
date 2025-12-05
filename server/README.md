# Vue Admin 后端服务

基于 Koa 框架的后端 API 服务，使用 JSON 文件模拟数据库。

## 功能特性

- 用户认证（登录/登出）
- 用户信息管理
- 菜单权限管理
- 基于角色的访问控制
- CORS 跨域支持
- 统一错误处理
- 请求日志记录

## 技术栈

- Koa - Web 框架
- TypeScript - 类型安全
- tsx - TypeScript 执行和热重载
- JSON 文件 - 数据存储

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动

### 启动生产服务器

```bash
pnpm start
```

## API 端点

### 认证

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 用户

- `GET /api/user/info` - 获取当前用户信息（需要认证）
- `PUT /api/user/info` - 更新当前用户信息（需要认证）

### 菜单

- `GET /api/menu/user` - 获取当前用户的菜单（需要认证）
- `GET /api/menu/all` - 获取所有菜单（需要管理员权限）
- `POST /api/menu` - 创建菜单（需要管理员权限）
- `PUT /api/menu/:id` - 更新菜单（需要管理员权限）
- `DELETE /api/menu/:id` - 删除菜单（需要管理员权限）
- `GET /api/menu/permission-codes` - 获取所有权限码
- `POST /api/role/:roleId/menus` - 保存角色菜单配置（需要管理员权限）

## 默认账号

- 用户名：`admin`
- 密码：`123456`

## 数据存储

数据存储在 `data` 目录下的 JSON 文件中：

- `users.json` - 用户数据
- `menus.json` - 菜单配置
- `role-menus.json` - 角色菜单关联

## 配置

可以通过环境变量配置：

- `PORT` - 服务器端口（默认：3000）
- `CORS_ORIGIN` - CORS 允许的来源（默认：http://localhost:5173）
- `NODE_ENV` - 运行环境（默认：development）

## 项目结构

```
server/
├── src/
│   ├── controllers/      # 控制器层
│   ├── services/         # 服务层
│   ├── repositories/     # 数据访问层
│   ├── middlewares/      # 中间件
│   ├── routes/           # 路由定义
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数
│   ├── config/           # 配置文件
│   └── app.ts            # 应用入口
├── data/                 # 数据存储
└── package.json
```
