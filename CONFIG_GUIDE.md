# 项目配置文件说明

本文档详细说明根目录下各个配置文件的作用和用途。

## 📑 目录

- [📦 包管理相关](#-包管理相关)
  - [package.json](#packagejson)
  - [pnpm-lock.yaml](#pnpm-lockyaml)
- [🔧 构建工具配置](#-构建工具配置)
  - [vite.config.ts](#viteconfigts)
- [📝 TypeScript 配置](#-typescript-配置)
  - [tsconfig.json](#tsconfigjson)
  - [tsconfig.app.json](#tsconfigappjson)
  - [tsconfig.node.json](#tsconfignodejson)
- [🎨 代码规范配置](#-代码规范配置)
  - [eslint.config.js](#eslintconfigjs)
  - [.prettierrc](#prettierrc)
- [🌍 环境变量配置](#-环境变量配置)
  - [.env.development](#envdevelopment)
  - [.env.production](#envproduction)
- [📄 HTML 入口](#-html-入口)
  - [index.html](#indexhtml)
- [📚 文档文件](#-文档文件)
  - [README.md](#readmemd)
  - [USAGE.md](#usagemd)
- [🚫 Git 配置](#-git-配置)
  - [.gitignore](#gitignore)
- [📁 目录说明](#-目录说明)
- [🔑 配置文件优先级](#-配置文件优先级)
- [💡 最佳实践](#-最佳实践)
- [🛠️ 常用命令](#️-常用命令)
- [📖 相关文档链接](#-相关文档链接)

---

## 📦 包管理相关

### `package.json`
- **作用**: 项目的核心配置文件
- **内容**:
  - 项目名称、版本、描述
  - 依赖包列表（dependencies 和 devDependencies）
  - 脚本命令（scripts）：如 `dev`、`build`、`preview`
  - 项目元信息
- **何时修改**: 
  - 安装/卸载依赖包时自动更新
  - 添加新的脚本命令时手动修改

### `pnpm-lock.yaml`
- **作用**: pnpm 的依赖锁定文件
- **内容**: 记录所有依赖包的精确版本和依赖关系树
- **何时修改**: 
  - 自动生成，不要手动修改
  - 执行 `pnpm install` 时自动更新
- **重要性**: 确保团队成员安装相同版本的依赖

## 🔧 构建工具配置

### `vite.config.ts`
- **作用**: Vite 构建工具的配置文件
- **内容**:
  - 开发服务器配置（端口、代理等）
  - 构建选项（输出目录、代码分割等）
  - 插件配置（Vue 插件等）
  - 路径别名（@/ 指向 src/）
- **何时修改**: 
  - 需要修改开发服务器设置
  - 添加新的构建插件
  - 优化打包配置

## 📝 TypeScript 配置

### `tsconfig.json`
- **作用**: TypeScript 项目的根配置文件
- **内容**: 引用其他 tsconfig 文件（app 和 node）
- **何时修改**: 通常不需要修改

### `tsconfig.app.json`
- **作用**: 应用代码的 TypeScript 配置
- **内容**:
  - 编译选项（严格模式、目标版本等）
  - 路径映射（@/* 指向 src/*）
  - 包含的文件范围（src/**/*）
- **何时修改**: 
  - 需要调整 TypeScript 严格程度
  - 添加新的路径别名

### `tsconfig.node.json`
- **作用**: Node.js 环境代码的 TypeScript 配置
- **内容**: 用于配置文件（如 vite.config.ts）的编译选项
- **何时修改**: 通常不需要修改

## 🎨 代码规范配置

### `eslint.config.js`
- **作用**: ESLint 代码检查工具的配置
- **内容**:
  - 代码规则配置
  - Vue、TypeScript 插件配置
  - 忽略的文件/目录
- **何时修改**: 
  - 需要调整代码规范规则
  - 添加/移除 ESLint 插件
  - 自定义团队代码风格

### `.prettierrc`
- **作用**: Prettier 代码格式化工具的配置
- **内容**:
  - 代码格式规则（分号、引号、缩进等）
  - 行宽、尾随逗号等设置
- **何时修改**: 
  - 需要调整代码格式风格
  - 统一团队代码格式规范

## 🌍 环境变量配置

### `.env.development`
- **作用**: 开发环境的环境变量
- **内容**: 
  - API 基础地址（VITE_API_BASE_URL）
  - 开发环境特定的配置
- **何时修改**: 
  - 修改开发环境的 API 地址
  - 添加新的环境变量
- **注意**: 变量名必须以 `VITE_` 开头才能在代码中访问

### `.env.production`
- **作用**: 生产环境的环境变量
- **内容**: 
  - 生产环境的 API 地址
  - 生产环境特定的配置
- **何时修改**: 
  - 部署前配置生产环境的 API 地址
  - 添加生产环境特定的配置

## 📄 HTML 入口

### `index.html`
- **作用**: 应用的 HTML 入口文件
- **内容**:
  - HTML 基础结构
  - 页面标题
  - 应用挂载点（#app）
  - 引入 main.ts
- **何时修改**: 
  - 修改页面标题
  - 添加全局 meta 标签
  - 引入外部 CDN 资源

## 📚 文档文件

### `README.md`
- **作用**: 项目说明文档
- **内容**:
  - 项目简介
  - 功能特性
  - 快速开始指南
  - 技术栈说明
- **何时修改**: 更新项目信息和使用说明

### `USAGE.md`
- **作用**: 详细使用说明文档
- **内容**:
  - 功能演示说明
  - 开发指南
  - 常见问题
- **何时修改**: 添加新功能说明或使用技巧

## 🚫 Git 配置

### `.gitignore`
- **作用**: Git 版本控制忽略文件配置
- **内容**: 
  - node_modules/（依赖包）
  - dist/（构建产物）
  - .env.local（本地环境变量）
  - 其他不需要提交的文件
- **何时修改**: 
  - 需要忽略新的文件或目录
  - 添加特定的构建产物

## 📁 目录说明

### `.kiro/`
- **作用**: Kiro IDE 的配置和规格文档目录
- **内容**: specs/（功能规格文档）

### `.vscode/`
- **作用**: VS Code 编辑器的配置目录
- **内容**: 编辑器设置、推荐插件等

### `public/`
- **作用**: 静态资源目录
- **内容**: 不需要编译的静态文件（如 favicon、图片等）
- **特点**: 文件会被直接复制到构建输出目录

### `src/`
- **作用**: 源代码目录
- **内容**: 所有应用代码（组件、页面、工具等）

### `dist/`
- **作用**: 构建输出目录
- **内容**: 执行 `pnpm build` 后生成的生产代码
- **特点**: 不应提交到 Git，每次构建会重新生成

### `node_modules/`
- **作用**: 依赖包安装目录
- **内容**: 所有 npm 包
- **特点**: 不应提交到 Git，通过 `pnpm install` 安装

## 🔑 配置文件优先级

### 环境变量加载顺序
1. `.env.local`（本地覆盖，不提交到 Git）
2. `.env.[mode]`（如 .env.development）
3. `.env`（通用配置）

### TypeScript 配置继承
```
tsconfig.json
├── tsconfig.app.json (应用代码)
└── tsconfig.node.json (配置文件)
```

## 💡 最佳实践

1. **不要手动修改的文件**:
   - `pnpm-lock.yaml`
   - `node_modules/`
   - `dist/`

2. **需要提交到 Git 的文件**:
   - 所有配置文件（除了 .env.local）
   - package.json
   - 源代码

3. **敏感信息处理**:
   - 不要在 .env 文件中存储密钥
   - 使用 .env.local 存储本地敏感配置
   - .env.local 应该在 .gitignore 中

4. **团队协作**:
   - 统一使用 pnpm 作为包管理器
   - 提交前运行 `pnpm lint` 检查代码
   - 遵循 ESLint 和 Prettier 规则

## 🛠️ 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📖 相关文档链接

- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 配置](https://www.typescriptlang.org/tsconfig)
- [ESLint 配置](https://eslint.org/docs/user-guide/configuring/)
- [Prettier 配置](https://prettier.io/docs/en/configuration.html)
- [pnpm 文档](https://pnpm.io/)
