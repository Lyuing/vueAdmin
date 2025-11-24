<template>
  <div v-if="hasSidebarMenus" :class="['sidebar', { collapsed: menuStore.collapsed }]">
    <div class="collapse-btn" @click="menuStore.toggleCollapse()">
      <el-icon>
        <component :is="menuStore.collapsed ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
    <el-menu
      :default-active="activeMenuName"
      :collapse="menuStore.collapsed"
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

import { useMenuStore } from '@/stores/menu'
import { findMenuByName } from '@/router/helper'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()

// 获取侧边栏菜单（当前激活一级菜单的子菜单）
const sidebarMenus = computed(() => {
  return menuStore.getActiveMenuChildren()
})

// 是否有侧边栏菜单
const hasSidebarMenus = computed(() => {
  return sidebarMenus.value.length > 0
})

// 当前激活的菜单
const activeMenuName = computed(() => {
  return route.name as string
})

const handleMenuSelect = (menuName: string) => {
  const menu = findMenuByName(menuName, menuStore.menuList)
  if (menu?.path) {
    router.push(menu.path)
  }
}

// 监听路由变化，自动展开菜单
watch(
  () => route.name,
  newName => {
    if (newName) {
      menuStore.autoExpandMenus(newName as string)
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  transition: width 0.3s;
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
  cursor: pointer;
  border-bottom: 1px solid #e8e8e8;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f5f5;
  }
}

.sidebar-menu {
  border-right: none;
  height: calc(100% - 48px);
  overflow-y: auto;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
  }

  :deep(.el-menu-item.is-active) {
    color: var(--color-primary, #409eff);
    background-color: #ecf5ff;
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
