# 主题系统使用指南

## 架构设计

主题系统采用**独立样式表文件 + 动态加载**的架构设计。

### 核心设计理念

1. **每个主题一个独立的样式表文件** - 便于维护和扩展
2. **通过动态加载切换主题** - 移除旧样式，加载新样式
3. **所有主题定义相同的 CSS 变量** - 确保一致性
4. **支持本地和远程主题** - 灵活的主题来源

### 文件结构

```
src/assets/styles/
├── theme.scss          # 默认蓝色主题
├── theme-green.scss    # 清新绿色主题
└── theme-purple.scss   # 优雅紫色主题
```

每个主题文件都定义相同的 CSS 变量：
- `--color-primary`
- `--color-success`
- `--color-warning`
- `--color-danger`
- `--color-info`

## 工作原理

### 1. 主题配置 (theme.ts)

```typescript
const themes: ThemeConfig[] = [
  {
    name: 'default',
    label: '默认蓝',
    cssFile: '/src/assets/styles/theme.scss'
  },
  {
    name: 'green',
    label: '清新绿',
    cssFile: '/src/assets/styles/theme-green.scss'
  },
  {
    name: 'purple',
    label: '优雅紫',
    cssFile: '/src/assets/styles/theme-purple.scss'
  }
]
```

### 2. 动态加载机制

当切换主题时：
1. 移除旧的主题 `<link>` 标签
2. 创建新的 `<link>` 标签加载新主题文件
3. 新主题的 CSS 变量覆盖旧主题

```typescript
function loadThemeCSS(cssFile: string, themeName: string) {
  // 1. 移除旧主题的 <link> 标签
  const existingLink = document.querySelector('link[data-theme]')
  if (existingLink) existingLink.remove()
  
  // 2. 创建新的 <link> 标签加载新主题
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = cssFile
  link.setAttribute('data-theme', themeName)
  document.head.appendChild(link)
}
```

## 基础使用

### 在组件中切换主题

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { currentTheme, themeList, setTheme, loadingTheme } = useTheme()

const handleThemeChange = async (themeName: string) => {
  await setTheme(themeName)
}
</script>

<template>
  <div>
    <el-select 
      v-model="currentTheme" 
      @change="handleThemeChange" 
      :loading="loadingTheme"
    >
      <el-option
        v-for="theme in themeList"
        :key="theme.name"
        :label="theme.label"
        :value="theme.name"
      />
    </el-select>
  </div>
</template>
```

## 扩展场景

### 场景 1：添加新的本地主题

**步骤 1：创建主题样式文件**

创建 `src/assets/styles/theme-dark.scss`：

```scss
/**
 * 暗色主题
 */

:root {
  --el-color-primary: var(--color-primary);
  --el-color-success: var(--color-success);
  --el-color-warning: var(--color-warning);
  --el-color-danger: var(--color-danger);
  --el-color-info: var(--color-info);
}

:root {
  --color-primary: #409eff;
  --color-success: #67c23a;
  --color-warning: #e6a23c;
  --color-danger: #f56c6c;
  --color-info: #909399;
  
  // 暗色主题特有的变量
  --color-text-primary: #e5eaf3;
  --color-bg-base: #1d1e1f;
  --color-border: #4c4d4f;
}
```

**步骤 2：在 theme.ts 中注册**

```typescript
const themes: ThemeConfig[] = [
  // ... 其他主题
  {
    name: 'dark',
    label: '暗色主题',
    cssFile: '/src/assets/styles/theme-dark.scss'
  }
]
```

### 场景 2：运行时注册远程主题

```typescript
import { useTheme } from '@/composables/useTheme'

const { registerTheme, setTheme } = useTheme()

// 注册远程主题
registerTheme({
  name: 'enterprise',
  label: '企业定制',
  cssFile: 'https://cdn.example.com/themes/enterprise.css'
})

// 切换到企业主题
await setTheme('enterprise')
```

### 场景 3：扩展更多 CSS 变量

当系统变大后，可以在所有主题文件中添加更多变量：

```scss
:root {
  // 基础颜色
  --color-primary: #409eff;
  --color-success: #67c23a;
  
  // 文字颜色
  --color-text-primary: #303133;
  --color-text-regular: #606266;
  --color-text-secondary: #909399;
  
  // 边框颜色
  --color-border: #dcdfe6;
  --color-border-light: #e4e7ed;
  
  // 背景颜色
  --color-bg-base: #ffffff;
  --color-bg-light: #f5f7fa;
  
  // 间距
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  // 圆角
  --border-radius-sm: 2px;
  --border-radius-base: 4px;
  --border-radius-lg: 8px;
  
  // 阴影
  --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-light: 0 2px 4px rgba(0, 0, 0, 0.05);
}
```

在组件中使用：

```vue
<style scoped>
.custom-card {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-base);
}
</style>
```

## 设计优势

### 1. 清晰的关注点分离

- **样式文件 (.scss)** - 定义完整的主题样式和变量
- **Store (theme.ts)** - 管理主题元数据和切换逻辑
- **Composable (useTheme.ts)** - 提供组件级别的使用接口

### 2. 易于维护和扩展

- 每个主题独立文件，修改互不影响
- 添加新主题只需创建新文件并注册
- 可以轻松添加更多 CSS 变量

### 3. 支持多种主题来源

- ✅ 本地主题文件（打包在项目中）
- ✅ 远程主题文件（CDN 或服务端）
- ✅ 运行时动态注册

### 4. 性能优化

- 按需加载：只加载当前使用的主题
- 避免重复加载：切换到当前主题时不重新加载
- 减少初始包体积：主题文件可以独立部署

## API 参考

### useTheme()

```typescript
const {
  currentTheme,      // 当前主题名称 (Ref<string>)
  themeList,         // 可用主题列表 (Ref<ThemeConfig[]>)
  loadingTheme,      // 主题加载状态 (Ref<boolean>)
  setTheme,          // 切换主题 (themeName: string) => Promise<void>
  initTheme,         // 初始化主题 () => void
  getCurrentTheme,   // 获取当前主题配置 () => ThemeConfig | undefined
  registerTheme      // 注册新主题 (theme: ThemeConfig) => void
} = useTheme()
```

### ThemeConfig 接口

```typescript
interface ThemeConfig {
  name: string      // 主题唯一标识
  label: string     // 主题显示名称
  cssFile: string   // 主题样式表文件路径
}
```

## 注意事项

1. **CSS 变量一致性** - 所有主题文件必须定义相同的 CSS 变量名
2. **异步切换** - `setTheme()` 是异步函数，需要使用 `await`
3. **加载状态** - 使用 `loadingTheme` 显示加载状态，提升用户体验
4. **错误处理** - 主题加载失败时会在控制台输出错误信息
