<template>
  <el-dropdown @command="handleLanguageChange">
    <span class="language-switcher">
      <i class="zk-monitor zk-monitor-icon-yuyan"></i>
      <span v-if="showLabel">{{ currentLanguage }}</span>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="lang in languageOptions"
          :key="lang.code"
          :command="lang.code"
          :class="{ 'is-active': lang.code === currentLocale }"
        >
          {{ lang.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LANGUAGE_OPTIONS, setLocale } from '@/locales'
import { changeLanguage } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

interface Props {
  showLabel?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showLabel: true
})

const { locale } = useI18n()

// 语言选项列表
const languageOptions = LANGUAGE_OPTIONS

// 当前语言
const currentLocale = computed(() => locale.value)
// 当前语言 名称
const currentLanguage = computed(() => {
  const option = LANGUAGE_OPTIONS.find(opt => opt.code === locale.value)
  return option?.label || locale.value
})

// 切换语言
const handleLanguageChange = async (lang: string) => {
  try {
    setLocale(lang)
    if (useAuthStore()?.isLoggedIn) {
      await changeLanguage(lang)
    }
  } catch (error) {
    console.error('Failed to change language:', error)
  }
}
</script>

<style scoped lang="scss">
.language-switcher {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  border: none;
  outline: none;
  color: var(--text-color-white);

  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-color-hover);
  }

  &:focus {
    outline: none;
  }
}

// 移除 Element Plus dropdown 触发器的默认边框
:deep(.el-dropdown) {
  outline: none;
  border: none;

  .el-dropdown-link {
    outline: none;
    border: none;
  }
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
}
</style>
