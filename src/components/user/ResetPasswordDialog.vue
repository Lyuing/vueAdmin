<template>
  <el-dialog
    :model-value="visible"
    :title="t('login.modifyPassword')"
    width="500px"
    align-center
    :close-on-click-modal="false"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item :label="t('login.password')" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          :placeholder="t('login.pleasePassword')"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button v-loading="rsaLoading" type="primary" @click="handleSubmit">{{
        t('common.confirm')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { changePassword } from '@/api/user'
import type { LoginResponse, User } from '@/types/user'

import { useRsa } from '@/composables/useRsa'

const { t } = useI18n()
// 使用 useRsa hook
const { isLoading: rsaLoading, error: rsaError, initializeRsa, encryptPassword } = useRsa()

interface Props {
  visible: boolean
  userData?: User | LoginResponse
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = ref<Partial<User>>({
  password: ''
})

// 表单验证规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    password: [
      { required: true, message: t('login.pleasePassword'), trigger: 'blur' },
      { min: 6, max: 20, message: t('validation.passwordLength'), trigger: 'blur' }
    ]
  }
  return baseRules
})

// 监听对话框打开，初始化表单数据
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      formData.value = {
        password: ''
      }
      // 清除验证
      setTimeout(() => {
        formRef.value?.clearValidate()
      }, 0)
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
  emit('update:visible', false)
}

// 提交表单
async function handleSubmit() {
  console.log('提交表单数据:', formData.value)
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return
    // 编辑模式下，如果密码为空，则不传递密码字段
    const currentPassword = formData.value.password
    if (!currentPassword) return
    const { encryptedData, clientId } = (await handleEncryption(currentPassword!)) || {}
    fetchResetPassword(encryptedData || '', clientId || '')
  })
}
// 密码加密
async function handleEncryption(password: string): Promise<{
  encryptedData: string
  clientId: string
} | null> {
  const success = await initializeRsa()
  if (!success) {
    const errorMsg = rsaError.value || t('login.getRsaKeyFailed')
    ElMessage.error(errorMsg)
    console.error('RSA 初始化失败:', rsaError.value)
    return null
  }

  const encryptedResult = await encryptPassword(password)
  if (!encryptedResult) {
    const errorMsg = rsaError.value || t('login.encryptFailed')
    ElMessage.error(errorMsg)
    console.error('密码加密失败:', rsaError.value)
    return null
  }

  return encryptedResult || null
}

// 调用修改密码接口
const userId = computed(() => {
  if (!props.userData) return null
  if ('id' in props.userData) {
    return props.userData.id
  } else {
    return props.userData.userId
  }
})
async function fetchResetPassword(password: string, clientId: string) {
  if (!userId.value) return console.error('用户ID不存在')
  try {
    await changePassword(userId.value, password, clientId)
    emit('update:visible', false)
    emit('success')
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(t('login.modifyPasswordFailed'))
  }
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
</style>
