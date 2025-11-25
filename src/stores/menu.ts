import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem } from '@/types/menu'

export const useMenuStore = defineStore('menu', () => {
  const menuList = ref<MenuItem[]>([])
  const activeMenu = ref<string>('')
  const openedMenus = ref<string[]>([])
  const collapsed = ref<boolean>(false)

  function setMenuList(menus: MenuItem[]) {
    menuList.value = menus
  }

  // 切换一级菜单
  function setActiveMenu(menuName: string) {
    activeMenu.value = menuName
  }

  // 展开二级菜单
  function setOpenedMenus(menus: string[]) {
    openedMenus.value = menus
  }

  // 侧边栏折叠
  function toggleCollapse() {
    collapsed.value = !collapsed.value
  }

  return {
    menuList,
    activeMenu,
    openedMenus,
    collapsed,
    setMenuList,
    setActiveMenu,
    setOpenedMenus,
    toggleCollapse
  }
})
