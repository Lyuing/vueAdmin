import pluginVue from 'eslint-plugin-vue'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'
import configPrettier from 'eslint-config-prettier'

export default [
  // ========== 基础设置 ==========
  {
    ignores: ['node_modules', 'dist', 'public', '*.config.*'] // 忽略构建、依赖和配置文件
  },

  // ========== 应用插件推荐配置 ==========
  // 此处为 Vue推荐配置，已包含基础规则
  ...pluginVue.configs['flat/recommended'],
  // Prettier配置提前，避免与自定义规则冲突
  configPrettier,

  // ========== Vue文件配置 ==========
  {
    files: ['**/*.vue'],
    languageOptions: {
      // 使用Vue插件提供的解析器处理.vue文件结构
      parser: pluginVue.parser,
      parserOptions: {
        // 为Vue文件中的<script>块指定TypeScript解析器
        parser: parserTypeScript,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    // .vue文件定义规则
    rules: {
      'vue/multi-word-component-names': 'off', // 允许单单词组件名
      'vue/no-unused-components': 'warn', // 未使用组件提示警告
      'vue/no-v-html': 'warn', // 谨慎使用v-html
      'vue/max-attributes-per-line': [
        'warn',
        {
          singleline: 4, // 允许最多4个属性在同一行，符合你当前的代码
          multiline: 1 // 需要换行时，强制一个属性占一行
        }
      ],
      'vue/first-attribute-linebreak': [
        // 强制属性换行
        'warn',
        {
          singleline: 'ignore', // 单行属性忽略
          multiline: 'below' // 多行属性强制换行
        }
      ]
    }
  },

  // ========== TypeScript文件配置 ==========
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: parserTypeScript, // 对.ts/.tsx文件使用TypeScript解析器
      parserOptions: {
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用any类型（根据项目需要）
      '@typescript-eslint/no-unused-vars': 'warn', // 未使用变量提示警告
      'vue/multi-word-component-names': 'off' // 允许单单词组件名
    }
  },

  // ========== 全局规则覆盖（所有文件） ==========
  {
    rules: {
      // 代码质量
      // 'max-lines-per-function': ['off', 80], // 函数最大行数
      'max-depth': ['error', 4], // 最大嵌套深度
      complexity: ['error', 10], // 圈复杂度限制
      // 'space-before-function-paren': [1, 'always'],      // 函数括号前空格
      // 'space-in-parens': ['error', 'always', { exceptions: ['empty'] }],  // 括号内空格
      'key-spacing': [0, { beforeColon: false, afterColon: true }], // 对象key冒号的前后空格
      'comma-spacing': [1, { before: false, after: true }], // 逗号前后空格
      'space-infix-ops': ['error', { int32Hint: false }], // 操作符周围有空格
      'no-multi-spaces': [1, { ignoreEOLComments: true }], // 禁止多余空格，允许行尾注释前有多余空格
      'no-trailing-spaces': [1, { ignoreComments: true }], // 行尾禁止多余空格，允许注释行尾有空格

      // 调试相关
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 生产环境警告console
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off' // 生产环境警告debugger
    }
  }
]
