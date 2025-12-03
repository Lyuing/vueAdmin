# 实施计划

- [x] 1. 初始化项目和基础配置



  - 使用Vite创建Vue3+TypeScript项目
  - 安装核心依赖：Pinia、Vue Router、Axios、Vue I18n、Element Plus、SCSS
  - 配置vite.config.ts，包括路径别名、代理、构建优化
  - 配置tsconfig.json，启用严格模式
  - 配置ESLint和Prettier代码规范
  - 创建项目目录结构（api、assets、components、composables、locales、router、stores、types、utils、views）
  - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [x] 2. 实现TypeScript类型定义


  - 创建types/api.ts，定义APIResponse、HTTPClientConfig等API相关类型
  - 创建types/user.ts，定义UserInfo、LoginRequest、LoginResponse等用户相关类型
  - 创建types/route.ts，定义RouteConfig、RouteMeta等路由相关类型
  - 创建types/menu.ts，定义MenuItem、SidebarState等菜单相关类型
  - 创建types/theme.ts，定义ThemeConfig等主题相关类型
  - _需求: 1.1, 1.2, 1.3, 2.1, 2.7, 3.1, 3.7, 5.1, 5.2, 5.5, 6.1, 6.7_

- [x] 3. 实现工具函数模块

  - [x] 3.1 实现HTTP请求封装（utils/http.ts）


    - 创建Axios实例，配置baseURL和timeout为30秒
    - 实现请求拦截器：从localStorage读取token并添加到Authorization header
    - 实现响应拦截器：统一处理响应格式，401时清除token并跳转登录页
    - 封装get、post、put、delete方法，提供类型安全的泛型支持
    - 实现统一错误处理和提示机制
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x] 3.2 实现本地存储工具（utils/storage.ts）


    - 封装localStorage的get、set、remove方法
    - 支持JSON序列化和反序列化
    - 提供类型安全的存储接口
    - _需求: 2.2, 2.5, 4.3, 4.4, 6.3, 6.4_
  - [x] 3.3 实现权限工具函数（utils/permission.ts）


    - 实现hasPermission函数，检查用户是否拥有指定权限
    - 实现filterAccessRoutes函数，根据权限过滤路由配置表
    - 实现checkPermission函数，用于路由守卫权限检查
    - _需求: 3.1, 3.2, 3.3, 5.5_
  - [x] 3.4 实现路由工具函数（utils/route.ts）


    - 实现generateMenus函数，从路由配置生成菜单数据
    - 实现calculateLevel函数，计算菜单层级
    - 实现getBreadcrumb函数，根据路由name追溯面包屑路径
    - 实现findRouteByName和findMenuByName辅助函数
    - _需求: 3.1, 3.7, 5.1, 5.2, 5.3, 5.5, 5.6, 5.9_

- [x] 4. 实现Pinia状态管理

  - [x] 4.1 实现认证状态管理（stores/auth.ts）


    - 定义AuthState接口，包含token、userInfo、isLoggedIn
    - 实现login方法：调用登录API，保存token和用户信息到localStorage
    - 实现logout方法：清除token和用户信息，跳转登录页
    - 实现restoreAuth方法：从localStorage恢复登录状态
    - 实现checkAuth方法：检查当前登录状态
    - 集成动态路由注册逻辑
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.5_
  - [x] 4.2 实现用户状态管理（stores/user.ts）


    - 定义UserState，存储用户详细信息
    - 实现getUserInfo方法，获取用户信息
    - 实现updateUserInfo方法，更新用户信息
    - _需求: 2.7_
  - [x] 4.3 实现主题状态管理（stores/theme.ts）


    - 定义ThemeState，包含当前主题名称
    - 定义3种预设主题配置：默认蓝、清新绿、优雅紫
    - 实现setTheme方法：动态修改CSS变量，保存到localStorage
    - 实现initTheme方法：从localStorage恢复主题设置
    - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [x] 4.4 实现菜单状态管理（stores/menu.ts）


    - 定义MenuState，包含menuList、activeMenu、openedMenus、collapsed
    - 实现generateMenus方法：根据路由和权限生成菜单
    - 实现toggleSubmenu方法：切换子菜单展开状态
    - 实现autoExpandMenus方法：根据当前路由自动展开父级菜单
    - 实现setActiveMenu方法：设置当前激活的一级菜单
    - 实现toggleCollapse方法：切换侧边栏折叠状态
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.9_

