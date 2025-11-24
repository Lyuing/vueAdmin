<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <p class="error-message">{{ t('error.403') }}</p>
      <el-button type="primary" @click="goHome">
        {{ t('error.backHome') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.push('/home')
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
  color: var(--color-danger, #f56c6c);
}

.error-message {
  margin: 0 0 30px;
  font-size: 18px;
  color: #666;
}
</style>
