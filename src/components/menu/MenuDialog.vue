<template>
  <el-dialog :model-value="visible" :title="mode === 'create' ? t('menu.add') : t('menu.edit')" width="600px"
    :close-on-click-modal="false" @update:model-value="handleUpdateVisible" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item :label="t('menu.form.id')" prop="id">
        <el-input v-model="formData.id" :placeholder="t('menu.validation.idRequired')" :disabled="mode === 'edit'" />
      </el-form-item>

      <el-form-item :label="t('menu.form.title')" prop="title">
        <el-input v-model="formData.title" :placeholder="t('menu.validation.titleRequired')" />
      </el-form-item>

      <el-form-item :label="t('menu.form.icon')" prop="icon">
        <IconPicker v-model="formData.icon" />
      </el-form-item>

      <el-form-item :label="t('menu.form.permissionCode')" prop="permissionCode">
        <el-input v-model="formData.permissionCode" placeholder="system_menu:view" />
      </el-form-item>

      <el-form-item :label="t('menu.form.menuType')" prop="menuType">
        <el-radio-group v-model="formData.menuType">
          <el-radio value="top">{{ t('menu.form.topNav') }}</el-radio>
          <el-radio value="sidebar_nav">{{ t('menu.form.sidebarNav') }}</el-radio>
          <el-radio value="sidebar_directory">{{ t('menu.form.sidebarDirectory') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.menuType !== 'top'" :label="t('menu.form.parentMenu')" prop="parentId">
        <el-tree-select v-model="formData.parentId" :data="parentMenuOptions" :placeholder="t('menu.form.parentMenu')"
          clearable check-strictly :render-after-expand="false" node-key="id"
          :props="{ label: 'title', children: 'children' }" />
      </el-form-item>

      <el-form-item :label="t('menu.form.hidden')" prop="hidden">
        <el-switch v-model="formData.hidden" />
      </el-form-item>

      <!-- 绑定导航选择器 - 仅在隐藏菜单时显示 -->
      <el-form-item v-if="formData.hidden" :label="t('menu.form.bindNavigation')" prop="bindMenuId">
        <el-tree-select 
          v-model="formData.bindMenuId" 
          :data="bindNavigationOptions"
          :placeholder="t('menu.form.bindNavigationPlaceholder')" 
          clearable 
          check-strictly
          :render-after-expand="false" 
          node-key="value" 
          :props="{ label: 'label', children: 'children', value: 'value' }"
        />
        <div style="margin-top: 4px; font-size: 12px; color: var(--el-color-info);">
          选择隐藏菜单应该关联的父级菜单，用于面包屑导航和菜单激活
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import type { MenuConfig } from '@/types/navigation'
import { useNavigationStore } from '@/stores/navigation'
import IconPicker from './IconPicker.vue'

const { t } = useI18n()
const navigationStore = useNavigationStore()

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  menuData?: MenuConfig | null
  allMenus: MenuConfig[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: MenuConfig): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

interface MenuFormData extends Partial<MenuConfig> {
  parentId?: string
  bindMenuId?: string
}

const formRef = ref<FormInstance>()
const formData = ref<MenuFormData>({
  id: '',
  title: '',
  icon: undefined,
  permissionCode: undefined,
  parentId: undefined,
  bindMenuId: undefined,
  menuType: 'sidebar_nav',
  hidden: false,
  children: []
})

// 表单验证规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    id: [
      { required: true, message: t('menu.validation.idRequired'), trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9-]+$/,
        message: t('menu.validation.idFormat'),
        trigger: 'blur'
      }
    ],
    title: [
      { required: true, message: t('menu.validation.titleRequired'), trigger: 'blur' },
      { min: 1, max: 50, message: t('menu.validation.titleLength'), trigger: 'blur' }
    ],
    permissionCode: [
      {
        pattern: /^[a-z0-9_:]+$/,
        message: t('menu.validation.permissionCodeFormat'),
        trigger: 'blur'
      }
    ],
    menuType: [
      { required: true, message: t('menu.validation.menuTypeRequired'), trigger: 'change' }
    ]
  }

  // 如果不是顶部导航，父级菜单为必填
  if (formData.value.menuType !== 'top') {
    baseRules.parentId = [
      { required: true, message: t('menu.validation.parentRequired'), trigger: 'change' }
    ]
  }

  // 如果是隐藏菜单，绑定导航为必填
  if (formData.value.hidden) {
    baseRules.bindMenuId = [
      { required: true, message: t('menu.validation.bindNavigationRequired'), trigger: 'change' },
      { validator: validateBindMenuId, trigger: 'change' }
    ]
  }

  return baseRules
})

// 父级菜单选项
// 规则：
// - 顶部导航菜单：不能选择父级（是顶级菜单）
// - 侧栏导航：可选父级为顶部导航或侧栏目录
// - 侧栏目录：可选父级为顶部导航或侧栏目录
const parentMenuOptions = computed(() => {
  // 如果当前菜单是顶部导航，则不显示父级选项（返回空数组）
  if (formData.value.menuType === 'top') return []

  // 侧栏导航和侧栏目录：可选父级为顶部导航或侧栏目录
  const allowedParentPositions = ['top', 'sidebar_directory']
  // 构建可选的父级菜单树
  function buildParentOptions(menus: MenuConfig[]): MenuConfig[] {
    return menus
      .filter(menu => {
        // 排除自身及其后代
        if ( props.menuData?.id === menu.id) return false
        // 只保留允许的类型
        return allowedParentPositions.includes(menu.menuType)
      })
      .map(menu => {
        // 递归处理子菜单
        const children = menu.children ? buildParentOptions(menu.children) : []
        return {
          ...menu,
          children
        }
      })
  }
  return buildParentOptions(props.allMenus)
})