- [x] 5. 实现路由配置和守卫

  - [x] 5.1 创建完整路由配置表（router/routes.ts）


    - 定义静态路由：登录页、404页面、403页面
    - 定义完整的动态路由配置表routeMap，包含所有业务路由
    - 为每个路由配置meta信息：title、icon、requiresAuth、permissions、parent、order
    - 实现多级嵌套路由结构示例（如系统管理模块）
    - _需求: 3.1, 3.6, 3.7, 5.1, 5.2, 5.5_
  - [x] 5.2 创建路由实例（router/index.ts）


    - 创建Vue Router实例，初始化静态路由
    - 实现addDynamicRoutes函数：根据权限过滤并动态注册路由
    - 实现resetRouter函数：清除动态路由
    - 配置路由懒加载
    - _需求: 3.1, 3.2, 3.4, 3.5_
  - [x] 5.3 实现路由守卫（router/guards.ts）


    - 实现beforeEach守卫：检查认证状态和权限
    - 未登录用户访问需认证页面时跳转登录页
    - 无权限用户访问受限页面时跳转403页面
    - 实现路由错误处理
    - _需求: 2.4, 2.6, 3.2, 3.3_

- [x] 6. 实现国际化配置

  - [x] 6.1 创建语言包（locales/zh-CN.ts和locales/en-US.ts）


    - 定义common模块：登录、登出、提交、取消等通用文本
    - 定义menu模块：菜单项翻译
    - 定义validation模块：表单验证提示
    - 定义login模块：登录页面文本
    - 定义theme模块：主题名称翻译
    - _需求: 4.1, 4.5, 4.7_
  - [x] 6.2 配置Vue I18n（main.ts中集成）


    - 创建i18n实例，配置locale和fallbackLocale
    - 从localStorage读取用户语言偏好
    - 注册中文和英文语言包
    - 挂载到Vue应用
    - _需求: 4.1, 4.2, 4.3, 4.4, 4.6_

- [x] 7. 实现API接口定义


  - 创建api/auth.ts，定义login、logout、refreshToken等认证接口
  - 创建api/user.ts，定义getUserInfo、updateUserInfo等用户接口
  - 使用HTTPClient发起请求，提供类型安全的接口
  - _需求: 2.1, 2.3, 2.7_

- [x] 8. 实现登录页面

  - [x] 8.1 创建登录页面组件（views/login/index.vue）


    - 使用Element Plus的Form组件创建表单
    - 添加用户名和密码输入框
    - 实现表单验证规则：必填项、密码最小长度6位
    - 添加登录按钮，显示加载状态
    - 实现handleLogin方法：调用AuthStore的login方法
    - 登录成功后跳转首页，失败时显示错误提示
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - [x] 8.2 实现登录页面样式（views/login/index.vue的style部分）

    - 实现居中布局
    - 使用响应式设计适配不同屏幕尺寸
    - 添加背景和卡片样式
    - _需求: 7.8_
  - [x] 8.3 添加记住密码功能

    - 添加记住密码复选框
    - 使用localStorage保存用户名
    - 页面加载时自动填充保存的用户名
    - _需求: 7.9_

