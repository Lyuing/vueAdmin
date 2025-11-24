<template>
  <div class="menu-page">
    <h2>{{ t('menu.menu') }}</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单列表</span>
          <el-button type="primary" size="small">新增菜单</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%" row-key="id" default-expand-all>
        <el-table-column prop="title" label="菜单名称" width="200" />
        <el-table-column prop="path" label="路由路径" width="200" />
        <el-table-column prop="icon" label="图标" width="120">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" />
        <el-table-column prop="order" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '显示' ? 'success' : 'info'">
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

const { t } = useI18n()

const tableData = ref([
  {
    id: 1,
    title: '首页',
    path: '/home',
    icon: 'HomeFilled',
    permission: 'home:view',
    order: 1,
    status: '显示'
  },
  {
    id: 2,
    title: '工作台',
    path: '/dashboard',
    icon: 'DataLine',
    permission: 'dashboard:view',
    order: 2,
    status: '显示'
  },
  {
    id: 3,
    title: '系统管理',
    path: '/system',
    icon: 'Setting',
    permission: 'system:view',
    order: 3,
    status: '显示',
    children: [
      {
        id: 31,
        title: '用户管理',
        path: '/system/user',
        icon: 'User',
        permission: 'system:user:view',
        order: 1,
        status: '显示'
      },
      {
        id: 32,
        title: '角色管理',
        path: '/system/role',
        icon: 'UserFilled',
        permission: 'system:role:view',
        order: 2,
        status: '显示'
      },
      {
        id: 33,
        title: '菜单管理',
        path: '/system/menu',
        icon: 'Menu',
        permission: 'system:menu:view',
        order: 3,
        status: '显示'
      }
    ]
  }
])
</script>

<style scoped lang="scss">
.menu-page {
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
