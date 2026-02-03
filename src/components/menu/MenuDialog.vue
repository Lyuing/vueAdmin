<template>
  <el-dialog
    :model-value="visible"
    :title="isEditMode ? t('menu.edit') : t('menu.add')"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item v-if="isEditMode" :label="t('menu.id')" prop="id">
        <el-input v-model="formData.id" :placeholder="t('menu.idPlaceholder')" disabled />
      </el-form-item>

      <el-form-item :label="t('menu.title')" prop="title">
        <el-input v-model.trim="formData.title" :placeholder="t('menu.titlePlaceholder')" />
      </el-form-item>

      <el-form-item :label="t('menu.icon')" prop="icon">
        <IconPicker v-model="formData.icon" />
      </el-form-item>

      <el-form-item :label="t('menu.permissionCode')" prop="permissionCode">
        <el-input
          v-model.trim="formData.permissionCode"
          :maxlength="20"
          :placeholder="`menu:module`"
          :disabled="isEditMode"
        />
      </el-form-item>

      <el-form-item :label="t('menu.menuType')" prop="menuType">
        <el-radio-group v-model="formData.menuType" @change="handleMenuTypeChange">
          <el-radio value="top">{{ t('menu.topNav') }}</el-radio>
          <el-radio value="sidebar_nav">{{ t('menu.sidebarNav') }}</el-radio>
          <el-radio value="sidebar_directory">{{ t('menu.sidebarDirectory') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="formData.menuType !== 'top'"
        :label="t('menu.parentMenu')"
        prop="parentId"
      >
        <el-tree-select
          v-model="formData.parentId"
          :data="parentMenuOptions"
          :placeholder="t('menu.parentMenu')"
          clearable
          check-strictly
          :render-after-expand="false"
          node-key="id"
          :props="{ label: 'title', children: 'children' }"
        />
        <div class="form-item-tip">{{ t('menu.parentNavigationTip') }}</div>
      </el-form-item>

      <el-form-item :label="t('menu.hidden')" prop="hidden">
        <el-switch v-model="formData.hidden" @change="handleHiddenChange" />
      </el-form-item>

      <!-- keepAlive 配置 - 仅对页面类型菜单显示 -->
      <el-form-item v-if="isPageMenu" :label="t('menu.keepAlive')" prop="keepAlive">
        <div class="form-line-with-tip">
          <el-switch v-model="formData.keepAlive" />
          <span class="form-item-tip">{{ t('menu.keepAliveTip') }}</span>
        </div>
      </el-form-item>

      <!-- 绑定导航选择器 - 仅在隐藏菜单时显示 -->
      <el-form-item
        v-if="formData.hidden && formData.menuType !== 'top'"
        :label="t('menu.bindNavigation')"
        prop="bindMenuId"
      >
        <el-tree-select
          v-model="formData.bindMenuId"
          :data="bindNavigationOptions"
          :placeholder="t('menu.bindNavigationPlaceholder')"
          clearable
          check-strictly
          :render-after-expand="false"
          node-key="value"
          :props="{ label: 'label', children: 'children', value: 'value' }"
        />
        <div class="form-item-tip">{{ t('menu.bindNavigationTip') }}</div>
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
  menuData?: MenuFormData | null
  allMenus: MenuConfig[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: MenuConfig): void
  (e: 'create', data: MenuConfig): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

interface MenuFormData extends Partial<MenuConfig> {
  parentId?: number
  bindMenuId?: number
  keepAlive?: boolean
  permissionId?: number
}

const FORM_DATA_RAW = {
  id: undefined,
  title: '',
  icon: undefined,
  permissionCode: undefined,
  permissionId: undefined,
  parentId: undefined,
  bindMenuId: undefined,
  menuType: undefined,
  hidden: false,
  keepAlive: false,
  children: []
}
const formRef = ref<FormInstance>()
const formData = ref<MenuFormData>({
  ...FORM_DATA_RAW
})

// 判断是否为页面类型菜单
const isPageMenu = computed(() => {
  return formData.value.menuType === 'top' || formData.value.menuType === 'sidebar_nav'
})

const isEditMode = computed(() => {
  return props.mode === 'edit'
})

// 表单验证规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    id: [
      { required: true, message: t('validation.required'), trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9-]+$/,
        message: t('validation.menuIdFormat'),
        trigger: 'blur'
      }
    ],
    title: [
      { required: true, message: t('validation.required'), trigger: 'blur' },
      { min: 1, max: 50, message: t('validation.menuTitleLength'), trigger: 'blur' }
    ],
    permissionCode: [
      { required: true, message: t('validation.required'), trigger: 'blur' },
      {
        pattern: /^menu:[a-z0-9_:]+$/,
        message: t('validation.menuPermissionCodeFormat'),
        trigger: 'blur'
      }
    ],
    menuType: [{ required: true, message: t('validation.menuTypeRequired'), trigger: 'change' }]
  }

  // 如果不是顶部导航，父级菜单为必填
  if (formData.value.menuType !== 'top') {
    baseRules.parentId = [
      { required: true, message: t('validation.menuParentRequired'), trigger: 'change' }
    ]
  }

  // 如果是隐藏菜单，绑定导航为必填
  if (formData.value.hidden) {
    baseRules.bindMenuId = [
      { required: true, message: t('validation.menuBindNavigationRequired'), trigger: 'change' },
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
const parentMenuOptions = ref<MenuConfig[]>([])
const getParentMenuOptions = () => {
  // 如果当前菜单是顶部导航，则不显示父级选项（返回空数组）
  // if (formData.value.menuType === 'top') return []

  // 侧栏导航和侧栏目录：可选父级为顶部导航或侧栏目录
  const allowedParentPositions = ['top', 'sidebar_directory']
  // 构建可选的父级菜单树
  function buildParentOptions(menus: MenuConfig[]): MenuConfig[] {
    return menus
      .filter(menu => {
        // 排除自身及其后代
        if (props.menuData?.id === menu.id) return false
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
  const parentOptions = buildParentOptions(props.allMenus)
  // console.log('--- 父级菜单节点树：', parentOptions)
  return parentOptions
}

// 绑定导航选项
// 用于隐藏菜单选择绑定的其他菜单
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

        // // 排除隐藏菜单
        // if (menu.hidden) {
        //   return false
        // }
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

// 监听菜单类型变化，清空父级菜单、绑定导航，处理 keepAlive 字段
function handleMenuTypeChange(value: string) {
  formData.value.parentId = undefined
  formData.value.bindMenuId = undefined
  // 切换为侧栏目录时，清空 keepAlive 字段
  if (value === 'sidebar_directory') {
    formData.value.keepAlive = false
  }
}

// 监听隐藏状态变化，清空绑定导航选择
function handleHiddenChange(value: boolean) {
  // 切换为显示时 清空绑定导航
  if (!value) {
    formData.value.bindMenuId = undefined
  }
}

// 监听对话框打开，初始化表单数据
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      initFormData()
      parentMenuOptions.value = getParentMenuOptions()
    }
  }
)

// 初始化表单数据
function initFormData() {
  if (isEditMode.value && props.menuData) {
    // 编辑模式：填充数据
    console.log('编辑模式：填充数据', { ...props.menuData })
    formData.value = {
      id: props.menuData.id,
      title: props.menuData.title,
      icon: props.menuData.icon,
      permissionCode: props.menuData.permissionCode,
      permissionId: props.menuData.permissionId,
      parentId: props.menuData.parentId,
      bindMenuId: props.menuData.bindMenuId,
      menuType: props.menuData.menuType,
      hidden: props.menuData.hidden,
      keepAlive: props.menuData.keepAlive,
      children: props.menuData.children || [],
      sort: props.menuData.sort
    }
  } else {
    // 创建模式：重置表单
    formData.value = {
      ...FORM_DATA_RAW
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
  await formRef.value.validate(valid => {
    if (!valid) return
    isEditMode.value
      ? emit('save', formData.value as MenuConfig)
      : emit('create', formData.value as MenuConfig)
  })
}

/**
 * 校验
 */

// 验证器：验证绑定导航选择
function validateBindMenuId(_rule: any, value: string, callback: any) {
  if (!value || !formData.value.hidden) {
    callback()
    return
  }

  const numericValue = Number(value)

  // 检查绑定的菜单是否存在
  const bindMenu = navigationStore.menuMap.get(numericValue)
  if (!bindMenu) {
    callback(new Error(t('validation.menuBindNavigationInvalid')))
    return
  }
  // TODO: 检查父级菜单是否隐藏
  // // 检查绑定的菜单是否隐藏
  // if (bindMenu.hidden) {
  //   return
  // }

  // 检查是否绑定到自己或自己的后代菜单上
  const children = props.menuData?.children || []
  if (formData.value.id === numericValue || checkCircularReference(numericValue, children)) {
    callback(new Error(t('validation.menuCircularReference')))
    return
  }

  callback()
}

// 校验循环引用
function checkCircularReference(bindMenuId: number, children: MenuConfig[]): MenuConfig | null {
  if (!children.length) {
    return null
  }
  const foundChild = children.find(child => {
    if (child?.id === bindMenuId) {
      return child
    } else if (child?.children?.length) {
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

.form-line-with-tip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-item-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-info);
  line-height: 1.5;
}

.form-line-with-tip .form-item-tip {
  margin-top: 0;
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
