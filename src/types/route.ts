import type { Component } from 'vue'

export interface RouteMeta extends Record<string | symbol, any> {
  title: string
  icon?: string
  requiresAuth: boolean
  permissionCode?: string
  permissions?: string[]
  roles?: string[]
  hidden?: boolean
  keepAlive?: boolean
  parent?: string
  affix?: boolean
  breadcrumb?: boolean
  hideInTopNav?: boolean
}

export interface RouteConfig {
  path: string
  name: string
  component: Component | (() => Promise<Component>)
  meta: RouteMeta
  children?: RouteConfig[]
  redirect?: string
}
