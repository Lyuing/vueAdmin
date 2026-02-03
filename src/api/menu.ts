import http from './http'
import type { MenuConfig } from '@/types/navigation'

/**
 * 菜单数据接口
 */

/**
 * 获取所有菜单配置（用于菜单管理和角色管理）
 */
export function getAllMenus(): Promise<{ data: MenuConfig[] }> {
  return http.get('/menu/allMenu')
}

/**
 * 获取完整菜单树
 */
export function getMenusTree(): Promise<MenuConfig[]> {
  return http.get('/menu/allMenu')
}

/**
 * 新建/更新单个菜单
 */
export function saveMenu(menu: Partial<MenuConfig>): Promise<void> {
  if (menu.id) {
    return http.post('/menu/update', menu)
  }
  return http.post('/menu/create', menu)
}

/**
 * 批量保存菜单列表（扁平化列表）
 */
export function saveMenusList(menus: MenuConfig[]): Promise<void> {
  return http.post('/menu/batch', menus)
}

/**
 * 批量保存所有菜单（保存整个菜单树）
 */
export function saveAllMenus(menus: MenuConfig[]): Promise<void> {
  return http.post('/menu/batch', menus)
}

/**
 * 删除菜单
 */
export function deleteMenu(menuId: number | string): Promise<void> {
  return http.post('/menu/delete', { id: menuId })
}

/**
 * 获取权限码列表
 */
export function getPermissionCodes(): Promise<{ data: string[] }> {
  return http.get('/menu/permissionCodes')
}
