<template>
  <div class="main-layout">
    <TopNav />
    <div class="layout-content">
      <Sidebar />
      <div class="main-content" :class="{ 'full-width': !hasSidebar }">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopNav from './TopNav.vue'
import Sidebar from './Sidebar.vue'
import { useMenuStore } from '@/stores/menu'

const menuStore = useMenuStore()

// 是否有侧边栏
const hasSidebar = computed(() => {
  return menuStore.getActiveMenuChildren().length > 0
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
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: var(--color-bg-page);
  transition: all 0.3s;

  &.full-width {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
}
</style>
