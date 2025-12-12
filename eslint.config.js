import pluginVue from 'eslint-plugin-vue';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';
import configPrettier from 'eslint-config-prettier';

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
      'vue/no-v-html': 'warn',                 // 谨慎使用v-html
      'vue/max-attributes-per-line': ['warn', {
        singleline: 3, // 允许最多4个属性在同一行，符合你当前的代码
        multiline: 1   // 需要换行时，强制一个属性占一行
      }],
      'vue/first-attribute-linebreak': [ 'warn', {
        singleline: 'ignore',
        multiline: 'below'
      }]
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
      '@typescript-eslint/no-unused-vars': 'warn',  // 未使用变量提示警告
      'vue/multi-word-component-names': 'off'
    }
  },

  // ========== 全局规则覆盖（所有文件） ==========
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 生产环境警告console
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off' // 生产环境警告debugger
    }
  }
];