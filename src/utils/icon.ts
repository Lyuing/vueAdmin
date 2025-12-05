import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import type { Component } from 'vue'

/**
 * 根据图标名称获取图标组件
 * @param iconName 图标名称
 * @returns 图标组件或 undefined
 */
export function getIconComponent(iconName?: string): Component | undefined {
  if (!iconName) return undefined
  return (ElementPlusIconsVue as Record<string, Component>)[iconName]
}

/**
 * 获取所有可用的图标名称列表
 * @returns 图标名称数组
 */
export function getAllIconNames(): string[] {
  return Object.keys(ElementPlusIconsVue)
}
