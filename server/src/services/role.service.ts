import { roleRepository } from '../repositories/role.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { menuRepository } from '../repositories/menu.repository.js'
import { BusinessError } from '../types/common.types.js'
import type {
  Role,
  RoleCreateInput,
  RoleUpdateInput,
  RolePermission,
  Permission
} from '../types/role.types.js'
import type { MenuConfig } from '../types/menu.types.js'

export class RoleService {
  /**
   * 计算角色的用户数量
   */
  private async calculateUserCount(roleId: number): Promise<number> {
    const allUsers = await userRepository.findAll()
    return allUsers.filter(user => user.roles && user.roles.some(role => role.id === roleId)).length
  }

  /**
   * 为角色列表添加动态计算的用户数量
   */
  private async enrichRolesWithUserCount(roles: Role[]): Promise<Role[]> {
    return Promise.all(
      roles.map(async role => ({
        ...role,
        userCount: await this.calculateUserCount(role.id)
      }))
    )
  }

  async getAllRoles(): Promise<Role[]> {
    const roles = await roleRepository.findAll()
    return await this.enrichRolesWithUserCount(roles)
  }

  async getRoleById(id: number): Promise<Role | null> {
    const role = await roleRepository.findByIdNumber(id)
    if (!role) return null

    // 动态计算用户数量
    return {
      ...role,
      userCount: await this.calculateUserCount(role.id)
    }
  }

  async createRole(input: RoleCreateInput): Promise<Role> {
    // 验证角色代码是否已存在
    if (await roleRepository.existsByCode(input.code)) {
      throw new BusinessError('角色代码已存在', 'DUPLICATE_CODE', 400)
    }

    // 验证角色名称是否已存在
    if (await roleRepository.existsByName(input.name)) {
      throw new BusinessError('角色名称已存在', 'DUPLICATE_NAME', 400)
    }

    // 创建角色时不需要传入userCount，它会在读取时动态计算
    const newRole = await roleRepository.createWithAutoId({
      name: input.name,
      code: input.code,
      description: input.description || '',
      permissions: input.permissions || []
    })

    // 返回时添加动态计算的用户数量
    return {
      ...newRole,
      userCount: 0 // 新创建的角色用户数量为0
    }
  }

  async updateRole(input: RoleUpdateInput): Promise<Role> {
    const existing = await roleRepository.findByIdNumber(input.id)

    if (!existing) {
      throw new BusinessError('角色不存在', 'NOT_FOUND', 404)
    }

    // 如果更新了代码，检查是否与其他角色冲突
    if (input.code && input.code !== existing.code) {
      if (await roleRepository.existsByCode(input.code)) {
        throw new BusinessError('角色代码已存在', 'DUPLICATE_CODE', 400)
      }
    }

    // 如果更新了名称，检查是否与其他角色冲突
    if (input.name && input.name !== existing.name) {
      if (await roleRepository.existsByName(input.name)) {
        throw new BusinessError('角色名称已存在', 'DUPLICATE_NAME', 400)
      }
    }

    const updated = await roleRepository.updateByIdNumber(input.id, {
      name: input.name,
      code: input.code,
      description: input.description,
      permissions: input.permissions
    })

    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    // 返回时添加动态计算的用户数量
    return {
      ...updated,
      userCount: await this.calculateUserCount(updated.id)
    }
  }

  async deleteRole(id: number): Promise<void> {
    const role = await roleRepository.findByIdNumber(id)

    if (!role) {
      throw new BusinessError('角色不存在', 'NOT_FOUND', 404)
    }

    // 动态检查是否有用户使用该角色
    const userCount = await this.calculateUserCount(id)
    if (userCount > 0) {
      throw new BusinessError('该角色下还有用户，无法删除', 'HAS_USERS', 400)
    }

    const success = await roleRepository.deleteByIdNumber(id)

    if (!success) {
      throw new BusinessError('删除失败', 'INTERNAL_ERROR', 500)
    }
  }

