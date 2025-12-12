<template>
  <div class="layout">
    <TopNav />
    <div class="layout-content">
      <Sidebar />
      <div class="main-content" :class="{ 'full-width': !hasSidebar }">
        <div class="content-wrapper">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopNav from './TopNav.vue'
import Sidebar from './Sidebar.vue'
import { useNavigation } from '@/composables/useNavigation'

const { sidebarMenus } = useNavigation()

const hasSidebar = computed(() => {
  return sidebarMenus.value.length > 0
})
</script>

<style scoped lang="scss">
.layout {
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
