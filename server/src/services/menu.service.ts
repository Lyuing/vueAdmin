import { menuRepository } from '../repositories/menu.repository.js'
import { roleRepository } from '../repositories/role.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { MenuConfig } from '../types/menu.types.js'

export class MenuService {
  /**
   * 将树结构菜单转换为扁平结构
   */
  private flattenMenuTree(treeMenus: MenuConfig[]): MenuConfig[] {
    const flatMenus: MenuConfig[] = []

    const flatten = (menus: MenuConfig[], parentId: number | null = null) => {
      for (const menu of menus) {
        // 创建扁平菜单项，移除children字段
        const flatMenu: MenuConfig = {
          ...menu,
          // 确保parentId正确设置
          ...(parentId && { parentId })
        }

        // 移除children字段，因为扁平结构不需要
        delete (flatMenu as any).children

        flatMenus.push(flatMenu)

        // 递归处理子菜单
        if (menu.children && menu.children.length > 0) {
          flatten(menu.children, menu.id)
        }
      }
    }

    flatten(treeMenus)
    return flatMenus
  }

  /**
   * 将扁平菜单列表构建为树结构
   */
  private buildMenuTree(flatMenus: MenuConfig[], parentId: number | null = null): MenuConfig[] {
    return flatMenus
      .filter(menu => {
        // 查找menus.json中的parentId字段
        const menuParentId = menu.parentId
        if (parentId === null) {
          // 顶级菜单：parentId为null或undefined
          return menuParentId === null || menuParentId === undefined
        }
        // 子菜单：parentId匹配
        return menuParentId === parentId
      })
      .map(menu => ({
        ...menu,
        children: this.buildMenuTree(flatMenus, menu.id)
      }))
  }

  /**
   * 过滤用户有权限的菜单（扁平列表）
   */
  private filterMenusByPermissions(flatMenus: MenuConfig[], permissions: string[]): MenuConfig[] {
    return flatMenus.filter(menu => {
      if (!menu.permissionCode) return true
      return permissions.includes(menu.permissionCode)
    })
  }

  async getUserMenus(userId: string): Promise<MenuConfig[]> {
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    // 动态计算用户权限
    const permissionSet = new Set<string>()
    for (const userRole of user.roles) {
      try {
        const role = await roleRepository.findByIdNumber(userRole.id)
        if (role && role.permissions) {
          role.permissions.forEach(p => permissionSet.add(p.permissionCode))
        }
      } catch (error) {
        console.error(`获取角色 ${userRole.id} 权限失败:`, error)
      }
    }
    const permissions = Array.from(permissionSet)

    // 获取所有菜单（扁平结构）
    const allMenus = await menuRepository.findAll()

    // 过滤用户有权限的菜单
    const filteredMenus = this.filterMenusByPermissions(allMenus, permissions)

    // 构建树结构
    return this.buildMenuTree(filteredMenus)
  }

  async getAllMenus(): Promise<MenuConfig[]> {
    const flatMenus = await menuRepository.findAll()
    return this.buildMenuTree(flatMenus)
  }

  async createMenu(menu: Partial<MenuConfig>): Promise<MenuConfig> {
    if (!menu.id || !menu.title) {
      throw new BusinessError('菜单ID和标题不能为空', 'VALIDATION_ERROR', 400)
    }

    const newMenu: MenuConfig = {
      id: menu.id,
      title: menu.title,
      icon: menu.icon,
      permissionId: menu.permissionId,
      permissionCode: menu.permissionCode,
      buttonPermissions: menu.buttonPermissions,
      menuType: menu.menuType || 'sidebar_nav',
      hidden: menu.hidden || false,
      bindMenuId: menu.bindMenuId,
      parentMenuCode: menu.parentMenuCode
    }

    return await menuRepository.create(newMenu)
  }

