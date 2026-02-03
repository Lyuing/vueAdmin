<template>
  <div v-if="hasSidebarMenus" :class="['sidebar', { collapsed: sidebarCollapsed }]">
    <div class="collapse-box" @click="toggleSidebar()">
      <p class="collapse-btn">
        <i
          :class="[
            'zk-monitor',
            'zk-monitor-icon-zhankai',
            'collapsed-icon',
            sidebarCollapsed ? 'collapsed-expand' : 'collapsed-fold'
          ]"
        ></i>
      </p>
    </div>
    <div class="menu-wraper">
      <el-scrollbar>
        <el-menu
          :default-active="activeMenuId"
          :default-openeds="openedMenuIds"
          :collapse="sidebarCollapsed"
          :unique-opened="false"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <template v-for="menu in sidebarMenus" :key="menu.id">
            <menu-item :menu="menu" />
          </template>
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigation } from '@/composables/useNavigation'
import { useNavigationStore } from '@/stores/navigation'
import MenuItem from './MenuItem.vue'

const router = useRouter()
const navigationStore = useNavigationStore()

const { sidebarMenus, activeMenuIds, sidebarCollapsed, toggleSidebar } = useNavigation()

// 是否有侧边栏菜单
const hasSidebarMenus = computed(() => {
  return sidebarMenus.value.length > 0
})

// 当前激活的菜单ID（最后一个，即当前菜单）
const activeMenuId = computed(() => {
  const ids = activeMenuIds.value
  return ids.length > 0 ? `${ids[ids.length - 1]}` : ''
})

// 需要展开的菜单ID列表（除了最后一个）
const openedMenuIds = computed(() => {
  const ids = activeMenuIds.value
  return ids.length > 1 ? [`${ids.slice(0, -1)}`] : []
})

// 处理菜单选择
const handleMenuSelect = (menuId: number) => {
  // 通过菜单ID查找菜单项，然后跳转到对应的路由
  const menu = navigationStore.menuMap.get(menuId)
  if (!menu) return
  const path = navigationStore.resolveMenuPath(menu) || menu.path
  if (path) router.push(path)
}
</script>

<style scoped lang="scss">
.sidebar {
  width: $sidebar-width;
  position: relative;
  flex-shrink: 0;
  background-color: var(--bgc-menu);
  transition: all var(--transition-duration);
  &.collapsed {
    width: 0;
    transform: translateX(-100%);
  }
}
.menu-wraper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0 $spacing-20;
}
.collapse-box {
  width: 26px;
  height: 60px;
  position: absolute;
  right: -20px;
  top: 50%;
  overflow: hidden;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
}
.collapse-btn {
  width: 16px;
  height: 100%;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-text-regular);
  background-color: var(--bgc-menu);
  border-radius: 0 var(--radius-m) var(--radius-m) 0;
  transition: all var(--transition-duration);

  &:hover {
    box-shadow: var(--shadow-light);
    .collapsed-icon {
      color: var(--color-white-70);
    }
  }

  .collapsed-icon {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);

    &.collapsed-expand {
      transform: rotate(-90deg);
    }
    &.collapsed-fold {
      transform: rotate(90deg);
    }
  }
}

.sidebar-menu {
  border-right: none;
  height: 100%;
  width: 100% !important;
  padding: $spacing-24 0;
  overflow: hidden;
  background-color: var(--color-bg-base);

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    border-radius: $radius-m;
    margin-top: $spacing-4;
  }
  :deep(.el-menu-item.is-active) {
    background-color: var(--menu-bg-active);
  }
}
</style>
