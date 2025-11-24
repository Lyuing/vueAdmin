export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  name: string
  parent?: string
  children?: MenuItem[]
  permissions?: string[]
  hidden?: boolean
  order?: number
  level: number
}

export interface SidebarState {
  collapsed: boolean
  openedMenus: string[]
}
