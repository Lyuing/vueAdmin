<template>
  <el-select
    ref="selectRef"
    v-bind="$attrs"
    :placeholder="placeholder"
    :suffix-icon="ZkSelectIcon"
    :class="['zk-select', $attrs.class]"
  >
    <slot />
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs, defineComponent, h } from 'vue'
import type { ElSelect } from 'element-plus'
import { t } from '@/locales'

defineOptions({
  name: 'ZkSelect',
  inheritAttrs: false
})

// 定义自定义图标组件
const ZkSelectIcon = defineComponent({
  name: 'ZkSelectIcon',
  render() {
    return h('i', {
      class: 'zk-monitor zk-monitor-icon-zhankai'
    })
  }
})

// 获取 attrs
const attrs = useAttrs()

// 计算 placeholder，如果没有传入则使用默认值
const placeholder = computed(() => {
  return (attrs.placeholder as string) || t('common.pleaseSelect')
})

// 获取 el-select 实例引用，用于方法透传
const selectRef = ref<InstanceType<typeof ElSelect>>()

// 暴露 el-select 的方法
defineExpose({
  // 获取原始 el-select 实例
  getSelectInstance: () => selectRef.value,
  // 透传常用方法
  focus: () => selectRef.value?.focus(),
  blur: () => selectRef.value?.blur()
})
</script>

<style scoped lang="scss">
.zk-select {
  width: var(--select-width);
  :deep(.el-select__suffix) {
    [class*='zk-monitor'] {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
    }
  }
}
// 默认尺寸选择器 处理高度
.zk-select:not(.el-select--large, .el-select--small) {
  :deep(.el-select__wrapper) {
    min-height: var(--select-height);
  }
}
</style>
