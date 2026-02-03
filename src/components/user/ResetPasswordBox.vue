<template>
  <div v-show="visible" class="reset-password-box">
    <div type="link" class="box-top-back" @click="handleBack">
      <el-button type="text" :icon="ArrowLeft" class="back-button" />
      <span class="back-content">{{ t('login.backLogin') }}</span>
    </div>

    <p class="box-title">{{ t('login.modifyPassword') }}</p>

    <el-form ref="formRef" :model="formData" :rules="rules" class="reset-form">
      <el-form-item prop="password" class="form-item">
        <div class="floating-input-wrapper">
          <el-input
            v-model="formData.password"
            type="password"
            show-password
            size="large"
            prefix-icon="Lock"
            class="floating-input"
            :maxlength="30"
            @keyup.enter="handleSubmit"
            @focus="handleInputFocus('password')"
            @blur="handleInputBlur('password')"
          />
          <label
            class="floating-label"
            :class="{ 'floating-label-active': isInputActive.password || formData.password }"
          >
            {{ t('login.pleasePassword') }}
          </label>
        </div>
      </el-form-item>
      <el-form-item prop="passwordRepeat" class="form-item">
        <div class="floating-input-wrapper">
          <el-input
            v-model="formData.passwordRepeat"
            type="password"
            show-password
            size="large"
            prefix-icon="Lock"
            class="floating-input"
            :maxlength="30"
            @keyup.enter="handleSubmit"
            @focus="handleInputFocus('passwordRepeat')"
            @blur="handleInputBlur('passwordRepeat')"
          />
          <label
            class="floating-label"
            :class="{
              'floating-label-active': isInputActive.passwordRepeat || formData.passwordRepeat
            }"
          >
            {{ t('login.pleasePasswordRepeat') }}
          </label>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading || rsaLoading"
          class="submit-button"
          @click="handleSubmit"
        >
          {{ t('common.confirm') }}
        </el-button>
      </el-form-item>
      <!-- RSA 错误提示 -->
      <el-alert
        v-if="rsaError"
        :title="rsaError"
        type="error"
        :closable="false"
        show-icon
        class="rsa-error-alert"
      />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { changePassword } from '@/api/user'
import type { LoginResponse, User } from '@/types/user'

import { ArrowLeft } from '@element-plus/icons-vue'
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
const formData = ref<{ password: string; passwordRepeat: string }>({
  password: '',
  passwordRepeat: ''
})

// 输入框激活状态
const isInputActive = reactive({
  password: false,
  passwordRepeat: false
})
// 处理输入框焦点事件
const handleInputFocus = (field: keyof typeof isInputActive) => {
  isInputActive[field] = true
}
const handleInputBlur = (field: keyof typeof isInputActive) => {
  isInputActive[field] = false
}
// 表单验证规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    password: [
      { required: true, message: t('validation.required'), trigger: 'blur' },
      { min: 6, max: 30, message: t('validation.passwordLength'), trigger: 'blur' }
    ],
    passwordRepeat: [
      { required: true, message: t('validation.required'), trigger: 'blur' },
      { min: 6, max: 30, message: t('validation.passwordLength'), trigger: 'blur' },
      { validator: validatePasswordRepeat, trigger: 'blur' }
    ]
  }
  return baseRules
})
function validatePasswordRepeat(_rule: any, value: string, callback: any) {
  if (value !== formData.value.password) {
    callback(new Error(t('validation.passwordRepeat')))
  } else {
    callback()
  }
}

// 监听对话框打开，初始化表单数据
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      formData.value = {
        password: '',
        passwordRepeat: ''
      }
      // 清除验证
      setTimeout(() => {
        formRef.value?.clearValidate()
      }, 0)
    }
  }
)

// 返回登录界面
function handleBack() {
  formRef.value?.resetFields()
  emit('update:visible', false)
}

// 提交表单
async function handleSubmit() {
  // console.log('提交表单数据:', formData.value)
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return
    // 如果密码为空，则不传递密码字段
    const currentPassword = formData.value.password
    if (!currentPassword) return
    const { encryptedData, clientId } = (await handleEncryption(currentPassword!)) || {}
    if (!encryptedData) return
    fetchChangePassword(encryptedData || '', clientId || '')
  })
}
// 密码加密
async function handleEncryption(password: string): Promise<{
  encryptedData: string
  clientId: string
} | null> {
  const success = await initializeRsa()
  if (!success) {
    // const errorMsg = rsaError.value || t('login.getRsaKeyFailed')
    // ElMessage.error(errorMsg)
    console.error('RSA 初始化失败:', rsaError.value)
    return null
  }

  const encryptedResult = await encryptPassword(password)
  if (!encryptedResult) {
    // const errorMsg = rsaError.value || t('login.encryptFailed')
    // ElMessage.error(errorMsg)
    console.error('密码加密失败:', rsaError.value)
    return null
  }

  return encryptedResult || null
}

// 调用修改密码接口
const loading = ref(false)
const userId = computed(() => {
  if (!props.userData) return null
  if ('id' in props.userData) {
    return props.userData.id
  } else {
    return props.userData.userId
  }
})
async function fetchChangePassword(password: string, clientId: string) {
  if (!userId.value) return console.error('用户ID不存在')
  try {
    loading.value = true
    await changePassword(userId.value, password, clientId)
    emit('update:visible', false)
    emit('success')
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error(error?.data?.message || t('login.modifyPasswordFailed'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.box-top-back {
  margin-bottom: 12px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    color: var(--color-primary);
    .back-button {
      color: var(--color-primary);
      background-color: var(--bgc-tag-primary);
    }
  }
}

.back-button {
  margin-right: $spacing-12;
  color: var(--text-color-base);
  padding: 4px 2px;
  background-color: var(--bgc-button-grey);
  height: $button-height-xs;
}

.box-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
}

.reset-form {
  padding: 12px 0;
  position: relative;
  .rsa-error-alert {
    position: absolute;
    bottom: -22px;
  }
}
.form-item {
  margin-top: 32px;
}
.submit-button {
  margin-top: 32px;
  width: 100%;
  height: 56px;
}

// 浮动标签样式
.floating-input-wrapper {
  position: relative;
  width: 100%; // 确保包装器占满宽度

  .floating-input {
    width: 100%; // 确保输入框占满宽度

    :deep(.el-input__wrapper) {
      padding-top: $spacing-8;
      padding-bottom: $spacing-8;
    }
  }

  .floating-label {
    height: 18px;
    line-height: 18px;
    position: absolute;
    left: 40px; // 与前缀图标对齐
    top: 50%;
    transform: translateY(-50%);
    color: var(--el-text-color-placeholder);
    font-size: var(--font-size-base);
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
    background: var(--color-white);
    padding: 0 $spacing-4;
    white-space: nowrap; // 防止标签文字换行
  }

  .floating-label-active {
    top: 0;
    left: 12px; // 浮动时移到边框位置
    transform: translateY(-50%);
    font-size: var(--font-size-xs);
    color: var(--el-color-primary);
  }

  // 验证码输入框特殊处理
  &.captcha-input {
    flex: 1;
    margin-right: $spacing-16;
  }
}
</style>