// 绑定导航选项 - 用于隐藏菜单选择绑定的其他菜单
const bindNavigationOptions = computed(() => {
  if (!formData.value.hidden) return []
  // 构建可选的绑定导航树（只包含可见菜单）
  function buildNavigationOptions(menus: MenuConfig[]): any[] {
    return menus
      .filter(menu => {
        // 排除自身（但在编辑模式下，如果当前菜单还没有ID，则不排除）
        if (props.menuData?.id && menu.id === props.menuData.id) {
          return false
        }
        
        // 如果是当前绑定的菜单，即使是隐藏的也要包含（用于回显）
        if (formData.value.bindMenuId && menu.id === formData.value.bindMenuId) {
          return true
        }
        
        // 排除隐藏菜单
        if (menu.hidden) {
          return false
        }
        return true
      })
      .map(menu => {
        const option = {
          value: menu.id,
          label: menu.title,
          disabled: !menu.menuType || menu.menuType === 'sidebar_directory',
          children: menu.children ? buildNavigationOptions(menu.children) : undefined
        }
        // 如果没有子选项，删除children属性
        if (!option.children || option.children.length === 0) {
          delete option.children
        }
        return option
      })
  }
  return buildNavigationOptions(props.allMenus)
})

// 监听菜单类型变化，清空父级菜单、绑定导航
watch(() => formData.value.menuType, (_newType, oldType) => {
  // 只有当用户主动切换菜单类型时才清空，避免初始化时清空
  if (oldType !== undefined) {
    // 如果切换到顶部导航，清空父级菜单
    formData.value.parentId = undefined
    formData.value.bindMenuId = undefined
  }
})

// 监听隐藏状态变化，清空绑定导航选择
watch(() => formData.value.hidden, (newHidden, oldHidden) => {
  // 只有当从隐藏变为显示时才清空绑定导航，避免初始化时清空
  if (oldHidden === true && newHidden === false) {
    formData.value.bindMenuId = undefined
  }
})

// 监听绑定导航选择变化，进行实时验证
watch(() => formData.value.bindMenuId, (newBindMenuId) => {
  if (newBindMenuId && formData.value.hidden) {
    // 延迟验证，避免在用户输入过程中频繁提示
    setTimeout(() => {
      formRef.value?.validateField('bindMenuId')
    }, 300)
  }
})

// 监听对话框打开，初始化表单数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initFormData()
  }
})

// 初始化表单数据
function initFormData() { 
  if (props.mode === 'edit' && props.menuData) {
    // 编辑模式：填充数据
    console.log('编辑模式：填充数据', {...props.menuData})
    formData.value = {
      id: props.menuData.id,
      title: props.menuData.title,
      icon: props.menuData.icon,
      permissionCode: props.menuData.permissionCode,
      parentId: props.menuData.parentId,
      bindMenuId: props.menuData.bindMenuId,
      menuType: props.menuData.menuType,
      hidden: props.menuData.hidden,
      children: props.menuData.children || []
    }
  } else {
    // 创建模式：重置表单
    formData.value = {
      id: '',
      title: '',
      icon: undefined,
      permissionCode: undefined,
      parentId: undefined,
      bindMenuId: undefined,
      menuType: 'sidebar_nav',
      hidden: false,
      children: []
    }
  }
  // 清除验证
  formRef.value?.clearValidate()
}
// 更新显示状态
function handleUpdateVisible(value: boolean) {
  emit('update:visible', value)
}

// 关闭对话框
function handleClose() {
  formRef.value?.resetFields()
}

// 取消
function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    valid && emit('save', formData.value as MenuConfig)
  })
}

/**
 * 校验
 */

// 验证器：验证绑定导航选择
function validateBindMenuId (_rule: any, value: string, callback: any) {
  if (!value || !formData.value.hidden) {
    callback()
    return
  }

  // 检查绑定的菜单是否存在
  const bindMenu = navigationStore.menuMap.get(value)
  if (!bindMenu) {
    callback(new Error(t('menu.validation.bindNavigationInvalid')))
    return
  }
  // TODO: 检查父级菜单是否隐藏
  // // 检查绑定的菜单是否隐藏
  // if (bindMenu.hidden) {
  //   callback(new Error(t('menu.validation.bindNavigationHidden')))
  //   return
  // }

  // 检查是否绑定到自己或自己的后代菜单上
  const children = props.menuData?.children || []
  if (formData.value.id === value || checkCircularReference(value, children)) {
    callback(new Error(t('menu.validation.circularReference')))
    return
  }

  callback()
}

// 校验循环引用
function checkCircularReference(bindMenuId: string, children: MenuConfig[]): MenuConfig | null {
  if (!children.length) {
    return null
  }
  const foundChild = children.find(child => {
    if ( child?.id === bindMenuId ) {
      return child
    } else if(child?.children?.length) {
      return checkCircularReference(bindMenuId, child?.children || [])
    } else {
      return null
    }
  })
  return foundChild || null
}

</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-form) {
  padding: 10px 0;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-tree-select) {
  width: 100%;
}

// 响应式布局
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;
  }

  :deep(.el-form) {
    .el-form-item__label {
      width: 80px !important;
    }
  }
}
</style>
