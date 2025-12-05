<template>
  <div class="main-layout">
    <TopNav />
    <div class="layout-content">
      <Sidebar />
      <div class="main-content" :class="{ 'full-width': !hasSidebar }">
        <Breadcrumb class="breadcrumb-container" />
        <div class="content-wrapper">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import TopNav from './TopNav.vue'
import Sidebar from './Sidebar.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { useNavigation } from '@/composables/useNavigation'

const { sidebarMenus, initMenus } = useNavigation()

/**
 * 判断是否显示侧边栏
 * 当有侧边栏菜单时，显示侧边栏
 */
const hasSidebar = computed(() => {
  return sidebarMenus.value.length > 0
})

/**
 * 组件挂载时初始化菜单
 */
onMounted(async () => {
  await initMenus()
})
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 1200px;
  overflow: hidden;
}

.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-page);
  transition: all 0.3s;

  &.full-width {
    width: 100%;
  }
}

// .breadcrumb-container {
//   padding: 4px 20px;
//   margin: 8px 0;
// }

.content-wrapper {
  flex: 1;
  padding: 8px 20px 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
}
</style>
