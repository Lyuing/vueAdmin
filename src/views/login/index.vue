<template>
  <div class="login-page">
    <div class="login-cover"></div>
    <div class="login-container">
      <div class="i18n-block">
        <LanguageSwitcher />
      </div>
      <div v-if="!modifyDialogVisible" class="login-box">
        <h6 class="login-sub-title">{{ t('login.welcome') }}</h6>
        <h1 class="login-title">{{ t('basic.name') }}</h1>
        <el-form ref="formRef" class="login-form" :model="form" :rules="rules">
          <el-form-item prop="username" class="form-item">
            <div class="floating-input-wrapper">
              <el-input
                v-model="form.username"
                size="large"
                prefix-icon="User"
                class="floating-input"
                :maxlength="64"
                @keyup.enter="handleLogin"
                @focus="handleInputFocus('username')"
                @blur="handleInputBlur('username')"
              />
              <label
                class="floating-label"
                :class="{ 'floating-label-active': isInputActive.username || form.username }"
              >
                {{ t('login.pleaseUsername') }}
              </label>
            </div>
          </el-form-item>
          <el-form-item prop="password" class="form-item">
            <div class="floating-input-wrapper">
              <el-input
                v-model="form.password"
                type="password"
                size="large"
                prefix-icon="Lock"
                show-password
                class="floating-input"
                :maxlength="30"
                @keyup.enter="handleLogin"
                @focus="handleInputFocus('password')"
                @blur="handleInputBlur('password')"
              />
              <label
                class="floating-label"
                :class="{ 'floating-label-active': isInputActive.password || form.password }"
              >
                {{ t('login.pleasePassword') }}
              </label>
            </div>
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item prop="captcha" class="form-item">
            <div class="w-full h-full flex items-center">
              <div class="floating-input-wrapper captcha-input">
                <el-input
                  v-model="form.captcha"
                  size="large"
                  prefix-icon="Key"
                  class="floating-input"
                  :maxlength="8"
                  @keyup.enter="handleLogin"
                  @focus="handleInputFocus('captcha')"
                  @blur="handleInputBlur('captcha')"
                />
                <label
                  class="floating-label"
                  :class="{ 'floating-label-active': isInputActive.captcha || form.captcha }"
                >
                  {{ t('login.pleaseCaptcha') }}
                </label>
              </div>
              <Captcha ref="captchaRef" :account="form.username" />
            </div>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="form.rememberMe" class="remember-me">
              {{ t('login.rememberMe') }}
            </el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading || rsaLoading"
              class="login-button"
              @click="handleLogin"
            >
              {{ t('login.submit') }}
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

      <div v-else class="login-box reset-box">
        <ResetPasswordBox
          v-model:visible="modifyDialogVisible"
          :user-data="currentUser"
          @success="onModifyPassword"
        />
      </div>
    </div>

    <!-- 修改密码弹框 -->
    <!-- <ResetPasswordDialog
      v-model:visible="modifyDialogVisible"
      :user-data="currentUser"
      @success="onModifyPassword"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { storage } from '@/utils/storage'
import { addDynamicRoutes, resetRouter } from '@/router'
import { useRsa } from '@/composables/useRsa'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import type { LoginResponse } from '@/types/user'
import Captcha from './Captcha.vue'
// import ResetPasswordDialog from '@/components/user/ResetPasswordDialog.vue'
import ResetPasswordBox from '@/components/user/ResetPasswordBox.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// 使用 useRsa hook
const { isLoading: rsaLoading, error: rsaError, initializeRsa, encryptPassword } = useRsa()

const formRef = ref<FormInstance>()
const captchaRef = ref<InstanceType<typeof Captcha>>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  captcha: '',
  rememberMe: false
})

// 输入框激活状态
const isInputActive = reactive({
  username: false,
  password: false,
  captcha: false
})

// 处理输入框焦点事件
const handleInputFocus = (field: keyof typeof isInputActive) => {
  isInputActive[field] = true
}

const handleInputBlur = (field: keyof typeof isInputActive) => {
  isInputActive[field] = false
}

