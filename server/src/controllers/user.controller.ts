import type { Context } from 'koa'
import { userService } from '../services/user.service.js'
import { success } from '../utils/response.util.js'
import { BusinessError } from '../types/common.types.js'
import type { UserInfo } from '../types/user.types.js'

export class UserController {
  // 获取当前用户信息（包含最新权限）
  async getUserInfo(ctx: Context): Promise<void> {
    const userId = ctx.state.user.userId
    const userInfo = await userService.getCurrentUser(userId)
    success(ctx, { data: userInfo })
  }

  // 更新当前用户信息
  async updateUserInfo(ctx: Context): Promise<void> {
    const userId = ctx.state.user.userId
    const updates = ctx.request.body as Partial<UserInfo>

    const userInfo = await userService.updateCurrentUser(userId, updates)
    success(ctx, userInfo)
  }

  // 管理员：获取所有用户
  async getAllUsers(ctx: Context): Promise<void> {
    const users = await userService.getAllUsers()
    success(ctx, { data: users })
  }

  // 管理员：创建用户
  async createUser(ctx: Context): Promise<void> {
    const userData = ctx.request.body as Partial<UserInfo>
    const user = await userService.createUser(userData)
    success(ctx, { data: user })
  }

  // 管理员：更新用户
  async updateUser(ctx: Context): Promise<void> {
    const { id, ...userData } = ctx.request.body as Partial<UserInfo> & { id: string }
    const user = await userService.updateUser(id, userData)
    success(ctx, { data: user })
  }

  // 管理员：删除用户
  async deleteUser(ctx: Context): Promise<void> {
    const { id } = ctx.request.body as { id: string }
    await userService.deleteUser(id)
    success(ctx, null, '删除成功')
  }
}

export const userController = new UserController()
