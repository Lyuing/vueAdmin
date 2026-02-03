<template>
  <div class="breadcrumb-container">
    <!-- 返回按钮 -->
    <el-button
      v-if="props.showBack"
      type="text"
      :icon="ArrowLeft"
      class="back-button"
      @click="handleBackClick"
    />

    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="app-breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in computedBreadcrumbs"
        :key="index"
        :to="item.isDirectory || index === computedBreadcrumbs.length - 1 ? '' : item.path"
      >
        <span :class="['breadcrumb-cell', item.isDirectory ? 'non-allowed' : '']">
          <el-icon v-if="item.icon" :class="['breadcrumb-icon']">
            <component :is="item.icon" />
          </el-icon>
          <span class="breadcrumb-content truncate">{{ t(`nav.${item.permissionCode}`) }}</span>
        </span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useNavigation } from '@/composables/useNavigation'
import type { BreadcrumbItem, MenuItem } from '@/types/navigation'

import { t } from '@/locales'

/**
 * 面包屑组件 Props 接口
 */
interface BreadcrumbProps {
  showBack?: boolean // 控制返回按钮显示，默认为 true
  handleBack?: () => void // 返回按钮点击事件处理函数
  /** 自定义面包屑数据处理函数（可选） */
  setBreadcrumbs?: (
    originalBreadcrumbs: BreadcrumbItem[],
    menuItems: MenuItem[]
  ) => BreadcrumbItem[]
}
// 定义 props，设置默认值
const props = withDefaults(defineProps<BreadcrumbProps>(), {
  showBack: false,
  handleBack: undefined,
  setBreadcrumbs: undefined
})

/**
 * 面包屑组件 Emits 接口
 */
interface BreadcrumbEmits {
  (e: 'on-back'): void
}
const emit = defineEmits<BreadcrumbEmits>()

const router = useRouter()
const { breadcrumbs } = useNavigation()

/**
 * 计算面包屑数据
 */
const computedBreadcrumbs = computed<BreadcrumbItem[]>(() => {
  // 如果有自定义处理函数，使用处理函数
  if (props.setBreadcrumbs) {
    try {
      return props.setBreadcrumbs(breadcrumbs.value, [])
    } catch (error) {
      return breadcrumbs.value
    }
  }
  return breadcrumbs.value
})

/**
 * 处理返回按钮点击事件
 * 如果传入了自定义处理函数则使用自定义函数，否则使用默认的返回逻辑
 */
function handleBackClick() {
  if (props.handleBack) {
    props.handleBack()
  } else {
    router.back()
  }
  emit('on-back')
}
</script>

<style scoped lang="scss">
.breadcrumb-container {
  display: flex;
  align-items: center;
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
}

.back-button {
  margin-right: $spacing-12;
  color: var(--text-color-base);
  padding: 4px 2px;
  background-color: var(--bgc-button-grey);
  height: $button-height-xs;

  &:hover {
    background-color: var(--bgc-button-grey);
  }
}

.app-breadcrumb {
  display: inline-block;
  .breadcrumb-icon {
    margin-right: $spacing-4;
    vertical-align: middle;
  }

  .breadcrumb-cell {
    display: flex;
    align-items: center;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-regular);
    color: var(--text-color-support);
    &:not(.non-allowed):hover {
      cursor: pointer;
      color: var(--el-color-primary);
    }
  }
  // 改为最后一段面包屑主色
  .el-breadcrumb__item:last-child .breadcrumb-cell {
    color: var(--text-color-base);
    cursor: auto;
    &:hover {
      color: var(--text-color-base);
    }
  }
  .breadcrumb-content {
    max-width: 240px;
  }
  // :deep(.el-breadcrumb__inner.is-link .breadcrumb-cell) {
  //   color: var(--text-color-base);
  //   cursor: auto;
  //   &:hover {
  //     color: var(--text-color-base);
  //   }
  // }
}
</style>
