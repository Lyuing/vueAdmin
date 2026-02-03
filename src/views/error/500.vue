<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">500</h1>
      <p class="error-message">{{ t('error.500') }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="goLogin">
          {{ t('error.backLogin') }}
        </el-button>
        <el-button @click="goBack">
          {{ t('common.back') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t } = useI18n()

const goLogin = () => {
  useAuthStore()?.clearAuth()
  router.push('/login')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.error-content {
  text-align: center;
}

.error-code {
  margin: 0 0 20px;
  font-size: 120px;
  font-weight: bold;
  color: var(--color-warning, #e6a23c);
}

.error-message {
  margin: 0 0 30px;
  font-size: 18px;
  color: #666;
}

.error-actions .el-button {
  margin-right: 10px;
  margin-left: 0;
}
</style>