- [x] 9. 实现布局组件

  - [x] 9.1 创建主布局组件（components/layout/MainLayout.vue）


    - 实现整体布局结构：顶部导航+侧边栏+主内容区
    - 集成TopNav、Sidebar和RouterView
    - 处理布局响应式
    - _需求: 5.1, 5.2_
  - [x] 9.2 创建顶部导航组件（components/layout/TopNav.vue）


    - 显示一级菜单项，从MenuStore获取数据
    - 实现菜单点击切换逻辑，更新activeMenu
    - 高亮当前激活的一级菜单
    - 右侧显示用户信息下拉菜单（包含登出按钮）
    - 右侧添加语言切换下拉菜单
    - 右侧添加主题切换下拉菜单
    - _需求: 5.1, 5.3, 5.6, 5.8, 4.2, 6.2, 2.3_
  - [x] 9.3 创建侧边栏组件（components/layout/Sidebar.vue）


    - 显示当前一级菜单下的二级菜单，从MenuStore获取数据
    - 实现多级嵌套菜单的递归渲染
    - 实现子菜单展开/折叠功能，调用toggleSubmenu
    - 实现菜单项点击路由跳转
    - 高亮当前路由及其父级路由
    - 实现侧边栏整体折叠/展开按钮
    - 显示菜单图标
    - 监听路由变化，自动展开父级菜单和更新高亮
    - _需求: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 10. 实现错误页面


  - 创建views/error/403.vue，显示无权限提示
  - 创建views/error/404.vue，显示页面不存在提示
  - 添加返回首页按钮
  - _需求: 3.3, 3.6_

- [x] 11. 实现首页和示例页面


  - 创建views/home/index.vue作为系统首页
  - 创建示例业务页面（如Dashboard、系统管理等），用于演示动态路由和权限控制
  - 在示例页面中展示多语言和主题切换效果
  - _需求: 3.1, 3.7, 4.2, 6.2, 7.7_

- [x] 12. 实现全局样式和主题

  - [x] 12.1 创建CSS变量定义（assets/styles/variables.scss）


    - 定义颜色变量：primary、success、warning、danger、info等
    - 定义尺寸变量：字体大小、间距、圆角等
    - 定义布局变量：顶部导航高度、侧边栏宽度等
    - _需求: 6.1, 6.5_
  - [x] 12.2 创建主题样式（assets/styles/theme.scss）


    - 基于CSS变量实现主题样式
    - 定义不同主题的颜色映射
    - _需求: 6.1, 6.2, 6.5, 6.7_
  - [x] 12.3 创建全局样式（assets/styles/index.scss）


    - 引入variables.scss和theme.scss
    - 定义全局重置样式
    - 定义通用工具类
    - _需求: 6.5_

- [x] 13. 实现组合式函数


  - 创建composables/useAuth.ts，封装认证相关逻辑
  - 创建composables/useTheme.ts，封装主题切换逻辑
  - 创建composables/usePermission.ts，封装权限检查逻辑
  - 提供可复用的组合式函数供组件使用
  - _需求: 2.1, 2.3, 2.7, 3.2, 3.3, 6.2, 6.5_

- [x] 14. 集成和配置应用入口

  - [x] 14.1 配置main.ts


    - 创建Vue应用实例
    - 注册Pinia、Router、I18n
    - 注册Element Plus
    - 初始化认证状态（restoreAuth）
    - 初始化主题（initTheme）
    - 挂载应用
    - 配置全局错误处理
    - _需求: 2.5, 4.4, 6.4_
  - [x] 14.2 配置App.vue


    - 使用RouterView渲染路由组件
    - 添加全局加载状态
    - _需求: 所有需求_

- [x] 15. 环境配置和构建优化


  - 创建.env.development、.env.production环境配置文件
  - 配置API baseURL等环境变量
  - 优化Vite构建配置：代码分割、压缩、Tree-shaking
  - 配置路由懒加载和组件懒加载
  - _需求: 3.4, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 16. 创建README文档



  - 编写项目简介和功能特性
  - 编写快速开始指南：安装依赖、运行开发服务器、构建生产版本
  - 编写项目结构说明
  - 编写技术栈说明
  - 编写开发规范
  - _需求: 所有需求_