const rules: FormRules = {
  username: [{ required: true, message: t('validation.required'), trigger: 'blur' }],
  password: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 6, max: 30, message: t('validation.passwordLength'), trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        captchaRef.value?.validateCaptcha(rule, value, callback)
      },
      trigger: 'manual'
    }
  ]
}

/**
 * 密钥加密
 */
const prepareEncryptedPassword = async () => {
  const success = await initializeRsa()
  if (!success) {
    console.error('RSA 初始化失败:', rsaError.value)
    return null
  }

  const encryptedResult = await encryptPassword(form.password)
  if (!encryptedResult) {
    console.error('密码加密失败:', rsaError.value)
    return null
  }

  return encryptedResult
}

/**
 * 登录
 */
const handleLogin = async () => {
  if (!formRef.value) return
  if (loading.value) return
  loading.value = true

  await formRef.value.validate(async valid => {
    if (!valid) {
      loading.value = false
      return
    }

    try {
      const encryptedResult = await prepareEncryptedPassword()
      if (!encryptedResult) return

      const response = await authStore.signin({
        usernameOrEmail: form.username,
        password: encryptedResult.encryptedData,
        clientId: encryptedResult.clientId
      })

      await handleLoginSuccess(response)
    } catch (error: any) {
      handleLoginError(error)
    } finally {
      loading.value = false
    }
  })
}
// 处理登录成功后的操作
const handleLoginSuccess = async (response: LoginResponse) => {
  // console.log('登录返回数据:', response)
  if ('requirePasswordChange' in response) {
    // 密码需要修改
    handleModifyPassword(response)
  } else if ('accessToken' in response) {
    // 登录成功
    // 1. 重置路由
    resetRouter()
    // 2. 添加动态路由
    await addDynamicRoutes(response.permissions)

    if (form.rememberMe) {
      storage.set('rememberedUsername', form.username)
    } else {
      storage.remove('rememberedUsername')
    }
    router.push('/home')
  }
}

// 处理登录错误
const handleLoginError = (err: any) => {
  console.error('登录失败:', err)
  const { status, data: { code, data: { message } = {} } = {} } = err
  let errorMessage = message || t('login.loginFailed')

  if (status === 404) {
    errorMessage = t('login.notFound')
  } else if (code === 40101) {
    errorMessage = t('login.nonExistAccount')
  } else if (code === 40102) {
    errorMessage = t('login.disabledAccount')
  } else if (code === 40103) {
    errorMessage = message || t('login.invalidAccount')
  } else if (code === 40104) {
    errorMessage = t('login.accountExpired')
  }

  ElMessage.error(errorMessage)
}

/**
 * 修改密码
 */
const modifyDialogVisible = ref(false)
const currentUser = ref<LoginResponse>()
async function handleModifyPassword(user: LoginResponse) {
  modifyDialogVisible.value = true
  currentUser.value = user
}
async function onModifyPassword() {
  ElMessage.success(t('login.modifyPasswordSuccess'))
  modifyDialogVisible.value = false
  form.password = ''
}

onMounted(() => {
  // 恢复记住的用户名
  const rememberedUsername = storage.get<string>('rememberedUsername')
  if (rememberedUsername) {
    form.username = rememberedUsername
    form.rememberMe = true
  }
})
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh;
  display: flex;
}

.login-cover {
  flex: 1;
  background: linear-gradient(135deg, $color-primary 0%, $color-info 100%);
  // background: url('../../assets/images/img-login.png') no-repeat center center / cover;
}

.login-container {
  width: 50%;
  min-width: 640px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: var(--color-white);
}

.login-box {
  width: 500px;
}

.login-title {
  margin-bottom: 40px;
  font-size: 28px;
  font-weight: var(--font-weight-bold);
}

.login-sub-title {
  font-size: var(--font-size-l);
  font-weight: var(--font-weight-base);
  color: var(--text-color-support);
}

.login-form {
  position: relative;
  .login-button {
    width: 100%;
    height: 56px;
  }

  .rsa-error-alert {
    position: absolute;
    bottom: -52px;
  }
}

.i18n-block {
  position: absolute;
  top: 20px;
  right: 20px;

  :deep(.language-switcher) {
    color: var(--text-color-base);
  }
}

.form-item {
  margin-top: 32px;
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
