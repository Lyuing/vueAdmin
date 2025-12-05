<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :to="item.path && index < breadcrumbs.length - 1 ? item.path : undefined"
    >
      <el-icon v-if="item.icon" class="breadcrumb-icon">
        <component :is="item.icon" />
      </el-icon>
      <span>{{ item.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation'

const { breadcrumbs } = useNavigation()
</script>

<style scoped lang="scss">
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 28px;
  margin-left: 8px;
  padding: 8px 28px;

  .breadcrumb-icon {
    margin-right: 4px;
    vertical-align: middle;
  }

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: inline-flex;
      align-items: center;
      font-weight: 400;
      color: #97a8be;
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }

      &.is-link {
        color: #97a8be;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    &:last-child {
      .el-breadcrumb__inner {
        color: #303133;
        font-weight: 500;
        cursor: text;

        &:hover {
          color: #303133;
        }
      }
    }
  }
}
</style>
