# 角色权限数据结构重构总结

## 重构目标

将角色权限的数据结构从简单的`permissionCodes`字符串数组改为包含`permissionId`和`permissionCode`的完整权限对象数组，以便在配置角色权限时能够正确回显完整的菜单结构。

## 数据结构变更

### 之前的结构
```json
{
  "id": 1,
  "name": "管理员",
  "code": "admin",
  "permissionCodes": [
    "home",
    "dashboard",
    "system_user"
  ]
}
```

### 现在的结构
```json
{
  "id": 1,
  "name": "管理员",
  "code": "admin",
  "permissions": [
    { "permissionId": 1001, "permissionCode": "menu:welcome" },
    { "permissionId": 1004, "permissionCode": "menu:workbench" },
    { "permissionId": 1005, "permissionCode": "menu:system_user" }
  ]
}
```

## 修改的文件

### 1. 类型定义 (server/src/types/role.types.ts)

**新增Permission接口：**
```typescript
export interface Permission {
  permissionId: number
  permissionCode: string
}
```

**更新Role接口：**
```typescript
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  userCount?: number
  createdTime: string
  updateTime: string
  permissions: Permission[]  // 从 permissionCodes: string[] 改为 permissions: Permission[]
}
```

**更新相关接口：**
- `RoleCreateInput.permissions`
- `RoleUpdateInput.permissions`
- `RoleMenuConfig.permissions`

### 2. 菜单类型 (server/src/types/menu.types.ts)

**添加permissionId字段：**
```typescript
export interface MenuConfig {
  id: string
  title: string
  icon?: string
  permissionId?: number  // 新增
  permissionCode?: string
  // ... 其他字段
}
```

### 3. 角色仓库 (server/src/repositories/role.repository.ts)

**完全重写，不再继承BaseRepository：**
- 直接管理Role类型（id为number）
- 实现自己的load/save方法
- 添加init()方法用于异步初始化
- 更新createWithAutoId方法使用permissions字段

### 4. 角色服务 (server/src/services/role.service.ts)

**getRolePermissions方法：**
- 返回类型从`Promise<string[]>`改为`Promise<number[]>`
- 返回permissionId数组用于前端回显

**saveRolePermissions方法：**
- 接收permissionIds数组
- 从menus.json中查找对应的permissionCode
- 构建完整的Permission对象数组
- 保存到角色

**新增buildPermissionMap方法：**
- 遍历所有菜单构建permissionId到permissionCode的映射
- 处理菜单和按钮权限

### 5. 认证服务 (server/src/services/auth.service.ts)

**更新权限获取逻辑：**
```typescript
// 之前：从roleMenuRepository获取
const roleMenu = await roleMenuRepository.findByRoleId(role.id)
if (roleMenu && roleMenu.permissionCodes) {
  roleMenu.permissionCodes.forEach(code => permissionSet.add(code))
}

// 现在：直接从角色获取
const role = await roleRepository.findByIdNumber(userRole.id)
if (role && role.permissions) {
  role.permissions.forEach(p => permissionSet.add(p.permissionCode))
}
```

### 6. 用户服务 (server/src/services/user.service.ts)

**更新getCurrentUser方法：**
- 移除roleMenuRepository依赖
- 直接从roleRepository获取角色权限
- 提取permissionCode到权限集合

### 7. 菜单服务 (server/src/services/menu.service.ts)

**更新getUserMenus方法：**
- 移除roleMenuRepository依赖
- 使用roleRepository获取角色权限
- 从permissions数组中提取permissionCode

### 8. 应用入口 (server/src/app.ts)

**移除roleMenuRepository：**
- 删除roleMenuRepository的导入
- 从loadData函数中移除roleMenuRepository.init()

### 9. 数据文件 (server/data/roles.json)

**更新所有角色数据：**
- 将permissionCodes数组转换为permissions对象数组
- 每个权限包含permissionId和permissionCode
- permissionId从menus.json中对应的菜单获取

## 前端影响

### API响应变化

**获取角色权限接口 (GET /api/permissions/v1/fetchByRole)：**
```typescript
// 之前返回：string[]
["home", "dashboard", "system_user"]

// 现在返回：number[]
[1001, 1004, 1005]
```

**保存角色权限接口 (POST /api/permissions/v1/batch-save)：**
```typescript
// 请求参数不变，仍然是permissionIds
{
  roleId: 1,
  permissionIds: [1001, 1004, 1005]
}
```

### 前端需要的调整

1. **权限回显**：前端接收到的是permissionId数组，可以直接用于树形控件的回显
2. **权限保存**：前端提交permissionIds数组，后端自动转换为完整的Permission对象
3. **权限树**：getAllPermissions接口返回的权限树中，每个节点的id就是permissionId

## 优势

1. **完整的数据结构**：保存了permissionId和permissionCode的完整映射关系
2. **便于回显**：前端可以直接使用permissionId进行树形控件的回显
3. **数据一致性**：权限数据与菜单数据保持一致的结构
4. **易于维护**：不需要额外的role-menus.json文件，减少数据冗余
5. **类型安全**：TypeScript类型定义更加准确

## 测试建议

1. **角色创建**：创建新角色并分配权限，验证permissions字段正确保存
2. **角色更新**：更新角色权限，验证permissions数组正确更新
3. **权限回显**：编辑角色时，验证权限树正确回显已选权限
4. **用户登录**：验证用户登录后获取的权限列表正确
5. **菜单显示**：验证用户菜单根据权限正确显示

## 注意事项

1. **数据迁移**：如果已有旧数据，需要将permissionCodes转换为permissions格式
2. **permissionId来源**：permissionId必须与menus.json中的permissionId一致
3. **按钮权限**：按钮权限的permissionId通过哈希算法生成，保持一致性
4. **向后兼容**：如果需要支持旧版本，可能需要同时保留permissionCodes字段
