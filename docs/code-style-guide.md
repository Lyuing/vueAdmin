# 代码风格配置说明

本文档详细说明项目中 ESLint 和 Prettier 的配置及其作用。

---

## 📋 目录

1. [Prettier 配置](#prettier-配置)
2. [ESLint 配置](#eslint-配置)
3. [两者的区别与协作](#两者的区别与协作)
4. [使用方法](#使用方法)

---

## 🎨 Prettier 配置

**文件位置：** `.prettierrc`

**作用：** Prettier 是一个代码格式化工具，专注于代码的**外观**（如何排版），不关心代码逻辑。

### 配置项详解

```json
{
  "semi": false,              // 不使用分号
  "singleQuote": true,        // 使用单引号而不是双引号
  "printWidth": 100,          // 每行最多100个字符
  "trailingComma": "none",    // 不添加尾随逗号
  "arrowParens": "avoid",     // 箭头函数单参数时不加括号
  "endOfLine": "auto"         // 自动处理换行符（兼容 Windows/Unix）
}
```

### 示例效果

**`semi: false`** - 不使用分号
```javascript
// ✅ Prettier 格式化后
const name = 'John'
const age = 25

// ❌ 如果设置为 true
const name = 'John';
const age = 25;
```

**`singleQuote: true`** - 使用单引号
```javascript
// ✅ Prettier 格式化后
const message = 'Hello World'

// ❌ 如果设置为 false
const message = "Hello World"
```

**`printWidth: 100`** - 每行最多100字符
```javascript
// ✅ 不超过100字符，保持一行
const result = someFunction(param1, param2, param3)

// ✅ 超过100字符，自动换行
const result = someLongFunctionName(
  veryLongParameter1,
  veryLongParameter2,
  veryLongParameter3
)
```

**`trailingComma: "none"`** - 不添加尾随逗号
```javascript
// ✅ Prettier 格式化后
const obj = {
  name: 'John',
  age: 25
}

// ❌ 如果设置为 "all"
const obj = {
  name: 'John',
  age: 25,  // 注意这里有逗号
}
```

**`arrowParens: "avoid"`** - 单参数箭头函数不加括号
```javascript
// ✅ Prettier 格式化后
const double = x => x * 2

// ❌ 如果设置为 "always"
const double = (x) => x * 2
```

**`endOfLine: "auto"`** - 自动处理换行符
- Windows 使用 `CRLF` (\r\n)
- Unix/Mac 使用 `LF` (\n)
- `auto` 会根据文件现有格式自动选择

---

## 🔍 ESLint 配置

**文件位置：** `eslint.config.js`

**作用：** ESLint 是一个代码质量检查工具，专注于代码的**质量**（是否有错误、是否符合最佳实践）。

### 配置结构

ESLint 9 使用扁平配置（Flat Config），配置是一个数组，每个对象是一个配置块。

```javascript
export default [
  // 配置块1: 忽略文件
  { ignores: [...] },
  
  // 配置块2: Vue 推荐规则
  ...pluginVue.configs['flat/recommended'],
  
  // 配置块3: Vue 文件特定规则
  { files: ['**/*.vue'], rules: {...} },
  
  // 配置块4: TypeScript 文件规则
  { files: ['**/*.{ts,tsx}'], rules: {...} },
  
  // 配置块5: Prettier 兼容
  configPrettier,
  
  // 配置块6: 全局规则
  { rules: {...} }
]
```

### 详细配置说明

#### 1️⃣ 忽略文件

```javascript
{
  ignores: ['node_modules', 'dist', 'public']
}
```

**作用：** 不检查这些目录中的文件
- `node_modules` - 第三方依赖
- `dist` - 构建输出目录
- `public` - 静态资源目录

---

#### 2️⃣ Vue 推荐规则

```javascript
...pluginVue.configs['flat/recommended']
```

**作用：** 引入 Vue 官方推荐的所有规则，包括：
- 组件命名规范
- 模板语法检查
- Props 验证
- 等等...

---

#### 3️⃣ Vue 文件特定规则

```javascript
{
  files: ['**/*.vue'],  // 只对 .vue 文件生效
  languageOptions: {
    parserOptions: {
      parser: parserTypeScript,  // 使用 TypeScript 解析器
      ecmaVersion: 'latest',     // 支持最新 ES 语法
      sourceType: 'module'       // 使用 ES 模块
    }
  },
  rules: {
    // ... 规则详见下方
  }
}
```

##### Vue 规则详解

**`vue/multi-word-component-names: 'off'`**
```vue
<!-- ✅ 允许单词组件名 -->
<template>
  <div>Home</div>
</template>
<script>
export default {
  name: 'Home'  // 单词组件名，不会报错
}
</script>

<!-- ❌ 如果开启，必须使用多词 -->
<!-- 必须改为 HomePage, HomeView 等 -->
```

**`vue/no-v-html: 'off'`**
```vue
<!-- ✅ 允许使用 v-html -->
<div v-html="htmlContent"></div>

<!-- ❌ 如果开启，会警告（防止 XSS 攻击） -->
```

**`vue/max-attributes-per-line`** ⭐ 重要
```vue
<!-- ✅ 3个或更少属性可以在一行 -->
<el-button type="primary" size="small" @click="handleClick">

<!-- ✅ 超过3个属性，每行一个 -->
<el-menu
  :default-active="activeMenuPath"
  :collapse="sidebarCollapsed"
  :unique-opened="false"
  router
  class="sidebar-menu"
>

<!-- ❌ 4个属性在一行会警告 -->
<el-menu :default-active="path" :collapse="collapsed" :unique-opened="false" router>
```

配置说明：
```javascript
'vue/max-attributes-per-line': [
  'warn',  // 警告级别（不会阻止提交）
  {
    singleline: 3,  // 单行模式最多3个属性
    multiline: 1    // 多行模式每行1个属性
  }
]
```

**`vue/first-attribute-linebreak`**
```vue
<!-- ✅ 多行时第一个属性换行 -->
<el-menu
  :default-active="path"
  :collapse="collapsed"
>

<!-- ❌ 多行时第一个属性不换行会警告 -->
<el-menu :default-active="path"
  :collapse="collapsed"
>
```

---

#### 4️⃣ TypeScript 文件规则

```javascript
{
  files: ['**/*.{ts,tsx}'],  // 只对 .ts 和 .tsx 文件生效
  languageOptions: {
    parser: parserTypeScript  // 使用 TypeScript 解析器
  },
  plugins: {
    '@typescript-eslint': pluginTypeScript
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
```

##### TypeScript 规则详解

**`@typescript-eslint/no-explicit-any: 'off'`**
```typescript
// ✅ 允许使用 any 类型
function process(data: any) {
  return data
}

// ❌ 如果开启，会警告（建议使用具体类型）
```

**`@typescript-eslint/no-unused-vars: 'warn'`**
```typescript
// ⚠️ 警告：变量未使用
const unusedVar = 123

// ✅ 使用了变量
const usedVar = 123
console.log(usedVar)

// ✅ 以下划线开头的变量不会警告（约定俗成）
const _internalVar = 123
```

---

#### 5️⃣ Prettier 兼容配置

```javascript
configPrettier
```

**作用：** 禁用所有与 Prettier 冲突的 ESLint 规则
- ESLint 负责代码质量
- Prettier 负责代码格式
- 避免两者规则冲突

---

#### 6️⃣ 全局规则

```javascript
{
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn'
  }
}
```

**`no-console: 'warn'`**
```javascript
// ⚠️ 警告：生产环境不应该有 console
console.log('debug info')

// ✅ 开发时可以用，但提交前应该删除
```

**`no-debugger: 'warn'`**
```javascript
// ⚠️ 警告：不应该提交 debugger
debugger

// ✅ 开发时可以用，但提交前必须删除
```

---

## 🤝 两者的区别与协作

### Prettier vs ESLint

| 特性 | Prettier | ESLint |
|------|----------|--------|
| **主要职责** | 代码格式化（外观） | 代码质量检查（逻辑） |
| **关注点** | 缩进、引号、分号、换行 | 未使用变量、潜在错误、最佳实践 |
| **可配置性** | 配置项少，固执己见 | 配置项多，高度可定制 |
| **自动修复** | 完全自动 | 部分自动 |
| **运行时机** | 保存时、提交前 | 编码时、保存时、提交前 |

### 协作流程

```
编写代码
   ↓
ESLint 检查代码质量 ← 实时提示错误和警告
   ↓
Prettier 格式化代码 ← 保存时自动格式化
   ↓
提交代码
```

### 示例：两者如何协作

```javascript
// 1. 你写的代码（格式混乱，有质量问题）
const  name="John";const age=25;console.log(name)

// 2. ESLint 检查
// ⚠️ 警告：no-console
// ⚠️ 警告：age 未使用

// 3. Prettier 格式化
const name = 'John'
const age = 25
console.log(name)

// 4. 你修复 ESLint 警告
const name = 'John'
const age = 25
console.log(name, age)  // 使用了 age
// console.log 在开发时保留，提交前删除
```

---

## 🚀 使用方法

### 命令行使用

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npx eslint . --fix

# 运行 Prettier 格式化
npm run format

# 检查 Prettier 格式（不修改文件）
npx prettier --check .
```

### IDE 集成

#### VS Code / Kiro IDE

1. **保存时自动格式化**
   - 安装 Prettier 扩展
   - 设置 `editor.formatOnSave: true`

2. **实时 ESLint 提示**
   - 安装 ESLint 扩展
   - 代码中会显示波浪线提示

3. **快捷键**
   - 格式化文档：`Shift + Alt + F`
   - 修复 ESLint 问题：`Ctrl + .`

### Git Hooks（推荐）

使用 `husky` + `lint-staged` 在提交前自动检查和格式化：

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 📝 规则级别说明

ESLint 规则有三个级别：

| 级别 | 说明 | 效果 |
|------|------|------|
| `'off'` 或 `0` | 关闭规则 | 不检查 |
| `'warn'` 或 `1` | 警告 | 黄色波浪线，不阻止运行 |
| `'error'` 或 `2` | 错误 | 红色波浪线，阻止构建 |

### 示例

```javascript
rules: {
  'no-console': 'warn',        // 警告，可以运行
  'no-debugger': 'error',      // 错误，阻止构建
  'vue/no-v-html': 'off'       // 关闭，不检查
}
```

---

## 🎯 最佳实践

### 1. 提交前检查

```bash
# 提交前运行
npm run lint
npm run format
```

### 2. 团队协作

- 所有成员使用相同的配置文件
- 配置文件纳入版本控制
- 定期更新依赖和规则

### 3. 渐进式采用

- 新项目：使用严格规则
- 老项目：先用 `warn`，逐步改为 `error`

### 4. 自定义规则

根据团队需求调整规则：

```javascript
rules: {
  // 根据团队习惯调整
  'vue/max-attributes-per-line': ['warn', { singleline: 4 }],
  
  // 添加新规则
  'vue/component-name-in-template-casing': ['error', 'PascalCase']
}
```

---

## 📚 参考资源

- [Prettier 官方文档](https://prettier.io/docs/en/)
- [ESLint 官方文档](https://eslint.org/docs/latest/)
- [eslint-plugin-vue 规则](https://eslint.vuejs.org/rules/)
- [@typescript-eslint 规则](https://typescript-eslint.io/rules/)

---

## 🔧 常见问题

### Q: Prettier 和 ESLint 冲突怎么办？

A: 使用 `eslint-config-prettier` 禁用冲突规则（已配置）

### Q: 如何临时禁用规则？

```javascript
// 禁用整个文件
/* eslint-disable */

// 禁用特定规则
/* eslint-disable no-console */
console.log('debug')
/* eslint-enable no-console */

// 禁用下一行
// eslint-disable-next-line no-console
console.log('debug')
```

### Q: 规则太严格怎么办？

A: 在 `eslint.config.js` 中调整规则级别：
```javascript
rules: {
  'no-console': 'warn'  // 从 error 改为 warn
}
```

---

**最后更新：** 2024-12-05
