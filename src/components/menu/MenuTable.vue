<template>
  <el-table :data="data" style="width: 100%" row-key="id"
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading" default-expand-all>
    <el-table-column prop="title" :label="t('menu.form.title')" width="160" />

    <el-table-column :label="t('menu.form.icon')" width="100" align="center">
      <template #default="{ row }">
        <el-icon v-if="row.icon" :size="20">
          <component :is="getIcon(row.icon)" />
        </el-icon>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <el-table-column prop="permissionCode" :label="t('menu.form.permissionCode')" width="170">
      <template #default="{ row }">
        <span>{{ row.permissionCode || '-' }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="t('menu.form.permissions')" width="130">
      <template #default="{ row }">
        <div class="permission-tags">
          <!-- 只显示按钮权限点 -->
          <el-tag
            v-for="btn in row.buttonPermissions"
            :key="btn.code"
            type="success"
            size="small"
          >
            {{ btn.name }}
          </el-tag>
          
          <span v-if="!row.buttonPermissions || row.buttonPermissions.length === 0">
            -
          </span>
        </div>
      </template>
    </el-table-column>

    <el-table-column :label="t('menu.form.position')" width="120" align="center">
      <template #default="{ row }">
        <el-tag v-if="row.position === 'top'" type="success" size="small">
          {{ t('menu.form.topNav') }}
        </el-tag>
        <el-tag v-else-if="row.position === 'sidebar_nav'" type="primary" size="small">
          {{ t('menu.form.sidebarNav') }}
        </el-tag>
        <el-tag v-else-if="row.position === 'sidebar_directory'" type="info" size="small">
          {{ t('menu.form.sidebarDirectory') }}
        </el-tag>
      </template>
    </el-table-column>

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

    <el-table-column :label="t('common.actions')" width="220" align="center" fixed="right">
      <template #default="{ row }">
        <el-button size="small" link :disabled="!canMoveUp(row)" :title="t('menu.moveUp')" @click="handleMoveUp(row)">
          <el-icon :size="18">
            <Top />
          </el-icon>
        </el-button>
        <el-button size="small" link :disabled="!canMoveDown(row)" :title="t('menu.moveDown')"
          @click="handleMoveDown(row)">
          <el-icon :size="18">
            <Bottom />
          </el-icon>
        </el-button>
        <el-button size="small" type="primary" link @click="handleEdit(row)">
          {{ t('common.edit') }}
        </el-button>
        <!-- <el-button size="small" type="danger" link @click="handleDelete(row)">
          {{ t('common.delete') }}
        </el-button> -->
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Top, Bottom } from '@element-plus/icons-vue'
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
  (e: 'update', menus: MenuConfig[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 查找菜单项及其同级数组
 */
function findMenuAndSiblings(menus: MenuConfig[], menuId: string): { menu: MenuConfig; siblings: MenuConfig[] } | null {
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i]
    if (!menu) continue

    if (menu.id === menuId) {
      return { menu, siblings: menus }
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuAndSiblings(menu.children, menuId)
      if (found) return found
    }
  }
  return null
}

/**
 * 检查是否可以向上移动
 */
function canMoveUp(menu: MenuConfig): boolean {
  const result = findMenuAndSiblings(props.data, menu.id)
  if (!result) return false

  const { siblings } = result
  const currentIndex = siblings.findIndex(m => m.id === menu.id)
  return currentIndex > 0
}

/**
 * 检查是否可以向下移动
 */
function canMoveDown(menu: MenuConfig): boolean {
  const result = findMenuAndSiblings(props.data, menu.id)
  if (!result) return false

  const { siblings } = result
  const currentIndex = siblings.findIndex(m => m.id === menu.id)
  return currentIndex >= 0 && currentIndex < siblings.length - 1
}

/**
 * 移动菜单项在同级中的位置
 */
function moveMenu(menu: MenuConfig, direction: 'up' | 'down') {
  // 创建深拷贝避免直接修改原数组
  const updatedMenus = JSON.parse(JSON.stringify(props.data))

  const result = findMenuAndSiblings(updatedMenus, menu.id)

  if (!result) {
    ElMessage.error('菜单不存在')
    return
  }

  const { siblings } = result
  const currentIndex = siblings.findIndex(m => m.id === menu.id)

  if (currentIndex === -1) {
    ElMessage.error('菜单不存在')
    return
  }

  // 检查是否可以移动
  if (direction === 'up' && currentIndex === 0) {
    ElMessage.warning('已经是第一个，无法上移')
    return
  }

  if (direction === 'down' && currentIndex === siblings.length - 1) {
    ElMessage.warning('已经是最后一个，无法下移')
    return
  }

  // 计算目标索引并交换位置
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  const currentMenu = siblings[currentIndex]
  const targetMenu = siblings[targetIndex]

  if (!currentMenu || !targetMenu) {
    ElMessage.error('菜单不存在')
    return
  }

  siblings[currentIndex] = targetMenu
  siblings[targetIndex] = currentMenu

  // 向上抛出更新后的菜单结构
  emit('update', updatedMenus)
}

function handleEdit(menu: MenuConfig) {
  emit('edit', menu)
}

function handleDelete(menu: MenuConfig) {
  emit('delete', menu)
}

function handleMoveUp(menu: MenuConfig) {
  moveMenu(menu, 'up')
}

function handleMoveDown(menu: MenuConfig) {
  moveMenu(menu, 'down')
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

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
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
