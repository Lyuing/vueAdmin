<template>
  <div class="resource-page">
    <h2>{{ t('resource.management') }}</h2>
    
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ t('resource.list') }}</span>
        </div>
      </template>
      
      <el-table :data="resourceList" style="width: 100%">
        <el-table-column prop="name" :label="t('resource.name')" width="200" />
        <el-table-column prop="type" :label="t('resource.type')" width="150" />
        <el-table-column prop="status" :label="t('resource.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? t('common.active') : t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('common.createdAt')" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewDetail(row)">
              {{ t('resource.viewDetail') }}
            </el-button>
            <el-button size="small" @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAllResources } from '@/api/resource'
import type { Resource } from '@/types/resource'

const { t } = useI18n()
const router = useRouter()

// 状态管理
const resourceList = ref<Resource[]>([])
const loading = ref(false)

// 加载资源列表
async function loadResourceList() {
  loading.value = true
  try {
    const response = await getAllResources()
    resourceList.value = response.data
  } catch (error) {
    console.error('加载资源列表失败:', error)
    ElMessage.error(t('resource.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 查看详情
function handleViewDetail(resource: Resource) {
  router.push(`/system/resource/${resource.id}`)
}

// 编辑资源
function handleEdit(resource: Resource) {
  router.push(`/system/resource/${resource.id}/edit`)
}

// 页面加载时获取资源列表
onMounted(() => {
  loadResourceList()
})
</script>

<style scoped lang="scss">
.resource-page {
  padding: 20px;
  
  h2 {
    margin: 0 0 20px;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.el-card) {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  :deep(.el-table) {
    .el-button + .el-button {
      margin-left: 8px;
    }
  }

  // 响应式布局
  @media (max-width: 768px) {
    padding: 10px;
    
    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }

    :deep(.el-table) {
      font-size: 12px;

      .el-button {
        padding: 5px 10px;
        font-size: 12px;
      }
    }
  }
}
</style>
