<template>
  <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.id + ''">
    <template #title>
      <el-icon v-if="menu.icon">
        <component :is="getIcon(menu.icon)" />
      </el-icon>
      <el-tooltip :content="t(`nav.${menu.permissionCode}`)" :show-after="800" placement="top">
        <span class="truncate">{{ t(`nav.${menu.permissionCode}`) }}</span>
      </el-tooltip>
    </template>
    <menu-item v-for="child in menu.children" :key="child.id" :menu="child" />
  </el-sub-menu>
  <el-menu-item v-else :index="menu.id + ''" @click="handleMenuClick">
    <el-icon v-if="menu.icon">
      <component :is="getIcon(menu.icon)" />
    </el-icon>
    <el-tooltip :content="t(`nav.${menu.permissionCode}`)" :show-after="800" placement="top">
      <span class="truncate">{{ t(`nav.${menu.permissionCode}`) }}</span>
    </el-tooltip>
  </el-menu-item>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getIconComponent } from '@/utils/icon'
import { useNavigationStore } from '@/stores/navigation'
import type { MenuItem } from '@/types/navigation'

import { t } from '@/locales'

const props = defineProps<{
  menu: MenuItem
}>()

const router = useRouter()

const navigationStore = useNavigationStore()

const handleMenuClick = () => {
  const path = navigationStore.resolveMenuPath(props.menu) || props.menu.path
  if (path) router.push(path)
}

const getIcon = (iconName?: string) => {
  return getIconComponent(iconName)
}
</script>
