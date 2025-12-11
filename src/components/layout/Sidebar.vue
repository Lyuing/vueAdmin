<template>
  <div v-if="hasSidebarMenus" :class="['sidebar', { collapsed: sidebarCollapsed }]">
    <div class="collapse-btn" @click="toggleSidebar()">
      <el-icon>
        <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
    <el-menu 
      :default-active="activeMenuId"
      :default-openeds="openedMenuIds"
      :collapse="sidebarCollapsed"
      :unique-opened="false"
      class="sidebar-menu"
      @select="handleMenuSelect"
    >
      <template v-for="menu in sidebarMenus" :key="menu.id">
        <menu-item-renderer :menu="menu" />
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigation } from '@/composables/useNavigation'
import { useNavigationStore } from '@/stores/navigation'
import MenuItemRenderer from './MenuItemRenderer.vue'

const router = useRouter()
const navigationStore = useNavigationStore()

const { sidebarMenus, sidebarCollapsed, toggleSidebar, activeMenuIds } = useNavigation()

// 是否有侧边栏菜单
const hasSidebarMenus = computed(() => {
  return sidebarMenus.value.length > 0
})

// 当前激活的菜单ID（最后一个，即当前菜单）
const activeMenuId = computed(() => {
  const ids = activeMenuIds.value
  return ids.length > 0 ? ids[ids.length - 1] : ''
})

// 需要展开的菜单ID列表（除了最后一个）
const openedMenuIds = computed(() => {
  const ids = activeMenuIds.value
  return ids.length > 1 ? ids.slice(0, -1) : []
})

// 处理菜单选择
const handleMenuSelect = (menuId: string) => {
  // 通过菜单ID查找菜单项，然后跳转到对应的路由
  const menu = navigationStore.menuMap.get(menuId)
  if (!menu) return
  const path = navigationStore.resolveMenuPath(menu) || menu.path
  if (path) router.push(path)
}
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
