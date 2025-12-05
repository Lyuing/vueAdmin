<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? t('user.add') : t('user.edit')"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item :label="t('user.form.username')" prop="username">
        <el-input
          v-model="formData.username"
          :placeholder="t('user.validation.usernameRequired')"
          :disabled="mode === 'edit'"
        />
      </el-form-item>

      <el-form-item :label="t('user.form.password')" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          :placeholder="mode === 'create' ? t('user.validation.passwordRequired') : t('user.form.passwordOptional')"
          show-password
        />
      </el-form-item>

      <el-form-item :label="t('user.form.roles')" prop="roles">
        <el-select
          v-model="formData.roles"
          multiple
          :placeholder="t('user.validation.rolesRequired')"
          style="width: 100%"
        >
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import type { User } from '@/api/user'
import type { Role } from '@/api/role'

const { t } = useI18n()

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  userData?: User | null
  roleList: Role[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: Partial<User>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = ref<Partial<User>>({
  username: '',
  password: '',
  roles: []
})

// 表单验证规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    username: [
      { required: true, message: t('user.validation.usernameRequired'), trigger: 'blur' },
      { min: 3, max: 20, message: t('user.validation.usernameLength'), trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: t('user.validation.usernameFormat'), trigger: 'blur' }
    ],
    roles: [
      { required: true, message: t('user.validation.rolesRequired'), trigger: 'change', type: 'array', min: 1 }
    ]
  }

  // 创建模式：密码必填
  if (props.mode === 'create') {
    baseRules.password = [
      { required: true, message: t('user.validation.passwordRequired'), trigger: 'blur' },
      { min: 6, max: 20, message: t('user.validation.passwordLength'), trigger: 'blur' }
    ]
  } else {
    // 编辑模式：密码可选
    baseRules.password = [
      { min: 6, max: 20, message: t('user.validation.passwordLength'), trigger: 'blur' }
    ]
  }

  return baseRules
})

// 监听对话框打开，初始化表单数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.mode === 'edit' && props.userData) {
      // 编辑模式：填充数据
      formData.value = {
        id: props.userData.id,
        username: props.userData.username,
        password: '',
        roles: props.userData.roles || []
      }
    } else {
      // 创建模式：重置表单
      formData.value = {
        username: '',
        password: '',
        roles: []
      }
    }
    // 清除验证
    formRef.value?.clearValidate()
  }
})

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

  await formRef.value.validate((valid) => {
    if (valid) {
      // 编辑模式下，如果密码为空，则不传递密码字段
      const submitData = { ...formData.value }
      if (props.mode === 'edit' && !submitData.password) {
        delete submitData.password
      }
      emit('save', submitData)
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

:deep(.el-select) {
  width: 100%;
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
