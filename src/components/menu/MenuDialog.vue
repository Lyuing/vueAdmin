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
        <el-input v-model="formData.permissionCode" placeholder="system_menu:view" disabled />
      </el-form-item>

      <el-form-item :label="t('menu.form.position')" prop="position">
        <el-radio-group v-model="formData.position">
          <el-radio value="top">{{ t('menu.form.topNav') }}</el-radio>
          <el-radio value="sidebar_nav">{{ t('menu.form.sidebarNav') }}</el-radio>
          <el-radio value="sidebar_directory">{{ t('menu.form.sidebarDirectory') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.position !== 'top'" :label="t('menu.form.parentMenu')" prop="parentId">
        <el-tree-select v-model="formData.parentId" :data="parentMenuOptions" :placeholder="t('menu.form.parentMenu')"
          clearable check-strictly :render-after-expand="false" node-key="id"
          :props="{ label: 'title', children: 'children' }" />
      </el-form-item>

      <el-form-item :label="t('menu.form.hidden')" prop="hidden">
        <el-switch v-model="formData.hidden" />
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
import IconPicker from './IconPicker.vue'

const { t } = useI18n()

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
}

const formRef = ref<FormInstance>()
const formData = ref<MenuFormData>({
  id: '',
  title: '',
  icon: undefined,
  permissionCode: undefined,
  parentId: undefined,
  position: 'sidebar_nav',
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
    position: [
      { required: true, message: t('menu.validation.positionRequired'), trigger: 'change' }
    ]
  }

  // 如果不是顶部导航，父级菜单为必填
  if (formData.value.position !== 'top') {
    baseRules.parentId = [
      { required: true, message: t('menu.validation.parentRequired'), trigger: 'change' }
    ]
  }

  return baseRules
})

// 获取所有子菜单ID（包括自身）
function getDescendantIds(menu: MenuConfig): string[] {
  const ids = [menu.id]
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach(child => {
      ids.push(...getDescendantIds(child))
    })
  }
  return ids
}

// 父级菜单选项
// 规则：
// - 顶部导航菜单：不能选择父级（是顶级菜单）
// - 侧栏导航：可选父级为顶部导航或侧栏目录
// - 侧栏目录：可选父级为顶部导航或侧栏目录
const parentMenuOptions = computed(() => {
  // 如果当前菜单是顶部导航，则不显示父级选项（返回空数组）
  if (formData.value.position === 'top') {
    return []
  }

  // 获取需要排除的菜单ID列表（自身及其后代）
  const excludeIds = props.mode === 'edit' && props.menuData
    ? getDescendantIds(props.menuData)
    : []

  // 侧栏导航和侧栏目录：可选父级为顶部导航或侧栏目录
  const allowedParentPositions = ['top', 'sidebar_directory']

  // 构建可选的父级菜单树
  function buildParentOptions(menus: MenuConfig[]): MenuConfig[] {
    return menus
      .filter(menu => {
        // 排除自身及其后代
        if (excludeIds.includes(menu.id)) return false
        // 只保留允许的位置类型
        return allowedParentPositions.includes(menu.position)
      })
      .map(menu => {
        // 递归处理子菜单
        const children = menu.children ? filterChildren(menu.children) : []
        return {
          ...menu,
          children
        }
      })
  }

  // 过滤子菜单，排除自身及其后代，保留允许的位置类型
  function filterChildren(children: MenuConfig[]): MenuConfig[] {
    return children
      .filter(child => {
        if (excludeIds.includes(child.id)) return false
        return allowedParentPositions.includes(child.position)
      })
      .map(child => ({
        ...child,
        children: child.children ? filterChildren(child.children) : []
      }))
  }

  return buildParentOptions(props.allMenus)
})

// 监听位置变化，清空父级菜单选择
watch(() => formData.value.position, (newPosition) => {
  // 如果切换到顶部导航，清空父级菜单
  if (newPosition === 'top') {
    formData.value.parentId = undefined
  }
})

// 从菜单树中查找指定菜单的父级ID
function findParentId(menus: MenuConfig[], targetId: string, parentId?: string): string | undefined {
  for (const menu of menus) {
    if (menu.id === targetId) {
      return parentId
    }
    if (menu.children && menu.children.length > 0) {
      const found = findParentId(menu.children, targetId, menu.id)
      if (found !== undefined) {
        return found
      }
    }
  }
  return undefined
}

// 监听对话框打开，初始化表单数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.mode === 'edit' && props.menuData) {
      // 编辑模式：填充数据
      // 从树结构中查找父级ID
      const parentId = findParentId(props.allMenus, props.menuData.id)

      formData.value = {
        id: props.menuData.id,
        title: props.menuData.title,
        icon: props.menuData.icon,
        permissionCode: props.menuData.permissionCode,
        parentId: parentId,
        position: props.menuData.position,
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
        position: 'sidebar_nav',
        hidden: false,
        children: []
      }
    }
    // 清除验证
    formRef.value?.clearValidate()
  }
})

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
    if (valid) {
      // 保留 parentId，由父组件处理树形结构
      emit('save', formData.value as MenuConfig & { parentId?: string })
    }
  })
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
