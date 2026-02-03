<template>
  <div class="viewer-select">
    <zk-select
      v-model="internalValue"
      v-bind="$attrs"
      :options="options"
      :clearable="props.clearable"
      :placeholder="t('alarm.alarmStatus')"
      @change="onChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { getAlertState } from '@/api/alert'
import { useI18n } from 'vue-i18n'

import ZkSelect from '@/components/common/ZkSelect.vue'
const { t } = useI18n()
// 定义 props
interface Props {
  modelValue?: number | null | undefined
  clearable?: boolean
}
const props = defineProps<Props>()

// 定义 emits
interface Emits {
  (e: 'update:modelValue', value: number | null | undefined): void
  (e: 'change', value: number | null | undefined): void
}
const emit = defineEmits<Emits>()

// 内部值
const internalValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value || null || undefined)
  }
})

// 选项
const viewerOptions = ref<{ label: string; value: string }[]>([])
const options = computed(() => {
  return viewerOptions.value.map(item => ({
    ...item,
    label: t(`alarm.alertStatus_${item.value}`)
  }))
})

// 接口数据
async function fetchUserList() {
  try {
    const res = await getAlertState()
    viewerOptions.value = res.map(item => ({
      ...item,
      label: item.name,
      value: item.code + ''
    }))
  } catch (error) {}
}

// 回调事件
function onChange(value: number) {
  emit('change', value)
}

onMounted(() => {
  fetchUserList()
})
</script>

<style lang="scss" scoped></style>
