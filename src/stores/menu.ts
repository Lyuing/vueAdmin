import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MenuItem } from '@/types/menu'
import type { RouteConfig } from '@/types/route'
import { generateMenus, getBreadcrumb } from '@/router/helper'

export const useMenuStore = defineStore('menu', () => {
  const menuList = ref<MenuItem[]>([])
  const activeMenu = ref<string>('')
  const openedMenus = ref<string[]>([])
  const collapsed = ref<boolean>(false)

  /**
   * 生成菜单
   */
  function setMenus(routes: RouteConfig[], permissions: string[], allRoutes: RouteConfig[]) {
    menuList.value = generateMenus(routes, permissions, allRoutes)
  }

  /**
   * 设置当前激活的一级菜单
   */
  function setActiveMenu(menuName: string) {
    activeMenu.value = menuName
  }

  /**
   * 切换子菜单展开状态
   */
  function toggleSubmenu(menuName: string) {
    const index = openedMenus.value.indexOf(menuName)
    if (index > -1) {
      openedMenus.value.splice(index, 1)
    } else {
      openedMenus.value.push(menuName)
    }
  }

  /**
   * 根据当前路由自动展开父级菜单
   */
  function autoExpandMenus(routeName: string) {
    const breadcrumb = getBreadcrumb(routeName, menuList.value)
    openedMenus.value = breadcrumb.map(item => item.name)

    // 设置激活的一级菜单
    if (breadcrumb.length > 0) {
      const topMenu = breadcrumb[0]
      if (topMenu) {
        setActiveMenu(topMenu.name)
      }
    }
  }

  /**
   * 切换侧边栏折叠状态
   */
  function toggleCollapse() {
    collapsed.value = !collapsed.value
  }

  /**
   * 获取当前激活菜单的子菜单
   */
  function getActiveMenuChildren(): MenuItem[] {
    const activeMenuItem = menuList.value.find(item => item.name === activeMenu.value)
    return activeMenuItem?.children || []
  }

  return {
    menuList,
    activeMenu,
    openedMenus,
    collapsed,
    setMenus,
    setActiveMenu,
    toggleSubmenu,
    autoExpandMenus,
    toggleCollapse,
    getActiveMenuChildren
  }
})
