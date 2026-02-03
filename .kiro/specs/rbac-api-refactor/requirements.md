# RBAC系统前后端接口重构需求文档

## 介绍

本项目是一个基于Vue3+TypeScript+Element Plus的中台管理系统，采用RBAC（基于角色的访问控制）权限模型。系统包含完整的用户认证、动态路由、权限分配功能。由于部分重构导致前后端接口不匹配，需要修复接口对接问题，确保登录认证、动态路由、权限分配流程正常工作。

## 术语表

- **Frontend_System**: Vue3前端应用系统
- **Backend_System**: Koa.js后端API服务系统  
- **Auth_Store**: Pinia认证状态管理存储
- **Token_Service**: JWT令牌服务
- **Route_Guard**: Vue Router路由守卫
- **Permission_System**: 权限验证系统
- **Menu_System**: 动态菜单系统
- **User_Session**: 用户会话管理

## 需求

### 需求 1: 用户登录认证流程

**用户故事:** 作为系统用户，我希望能够通过用户名/邮箱和密码登录系统，以便访问我有权限的功能模块。

#### 验收标准

1. WHEN 用户提交登录表单，THE Frontend_System SHALL 调用正确的后端登录接口
2. WHEN Backend_System 验证用户凭据成功，THE Backend_System SHALL 返回包含访问令牌、用户信息、权限列表和菜单树的响应
3. WHEN Frontend_System 接收到登录成功响应，THE Auth_Store SHALL 存储用户令牌和信息到本地存储
4. IF 用户凭据验证失败，THEN THE Backend_System SHALL 返回明确的错误信息
5. WHEN 用户登录成功，THE Frontend_System SHALL 重定向到用户有权限访问的首页

### 需求 2: 用户信息获取和会话恢复

**用户故事:** 作为已登录用户，我希望系统能够在页面刷新或重新访问时自动恢复我的登录状态，以便无需重复登录。

#### 验收标准

1. WHEN Frontend_System 初始化时存在有效令牌，THE Frontend_System SHALL 调用获取当前用户信息接口
2. WHEN Backend_System 接收到用户信息请求，THE Backend_System SHALL 验证令牌并返回最新的用户信息和权限
3. WHEN 用户信息获取成功，THE Auth_Store SHALL 更新用户信息和权限到最新状态
4. IF 令牌已过期或无效，THEN THE Backend_System SHALL 返回401状态码
5. WHEN 接收到401响应，THE Frontend_System SHALL 清除本地认证信息并重定向到登录页

### 需求 3: 动态路由和菜单加载

**用户故事:** 作为不同角色的用户，我希望系统根据我的权限动态显示相应的菜单和路由，以便只能访问我有权限的功能。

#### 验收标准

1. WHEN 用户登录成功，THE Menu_System SHALL 根据用户权限生成动态菜单树
2. WHEN Frontend_System 接收到菜单数据，THE Route_Guard SHALL 动态注册用户有权限的路由
3. WHILE 用户浏览系统，THE Permission_System SHALL 验证每个路由的访问权限
4. IF 用户访问无权限的路由，THEN THE Route_Guard SHALL 阻止访问并重定向到403页面
5. WHEN 用户权限发生变更，THE Frontend_System SHALL 重新加载动态路由和菜单

### 需求 4: 用户管理接口对接

**用户故事:** 作为系统管理员，我希望能够管理用户账户（创建、更新、删除、启用/禁用），以便维护系统用户。

#### 验收标准

1. WHEN 管理员请求用户列表，THE Backend_System SHALL 返回分页的用户数据
2. WHEN 管理员创建新用户，THE Backend_System SHALL 验证数据并创建用户记录
3. WHEN 管理员更新用户信息，THE Backend_System SHALL 验证权限并更新用户数据
4. WHEN 管理员删除用户，THE Backend_System SHALL 验证权限并软删除用户记录
5. WHEN 管理员修改用户状态，THE Backend_System SHALL 更新用户启用/禁用状态

### 需求 5: 接口响应格式标准化

**用户故事:** 作为前端开发者，我希望所有后端接口都遵循统一的响应格式，以便前端能够统一处理API响应。

#### 验收标准

1. THE Backend_System SHALL 返回包含code、data、message字段的统一响应格式
2. WHEN 请求成功时，THE Backend_System SHALL 返回code为200的响应
3. WHEN 请求失败时，THE Backend_System SHALL 返回相应的错误码和错误信息
4. WHEN 返回分页数据时，THE Backend_System SHALL 包含currentPage、pageSize、totalPage、totalElements字段
5. THE Backend_System SHALL 在响应头中正确设置Content-Type为application/json