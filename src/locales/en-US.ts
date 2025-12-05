export default {
  common: {
    login: 'Login',
    logout: 'Logout',
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    save: 'Save',
    back: 'Back',
    close: 'Close',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
    show: 'Show',
    hide: 'Hide',
    actions: 'Actions',
    saveFailed: 'Save failed, please try again',
    deleteFailed: 'Delete failed, please try again'
  },
  menu: {
    home: 'Home',
    dashboard: 'Dashboard',
    system: 'System',
    user: 'User Management',
    role: 'Role Management',
    menu: 'Menu Management',
    management: 'Menu Management',
    list: 'Menu List',
    add: 'Add Menu',
    edit: 'Edit Menu',
    delete: 'Delete Menu',
    deleteConfirm: 'Are you sure to delete this menu and all its submenus?',
    form: {
      id: 'Menu ID',
      title: 'Title',
      icon: 'Icon',
      permissionCode: 'Permission Code',
      parentMenu: 'Parent Menu',
      position: 'Position',
      order: 'Order',
      hidden: 'Hidden',
      topNav: 'Top Navigation',
      sidebar: 'Sidebar',
      selectIcon: 'Select Icon',
      searchIcon: 'Search icons...',
      noIconFound: 'No matching icons found'
    },
    message: {
      createSuccess: 'Created successfully',
      updateSuccess: 'Updated successfully',
      deleteSuccess: 'Deleted successfully',
      loadFailed: 'Failed to load menu list'
    },
    validation: {
      idRequired: 'Please enter menu ID',
      idFormat: 'ID can only contain letters, numbers and hyphens',
      titleRequired: 'Please enter menu title',
      titleLength: 'Title length should be between 1-50 characters',
      permissionCodeFormat: 'Permission code format: module:action or module:submodule:action',
      positionRequired: 'Please select menu position',
      parentRequired: 'Please select parent menu',
      orderRequired: 'Please enter order value',
      orderRange: 'Order value range: 0-9999'
    }
  },
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    minLength: 'Length cannot be less than {min} characters',
    maxLength: 'Length cannot exceed {max} characters'
  },
  login: {
    title: 'Admin System',
    username: 'Please enter username',
    password: 'Please enter password',
    rememberMe: 'Remember me',
    submit: 'Login',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed'
  },
  theme: {
    title: 'Theme Settings',
    default: 'Default Blue',
    green: 'Fresh Green',
    purple: 'Elegant Purple'
  },
  language: {
    title: 'Language Settings',
    zhCN: '简体中文',
    enUS: 'English',
    zhTW: '繁體中文',
    jaJP: '日本語'
  },
  error: {
    403: 'Sorry, you do not have permission to access this page',
    404: 'Sorry, the page you visited does not exist',
    backHome: 'Back Home'
  }
}
