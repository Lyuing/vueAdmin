/**
 * 菜单挂载关系验证工具
 * 用于验证菜单配置的正确性和挂载关系的有效性
 */

import type { MenuConfig } from '@/types/navigation'
import {
  validateMenuMounting,
  isCircularReference,
  findMenuByPermissionCode,
  recoverFromMenuErrors
} from '@/utils/menu-utils'

/**
 * 验证结果接口
 */
interface ValidationReport {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fixedMenus?: MenuConfig[]
}

/**
 * 验证菜单配置的完整性
 * @param menus 菜单配置列表
 * @returns 验证报告
 */
export function validateMenuConfiguration(menus: MenuConfig[]): ValidationReport {
  const errors: string[] = []
  const warnings: string[] = []
  
  console.log('🔍 开始验证菜单配置...')
  
  // 验证基础字段
  validateBasicFields(menus, errors)
  
  // 验证挂载关系
  validateMountingRelationships(menus, errors, warnings)
  
  // 验证权限码唯一性
  validatePermissionCodeUniqueness(menus, errors)
  
  // 验证菜单ID唯一性
  validateMenuIdUniqueness(menus, errors)
  
  const isValid = errors.length === 0
  
  // 如果有错误，尝试自动修复
  let fixedMenus: MenuConfig[] | undefined
  if (!isValid) {
    console.log('🔧 尝试自动修复菜单配置错误...')
    fixedMenus = recoverFromMenuErrors(menus)
    
    // 重新验证修复后的菜单
    const fixedReport = validateMenuConfiguration(fixedMenus)
    if (fixedReport.isValid) {
      console.log('✅ 菜单配置已自动修复')
    } else {
      console.log('❌ 自动修复失败，仍存在错误')
    }
  }
  
  return {
    isValid,
    errors,
    warnings,
    fixedMenus
  }
}

/**
 * 验证基础字段
 */
function validateBasicFields(menus: MenuConfig[], errors: string[]): void {
  function traverse(items: MenuConfig[], path: string = '') {
    items.forEach((menu, index) => {
      const currentPath = `${path}[${index}]`
      
      if (!menu.id) {
        errors.push(`${currentPath}: 菜单ID不能为空`)
      }
      
      if (!menu.title) {
        errors.push(`${currentPath}: 菜单标题不能为空`)
      }
      
      if (!['top', 'sidebar_nav', 'sidebar_directory'].includes(menu.menuType)) {
        errors.push(`${currentPath}: 无效的菜单类型: ${menu.menuType}`)
      }
      
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children, `${currentPath}.children`)
      }
    })
  }
  
  traverse(menus)
}

/**
 * 验证挂载关系
 */
function validateMountingRelationships(menus: MenuConfig[], errors: string[], warnings: string[]): void {
  function traverse(items: MenuConfig[], path: string = '') {
    items.forEach((menu, index) => {
      const currentPath = `${path}[${index}]`
      
      if (menu.hidden && menu.parentMenuCode) {
        // 验证挂载关系
        const validation = validateMenuMounting(menu, menus)
        if (!validation.valid) {
          errors.push(`${currentPath}: ${validation.error}`)
        }
        
        // 检查循环引用
        if (menu.permissionCode && isCircularReference(menu.permissionCode, menu.parentMenuCode, menus)) {
          errors.push(`${currentPath}: 检测到循环引用`)
        }
        
        // 检查父级菜单是否存在
        const parentMenu = findMenuByPermissionCode(menu.parentMenuCode, menus)
        if (!parentMenu) {
          errors.push(`${currentPath}: 挂载的父级菜单不存在: ${menu.parentMenuCode}`)
        } else if (parentMenu.hidden) {
          warnings.push(`${currentPath}: 挂载到隐藏的父级菜单: ${menu.parentMenuCode}`)
        }
      }
      
      // 检查隐藏菜单是否有挂载关系
      if (menu.hidden && !menu.parentMenuCode) {
        warnings.push(`${currentPath}: 隐藏菜单建议设置挂载关系`)
      }
      
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children, `${currentPath}.children`)
      }
    })
  }
  
  traverse(menus)
}

/**
 * 验证权限码唯一性
 */
function validatePermissionCodeUniqueness(menus: MenuConfig[], errors: string[]): void {
  const permissionCodes = new Map<string, string[]>()
  
  function traverse(items: MenuConfig[], path: string = '') {
    items.forEach((menu, index) => {
      const currentPath = `${path}[${index}]`
      
      if (menu.permissionCode) {
        if (!permissionCodes.has(menu.permissionCode)) {
          permissionCodes.set(menu.permissionCode, [])
        }
        permissionCodes.get(menu.permissionCode)!.push(currentPath)
      }
      
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children, `${currentPath}.children`)
      }
    })
  }
  
  traverse(menus)
  
  // 检查重复的权限码
  permissionCodes.forEach((paths, code) => {
    if (paths.length > 1) {
      errors.push(`权限码重复: ${code} 出现在: ${paths.join(', ')}`)
    }
  })
}

