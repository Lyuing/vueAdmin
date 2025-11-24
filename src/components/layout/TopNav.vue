<template>
  <div class="top-nav">
    <div class="nav-left">
      <h1 class="logo">{{ t('login.title') }}</h1>
      <div class="nav-menu">
        <div
          v-for="menu in topMenus"
          :key="menu.id"
          :class="['menu-item', { active: activeMenu === menu.name }]"
          @click="handleMenuClick(menu)"
        >
          <el-icon v-if="menu.icon">
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </div>
      </div>
    </div>
    <div class="nav-right">
      <!-- 语言切换 -->
      <el-dropdown @command="handleLanguageChange">
        <span class="nav-item">
          <el-icon><Globe /></el-icon>
          <span>{{ currentLanguage }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">{{ t('language.zhCN') }}</el-dropdown-item>
            <el-dropdown-item command="en-US">{{ t('language.enUS') }}</el-dropdown-item>
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
              v-for="theme in themeStore.themeList"
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useThemeStore } from '@/stores/theme'
import { storage } from '@/utils/storage'
import type { MenuItem } from '@/types/menu'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()
const themeStore = useThemeStore()

// 获取一级菜单
const topMenus = computed(() => {
  return menuStore.menuList.filter(menu => menu.level === 1)
})

const activeMenu = computed(() => menuStore.activeMenu)

const currentLanguage = computed(() => {
  return locale.value === 'zh-CN' ? '中文' : 'English'
})

const handleMenuClick = (menu: MenuItem) => {
  menuStore.setActiveMenu(menu.name)
  if (menu.path) {
    router.push(menu.path)
  } else if (menu.children && menu.children.length > 0) {
    const firstChild = menu.children[0]
    if (firstChild?.path) {
      router.push(firstChild.path)
    }
  }
}

const handleLanguageChange = (lang: string) => {
  locale.value = lang
  storage.set('locale', lang)
}

const handleThemeChange = (themeName: string) => {
  themeStore.setTheme(themeName)
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    authStore.logout()
  }
}
</script>

<style scoped lang="scss">
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  color: var(--color-primary, #409eff);
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

  &:hover {
    background-color: #f5f5f5;
  }

  &.active {
    color: var(--color-primary, #409eff);
    background-color: #ecf5ff;
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

  &:hover {
    background-color: #f5f5f5;
  }
}

.user-info {
  gap: 10px;
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
