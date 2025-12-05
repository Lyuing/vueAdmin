<template>
  <el-table :data="data" style="width: 100%" row-key="id"
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading" default-expand-all>
    <el-table-column prop="title" :label="t('menu.form.title')" width="200" />

    <el-table-column :label="t('menu.form.icon')" width="100" align="center">
      <template #default="{ row }">
        <el-icon v-if="row.icon" :size="20">
          <component :is="getIcon(row.icon)" />
        </el-icon>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <el-table-column prop="permissionCode" :label="t('menu.form.permissionCode')" width="180">
      <template #default="{ row }">
        <span>{{ row.permissionCode || '-' }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="t('menu.form.position')" width="100" align="center">
      <template #default="{ row }">
        <el-tag v-if="row.position === 'top'" type="success" size="small">
          {{ t('menu.form.topNav') }}
        </el-tag>
        <el-tag v-else type="info" size="small">
          {{ t('menu.form.sidebar') }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column prop="order" :label="t('menu.form.order')" width="80" align="center" />

    <el-table-column :label="t('menu.form.hidden')" width="100" align="center">
      <template #default="{ row }">
        <el-tag v-if="!row.hidden" type="success" size="small">
          {{ t('common.show') }}
        </el-tag>
        <el-tag v-else type="info" size="small">
          {{ t('common.hide') }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column :label="t('common.actions')" width="180" align="center" fixed="right">
      <template #default="{ row }">
        <el-button size="small" type="primary" link @click="handleEdit(row)">
          {{ t('common.edit') }}
        </el-button>
        <el-button size="small" type="danger" link @click="handleDelete(row)">
          {{ t('common.delete') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { MenuConfig } from '@/types/navigation'
import { getIconComponent } from '@/utils/icon'

const { t } = useI18n()

// 获取图标组件
const getIcon = (iconName?: string) => {
  return getIconComponent(iconName)
}

interface Props {
  data: MenuConfig[]
  loading?: boolean
}

interface Emits {
  (e: 'edit', menu: MenuConfig): void
  (e: 'delete', menu: MenuConfig): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleEdit(menu: MenuConfig) {
  emit('edit', menu)
}

function handleDelete(menu: MenuConfig) {
  emit('delete', menu)
}
</script>

<style scoped lang="scss">
:deep(.el-table) {
  font-size: 14px;

  .el-table__header {
    th {
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  .el-table__row {
    &:hover {
      background-color: var(--el-fill-color-lighter);
    }
  }

  .el-button--link {
    padding: 0 8px;
    height: auto;
  }
}

// 响应式布局
@media (max-width: 1200px) {
  :deep(.el-table) {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  :deep(.el-table) {
    font-size: 12px;

    .el-table__cell {
      padding: 8px 0;
    }
  }
}
</style>
