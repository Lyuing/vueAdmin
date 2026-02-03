<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? t('role.add') : t('role.edit')"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item :label="t('role.name')" prop="name">
        <el-input
          v-model.trim="formData.name"
          :placeholder="t('role.searchPlaceholder')"
          :maxlength="20"
        />
      </el-form-item>

      <!-- <el-form-item :label="t('role.code')" prop="code">
        <el-input
          v-model.trim="formData.code"
          :placeholder="t('role.codePlaceholder')"
          :maxlength="20"
          :disabled="mode === 'edit'"
        />
      </el-form-item> -->

      <el-form-item :label="t('role.description')" prop="description">
        <el-input
          v-model.trim="formData.description"
          type="textarea"
          :rows="3"
          :maxlength="200"
          :placeholder="t('role.descriptionPlaceholder')"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import type { Role } from '@/types/role'

const { t } = useI18n()

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  roleData?: Role | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: Partial<Role>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = ref<Partial<Role>>({
  name: '',
  code: '',
  description: '',
  status: 'ACTIVE'
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: t('validation.roleNameRequired'), trigger: 'blur' },
    { min: 2, max: 20, message: t('validation.roleNameLength'), trigger: 'blur' }
  ],
  code: [
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('validation.roleCodeFormat'), trigger: 'blur' },
    { max: 20, message: t('validation.roleCodeMaxLength'), trigger: 'blur' }
  ],
  description: [{ max: 200, message: t('validation.roleDescriptionMaxLength'), trigger: 'blur' }]
}

// 监听对话框打开，初始化表单数据
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      if (props.mode === 'edit' && props.roleData) {
        // 编辑模式：填充数据
        formData.value = {
          id: props.roleData.id,
          name: props.roleData.name,
          code: props.roleData.code,
          description: props.roleData.description || '',
          status: props.roleData.status
        }
      } else {
        // 创建模式：重置表单
        formData.value = {
          name: '',
          code: '',
          description: '',
          status: 'ACTIVE'
        }
      }
      // 清除验证
      formRef.value?.clearValidate()
    }
  }
)

// 更新显示状态
function handleUpdateVisible(value: boolean) {
  emit('update:visible', value)
}

// 关闭对话框
function handleClose() {
  formRef.value?.resetFields()
}

// 取消
function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(valid => {
    if (valid) {
      emit('save', formData.value)
    }
  })
}
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.el-form) {
  padding: 10px 0;
}

:deep(.el-form-item) {
  margin-bottom: 22px;

  .el-form-item__label {
    font-weight: 500;
  }
}

// 响应式布局
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;
  }

  :deep(.el-form-item__label) {
    width: 80px !important;
  }
}
</style>
