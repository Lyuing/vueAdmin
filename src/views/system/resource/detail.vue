<template>
  <Breadcrumb class="breadcrumb-container" />
  <div class="resource-detail-page">
    <h2>{{ t('resource.detail') }}</h2>

    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ resource?.name }}</span>
          <div class="header-actions">
            <el-button @click="handleBack">
              {{ t('resource.backToList') }}
            </el-button>
            <el-button type="primary" @click="handleEdit">
              {{ t('common.edit') }}
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="resource" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('resource.name')">
            {{ resource.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('resource.type')">
            {{ resource.type }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('resource.status')">
            <el-tag :type="resource.status === 'active' ? 'success' : 'info'">
              {{ resource.status === 'active' ? t('common.active') : t('common.disabled') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('resource.createdBy')">
            {{ resource.createdBy || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('common.createdAt')" :span="2">
            {{ formatDate(resource.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('common.updatedAt')" :span="2">
            {{ formatDate(resource.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('resource.description')" :span="2">
            {{ resource.description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="resource.metadata && Object.keys(resource.metadata).length > 0"
            :label="t('resource.metadata')"
            :span="2"
          >
            <pre>{{ JSON.stringify(resource.metadata, null, 2) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-empty v-else-if="!loading" description="资源不存在" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getResourceById } from '@/api/resource'
import type { Resource } from '@/types/resource'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// 状态管理
const resource = ref<Resource | null>(null)
const loading = ref(false)

// 加载资源详情
async function loadResourceDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('资源ID不存在')
    router.push('/system/resource')
    return
  }

  loading.value = true
  try {
    const response = await getResourceById(id)
    resource.value = response.data
  } catch (error) {
    console.error('加载资源详情失败:', error)
    ElMessage.error(t('resource.message.loadDetailFailed'))
    // 如果是404错误，可以考虑跳转回列表页
    setTimeout(() => {
      router.push('/system/resource')
    }, 2000)
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
    minute: '2-digit',
    second: '2-digit'
  })
}

// 返回列表
function handleBack() {
  router.push('/system/resource')
}

// 编辑资源
function handleEdit() {
  const id = route.params.id as string
  router.push(`/system/resource/${id}/edit`)
}

// 页面加载时获取资源详情
onMounted(() => {
  loadResourceDetail()
})
</script>

<style scoped lang="scss">
.resource-detail-page {
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

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .detail-content {
    pre {
      margin: 0;
      padding: 10px;
      background-color: var(--el-fill-color-light);
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.5;
    }
  }

  // 响应式布局
  @media (max-width: 768px) {
    padding: 10px;

    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }

    .card-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }

    :deep(.el-descriptions) {
      .el-descriptions__body {
        .el-descriptions__table {
          .el-descriptions__cell {
            padding: 8px;
          }
        }
      }
    }
  }
}
</style>
