<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">{{ t('login.title') }}</h1>
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="t('login.username')"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="t('login.password')"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.rememberMe">
            {{ t('login.rememberMe') }}
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { storage } from '@/utils/storage'
import { addDynamicRoutes } from '@/router'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const rules: FormRules = {
  username: [{ required: true, message: t('validation.required'), trigger: 'blur' }],
  password: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 6, message: t('validation.minLength', { min: 6 }), trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        const response = await authStore.login(form.username, form.password)

        // 动态注册路由
        await addDynamicRoutes(response.userInfo.permissions)

        // 记住密码
        if (form.rememberMe) {
          storage.set('rememberedUsername', form.username)
        } else {
          storage.remove('rememberedUsername')
        }

        ElMessage.success(t('login.loginSuccess'))
        router.push('/home')
      } catch (error: any) {
        ElMessage.error(error.message || t('login.loginFailed'))
      } finally {
        loading.value = false
      }
    }
  })
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-title {
  margin: 0 0 30px;
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.login-form {
  .login-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .login-box {
    width: 90%;
    padding: 30px 20px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
