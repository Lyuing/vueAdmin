<template>
  <div class="top-nav">
    <div class="nav-left">
      <h1 class="logo">{{ t('login.title') }}</h1>
      <div class="nav-menu">
        <div
          v-for="menu in navs"
          :key="menu.id"
          :class="['menu-item', { active: isMenuActive(menu) }]"
          @click="handleMenuClick(menu)"
        >
          <el-icon v-if="menu.icon">
            <component :is="getIcon(menu.icon)" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </div>
      </div>
    </div>
    <div class="nav-right">
      <!-- 语言切换 -->
      <el-dropdown @command="handleLanguageChange">
        <span class="nav-item">
          <el-icon><Place /></el-icon>
          <span>{{ currentLanguage }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item 
              v-for="lang in languageOptions" 
              :key="lang.code"
              :command="lang.code"
            >
              {{ lang.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换 -->
      <el-dropdown @command="handleThemeChange">
        <span class="nav-item">
          <el-icon><Brush /></el-icon>
          <span>{{ t('theme.title') }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="theme in themeList"
              :key="theme.name"
              :command="theme.name"
            >
              {{ t(`theme.${theme.name}`) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户信息 -->
      <el-dropdown @command="handleUserCommand">
        <span class="nav-item user-info">
          <el-avatar :size="32" :src="authStore.userInfo?.avatar">
            {{ authStore.userInfo?.nickname?.charAt(0) }}
          </el-avatar>
          <span>{{ authStore.userInfo?.nickname }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              {{ t('common.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/composables/useNavigation'
import { useNavigationStore } from '@/stores/navigation'
import { useTheme } from '@/composables/useTheme'
import { storage } from '@/utils/storage'
import { LANGUAGE_OPTIONS, getLanguageLabel, isValidLanguage } from '@/locales'
import { getIconComponent } from '@/utils/icon'
import type { MenuItem } from '@/types/navigation'


const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const { topMenus, activeTopMenu } = useNavigation()
const navigationStore = useNavigationStore()
const { themeList, setTheme } = useTheme()

// 使用配置获取当前语言显示名称
const currentLanguage = computed(() => {
  return getLanguageLabel(locale.value)
})

// 语言选项配置
const languageOptions = LANGUAGE_OPTIONS

const navs = computed(() => {
  return topMenus.value.filter(menu => !menu.hidden)
})
// 判断菜单是否激活
const isMenuActive = (menu: MenuItem) => {
  return menu.id === activeTopMenu.value?.id
}

const handleMenuClick = (menu: MenuItem) => {
  try {
    const path = navigationStore.resolveMenuPath(menu)
    path && router.push(path)
  } catch (error) {
    console.error('跳转失败 path:', error)
  }
}

const handleLanguageChange = (lang: string) => {
  try {
    if (isValidLanguage(lang)) {
      locale.value = lang
      storage.set('locale', lang)
    }
  } catch (error) {
    console.error('Failed to change language:', error)
  }
}

const handleThemeChange = async (themeName: string) => {
  await setTheme(themeName)
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout()
  }
}

// 获取图标组件
const getIcon = (iconName?: string) => {
  return getIconComponent(iconName)
}
</script>

<style scoped lang="scss">
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: var(--color-bg-base);
  box-shadow: var(--shadow-base);
  border-bottom: 1px solid var(--color-border-lighter);
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
}

.nav-menu {
  display: flex;
  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  color: var(--color-text-regular);

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  &.active {
    color: var(--color-primary);
    background-color: var(--color-bg-active);
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  border: none;
  outline: none;
  color: var(--color-text-regular);

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  &:focus {
    outline: none;
  }
}

.user-info {
  gap: 10px;
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

@media (max-width: 768px) {
  .logo {
    font-size: 16px;
  }

  .nav-menu {
    display: none;
  }

  .nav-item span {
    display: none;
  }
}
</style>
