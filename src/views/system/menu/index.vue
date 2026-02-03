<template>
  <div class="menu-page-container">
    <div class="menu-page">
      <h2 class="flex flex-between">
        <span>{{ t('menu.menu') }}</span>
        <el-button v-if="ENV_DEV" type="primary" @click="handleCreate">
          {{ t('menu.add') }}
        </el-button>
      </h2>
      <div class="card-wrap">
        <MenuTable
          class="flex-1"
          :data="menuList"
          :loading="loading"
          @edit="handleEdit"
          @delete="handleDelete"
          @update="handleMenuUpdate"
        />
      </div>

      <MenuDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :menu-data="currentMenu"
        :all-menus="menuList"
        @save="onSave"
        @create="onCreate"
        @cancel="dialogVisible = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MenuConfig } from '@/types/navigation'
import { getMenusTree, saveMenusList, saveMenu, deleteMenu } from '@/api/menu'
import MenuTable from '@/components/menu/MenuTable.vue'
import MenuDialog from '@/components/menu/MenuDialog.vue'

const { t } = useI18n()
const ENV_DEV = import.meta.env.DEV

// 状态管理
const menuList = ref<MenuConfig[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentMenu = ref<MenuConfig | null>(null)

// 页面加载时获取菜单列表
onMounted(() => {
  loadMenuList()
})
// 加载菜单列表
async function loadMenuList() {
  try {
    loading.value = true
    const response = await getMenusTree()
    menuList.value = response
    console.log('获取菜单管理列表:', response)
  } catch (error) {
    console.error('加载菜单列表失败:', error)
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
    await ElMessageBox.confirm(t('menu.deleteConfirm'), t('menu.delete'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })

    await deleteMenu(menu.id)
    ElMessage.success(t('menu.deleteSuccess'))
    await loadMenuList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error)
    }
  }
}

// 新建菜单
async function onCreate(menuData: MenuConfig) {
  try {
    loading.value = true
    const params = {
      ...menuData,
      code: menuData.permissionCode,
      name: menuData.title,
      sort: 0
    }
    await saveMenu(params)

    ElMessage.success(t('menu.createSuccess'))
    dialogVisible.value = false

    // 重新获取完整菜单结构
    await loadMenuList()
  } catch (error) {
    console.error('创建菜单失败:', error)
  } finally {
    loading.value = false
  }
}
// 弹框中 保存菜单编辑
async function onSave(menuData: MenuConfig) {
  try {
    loading.value = true
    // 判断是否父级发生了变化
    const preParentId = currentMenu.value?.parentId
    const newParentId = menuData.parentId
    const isParentChanged =
      (newParentId && newParentId !== preParentId) || (!newParentId && preParentId)
    const params = {
      ...menuData,
      code: menuData.permissionCode,
      name: menuData.title,
      icon: menuData.icon || '',
      sort: isParentChanged ? 0 : menuData.sort
    }
    // console.warn('保存的菜单 params', params)
    await fetchSaveMenus([params])

    ElMessage.success(t('menu.updateSuccess'))
    dialogVisible.value = false

    // 重新获取完整菜单结构
    await loadMenuList()
  } catch (error) {
    console.error('保存菜单失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理菜单更新（移动后）
 */
async function handleMenuUpdate(updatedMenus: MenuConfig[]) {
  try {
    loading.value = true
    const sortList = updateMenusSort(updatedMenus)
    await fetchSaveMenus(sortList)
    ElMessage.success(t('menu.orderUpdateSuccess'))

    // 重新获取完整菜单结构
    await loadMenuList()
  } catch (error) {
    console.error('保存菜单顺序失败:', error)
    // 保存失败时重新加载
    await loadMenuList()
  } finally {
    loading.value = false
  }
}
// 重新计算菜单sort
function updateMenusSort(menus: MenuConfig[]) {
  const list = menus.map((menu, index) => {
    menu.sort = index + 1
    menu.children && (menu.children = updateMenusSort(menu.children))
    return menu
  })
  return list
}

async function fetchSaveMenus(menus: MenuConfig[]) {
  const flattenedMenus: MenuConfig[] = []
  const getFlattenedMenus = (menu: MenuConfig) => {
    flattenedMenus.push(menu)
    menu.children ? menu.children.forEach(getFlattenedMenus) : null
  }
  menus.forEach(getFlattenedMenus)
  try {
    console.warn('准备保存的扁平化菜单列表:', flattenedMenus)
    await saveMenusList(flattenedMenus)
  } catch (error) {
    console.error('保存菜单列表失败:', error)
  }
}
</script>

<style scoped lang="scss">
.menu-page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  padding: $spacing-8 $spacing-20 $spacing-20;
}
.menu-page {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  h2 {
    margin: $spacing-12 0;
    font-size: 24px;
    font-weight: var(--font-weight-bold);
    color: var(--text-color-base);
  }
}
.card-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  :deep(.el-card__body) {
    padding: $spacing-16;
    height: 100%;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
