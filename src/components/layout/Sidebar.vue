<template>
  <div v-if="hasSidebarMenus" :class="['sidebar', { collapsed }]">
    <div class="collapse-btn" @click="toggleCollapse()">
      <el-icon>
        <component :is="collapsed ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
    <el-menu
      :default-active="activeMenuName"
      :collapse="collapsed"
      :unique-opened="false"
      class="sidebar-menu"
      @select="handleMenuSelect"
    >
      <template v-for="menu in sidebarMenus" :key="menu.id">
        <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.name">
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <template v-for="child in menu.children" :key="child.id">
            <el-menu-item :index="child.name">
              <el-icon v-if="child.icon">
                <component :is="child.icon" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
        <el-menu-item v-else :index="menu.name">
          <el-icon v-if="menu.icon">
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useMenu } from '@/composables/useMenu'

const router = useRouter()
const route = useRoute()
const { collapsed, toggleCollapse, getActiveMenuChildren, autoExpandMenus, findMenuByName } = useMenu()

// 获取侧边栏菜单（当前激活一级菜单的子菜单）
const sidebarMenus = computed(() => {
  return getActiveMenuChildren()
})

// 是否有侧边栏菜单
const hasSidebarMenus = computed(() => {
  return sidebarMenus.value.length > 0
})

// 当前激活的菜单
const activeMenuName = computed(() => {
  return route.name as string
})

// 菜单选择事件
const handleMenuSelect = (menuName: string) => {
  const menu = findMenuByName(menuName)
  if (menu?.path) {
    router.push(menu.path)
  }
}

// 监听路由变化，自动展开菜单
watch(
  () => route.name,
  newName => {
    if (newName) {
      autoExpandMenus(newName as string)
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.sidebar {
  position: relative;
  width: 200px;
  background-color: var(--color-bg-base);
  transition: width 0.3s;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: var(--color-border);
    z-index: 1;
  }

  &.collapsed {
    width: 64px;
  }
}

.collapse-btn {
  position: absolute;
  right: -1px;
  top: 12px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  transition: all 0.3s;
  color: var(--color-text-regular);
  transform: translateX(50%);

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-light);
  }
}

.sidebar-menu {
  border-right: none;
  height: 100%;
  overflow-y: auto;
  background-color: var(--color-bg-base);

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
    color: var(--color-text-regular);

    &:hover {
      background-color: var(--color-bg-hover);
      color: var(--color-text-primary);
    }
  }

  :deep(.el-menu-item.is-active) {
    color: var(--color-primary);
    background-color: var(--color-bg-active);
  }

  :deep(.el-sub-menu__title) {
    &:hover {
      background-color: var(--color-bg-hover);
    }
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 0;
    z-index: 99;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

    &.collapsed {
      left: -200px;
    }
  }
}
</style>
