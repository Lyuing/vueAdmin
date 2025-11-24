import type { RouteConfig } from '@/types/route'
import type { MenuItem } from '@/types/menu'
import { hasPermission } from '@/utils/permission'

/**
 * 根据路由name查找路由配置
 */
export function findRouteByName(name: string, routes: RouteConfig[]): RouteConfig | null {
    for (const route of routes) {
        if (route.name === name) {
            return route
        }
        if (route.children) {
            const found = findRouteByName(name, route.children)
            if (found) return found
        }
    }
    return null
}

/**
 * 根据菜单name查找菜单项
 */
export function findMenuByName(name: string, menus: MenuItem[]): MenuItem | null {
    for (const menu of menus) {
        if (menu.name === name) {
            return menu
        }
        if (menu.children) {
            const found = findMenuByName(name, menu.children)
            if (found) return found
        }
    }
    return null
}

/**
 * 计算菜单层级
 */
export function calculateLevel(route: RouteConfig, allRoutes: RouteConfig[]): number {
    if (!route.meta.parent) return 1 // 顶部导航

    const parent = findRouteByName(route.meta.parent, allRoutes)
    if (!parent?.meta.parent) return 2 // 侧边栏一级

    return 3 // 侧边栏二级或更深
}

/**
 * 从路由配置生成菜单数据
 */
export function generateMenus(
    routes: RouteConfig[],
    permissions: string[],
    allRoutes: RouteConfig[]
): MenuItem[] {
    const menus: MenuItem[] = []

    for (const route of routes) {
        // 跳过隐藏的路由
        if (route.meta?.hidden) {
            // 但是要处理它的children
            if (route.children) {
                menus.push(...generateMenus(route.children, permissions, allRoutes))
            }
            continue
        }

        // 检查权限
        if (!hasPermission(route.meta?.permissions, permissions)) {
            continue
        }

        const menuItem: MenuItem = {
            id: route.name,
            name: route.name,
            title: route.meta.title,
            icon: route.meta.icon,
            path: route.path,
            parent: route.meta.parent,
            level: calculateLevel(route, allRoutes),
            order: route.meta.order || 0,
            permissions: route.meta.permissions,
            hidden: route.meta.hidden
        }

        // 处理子菜单
        if (route.children) {
            menuItem.children = generateMenus(route.children, permissions, allRoutes)
        }

        menus.push(menuItem)
    }

    return menus.sort((a, b) => (a.order || 0) - (b.order || 0))
}

/**
 * 根据当前路由获取面包屑路径
 */
export function getBreadcrumb(routeName: string, menuList: MenuItem[]): MenuItem[] {
    const breadcrumb: MenuItem[] = []
    let current = findMenuByName(routeName, menuList)

    while (current) {
        breadcrumb.unshift(current)
        if (current.parent) {
            current = findMenuByName(current.parent, menuList)
        } else {
            break
        }
    }

    return breadcrumb
}
