<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? t('user.add') : t('user.edit')"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item :label="t('basic.username')" prop="username">
        <el-input
          v-model.trim="formData.username"
          :placeholder="t('user.pleaseInputUsername')"
          :disabled="mode === 'edit'"
        />
      </el-form-item>
      <el-form-item :label="t('basic.realName')" prop="realName">
        <el-input v-model="formData.realName" :placeholder="t('user.pleaseInputRealName')" />
      </el-form-item>
      <el-form-item v-if="mode === 'create'" :label="t('basic.password')" prop="password">
        <el-input
          v-model.trim="formData.password"
          :placeholder="t('user.pleaseInputPassword')"
          :maxlength="30"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item :label="t('basic.phone')" prop="phone">
        <el-input v-model.trim="formData.phone" :placeholder="t('user.pleaseInputPhone')" />
      </el-form-item>

      <!-- <el-form-item :label="t('basic.department')" prop="departmentId">
        <el-tree-select
          v-model="formData.departmentId"
          :data="regionTree"
          :placeholder="t('user.pleaseSelectDepartment')"
          clearable
          check-strictly
          :render-after-expand="false"
          node-key="id"
          :props="{ label: 'name', children: 'children' }"
        />
      </el-form-item> -->

      <el-form-item :label="t('basic.role')" prop="roleIds">
        <el-select
          v-model="formData.roleIds"
          multiple
          :placeholder="t('user.pleasePickRoles')"
          style="width: 100%"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
            :disabled="role.disabled"
          >
            <p class="flex items-center justify-between w-full">
              {{ role.name }}
              <el-tag :type="role.roleType === RoleType.SYSTEM ? 'info' : 'primary'">
                {{
                  role.roleType === RoleType.SYSTEM ? t('role.systemRole') : t('role.customRole')
                }}
              </el-tag>
            </p>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button :loading="rsaLoading" type="primary" @click="handleSubmit">{{
        t('common.confirm')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { type FormInstance, type FormRules, ElMessage } from 'element-plus'
import type { User } from '@/types/user'
import { type Role, RoleType } from '@/types/role'
import type { Region } from '@/types/region'

import { useRsa } from '@/composables/useRsa'

const { t } = useI18n()
// 使用 useRsa hook
const { isLoading: rsaLoading, error: rsaError, initializeRsa, encryptPassword } = useRsa()

interface Props {
  visible: boolean
  mode: 'create' | 'edit'
  userData?: User | null
  roleList: Role[]
  regionTree: Region[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: Partial<User>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = ref<Partial<User> & { roleIds: number[] }>({
  username: '',
  roleIds: []
})

// 角色选项
const roleOptions = computed(() => {
  const checked = formData.value.roleIds[0]
  const checkRoleType = props.roleList.find(item => item.id === checked)?.roleType || ''
  const options = props.roleList.map(item => ({
    ...item,
    disabled: !!(checkRoleType && item.roleType !== checkRoleType)
  }))
  return options
})

// 表单验证规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    username: [
      { required: true, message: t('validation.usernameRequired'), trigger: 'blur' },
      { min: 3, max: 20, message: t('validation.usernameLength'), trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: t('validation.usernameFormat'), trigger: 'blur' }
    ],
    realName: [
      { required: true, message: t('validation.realNameRequired'), trigger: 'blur' },
      { min: 2, max: 20, message: t('validation.realNameLength'), trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
        message: t('validation.realNameFormat'),
        trigger: 'blur'
      }
    ],
    phone: [{ pattern: /^1[3456789]\d{9}$/, message: t('validation.phone'), trigger: 'blur' }],
    departmentId: [
      { required: true, message: t('validation.departmentRequired'), trigger: 'change' }
    ],
    roleIds: [
      {
        required: true,
        message: t('validation.rolesRequired'),
        trigger: 'change',
        type: 'array',
        min: 1
      }
    ]
  }
  if (props.mode === 'create') {
    baseRules.password = [
      { required: true, message: t('validation.passwordRequired'), trigger: 'blur' },
      { min: 6, max: 30, message: t('validation.passwordLength'), trigger: 'blur' }
    ]
  }
  return baseRules
})

// 监听对话框打开，初始化表单数据
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      if (props.mode === 'edit' && props.userData) {
        // 编辑模式：填充数据
        formData.value = {
          id: props.userData.id,
          username: props.userData.username,
          realName: props.userData.realName,
          phone: props.userData.phone,
          departmentId: props.userData.departmentId && Number(props.userData.departmentId),
          roleIds: props.userData.roles?.map(role => Number(role.id)) || []
        }
      } else {
        // 创建模式：重置表单
        formData.value = {
          username: '',
          realName: '',
          phone: '',
          departmentId: undefined,
          roleIds: []
        }
      }
      // 清除验证
      setTimeout(() => {
        formRef.value?.clearValidate()
      }, 0)
    }
  }
)

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
  // console.log('提交表单数据:', formData.value)
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (!valid) return
    if (props.mode === 'edit') {
      // 编辑模式下，不传递密码字段
      emit('save', { ...formData.value })
      return
    }
    // 密码加密
    const { encryptedData, clientId } = (await handleEncryption(formData.value.password!)) || {}
    if (!encryptedData || !clientId) return
    const formDto = {
      ...formData.value,
      password: encryptedData,
      clientId
    }
    emit('save', formDto)
  })
}
// 密码加密
async function handleEncryption(password: string): Promise<{
  encryptedData: string
  clientId: string
} | null> {
  const success = await initializeRsa()
  if (!success) {
    // const errorMsg = rsaError.value || t('login.getRsaKeyFailed')
    // ElMessage.error(errorMsg)
    console.error('RSA 初始化失败:', rsaError.value)
    return null
  }

  const encryptedResult = await encryptPassword(password)
  if (!encryptedResult) {
    // const errorMsg = rsaError.value || t('login.encryptFailed')
    // ElMessage.error(errorMsg)
    console.error('密码加密失败:', rsaError.value)
    return null
  }

  return encryptedResult || null
}
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.el-form) {
  padding: 10px 0;
}

:deep(.el-form-item) {
  margin-bottom: 22px;

  .el-form-item__label {
    font-weight: 500;
  }
}

:deep(.el-select) {
  width: 100%;
}

// 响应式布局
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;
  }

  :deep(.el-form-item__label) {
    width: 80px !important;
  }
}
</style>
