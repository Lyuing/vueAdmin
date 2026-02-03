<template>
  <div class="tag-box">
    <div class="merchant-tag" :class="tagInfo?.class">
      {{ tagInfo?.label }}
    </div>
    <template v-if="merchantName">
      <el-popover placement="top" trigger="hover" effect="dark" :disabled="!isTextEllipsisActive">
        <p class="popover-content">{{ merchantName }}</p>
        <template #reference>
          <div ref="merchantLabelRef" class="merchant-label truncate">
            <span class="merchant-label-name">{{ merchantName }}</span>
          </div>
        </template>
      </el-popover>
    </template>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElPopover } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
interface Props {
  type?: number // 商户类型：1-KA，2-普通商户
  merchantId?: number // 商户ID
  merchantName?: string // 商户名称
}
const props = defineProps<Props>()

const typeOption = computed<Record<number, { label: string; class: string }>>(() => ({
  1: { label: 'KA', class: 'ka-tag' },
  2: { label: t('client.merchantType_normal'), class: 'common-tag' }
}))

const tagInfo = computed(() => {
  const type = props.type || 2
  return typeOption.value[type]
})

/**
 * 检查文本是否溢出（显示省略号）
 */
const merchantLabelRef = ref<HTMLElement | null>(null)
const isTextEllipsisActive = ref(false)

const checkEllipsis = () => {
  if (merchantLabelRef.value) {
    // offsetWidth 是元素渲染后的实际宽度
    // scrollWidth 是元素完整内容的宽度
    // 如果 scrollWidth > offsetWidth，则表示存在省略号
    isTextEllipsisActive.value =
      merchantLabelRef.value.scrollWidth > merchantLabelRef.value.offsetWidth
  }
}

onMounted(() => {
  if (props.merchantName) {
    nextTick(() => {
      checkEllipsis()
    })
  }
})

watch(
  () => props.merchantName,
  () => {
    nextTick(() => {
      checkEllipsis()
    })
  },
  { immediate: true }
)
</script>
<style scoped lang="scss">
.tag-box {
  display: inline-flex;
  max-width: 120px;
  height: 20px;
  line-height: 18px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  user-select: none;
  overflow: hidden;
  border-radius: var(--radius-s);
  // &:not(:first-child) {
  //   margin-left: $spacing-8;
  // }
  // &:not(:last-child) {
  //   margin-right: $spacing-8;
  // }
}
.merchant-tag {
  min-width: 36px;
  height: 100%;
  line-height: 20px;
  text-align: center;
  padding: 0 $spacing-4;
  border-radius: var(--radius-s) 0 0 var(--radius-s);
}
.merchant-label {
  flex: 1;
  overflow: hidden;
  height: 100%;
  padding: 0 $spacing-4;
  color: var(--text-color-base);
  font-weight: var(--font-weight-bold);
  border: 1px solid var(--border-color);
  border-radius: 0 var(--radius-s) var(--radius-s) 0;
  background: var(--color-white);
  cursor: pointer;
}
.popover-content {
  font-size: var(--font-size-xs);
}

.ka-tag {
  background-color: var(--bgc-black);
  color: var(--color-gold);
}
.common-tag {
  background-color: var(--color-blue);
  color: var(--color-white);
}
</style>
