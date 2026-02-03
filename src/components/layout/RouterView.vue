<template>
  <router-view v-slot="{ Component, route }">
    <div class="router-view-container">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews" :exclude="excludedViews">
          <component :is="Component" v-if="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </div>
  </router-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNavigationStore } from '@/stores/navigation'

const navigationStore = useNavigationStore()

// 计算需要缓存的视图组件名称列表
const cachedViews = computed(() => {
  // console.warn('缓存的组件', navigationStore.cachedViews)
  return navigationStore.cachedViews
})

// 计算需要排除缓存的视图组件名称列表
const excludedViews = computed(() => {
  return navigationStore.excludedViews
})
</script>

<style scoped>
.router-view-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.1s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