  /**
   * 获取角色的权限列表（返回permissionId数组，用于前端回显）
   */
  async getRolePermissions(roleId: number): Promise<Partial<RolePermission>[]> {
    const role = await roleRepository.findByIdNumber(roleId)
    if (!role) {
      return []
    }
    // 返回permissionId数组
    return (
      role.permissions?.map(p => ({
        id: p.permissionId,
        code: p.permissionCode
      })) || []
    )
  }

  /**
   * 保存角色权限
   * @param roleId 角色ID
   * @param permissionIds 权限ID数组
   */
  async saveRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await roleRepository.findByIdNumber(roleId)

    if (!role) {
      throw new BusinessError('角色不存在', 'NOT_FOUND', 404)
    }

    // 获取所有菜单，构建permissionId到permissionCode的映射
    const menus = await menuRepository.findAll()
    const permissionMap = this.buildPermissionMap(menus)

    // 将permissionIds转换为完整的Permission对象
    const permissions: Permission[] = permissionIds
      .map(id => {
        const code = permissionMap.get(id)
        if (code) {
          return { permissionId: id, permissionCode: code }
        }
        return null
      })
      .filter((p): p is Permission => p !== null)

    // 更新角色权限
    await roleRepository.updateByIdNumber(roleId, { permissions })
  }

  /**
   * 获取所有权限树（用于角色权限分配）
   */
  async getAllPermissions(): Promise<RolePermission[]> {
    const flatMenus = await menuRepository.findAll()
    return this.convertMenusToPermissions(flatMenus)
  }

  /**
   * 构建permissionId到permissionCode的映射（扁平菜单列表）
   */
  private buildPermissionMap(flatMenus: MenuConfig[]): Map<number, string> {
    const map = new Map<number, string>()

    flatMenus.forEach(menu => {
      if (menu.permissionId && menu.permissionCode) {
        map.set(menu.permissionId, menu.permissionCode)
      }

      // 处理按钮权限
      if (menu.buttonPermissions) {
        menu.buttonPermissions.forEach(btn => {
          // 为按钮权限生成ID（基于菜单ID和按钮code）
          const btnId = this.generatePermissionId(`${menu.id}_${btn.code}`)
          map.set(btnId, btn.code)
        })
      }
    })

    return map
  }

  /**
   * 将扁平菜单列表转换为权限树
   */
  private convertMenusToPermissions(flatMenus: MenuConfig[], parentId?: number): RolePermission[] {
    // 获取当前层级的菜单
    const currentLevelMenus = flatMenus.filter(menu => {
      const menuParentId = (menu as any).parentId
      if (parentId === undefined) {
        // 顶级菜单：parentId为null或undefined
        return menuParentId === null || menuParentId === undefined
      }
      // 子菜单：需要找到parentId对应的菜单ID
      const parentMenu = flatMenus.find(m => m.permissionId === parentId)
      if (!parentMenu) return false
      return String(menuParentId) === String(parentMenu.id)
    })

    return currentLevelMenus.map((menu, index) => {
      const permissionId = menu.permissionId || this.generatePermissionId(menu.id)

      const permission: RolePermission = {
        id: permissionId,
        code: menu.permissionCode || menu.id,
        name: menu.title,
        category: 'FUNCTION',
        type: 'MENU',
        status: 'ACTIVE',
        parentId,
        sort: index,
        children: []
      }

      // 递归处理子菜单
      permission.children = this.convertMenusToPermissions(flatMenus, permissionId)

      // 添加按钮权限
      if (menu.buttonPermissions && menu.buttonPermissions.length > 0) {
        const buttonPermissions = menu.buttonPermissions.map((btn, btnIndex) => ({
          id: this.generatePermissionId(`${menu.id}_${btn.code}`),
          code: btn.code,
          name: btn.name,
          category: 'FUNCTION' as const,
          type: 'BUTTON' as const,
          status: 'ACTIVE' as const,
          parentId: permission.id,
          sort: btnIndex,
          description: btn.description,
          children: []
        }))
        permission.children.push(...buttonPermissions)
      }

      return permission
    })
  }

  /**
   * 生成权限ID（基于字符串哈希）
   */
  private generatePermissionId(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}

export const roleService = new RoleService()
