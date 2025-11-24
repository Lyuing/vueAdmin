<template>
  <div class="user-page">
    <h2>{{ t('menu.user') }}</h2>
    <el-card class="mb-20">
      <p>用户管理页面 - 演示权限控制</p>
      <p>当前用户权限: {{ authStore.userInfo?.permissions.join(', ') }}</p>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" size="small">新增用户</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const tableData = ref([
  {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    email: 'admin@example.com',
    role: '超级管理员',
    status: '正常'
  },
  {
    id: 2,
    username: 'user1',
    nickname: '用户1',
    email: 'user1@example.com',
    role: '普通用户',
    status: '正常'
  },
  {
    id: 3,
    username: 'user2',
    nickname: '用户2',
    email: 'user2@example.com',
    role: '普通用户',
    status: '禁用'
  }
])
</script>

<style scoped lang="scss">
.user-page {
  h2 {
    margin: 0 0 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-20 {
  margin-bottom: 20px;
}
</style>
