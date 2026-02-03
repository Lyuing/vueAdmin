<template>
  <div class="viewer-select">
    <zk-select
      v-model="internalValue"
      v-bind="$attrs"
      :options="options"
      :placeholder="t('basic.customType')"
      @change="onChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ZkSelect from '@/components/common/ZkSelect.vue'

const { t } = useI18n()

// 定义 props
interface Props {
  modelValue?: number | null
  showAll?: boolean // 是否显示"全部客户"选项，默认为 true
}
const props = withDefaults(defineProps<Props>(), {
  showAll: false,
  modelValue: null
})

// 定义 emits
interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', value: number): void
}
const emit = defineEmits<Emits>()

// 内部值
const internalValue = computed({
  get() {
    return props.showAll ? (props.modelValue ?? 0) : props.modelValue
  },
  set(value) {
    emit('update:modelValue', value || null)
  }
})

// 用户选项
const options = computed(() => {
  const baseOptions = [
    { label: t('basic.regularCustomer'), value: 1 },
    { label: t('basic.kaCustomer'), value: 2 }
    // { label: '其他', value: 3 },
  ]

  // 根据配置决定是否添加"全部客户"选项
  if (props.showAll) {
    return [{ label: t('basic.allCustomers'), value: 0 }, ...baseOptions]
  }

  return baseOptions
})

// 回调事件
function onChange(value: number) {
  emit('change', value)
}
</script>

<style lang="scss" scoped></style>
