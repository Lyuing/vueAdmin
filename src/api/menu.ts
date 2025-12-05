import http from './http'
import type { MenuConfig } from '@/types/navigation'

/**
 * 获取用户菜单配置
 */
export function getUserMenus(): Promise<{ data: MenuConfig[]; version?: string }> {
    return http.get('/menu/user')
}

/**
 * 获取所有菜单配置（用于菜单管理和角色管理）
 */
export function getAllMenus(): Promise<{ data: MenuConfig[] }> {
    return http.get('/menu/all')
}

/**
 * 保存菜单（创建/更新）
 */
export function saveMenu(menu: Partial<MenuConfig>): Promise<{ data: MenuConfig }> {
    if (menu.id) {
        return http.put(`/menu/${menu.id}`, menu)
    }
    return http.post('/menu', menu)
}

/**
 * 删除菜单
 */
export function deleteMenu(menuId: string): Promise<void> {
    return http.delete(`/menu/${menuId}`)
}

/**
 * 保存角色菜单配置
 */
export function saveRoleMenus(roleId: string, menuIds: string[]): Promise<void> {
    return http.post(`/role/${roleId}/menus`, { menuIds })
}

/**
 * 获取权限码列表
 */
export function getPermissionCodes(): Promise<{ data: string[] }> {
    return http.get('/menu/permission-codes')
}
