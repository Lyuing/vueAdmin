<template>
  <div class="top-nav">
    <div class="nav-left">
      <h1 class="logo flex items-center">
        <img class="logo-img" src="/vite.svg" :alt="t('basic.title')" />
        <span>{{ t('basic.title') }}</span>
      </h1>
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
      <LanguageSwitcher />

      <!-- 用户信息 -->
      <el-dropdown @command="handleUserCommand">
        <span class="nav-item user-info">
          <el-avatar :size="32" :src="authStore.userInfo?.avatar">
            {{ authStore.userInfo?.username?.charAt(0) }}
          </el-avatar>
          <span>{{ authStore.userInfo?.username }}</span>
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
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

import { getIconComponent } from '@/utils/icon'
import type { MenuItem } from '@/types/navigation'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const { topNavs, activeTopNav } = useNavigation()
const navigationStore = useNavigationStore()

const navs = computed(() => {
  return topNavs.value.filter(menu => !menu.hidden)
})
// 判断菜单是否激活
const isMenuActive = (menu: MenuItem) => {
  return menu.id === activeTopNav.value?.id
}

const handleMenuClick = (menu: MenuItem) => {
  try {
    const path = navigationStore.resolveMenuPath(menu)
    path && router.push(path)
  } catch (error) {
    console.error('跳转失败 path:', error)
  }
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
  height: $nav-height;
  padding: 0 $spacing-20;
  color: var(--text-color-white);
  background-color: var(--bgc-nav);
  box-shadow: var(--shadow-base);
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.logo-img {
  height: 26px;
  width: 95px;
  margin-right: 8px;
  vertical-align: middle;
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
  color: var(--menu-color-text);

  &:hover {
    background-color: var(--bg-hover);
    color: var(--menu-active-color-text);
  }

  &.active {
    color: var(--text-color-hover);
    background-color: var(--bg-active);
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
  color: var(--text-color-white);

  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-color-hover);
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
</style>
