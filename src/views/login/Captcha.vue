<template>
  <!-- <p class="captcha-content" @click="refreshCaptcha">{{ captchaQuestion }}</p> -->
  <p class="captcha-img" @click="refreshCaptcha">
    <img v-show="captchaImage" :src="captchaImage" class="captcha-pic" />
  </p>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { t } from '@/locales'
import {
  generateCaptcha as fetchGenerateCaptcha,
  validateCaptcha as fetchValidateCaptcha
} from '@/api/auth'

const props = defineProps<{
  account?: string
}>()

// 暴露验证方法和刷新方法给父组件
defineExpose({
  validateCaptcha,
  refreshCaptcha
})

onMounted(() => {
  generateCaptcha()
})

// // 验证码相关
// const captchaQuestion = ref('')
// const captchaAnswer = ref(0)
// 验证码图片
const captchaImage = ref('')
const captchaId = ref('')

// 生成随机验证码问题
async function generateCaptcha() {
  try {
    const response = await fetchGenerateCaptcha(props.account)
    captchaImage.value = response?.image
    captchaId.value = response?.captchaId
  } catch (error) {
    console.error('生成验证码失败', error)
  }

  /**
   * 前端模拟生成验证码
   */
  // const num1 = Math.floor(Math.random() * 20) + 1
  // const num2 = Math.floor(Math.random() * 20) + 1
  // const operator = Math.random() > 0.5 ? '+' : '-'
  // captchaQuestion.value = `${num1} ${operator} ${num2} = ?`
  // captchaAnswer.value = operator === '+' ? num1 + num2 : num1 - num2
}

// 验证码验证器
async function validateCaptcha(_rule: any, value: string, callback: any) {
  // console.warn('验证码校验', value)
  if (!value) {
    callback(new Error(t('validation.required')))
    return
  }
  try {
    const response = await fetchValidateCaptcha(value, captchaId.value, props.account)
    // console.warn('验证码校验结果', response)
    if (response.valid) {
      callback()
    } else {
      callback(new Error(t('login.captchaValidatError')))
    }
  } catch (error: any) {
    const msg = error?.data?.message
    const code = error?.data?.code
    console.error('验证码校验失败', code, msg, error)
    callback(new Error(msg || t('validation.validateFailed')))
    // 验证码过期则重新获取验证码
    if ([40105, 40106].includes(code)) {
      generateCaptcha()
    }
  }
}

// 重新生成验证码
function refreshCaptcha() {
  generateCaptcha()
}
</script>

<style scoped lang="scss">
.captcha-content {
  width: 110px;
  padding: 0 $spacing-12;
  cursor: pointer;
}
.captcha-img {
  width: 140px;
  height: 100%;
  display: block;
  cursor: pointer;
  background-color: var(--bgc-page);
}
.captcha-pic {
  width: 100%;
  height: 100%;
}
</style>
