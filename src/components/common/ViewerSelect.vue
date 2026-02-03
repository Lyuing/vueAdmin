<template>
  <div class="viewer-select">
    <zk-select
      v-model="internalValue"
      v-bind="$attrs"
      :options="options"
      placement="bottom-end"
      :placeholder="placeholder"
      popper-style="min-width: 110px; max-width: 240px"
      @change="onChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getRegionUsers } from '@/api/user'

import ZkSelect from '@/components/common/ZkSelect.vue'

// 定义 props
interface Props {
  modelValue?: number | null
  placeholder?: string | null
}
const props = defineProps<Props>()

// 定义 emits
interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', value: number): void
}
const emit = defineEmits<Emits>()

// 内部值
const internalValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value || null)
  }
})

// 用户选项
const viewerOptions = ref<{ label: string; value: number }[]>([])
const options = computed(() => {
  return [
    // { label: '全部', value: 0 },   // 暂时不显示全部
    ...viewerOptions.value
  ]
})

// 用户部门ID
const departmentId = computed<number | null>(() => {
  return useAuthStore().userInfo?.departmentId || null
})

// 接口数据
async function fetchUserList() {
  if (!departmentId.value) return []
  try {
    const res = await getRegionUsers(departmentId.value)
    viewerOptions.value = res.map(item => ({
      ...item,
      label: item.username,
      value: item.id
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
