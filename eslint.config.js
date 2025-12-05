import pluginVue from 'eslint-plugin-vue'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'
import parserTypeScript from '@typescript-eslint/parser'
import configPrettier from 'eslint-config-prettier'

export default [
  {
    ignores: ['node_modules', 'dist', 'public']
  },
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: parserTypeScript,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      // Vue 模板属性换行规则：3个或更少属性可以在一行，超过3个则每行1个
      'vue/max-attributes-per-line': [
        'warn',
        {
          singleline: 3, // 单行最多3个属性
          multiline: 1   // 多行时每行1个属性
        }
      ],
      'vue/first-attribute-linebreak': [
        'warn',
        {
          singleline: 'ignore',
          multiline: 'below'
        }
      ]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  configPrettier,
  {
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn'
    }
  }
]
