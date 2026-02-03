# API响应码标准化

## 问题描述

之前的实现中，API响应的`code`字段类型不统一：
- **成功响应**：`code: 0`（数字）
- **错误响应**：`code: 'AUTH_FAILED'`（字符串）

这导致前端处理响应时需要判断code的类型，不够规范。

## 解决方案

统一使用**数字类型**作为响应码，采用以下规则：

### 响应码规则

| 场景 | code值 | HTTP状态码 | 说明 |
|------|--------|-----------|------|
| 成功 | 0 | 200 | 请求成功 |
| 客户端错误 | 400 | 400 | 请求参数错误 |
| 认证失败 | 401 | 401 | 未认证或认证失败 |
| 权限不足 | 403 | 403 | 无权限访问 |
| 资源不存在 | 404 | 404 | 资源不存在 |
| 服务器错误 | 500 | 500 | 内部服务器错误 |

### 响应格式

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

**错误响应：**
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

## 代码变更

### 1. 类型定义 (server/src/types/common.types.ts)

**ApiResponse接口：**
```typescript
export interface ApiResponse<T = any> {
  code: number        // 从 number | string 改为 number
  message: string
  data: T | null
}
```

**BusinessError类：**
```typescript
export class BusinessError extends Error {
  errorCode: string   // 保留errorCode用于内部错误分类
  statusCode: number

  constructor(message: string, errorCode: string, statusCode: number) {
    super(message)
    this.errorCode = errorCode  // 从 code 改为 errorCode
    this.statusCode = statusCode
    this.name = 'BusinessError'
  }
}
```

### 2. 响应工具 (server/src/utils/response.util.ts)

**error函数：**
```typescript
export function error(ctx: Context, code: number, message: string, statusCode = 500): void {
  ctx.status = statusCode
  const response: ApiResponse = {
    code,           // 使用数字类型的code
    message,
    data: null
  }
  ctx.body = response
}
```

### 3. 错误处理中间件 (server/src/middlewares/error.middleware.ts)

**errorHandler函数：**
```typescript
export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (err: any) {
    console.error('Error:', err)

    if (err instanceof BusinessError) {
      // 使用HTTP状态码作为响应code
      error(ctx, err.statusCode, err.message, err.statusCode)
    } else {
      const message =
        config.env === 'production' ? 'Internal server error' : err.message || 'Unknown error'

      error(ctx, 500, message, 500)
    }
  }
}
```

## 优势

1. **类型统一**：所有响应的code都是数字类型，前端处理更简单
2. **语义清晰**：code值直接对应HTTP状态码，易于理解
3. **标准化**：符合RESTful API的最佳实践
4. **易于扩展**：可以根据需要添加更多的状态码

## 前端影响

### 响应处理

**之前：**
```typescript
if (response.code === 200 || response.code === 0) {
  // 成功
} else if (response.code === 'AUTH_FAILED') {
  // 认证失败
}
```

**现在：**
```typescript
if (response.code === 0) {
  // 成功
} else if (response.code === 401) {
  // 认证失败
} else if (response.code === 403) {
  // 权限不足
}
```

### HTTP拦截器

前端的HTTP拦截器已经正确处理了这种情况：

```typescript
// src/api/http.ts
if (code === 200 || code === 0) {
  return rawResponse ? response.data : data
} else {
  showMessage && ElMessage.error(message || t('common.httpResponseError'))
  return Promise.reject(response)
}
```

## 常见错误码映射

| 业务场景 | errorCode | statusCode | code | message |
|---------|-----------|-----------|------|---------|
| 登录成功 | - | 200 | 0 | success |
| 用户名或密码错误 | AUTH_FAILED | 401 | 401 | 用户名或密码错误 |
| 账号被禁用 | ACCOUNT_DISABLED | 403 | 403 | 账号已被禁用 |
| 账号被锁定 | ACCOUNT_LOCKED | 403 | 403 | 账号已被锁定 |
| 密码解密失败 | DECRYPTION_FAILED | 400 | 400 | 密码解密失败 |
| 用户不存在 | NOT_FOUND | 404 | 404 | 用户不存在 |
| 角色代码已存在 | DUPLICATE_CODE | 400 | 400 | 角色代码已存在 |
| 内部服务器错误 | INTERNAL_ERROR | 500 | 500 | 内部服务器错误 |

## 注意事项

1. **errorCode保留**：BusinessError类中保留了errorCode字段，用于内部日志记录和错误分类
2. **向后兼容**：前端HTTP客户端已经支持code为0或200的成功判断
3. **错误消息**：message字段提供用户友好的错误描述
4. **HTTP状态码**：响应的HTTP状态码与code值保持一致

## 测试建议

1. **成功场景**：验证所有成功响应的code为0
2. **认证错误**：验证登录失败返回code为401
3. **权限错误**：验证无权限访问返回code为403
4. **参数错误**：验证参数验证失败返回code为400
5. **服务器错误**：验证内部错误返回code为500
