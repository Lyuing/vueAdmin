export default {
  common: {
    login: '登入',
    logout: '登出',
    submit: '提交',
    cancel: '取消',
    confirm: '確認',
    delete: '刪除',
    edit: '編輯',
    add: '新增',
    search: '搜尋',
    reset: '重置',
    save: '儲存',
    back: '返回',
    close: '關閉',
    refresh: '重新整理',
    export: '匯出',
    import: '匯入'
  },
  menu: {
    home: '首頁',
    dashboard: '工作台',
    system: '系統管理',
    user: '使用者管理',
    role: '角色管理',
    menu: '選單管理',
    management: '選單管理',
    list: '選單列表',
    add: '新增選單',
    edit: '編輯選單',
    delete: '刪除選單',
    deleteConfirm: '確定刪除該選單及其所有子選單嗎？',
    moveUp: '上移',
    moveDown: '下移',
    form: {
      id: '選單ID',
      title: '選單標題',
      icon: '圖示',
      permissionCode: '頁面權限',
      permissions: '操作權限',
      parentMenu: '父級選單',
      menuType: '選單類型',
      hidden: '是否隱藏',
      hiddenMenu: '隱藏選單',
      bindNavigation: '綁定導航',
      bindNavigationPlaceholder: '請選擇綁定的父級選單',
      topNav: '頂部導航',
      sidebarNav: '側欄導航',
      sidebarDirectory: '側欄目錄',
      selectIcon: '選擇圖示',
      searchIcon: '搜尋圖示...',
      noIconFound: '未找到匹配的圖示'
    },
    message: {
      createSuccess: '建立成功',
      updateSuccess: '更新成功',
      deleteSuccess: '刪除成功',
      loadFailed: '載入選單列表失敗',
      orderUpdateSuccess: '選單順序更新成功'
    },
    validation: {
      idRequired: '請輸入選單ID',
      idFormat: 'ID只能包含字母、數字和中劃線',
      titleRequired: '請輸入選單標題',
      titleLength: '標題長度在1-50個字元之間',
      permissionCodeFormat: '權限碼格式: module:action',
      menuTypeRequired: '請選擇選單類型',
      parentRequired: '請選擇父級選單',
      bindNavigationRequired: '隱藏選單必須選擇綁定導航',
      bindNavigationInvalid: '指定的綁定父級選單不存在',
      circularReference: '不能將選單綁定到自身或其子選單',
      parentMenuHidden: '不能綁定到隱藏的父級選單'
    }
  },
  validation: {
    required: '此項為必填項',
    email: '請輸入正確的電子郵件地址',
    phone: '請輸入正確的手機號碼',
    minLength: '長度不能少於{min}個字元',
    maxLength: '長度不能超過{max}個字元'
  },
  login: {
    title: '中台管理系統',
    username: '請輸入使用者名稱',
    password: '請輸入密碼',
    rememberMe: '記住密碼',
    submit: '登入',
    loginSuccess: '登入成功',
    loginFailed: '登入失敗'
  },
  theme: {
    title: '主題設定',
    default: '預設藍',
    green: '清新綠',
    purple: '優雅紫'
  },
  language: {
    title: '語言設定',
    zhCN: '简体中文',
    enUS: 'English',
    zhTW: '繁體中文',
    jaJP: '日本語'
  },
  error: {
    403: '抱歉，您無權存取該頁面',
    404: '抱歉，您存取的頁面不存在',
    backHome: '返回首頁'
  }
}
