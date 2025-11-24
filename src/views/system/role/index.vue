<template>
  <div class="role-page">
    <h2>{{ t('menu.role') }}</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" size="small">新增角色</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="userCount" label="用户数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="warning">权限</el-button>
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

const { t } = useI18n()

const tableData = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    userCount: 1,
    status: '启用'
  },
  {
    id: 2,
    name: '管理员',
    code: 'admin',
    description: '拥有系统管理权限',
    userCount: 5,
    status: '启用'
  },
  {
    id: 3,
    name: '普通用户',
    code: 'user',
    description: '基础功能使用权限',
    userCount: 120,
    status: '启用'
  },
  {
    id: 4,
    name: '访客',
    code: 'guest',
    description: '只读权限',
    userCount: 0,
    status: '禁用'
  }
])
</script>

<style scoped lang="scss">
.role-page {
  h2 {
    margin: 0 0 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
