<template>
  <el-table
    ref="tableRef"
    v-loading="loading"
    :data="menuData"
    class="table-block"
    row-key="id"
    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    default-expand-all
  >
    <!-- 选择列 -->
    <el-table-column prop="title" :label="t('menu.title')" min-width="160" show-overflow-tooltip />

    <el-table-column :label="t('menu.icon')" min-width="100" align="center">
      <template #default="{ row }">
        <p class="flex items-center justify-center">
          <el-icon v-if="row.icon" :size="20">
            <component :is="getIcon(row.icon)" />
          </el-icon>
          <span v-else>-</span>
        </p>
      </template>
    </el-table-column>

    <el-table-column
      prop="permissionCode"
      :label="t('menu.permissionCode')"
      min-width="180"
      show-overflow-tooltip
    >
      <template #default="{ row }">
        <span>{{ row.permissionCode || '-' }}</span>
      </template>
    </el-table-column>

    <!-- <el-table-column :label="t('menu.form.permissions')"  min-width="130">
      <template #default="{ row }">
        <div class="permission-tags">
          <el-tag v-for="btn in row.buttonPermissions" :key="btn.code" type="success" size="small">
            {{ btn.name }}
          </el-tag>
          <span v-if="!row.buttonPermissions || row.buttonPermissions.length === 0"> - </span>
        </div>
      </template>
    </el-table-column> -->

    <el-table-column :label="t('menu.menuType')" min-width="110" align="center">
      <template #default="{ row }">
        <el-tag v-if="row.menuType === 'top'" type="success" size="small">
          {{ t('menu.topNav') }}
        </el-tag>
        <el-tag v-else-if="row.menuType === 'sidebar_nav'" type="primary" size="small">
          {{ t('menu.sidebarNav') }}
        </el-tag>
        <el-tag v-else-if="row.menuType === 'sidebar_directory'" type="info" size="small">
          {{ t('menu.sidebarDirectory') }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column :label="t('menu.hidden')" min-width="100" align="center">
      <template #default="{ row }">
        <div class="hidden-status">
          <el-tag v-if="!row.hidden" type="success" size="small">
            {{ t('common.show') }}
          </el-tag>
          <el-tag v-else type="warning" size="small">
            {{ t('common.hide') }}
          </el-tag>
        </div>
      </template>
    </el-table-column>

    <!-- keepAlive 状态列 -->
    <el-table-column :label="t('menu.keepAlive')" min-width="100" align="center">
      <template #default="{ row }">
        <div v-if="isPageMenu(row)" class="keepalive-status">
          <el-tag v-if="row.keepAlive" type="success" size="small">{{
            t('menu.keepAliveEnabled')
          }}</el-tag>
          <el-tag v-else type="info" size="small">{{ t('menu.keepAliveDisabled') }}</el-tag>
        </div>
        <span v-else class="not-applicable">
          {{ t('common.notApplicable') }}
        </span>
      </template>
    </el-table-column>

    <!-- 绑定关系列 - 仅对隐藏菜单显示 -->
    <el-table-column :label="t('menu.bindNavigation')" min-width="150" align="center">
      <template #default="{ row }">
        <div v-if="row.hidden && row.bindMenuId" class="mount-info">
          <el-tag type="info" size="small">
            <el-icon style="margin-right: 4px">
              <Link />
            </el-icon>
            {{ getBindMenuTitle(row.bindMenuId) }}
          </el-tag>
        </div>
        <span v-else>-</span>
      </template>
    </el-table-column>

    <el-table-column
      v-if="ENV_DEV"
      :label="t('common.actions')"
      min-width="220"
      align="center"
      fixed="right"
    >
      <template #default="{ row }">
        <el-button
          size="small"
          link
          :disabled="!row.canMoveUp"
          :title="t('menu.moveUp')"
          @click="handleMoveUp(row)"
        >
          <el-icon :size="18">
            <Top />
          </el-icon>
        </el-button>
        <el-button
          size="small"
          link
          :disabled="!row.canMoveDown"
          :title="t('menu.moveDown')"
          @click="handleMoveDown(row)"
        >
          <el-icon :size="18">
            <Bottom />
          </el-icon>
        </el-button>
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Top, Bottom, Link } from '@element-plus/icons-vue'
import type { MenuConfig } from '@/types/navigation'
import { getIconComponent } from '@/utils/icon'

