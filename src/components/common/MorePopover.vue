<template>
  <el-popover
    v-bind="$attrs"
    trigger="hover"
    :width="width"
    :placement="placement"
    popper-class="more-popover-popper"
  >
    <template #reference>
      <el-button class="more-text-btn" size="small" type="primary" link>
        {{ text || t('common.more') }}
        <i class="ico-arrow zk-monitor zk-monitor-icon-qiehuan"></i>
      </el-button>
    </template>
    <div class="more-popover-content">
      <slot />
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface Props {
  /**
   * 按钮显示的文字，如果未提供则使用国际化默认值
   */
  text?: string
  /**
   * 气泡弹窗的宽度
   * @default 150
   */
  width?: number | string
  /**
   * 气泡弹窗的位置
   * @default 'bottom-end'
   */
  placement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
}

const props = withDefaults(defineProps<Props>(), {
  width: 100,
  text: '',
  placement: 'bottom-end'
})
</script>

<style lang="scss" scoped>
.more-text-btn {
  cursor: pointer;
  user-select: none;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    display: inline-block;
    left: -8px;
    width: 0;
    top: 2px;
    bottom: 2px;
    vertical-align: middle;
    border-left: 1px solid var(--border-color);
  }
}
.ico-arrow {
  font-size: var(--font-size-base);
}
.more-popover-content {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-8;
  :deep(.el-button) {
    margin-left: 0;
  }
}
</style>
