export default {
  common: {
    login: '登录',
    logout: '登出',
    submit: '提交',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    add: '新增',
    search: '搜索',
    reset: '重置',
    save: '保存',
    back: '返回',
    close: '关闭',
    refresh: '刷新',
    export: '导出',
    import: '导入',
    show: '显示',
    hide: '隐藏',
    actions: '操作',
    saveFailed: '保存失败，请重试',
    deleteFailed: '删除失败，请重试',
    active: '启用',
    disabled: '禁用',
    createdAt: '创建时间',
    updatedAt: '更新时间'
  },
  user: {
    management: '用户管理',
    list: '用户列表',
    add: '添加用户',
    edit: '编辑用户',
    delete: '删除用户',
    deleteConfirm: '确定删除该用户吗？此操作不可恢复',
    form: {
      username: '用户名',
      password: '密码',
      passwordOptional: '不填写则不修改密码',
      roles: '角色',
      status: '状态'
    },
    validation: {
      usernameRequired: '请输入用户名',
      usernameLength: '用户名长度在3-20个字符之间',
      usernameFormat: '用户名只能包含字母、数字和下划线',
      passwordRequired: '请输入密码',
      passwordLength: '密码长度在6-20个字符之间',
      rolesRequired: '请选择角色'
    },
    message: {
      createSuccess: '创建用户成功',
      updateSuccess: '更新用户成功',
      deleteSuccess: '删除用户成功',
      loadFailed: '加载用户列表失败'
    }
  },
  role: {
    management: '角色管理',
    list: '角色列表',
    add: '添加角色',
    edit: '编辑角色',
    delete: '删除角色',
    deleteConfirm: '确定删除该角色吗？该角色关联了 {count} 个用户',
    permission: '配置权限',
    userCount: '用户数',
    form: {
      name: '角色名称',
      code: '角色编码',
      description: '描述',
      descriptionPlaceholder: '请输入角色描述',
      status: '状态'
    },
    validation: {
      nameRequired: '请输入角色名称',
      nameLength: '角色名称长度在2-20个字符之间',
      codeRequired: '请输入角色编码',
      codeFormat: '角色编码只能包含字母、数字和下划线'
    },
    message: {
      createSuccess: '创建角色成功',
      updateSuccess: '更新角色成功',
      deleteSuccess: '删除角色成功',
      loadFailed: '加载角色列表失败',
      permissionSaveSuccess: '保存权限成功'
    }
  },
  menu: {
    home: '首页',
    dashboard: '工作台',
    system: '系统管理',
    user: '用户管理',
    role: '角色管理',
    menu: '菜单管理',
    management: '菜单管理',
    list: '菜单列表',
    add: '添加菜单',
    edit: '编辑菜单',
    delete: '删除菜单',
    deleteConfirm: '确定删除该菜单及其所有子菜单吗？',
    moveUp: '上移',
    moveDown: '下移',
    form: {
      id: '菜单ID',
      title: '菜单标题',
      icon: '图标',
      permissionCode: '权限码',
      permissions: '权限点',
      parentMenu: '父级菜单',
      position: '显示位置',
      hidden: '是否隐藏',
      topNav: '顶部导航',
      sidebarNav: '侧栏导航',
      sidebarDirectory: '侧栏目录',
      selectIcon: '选择图标',
      searchIcon: '搜索图标...',
      noIconFound: '未找到匹配的图标'
    },
    message: {
      createSuccess: '创建成功',
      updateSuccess: '更新成功',
      deleteSuccess: '删除成功',
      loadFailed: '加载菜单列表失败',
      orderUpdateSuccess: '菜单顺序更新成功'
    },
    validation: {
      idRequired: '请输入菜单ID',
      idFormat: 'ID只能包含字母、数字和中划线',
      titleRequired: '请输入菜单标题',
      titleLength: '标题长度在1-50个字符之间',
      permissionCodeFormat: '权限码格式: module:action',
      positionRequired: '请选择菜单位置',
      parentRequired: '请选择父级菜单'
    }
  },
  validation: {
    required: '此项为必填项',
    email: '请输入正确的邮箱地址',
    phone: '请输入正确的手机号码',
    minLength: '长度不能少于{min}个字符',
    maxLength: '长度不能超过{max}个字符'
  },
  login: {
    title: '中台管理系统',
    username: '请输入用户名',
    password: '请输入密码',
    rememberMe: '记住密码',
    submit: '登录',
    loginSuccess: '登录成功',
    loginFailed: '登录失败'
  },
  theme: {
    title: '主题设置',
    default: '默认蓝',
    green: '清新绿',
    purple: '优雅紫'
  },
  language: {
    title: '语言设置',
    zhCN: '简体中文',
    enUS: 'English',
    zhTW: '繁體中文',
    jaJP: '日本語'
  },
  error: {
    403: '抱歉，您无权访问该页面',
    404: '抱歉，您访问的页面不存在',
    backHome: '返回首页'
  }
}