  async updateMenu(menuId: number, menu: Partial<MenuConfig>): Promise<MenuConfig> {
    const existing = await menuRepository.findById(menuId)

    if (!existing) {
      throw new BusinessError('菜单不存在', 'NOT_FOUND', 404)
    }

    const updated = await menuRepository.update(menuId, menu)

    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async deleteMenu(menuId: number): Promise<void> {
    const success = await menuRepository.delete(menuId)

    if (!success) {
      throw new BusinessError('菜单不存在', 'NOT_FOUND', 404)
    }
  }

  async getPermissionCodes(): Promise<string[]> {
    return await menuRepository.getAllPermissionCodes()
  }

  async saveAllMenus(menus: MenuConfig[]): Promise<void> {
    // 检查传入的数据是否为树结构（包含children字段）
    const hasChildren = menus.some(menu => menu.children && menu.children.length > 0)

    let flatMenus: MenuConfig[]
    if (hasChildren) {
      // 如果是树结构，转换为扁平结构
      console.log('检测到树结构菜单数据，正在转换为扁平结构...')
      flatMenus = this.flattenMenuTree(menus)
    } else {
      // 如果已经是扁平结构，直接使用
      flatMenus = menus
    }

    // 部分更新：只更新传入的菜单项，不替换整个列表
    await this.updateMenusPartially(flatMenus)
    console.log(`已更新 ${flatMenus.length} 个菜单项`)
  }

  /**
   * 部分更新菜单：只更新传入的菜单项，保留其他菜单
   */
  private async updateMenusPartially(updatedMenus: MenuConfig[]): Promise<void> {
    // 获取当前所有菜单
    const currentMenus = await menuRepository.findAll()

    // 创建一个Map用于快速查找当前菜单
    const currentMenuMap = new Map<number, MenuConfig>()
    currentMenus.forEach(menu => {
      currentMenuMap.set(menu.id, menu)
    })

    // 处理传入的菜单更新
    const updatedMenuMap = new Map<number, MenuConfig>()
    for (const updatedMenu of updatedMenus) {
      const currentMenu = currentMenuMap.get(updatedMenu.id)

      if (currentMenu) {
        // 菜单存在，合并更新（排除children字段）
        const { children, ...updateFields } = updatedMenu as any
        const mergedMenu = {
          ...currentMenu,
          ...updateFields,
          updateTime: new Date().toISOString()
        }
        updatedMenuMap.set(updatedMenu.id, mergedMenu)
        console.log(`更新菜单: ${updatedMenu.id} - ${updatedMenu.title}`)
      } else {
        // 菜单不存在，作为新菜单添加（排除children字段）
        const { children, ...newMenuFields } = updatedMenu as any
        const newMenu = {
          ...newMenuFields,
          createdTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        updatedMenuMap.set(updatedMenu.id, newMenu)
        console.log(`新增菜单: ${updatedMenu.id} - ${updatedMenu.title}`)
      }
    }

    // 构建最终的菜单列表：保留未更新的菜单 + 更新/新增的菜单
    const finalMenus: MenuConfig[] = []

    // 先添加所有当前菜单，如果有更新则使用更新后的版本
    currentMenus.forEach(currentMenu => {
      const updatedMenu = updatedMenuMap.get(currentMenu.id)
      if (updatedMenu) {
        finalMenus.push(updatedMenu)
      } else {
        finalMenus.push(currentMenu)
      }
    })

    // 添加新菜单（在当前菜单中不存在的）
    updatedMenus.forEach(updatedMenu => {
      if (!currentMenuMap.has(updatedMenu.id)) {
        const { children, ...newMenuFields } = updatedMenu as any
        const newMenu = {
          ...newMenuFields,
          createdTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        finalMenus.push(newMenu)
      }
    })

    // 保存最终的菜单列表
    await menuRepository.saveAll(finalMenus)
  }

  /**
   * 获取可绑定的菜单选项（返回树结构）
   * @param excludeMenuId 要排除的菜单ID（通常是当前编辑的菜单）
   * @returns 可绑定的菜单选项列表
   */
  async getBindableMenuOptions(excludeMenuId?: number): Promise<MenuConfig[]> {
    const allMenus = await menuRepository.findAll()

    // 过滤出可用于绑定的菜单选项
    const bindableMenus = allMenus.filter(menu => {
      // 排除指定的菜单ID（避免自己绑定自己）
      if (excludeMenuId && menu.id === excludeMenuId) {
        return false
      }

      // 排除隐藏的菜单（隐藏菜单不能作为绑定目标）
      if (menu.hidden) {
        return false
      }

      return true
    })

    // 构建树结构
    return this.buildMenuTree(bindableMenus)
  }
}

export const menuService = new MenuService()
