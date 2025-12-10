import http from './http'
import type { MenuConfig } from '@/types/navigation'

/**
 * 获取用户菜单配置（仅用于管理功能，普通用户菜单现在从 userInfo 中获取）
 */
export function getUserMenus(): Promise<{ data: MenuConfig[]; version?: string }> {
    return http.get('/menu/user')
}

/**
 * 获取所有菜单配置（用于菜单管理和角色管理）
 */
export function getAllMenus(): Promise<{ data: MenuConfig[] }> {
    return http.get('/menu/allMenu')
}

/**
 * 保存菜单（创建/更新）
 */
export function saveMenu(menu: Partial<MenuConfig>): Promise<{ data: MenuConfig }> {
    if (menu.id) {
        return http.post('/menu/update', menu)
    }
    return http.post('/menu/create', menu)
}

/**
 * 删除菜单
 */
export function deleteMenu(menuId: string): Promise<void> {
    return http.post('/menu/delete', { id: menuId })
}

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
