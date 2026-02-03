<template>
  <el-empty :image="emptyImage" :image-size="imageSize" :description="description">
    <slot name="extra"></slot>
  </el-empty>
</template>

<script setup lang="ts">
import { ElEmpty } from 'element-plus'
import emptyImage from '@/assets/images/img-empty.png'

interface Props {
  description?: string
  imageSize?: number
}

withDefaults(defineProps<Props>(), {
  description: '',
  imageSize: 110
})
</script>

<style scoped lang="scss">
/* 可以在这里添加自定义样式 */
</style>