/**
 * 验证菜单ID唯一性
 */
function validateMenuIdUniqueness(menus: MenuConfig[], errors: string[]): void {
  const menuIds = new Map<string, string[]>()
  
  function traverse(items: MenuConfig[], path: string = '') {
    items.forEach((menu, index) => {
      const currentPath = `${path}[${index}]`
      
      if (!menuIds.has(menu.id)) {
        menuIds.set(menu.id, [])
      }
      menuIds.get(menu.id)!.push(currentPath)
      
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children, `${currentPath}.children`)
      }
    })
  }
  
  traverse(menus)
  
  // 检查重复的菜单ID
  menuIds.forEach((paths, id) => {
    if (paths.length > 1) {
      errors.push(`菜单ID重复: ${id} 出现在: ${paths.join(', ')}`)
    }
  })
}

/**
 * 生成验证报告
 */
export function generateValidationReport(report: ValidationReport): string {
  let output = '📋 菜单配置验证报告\n'
  output += '='.repeat(50) + '\n\n'
  
  if (report.isValid) {
    output += '✅ 验证通过：菜单配置正确\n'
  } else {
    output += '❌ 验证失败：发现以下问题\n\n'
    
    if (report.errors.length > 0) {
      output += '🚨 错误：\n'
      report.errors.forEach((error, index) => {
        output += `  ${index + 1}. ${error}\n`
      })
      output += '\n'
    }
  }
  
  if (report.warnings.length > 0) {
    output += '⚠️  警告：\n'
    report.warnings.forEach((warning, index) => {
      output += `  ${index + 1}. ${warning}\n`
    })
    output += '\n'
  }
  
  if (report.fixedMenus) {
    output += '🔧 已生成修复后的菜单配置\n'
  }
  
  return output
}

/**
 * 测试挂载关系的各种场景
 */
export function testMountingScenarios(): boolean {
  console.log('🧪 测试挂载关系各种场景...')
  
  // 测试场景1：正常挂载
  const normalCase: MenuConfig[] = [
    {
      id: 'parent',
      title: '父级菜单',
      permissionCode: 'parent',
      menuType: 'top',
      hidden: false,
      children: []
    },
    {
      id: 'child',
      title: '子级菜单',
      permissionCode: 'child',
      menuType: 'sidebar_nav',
      hidden: true,
      parentMenuCode: 'parent',
      children: []
    }
  ]
  
  const normalReport = validateMenuConfiguration(normalCase)
  if (!normalReport.isValid) {
    console.error('❌ 正常挂载场景验证失败')
    return false
  }
  
  // 测试场景2：循环引用
  const circularCase: MenuConfig[] = [
    {
      id: 'menu1',
      title: '菜单1',
      permissionCode: 'menu1',
      menuType: 'top',
      hidden: true,
      parentMenuCode: 'menu2',
      children: []
    },
    {
      id: 'menu2',
      title: '菜单2',
      permissionCode: 'menu2',
      menuType: 'sidebar_nav',
      hidden: true,
      parentMenuCode: 'menu1',
      children: []
    }
  ]
  
  const circularReport = validateMenuConfiguration(circularCase)
  if (circularReport.isValid) {
    console.error('❌ 循环引用检测失败')
    return false
  }
  
  // 测试场景3：挂载到不存在的菜单
  const nonExistentCase: MenuConfig[] = [
    {
      id: 'child',
      title: '子级菜单',
      permissionCode: 'child',
      menuType: 'sidebar_nav',
      hidden: true,
      parentMenuCode: 'non_existent',
      children: []
    }
  ]
  
  const nonExistentReport = validateMenuConfiguration(nonExistentCase)
  if (nonExistentReport.isValid) {
    console.error('❌ 不存在父级菜单检测失败')
    return false
  }
  
  console.log('✅ 挂载关系场景测试通过')
  return true
}

/**
 * 运行完整的挂载关系验证
 */
export function runMountingValidation(): boolean {
  console.log('🚀 开始挂载关系功能验证...')
  
  const tests = [
    testMountingScenarios
  ]
  
  let allPassed = true
  
  for (const test of tests) {
    try {
      const result = test()
      if (!result) {
        allPassed = false
      }
    } catch (error) {
      console.error('❌ 验证执行失败：', error)
      allPassed = false
    }
  }
  
  if (allPassed) {
    console.log('🎉 挂载关系功能验证通过！')
  } else {
    console.log('💥 挂载关系功能验证失败，请检查实现')
  }
  
  return allPassed
}