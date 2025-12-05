<template>
  <div class="icon-picker">
    <el-input :model-value="modelValue" :placeholder="t('menu.form.selectIcon')" readonly @click="dialogVisible = true">
      <template #prefix>
        <el-icon v-if="modelValue">
          <component :is="getIcon(modelValue)" />
        </el-icon>
      </template>
      <template #suffix>
        <el-icon v-if="modelValue" class="clear-icon" @click.stop="handleClear">
          <Close />
        </el-icon>
        <el-icon v-else>
          <Search />
        </el-icon>
      </template>
    </el-input>

    <el-dialog v-model="dialogVisible" :title="t('menu.form.selectIcon')" width="800px" :close-on-click-modal="false">
      <div class="icon-picker-dialog">
        <el-input v-model="searchText" :placeholder="t('menu.form.searchIcon')" clearable class="search-input">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <div class="icon-list">
          <div v-for="icon in filteredIcons" :key="icon" class="icon-item" :class="{ active: modelValue === icon }"
            @click="handleSelect(icon)">
            <el-icon :size="24">
              <component :is="getIcon(icon)" />
            </el-icon>
            <span class="icon-name">{{ icon }}</span>
          </div>
        </div>

        <el-empty v-if="filteredIcons.length === 0" :description="t('menu.form.noIconFound')" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Close, Search } from '@element-plus/icons-vue'
import { getAllIconNames, getIconComponent } from '@/utils/icon'

const { t } = useI18n()

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string | undefined): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = ref(false)
const searchText = ref('')

// 获取所有图标名称
const allIcons = getAllIconNames()

// 获取图标组件
const getIcon = (iconName?: string) => {
  return getIconComponent(iconName)
}

// 过滤图标
const filteredIcons = computed(() => {
  if (!searchText.value) {
    return allIcons
  }
  const search = searchText.value.toLowerCase()
  return allIcons.filter(icon => icon.toLowerCase().includes(search))
})

// 选择图标
function handleSelect(icon: string) {
  emit('update:modelValue', icon)
  dialogVisible.value = false
  searchText.value = ''
}

// 清空图标
function handleClear() {
  emit('update:modelValue', undefined)
}
</script>

<style scoped lang="scss">
.icon-picker {
  width: 100%;

  :deep(.el-input) {
    cursor: pointer;

    .el-input__wrapper {
      cursor: pointer;
    }
  }

  .clear-icon {
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.icon-picker-dialog {
  .search-input {
    margin-bottom: 20px;
  }

  .icon-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    background-color: var(--el-fill-color-blank);

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: var(--el-fill-color-lighter);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-darker);
      border-radius: 4px;

      &:hover {
        background: var(--el-border-color-dark);
      }
    }

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 15px 10px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      background-color: var(--el-fill-color-blank);

      &:hover {
        background-color: var(--el-fill-color-light);
        border-color: var(--el-color-primary);
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.active {
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      }

      .icon-name {
        margin-top: 8px;
        font-size: 12px;
        text-align: center;
        word-break: break-all;
        line-height: 1.2;
        color: var(--el-text-color-regular);
      }

      &.active .icon-name {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}

// 响应式布局
@media (max-width: 768px) {
  .icon-picker-dialog {
    .icon-list {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
      max-height: 300px;

      .icon-item {
        padding: 10px 5px;

        .icon-name {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
