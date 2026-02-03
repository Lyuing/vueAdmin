import type { Context } from 'koa'
import { userService } from '../services/user.service.js'
import { success } from '../utils/response.util.js'
import type { UserCreateInput, UserUpdateInput } from '../types/user.types.js'

export class UserController {
  async getCurrentUser(ctx: Context): Promise<void> {
    const userId = ctx.state.user.userId
    const user = await userService.getCurrentUser(userId)
    success(ctx, user)
  }

  async getAllUsers(ctx: Context): Promise<void> {
    const users = await userService.getAllUsers()
    success(ctx, users)
  }

  async getUsersList(ctx: Context): Promise<void> {
    const { currentPage = 1, pageSize = 10, keyword, departmentId } = ctx.query

    let users = await userService.getAllUsers()

    // 关键词搜索
    if (keyword) {
      const kw = String(keyword).toLowerCase()
      users = users.filter(
        user =>
          user.username.toLowerCase().includes(kw) ||
          user.nickname.toLowerCase().includes(kw) ||
          (user.email && user.email.toLowerCase().includes(kw))
      )
    }

    // 部门筛选
    if (departmentId) {
      // 暂时不实现，因为当前数据结构中没有 departmentId
    }

    // 分页
    const total = users.length
    const page = Number(currentPage)
    const size = Number(pageSize)
    const start = (page - 1) * size
    const end = start + size
    const list = users.slice(start, end)

    success(ctx, {
      list,
      currentPage: page,
      pageSize: size,
      totalPage: Math.ceil(total / size),
      totalElements: total
    })
  }

  async getUsersByDepartment(ctx: Context): Promise<void> {
    const { departmentId } = ctx.query
    const users = await userService.getUsersByDepartment(Number(departmentId))
    success(ctx, users)
  }

  async createUser(ctx: Context): Promise<void> {
    const input = ctx.request.body as UserCreateInput
    const user = await userService.createUser(input)
    success(ctx, user)
  }

  async updateUser(ctx: Context): Promise<void> {
    const input = ctx.request.body as UserUpdateInput
    const user = await userService.updateUser(input)
    success(ctx, user)
  }

  async deleteUser(ctx: Context): Promise<void> {
    const { id } = ctx.query
    await userService.deleteUser(String(id))
    success(ctx, null, '删除成功')
  }

  async enableUser(ctx: Context): Promise<void> {
    const { id } = ctx.query
    const user = await userService.updateUserStatus(String(id), 'ACTIVE')
    success(ctx, user)
  }

  async disableUser(ctx: Context): Promise<void> {
    const { id } = ctx.query
    const user = await userService.updateUserStatus(String(id), 'INACTIVE')
    success(ctx, user)
  }

  async resetPassword(ctx: Context): Promise<void> {
    const { id } = ctx.query
    const user = await userService.resetPassword(String(id))
    success(ctx, user, '密码已重置为 123456')
  }

  async changePassword(ctx: Context): Promise<void> {
    const { id, newPassword, clientId } = ctx.request.body as {
      id: number
      newPassword: string
      clientId?: string
    }
    const user = await userService.changePassword(String(id), newPassword, clientId)
    success(ctx, user, '密码修改成功')
  }

  async changeLanguage(ctx: Context): Promise<void> {
    const userId = ctx.state.user.userId
    const { language } = ctx.query
    await userService.changeLanguage(userId, String(language))
    success(ctx, null, '语言切换成功')
  }
}

export const userController = new UserController()
