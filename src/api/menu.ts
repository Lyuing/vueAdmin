import http from './http'
import type { MenuConfig } from '@/types/navigation'

/**
 *
 * 菜单数据接口
 */

// 新建单个菜单
export function saveMenu(menu: Partial<MenuConfig>): Promise<void> {
  return http.post('/menus/v1', menu)
}

// 获取完整菜单树
export function getMenusTree(): Promise<MenuConfig[]> {
  return http.get('/menus/v1/tree', {}, { rawResponse: false })
}

// 保存、更新菜单
export function saveMenusList(menus: MenuConfig[]): Promise<void> {
  return http.post('/menus/v1/batch-save-or-update', menus)
}

// 删除菜单
export function deleteMenu(menuId: number): Promise<void> {
  return http.post(`/menus/v1/delete`, { id: menuId })
}

// 获取用户菜单配置 - 弃用
// export function getUserMenus(userId: number): Promise<{ data: MenuConfig[]; version?: string }> {
//   return http.get('/menus/v1/user-menus', { userId })
// }

/**
 * 获取所有菜单配置（用于菜单管理和角色管理）
 */
export function getAllMenus(): Promise<{ data: MenuConfig[] }> {
  return http.get('/menu/allMenu')
}

/**
 * 保存菜单（创建/更新）
 */
// export function saveMenu(menu: Partial<MenuConfig>): Promise<{ data: MenuConfig }> {
//   if (menu.id) {
//     return http.post('/menu/update', menu)
//   }
//   return http.post('/menu/create', menu)
// }

/**
 * 批量保存所有菜单（保存整个菜单树）
 */
export function saveAllMenus(menus: MenuConfig[]): Promise<void> {
  return http.post('/menu/batch', menus)
}

/**
 * 获取权限码列表
 */
export function getPermissionCodes(): Promise<{ data: string[] }> {
  return http.get('/menu/permissionCodes')
}
