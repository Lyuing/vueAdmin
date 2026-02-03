<template>
  <div class="user-profile">
    <!-- 公共组件使用 PascalCase 命名 -->
    <div>
      <h2 class="user-profile__title">{{ title }} - {{ nickname }}</h2>
      <p>{{ pagination.totalElements }}</p>
      <el-input v-model="searchKeyword"></el-input>
    </div>

    <!-- 模态框组件 -->
    <UserEditModal v-if="showEditModal" @close="handleCloseModal" @success="handleEditSuccess" />
  </div>
</template>

<script setup lang="ts">
/**
 * 脚本部分规范：
 * 1. 导入顺序：Vue/Pinia -> 库 -> 类型 -> 组件 -> 工具函数
 * 2. 使用 defineProps 和 defineEmits 定义组件接口
 * 3. 使用 defineExpose 暴露给父组件的方法
 */

/**
 * 方法规范：
 * 1. 函数名使用 camelCase
 * 2. 单一职责，只处理一个功能
 * 3. 异步函数以 async/await 处理
 */

import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

// 类型定义
import type { UserInfo } from '@/types/user'

// 组合式函数
import { usePagination } from '@/composables/usePagination.ts'

// Store
import { useAuthStore } from '@/stores/auth'

// 组件
import UserEditModal from '@/components/user/user-edit-modal.vue'

// API
import { getAllUsers } from '@/api/user'

// 设置组件名称，与路由名称保持一致，用于 KeepAlive 缓存
defineOptions({
  name: 'TemplateDemo'
})

// Props 定义
interface Props {
  userIds?: number[]
  showTitle?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  userIds: () => [],
  showTitle: true
})

// Emits 定义
interface Emits {
  (e: 'page-load', ids: number[]): void
  (e: 'submit', data: Partial<UserInfo>): void
}
const emit = defineEmits<Emits>()

// 暴露给父组件的方法
defineExpose({
  reload: fetchUserData
})

// Store 使用
const userStore = useAuthStore()
const { userInfo } = storeToRefs(userStore)

/**
 * 生命周期钩子
 */
onMounted(async () => {
  // 初始化数据
  await fetchUserData()
  emitPageLoad()
  // ...
})

/**
 * 弹框相关
 */
const showEditModal = ref(false)
const handleCloseModal = () => {
  showEditModal.value = false
}
const handleEditSuccess = () => {
  // 更新 store
  userStore.checkAuth()
  handleCloseModal()

  emit('submit', {})
}

/**
 * 搜索框相关
 */
const searchKeyword = ref('')
// 监听搜索关键词变化
watch(
  searchKeyword,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      // ...
    }
  },
  { deep: true }
)

/** 分页相关 */
const currentPage = ref(1)
const pageSize = ref(10)

const { pagination } = usePagination({
  pageSize: pageSize.value,
  currentPage: currentPage.value
})

/**
 * 计算属性规范：
 * 1. 单一职责，只计算一个值
 * 2. 命名清晰，反映计算结果
 */
const title = computed(() => {
  return props.showTitle ? `用户列表` : ''
})
const nickname = computed(() => {
  return userInfo.value?.username || ''
})

/**
 * 功能方法
 */
function fetchUserData() {
  // 获取接口数据
  return getAllUsers()
}
function emitPageLoad() {
  // 触发父组件事件，传递 userIds 数组（保证类型为 number[]）
  const ids: number[] = props.userIds || []
  emit('page-load', ids)
}
</script>

<style scoped lang="scss">
/**
 * 样式规范：
 * 1. 优先使用 CSS 变量
 */

.user-profile {
  // theme 变量
  padding: var(--space-lg, 24px);
  margin: var(--space-md, 16px);

  // variables 变量
  box-shadow: $shadow-base;

  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

// 样式穿透
:deep(.el-input) {
  width: 100%;
  max-width: 400px;
}
</style>
