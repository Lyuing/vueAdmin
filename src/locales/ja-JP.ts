export default {
  common: {
    login: 'ログイン',
    logout: 'ログアウト',
    submit: '送信',
    cancel: 'キャンセル',
    confirm: '確認',
    delete: '削除',
    edit: '編集',
    add: '追加',
    search: '検索',
    reset: 'リセット',
    save: '保存',
    back: '戻る',
    close: '閉じる',
    refresh: '更新',
    export: 'エクスポート',
    import: 'インポート'
  },
  menu: {
    home: 'ホーム',
    dashboard: 'ダッシュボード',
    system: 'システム管理',
    user: 'ユーザー管理',
    role: 'ロール管理',
    menu: 'メニュー管理',
    management: 'メニュー管理',
    list: 'メニューリスト',
    add: 'メニュー追加',
    edit: 'メニュー編集',
    delete: 'メニュー削除',
    deleteConfirm: 'このメニューとすべてのサブメニューを削除してもよろしいですか？',
    moveUp: '上に移動',
    moveDown: '下に移動',
    form: {
      id: 'メニューID',
      title: 'メニュータイトル',
      icon: 'アイコン',
      permissionCode: 'ページ権限',
      permissions: '操作権限',
      parentMenu: '親メニュー',
      menuType: 'メニュータイプ',
      hidden: '非表示',
      hiddenMenu: '隠しメニュー',
      parentNavigation: 'マウントナビゲーション',
      parentNavigationPlaceholder: 'マウントする親メニューを選択してください',
      topNav: 'トップナビゲーション',
      sidebarNav: 'サイドバーナビゲーション',
      sidebarDirectory: 'サイドバーディレクトリ',
      selectIcon: 'アイコン選択',
      searchIcon: 'アイコンを検索...',
      noIconFound: '一致するアイコンが見つかりません'
    },
    message: {
      createSuccess: '作成に成功しました',
      updateSuccess: '更新に成功しました',
      deleteSuccess: '削除に成功しました',
      loadFailed: 'メニューリストの読み込みに失敗しました',
      orderUpdateSuccess: 'メニューの順序が正常に更新されました'
    },
    validation: {
      idRequired: 'メニューIDを入力してください',
      idFormat: 'IDは文字、数字、ハイフンのみ使用できます',
      titleRequired: 'メニュータイトルを入力してください',
      titleLength: 'タイトルの長さは1-50文字である必要があります',
      permissionCodeFormat: '権限コード形式: module:action',
      menuTypeRequired: 'メニュータイプを選択してください',
      parentRequired: '親メニューを選択してください',
      parentNavigationRequired: '隠しメニューはマウントナビゲーションを選択する必要があります',
      parentNavigationInvalid: '指定されたマウント親メニューが存在しません',
      circularReference: 'メニューを自分自身またはそのサブメニューにマウントできません',
      parentMenuHidden: '隠された親メニューにマウントできません'
    }
  },
  validation: {
    required: 'この項目は必須です',
    email: '正しいメールアドレスを入力してください',
    phone: '正しい電話番号を入力してください',
    minLength: '長さは{min}文字以上である必要があります',
    maxLength: '長さは{max}文字以下である必要があります'
  },
  login: {
    title: '管理システム',
    username: 'ユーザー名を入力してください',
    password: 'パスワードを入力してください',
    rememberMe: 'パスワードを記憶する',
    submit: 'ログイン',
    loginSuccess: 'ログインに成功しました',
    loginFailed: 'ログインに失敗しました'
  },
  theme: {
    title: 'テーマ設定',
    default: 'デフォルトブルー',
    green: 'フレッシュグリーン',
    purple: 'エレガントパープル'
  },
  language: {
    title: '言語設定',
    zhCN: '简体中文',
    enUS: 'English',
    zhTW: '繁體中文',
    jaJP: '日本語'
  },
  error: {
    403: '申し訳ございません。このページにアクセスする権限がありません',
    404: '申し訳ございません。お探しのページは存在しません',
    backHome: 'ホームに戻る'
  }
}
