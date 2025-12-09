<template>
  <div class="menu-page">
    <h2>{{ t('menu.menu') }}</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('menu.list') }}</span>
          <el-button type="primary" size="small" @click="handleCreate">
            {{ t('menu.add') }}
          </el-button>
        </div>
      </template>

      <MenuTable :data="menuList" :loading="loading" @edit="handleEdit" @delete="handleDelete" @update="handleMenuUpdate" />
    </el-card>

    <MenuDialog v-model:visible="dialogVisible" :mode="dialogMode" :menu-data="currentMenu" :all-menus="menuList"
      @save="handleSave" @cancel="handleCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MenuConfig } from '@/types/navigation'
import { getAllMenus, saveAllMenus, deleteMenu } from '@/api/menu'
import MenuTable from '@/components/menu/MenuTable.vue'
import MenuDialog from '@/components/menu/MenuDialog.vue'

const { t } = useI18n()

// 状态管理
const menuList = ref<MenuConfig[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentMenu = ref<MenuConfig | null>(null)

// 加载菜单列表
async function loadMenuList() {
  try {
    loading.value = true
    const response = await getAllMenus()
    menuList.value = response.data
  } catch (error) {
    console.error('加载菜单列表失败:', error)
    ElMessage.error(t('menu.message.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 创建菜单
function handleCreate() {
  dialogMode.value = 'create'
  currentMenu.value = null
  dialogVisible.value = true
}

// 编辑菜单
function handleEdit(menu: MenuConfig) {
  dialogMode.value = 'edit'
  currentMenu.value = menu
  dialogVisible.value = true
}

// 删除菜单
async function handleDelete(menu: MenuConfig) {
  try {
    await ElMessageBox.confirm(
      t('menu.deleteConfirm'),
      t('menu.delete'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await deleteMenu(menu.id)
    ElMessage.success(t('menu.message.deleteSuccess'))
    await loadMenuList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error)
      ElMessage.error(t('common.deleteFailed'))
    }
  }
}

// 保存菜单
async function handleSave(menuData: MenuConfig & { parentId?: string }) {
  try {
    loading.value = true

    // 处理树形结构
    const { parentId, ...menuToSave } = menuData

    let updatedMenuList: MenuConfig[]

    if (dialogMode.value === 'create') {
      // 创建模式：根据 parentId 决定插入位置
      if (parentId) {
        // 有父级菜单，插入到父级的 children 中
        updatedMenuList = insertMenuToParent(menuList.value, parentId, menuToSave)
      } else {
        // 没有父级菜单，作为顶级菜单添加
        updatedMenuList = [...menuList.value, menuToSave]
      }
    } else {
      // 编辑模式：先移除旧位置，再插入新位置
      const removedMenus = removeMenuFromTree(menuList.value, menuToSave.id)

      if (parentId) {
        // 有父级菜单，插入到父级的 children 中
        updatedMenuList = insertMenuToParent(removedMenus, parentId, menuToSave)
      } else {
        // 没有父级菜单，作为顶级菜单
        updatedMenuList = [...removedMenus, menuToSave]
      }
    }

    // 保存整个菜单树到后端
    await saveAllMenus(updatedMenuList)

    ElMessage.success(
      dialogMode.value === 'create'
        ? t('menu.message.createSuccess')
        : t('menu.message.updateSuccess')
    )
    dialogVisible.value = false

    // 重新获取完整菜单结构
    await loadMenuList()
  } catch (error) {
    console.error('保存菜单失败:', error)
    ElMessage.error(t('common.saveFailed'))
  } finally {
    loading.value = false
  }
}

// 将菜单插入到父级菜单的 children 中
function insertMenuToParent(menus: MenuConfig[], parentId: string, newMenu: MenuConfig): MenuConfig[] {
  return menus.map(menu => {
    if (menu.id === parentId) {
      return {
        ...menu,
        children: [...(menu.children || []), newMenu]
      }
    }
    if (menu.children && menu.children.length > 0) {
      return {
        ...menu,
        children: insertMenuToParent(menu.children, parentId, newMenu)
      }
    }
    return menu
  })
}

// 从树中移除菜单
function removeMenuFromTree(menus: MenuConfig[], menuId: string): MenuConfig[] {
  return menus
    .filter(menu => menu.id !== menuId)
    .map(menu => ({
      ...menu,
      children: menu.children ? removeMenuFromTree(menu.children, menuId) : []
    }))
}

/**
 * 处理菜单更新（移动后）
 */
async function handleMenuUpdate(updatedMenus: MenuConfig[]) {
  try {
    loading.value = true
    await saveAllMenus(updatedMenus)
    menuList.value = updatedMenus
    ElMessage.success(t('menu.message.orderUpdateSuccess'))
  } catch (error) {
    console.error('保存菜单顺序失败:', error)
    ElMessage.error(t('common.saveFailed'))
    // 保存失败时重新加载
    await loadMenuList()
  } finally {
    loading.value = false
  }
}

// 取消
function handleCancel() {
  dialogVisible.value = false
}

// 页面加载时获取菜单列表
onMounted(() => {
  loadMenuList()
})
</script>

<style scoped lang="scss">
.menu-page {
  padding: 20px;

  h2 {
    margin: 0 0 20px;
    font-size: 24px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  :deep(.el-card) {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

// 响应式布局
@media (max-width: 768px) {
  .menu-page {
    padding: 10px;

    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
