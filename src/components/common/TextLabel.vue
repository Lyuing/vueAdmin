<template>
  <el-popover placement="top" trigger="hover" effect="dark" :disabled="!isTextEllipsisActive">
    <p class="popover-content">{{ label }}</p>
    <template #reference>
      <div ref="labelRef" class="truncate">
        <span class="label-content">{{ label }}</span>
      </div>
    </template>
  </el-popover>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { ElPopover } from 'element-plus'

interface Props {
  label?: string // 标题
}
const props = defineProps<Props>()

/**
 * 检查文本是否溢出（显示省略号）
 */
const labelRef = ref<HTMLElement | null>(null)
const isTextEllipsisActive = ref(false)

const checkEllipsis = () => {
  if (labelRef.value) {
    // offsetWidth 是元素渲染后的实际宽度
    // scrollWidth 是元素完整内容的宽度
    // 如果 scrollWidth > offsetWidth，则表示存在省略号
    isTextEllipsisActive.value = labelRef.value.scrollWidth > labelRef.value.offsetWidth
  }
}

onMounted(() => {
  if (props.label) {
    nextTick(() => {
      checkEllipsis()
    })
  }
})

watch(
  () => props.label,
  () => {
    nextTick(() => {
      checkEllipsis()
    })
  },
  { immediate: true }
)
</script>
<style scoped lang="scss">
.popover-content {
  font-size: var(--font-size-xs);
}
</style>
