import { roleRepository } from '../repositories/role.repository.js'
import { roleMenuRepository } from '../repositories/role-menu.repository.js'
import { BusinessError } from '../types/common.types.js'
import type { Role } from '../types/role.types.js'

export class RoleService {
  async getAllRoles(): Promise<Role[]> {
    return await roleRepository.findAll()
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await roleRepository.findById(id)
    if (!role) {
      throw new BusinessError('角色不存在', 'NOT_FOUND', 404)
    }
    return role
  }

  async createRole(role: Partial<Role>): Promise<Role> {
    if (!role.name || !role.code) {
      throw new BusinessError('角色名称和编码不能为空', 'VALIDATION_ERROR', 400)
    }

    // 检查角色编码是否已存在
    const existing = await roleRepository.findByCode(role.code)
    if (existing) {
      throw new BusinessError('角色编码已存在', 'DUPLICATE_CODE', 400)
    }

    const newRole: Role = {
      id: role.code, // 使用 code 作为 id
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return await roleRepository.create(newRole)
  }

  async updateRole(roleId: string, role: Partial<Role>): Promise<Role> {
    const existing = await roleRepository.findById(roleId)
    if (!existing) {
      throw new BusinessError('角色不存在', 'NOT_FOUND', 404)
    }

    const updated = await roleRepository.update(roleId, {
      ...role,
      updatedAt: new Date().toISOString()
    })

    if (!updated) {
      throw new BusinessError('更新失败', 'INTERNAL_ERROR', 500)
    }

    return updated
  }

  async deleteRole(roleId: string): Promise<void> {
    const success = await roleRepository.delete(roleId)
    if (!success) {
      throw new BusinessError('角色不存在', 'NOT_FOUND', 404)
    }

    // 同时删除角色菜单关系
    try {
      await roleMenuRepository.delete(roleId)
    } catch (error) {
      // 如果角色菜单关系不存在，忽略错误
      console.log('角色菜单关系不存在或已删除')
    }
  }

  async getRoleMenus(roleId: string) {
    const role = await this.getRoleById(roleId)
    const roleMenus = await roleMenuRepository.findByRoleId(roleId)
    
    console.log('获取角色菜单权限:', { roleId, roleMenus })
    
    return {
      roleId: role.id,
      roleName: role.name,
      permissionCodes: roleMenus?.permissionCodes || []
    }
  }

  async saveRoleMenus(roleId: string, permissionCodes: string[]): Promise<void> {
    const role = await this.getRoleById(roleId)
    console.log('保存角色菜单权限:', { roleId, roleName: role.name, permissionCodes })
    await roleMenuRepository.saveRoleMenus(roleId, role.name, permissionCodes)
    console.log('保存成功')
  }
}

export const roleService = new RoleService()