const { t } = useI18n()
const ENV_DEV = import.meta.env.DEV

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

// 获取图标组件
const getIcon = (iconName?: string) => {
  return getIconComponent(iconName)
}

// 扩展菜单配置接口，添加移动状态信息
interface MenuExtend extends MenuConfig {
  canMoveUp: boolean
  canMoveDown: boolean
  children?: MenuExtend[]
}

// 创建带有移动状态的菜单模板数据
const menuData = computed<MenuExtend[]>(() => {
  const processMenus = (menus: MenuConfig[]): MenuExtend[] => {
    return menus.map((menu, index) => ({
      ...menu,
      canMoveUp: index > 0,
      canMoveDown: index < menus.length - 1,
      children: menu.children ? processMenus(menu.children) : undefined
    }))
  }

  return processMenus(props.data)
})

// 创建菜单ID映射，用于快速查找
const menuIdMap = computed(() => {
  const map = new Map<number, MenuExtend>()
  const buildMap = (menus: MenuExtend[]) => {
    for (const menu of menus) {
      map.set(menu.id, menu)
      if (menu.children && menu.children.length > 0) {
        buildMap(menu.children)
      }
    }
  }
  buildMap(menuData.value)
  return map
})

// 获取绑定菜单标题 - 使用缓存映射提高性能
const getBindMenuTitle = (bindMenuId: number): string => {
  if (!bindMenuId) return '-'
  // 尝试从模板数据中查找
  const bindMenu = menuIdMap.value.get(bindMenuId)
  if (bindMenu) {
    return bindMenu.title
  }
  // 如果没找到，返回ID本身，表示可能存在数据不一致
  return `[${bindMenuId}]`
}

// 判断是否为页面类型菜单
const isPageMenu = (menu: MenuConfig): boolean => {
  return menu.menuType === 'top' || menu.menuType === 'sidebar_nav'
}

function handleEdit(menu: MenuConfig) {
  emit('edit', menu)
}

function handleDelete(menu: MenuConfig) {
  emit('delete', menu)
}

function handleMoveUp(menu: MenuExtend) {
  moveMenu(menu, 'up')
}

function handleMoveDown(menu: MenuExtend) {
  moveMenu(menu, 'down')
}
/**
 * 移动相关功能
 */

// 在同级中移动菜单项 - 使用模板数据中的移动状态
function moveMenu(menu: MenuExtend, direction: 'up' | 'down') {
  // 检查是否可以移动
  if (direction === 'up' && !menu.canMoveUp) {
    ElMessage.warning(t('menu.cannotMoveUp'))
    return
  }

  if (direction === 'down' && !menu.canMoveDown) {
    ElMessage.warning(t('menu.cannotMoveDown'))
    return
  }

  // 创建深拷贝避免直接修改原数组
  const updatedMenus = JSON.parse(JSON.stringify(props.data))

  // 找到菜单项及其同级数组
  const result = findMenuAndSiblings(updatedMenus, menu.id)
  if (!result) {
    ElMessage.error(t('menu.menuNotFound'))
    return
  }

  const { siblings } = result
  const currentIndex = siblings.findIndex(m => m.id === menu.id)

  if (currentIndex === -1) {
    ElMessage.error(t('menu.menuNotFound'))
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
// 查找菜单项及其同级数组
function findMenuAndSiblings(
  menus: MenuConfig[],
  menuId: number
): { menu: MenuConfig; siblings: MenuConfig[] } | null {
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
</script>

<style scoped lang="scss">
:deep(.el-table) {
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

.table-block {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.hidden-status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mount-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.keepalive-status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-applicable {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  font-style: italic;
}

.el-tag {
  border-radius: 12px;
  font-weight: 500;

  &.el-tag--success {
    background-color: var(--el-color-success-light-9);
    border-color: var(--el-color-success-light-7);
    color: var(--el-color-success);
  }

  &.el-tag--info {
    background-color: var(--el-fill-color-light);
    border-color: var(--el-border-color-light);
    color: var(--el-text-color-regular);
  }

  .el-icon {
    display: inline-flex;
    cursor: default;
  }
}

// 响应式布局
</style>
