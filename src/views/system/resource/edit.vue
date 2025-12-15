<template>
  <Breadcrumb class="breadcrumb-container" />
  <div class="resource-edit-page">
    <h2>{{ t('resource.edit') }}</h2>

    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ formData.name || t('resource.edit') }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="resource-form"
      >
        <el-form-item :label="t('resource.name')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="t('resource.name')"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="t('resource.type')" prop="type">
          <el-input v-model="formData.type" :placeholder="t('resource.type')" />
        </el-form-item>

        <el-form-item :label="t('resource.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            :placeholder="t('resource.description')"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="t('resource.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">{{ t('common.active') }}</el-radio>
            <el-radio value="inactive">{{ t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">
            {{ t('common.save') }}
          </el-button>
          <el-button @click="handleCancel">
            {{ t('common.cancel') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getResourceById, updateResource } from '@/api/resource'
import type { Resource } from '@/types/resource'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref<FormInstance>()

// 状态管理
const loading = ref(false)
const saving = ref(false)

// 表单数据
const formData = reactive<Partial<Resource>>({
  name: '',
  type: '',
  description: '',
  status: 'active'
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 1, max: 100, message: t('validation.maxLength', { max: 100 }), trigger: 'blur' }
  ],
  type: [{ required: true, message: t('validation.required'), trigger: 'blur' }],
  status: [{ required: true, message: t('validation.required'), trigger: 'change' }]
}

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
    const resource = response.data

    // 填充表单数据
    formData.name = resource.name
    formData.type = resource.type
    formData.description = resource.description
    formData.status = resource.status
  } catch (error) {
    console.error('加载资源详情失败:', error)
    ElMessage.error(t('resource.message.loadDetailFailed'))
    setTimeout(() => {
      router.push('/system/resource')
    }, 2000)
  } finally {
    loading.value = false
  }
}

// 保存资源
async function handleSave() {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    const id = route.params.id as string
    saving.value = true

    // 更新资源
    await updateResource(id, {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      status: formData.status
    })

    ElMessage.success(t('resource.message.updateSuccess'))

    // 跳转到详情页
    router.push(`/system/resource/${id}`)
  } catch (error) {
    if (error !== false) {
      // 排除表单验证失败的情况
      console.error('保存资源失败:', error)
      ElMessage.error(t('resource.message.updateFailed'))
    }
  } finally {
    saving.value = false
  }
}

// 取消编辑
function handleCancel() {
  const id = route.params.id as string
  router.push(`/system/resource/${id}`)
}

// 页面加载时获取资源详情
onMounted(() => {
  loadResourceDetail()
})
</script>

<style scoped lang="scss">
.resource-edit-page {
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
    font-weight: 600;
    font-size: 16px;
  }

  .resource-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px 0;
  }

  // 响应式布局
  @media (max-width: 768px) {
    padding: 10px;

    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }

    .resource-form {
      max-width: 100%;
      padding: 10px 0;

      :deep(.el-form-item__label) {
        width: 100px !important;
      }
    }
  }
}
</style>
