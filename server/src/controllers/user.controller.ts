import type { Context } from 'koa'
import { userService } from '../services/user.service.js'
import { success } from '../utils/response.util.js'
import { BusinessError } from '../types/common.types.js'
import type { UserInfo } from '../types/user.types.js'

export class UserController {
  async getUserInfo(ctx: Context): Promise<void> {
    const userId = ctx.state.user.userId

    const userInfo = await userService.getUserById(userId)

    if (!userInfo) {
      throw new BusinessError('用户不存在', 'NOT_FOUND', 404)
    }

    success(ctx, userInfo)
  }

  async updateUserInfo(ctx: Context): Promise<void> {
    const userId = ctx.state.user.userId
    const updates = ctx.request.body as Partial<UserInfo>

    const userInfo = await userService.updateUser(userId, updates)
    success(ctx, userInfo)
  }
}

export const userController = new UserController()
