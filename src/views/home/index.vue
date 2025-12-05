<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <h2>{{ t('menu.home') }}</h2>
      <p>管理系统</p>
      <el-divider />
      <div class="info-grid">
        <div class="info-item">
          <el-icon :size="40" color="#409EFF"><User /></el-icon>
          <div class="info-text">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ authStore.userInfo?.username }}</div>
          </div>
        </div>
        <div class="info-item">
          <el-icon :size="40" color="#67C23A"><UserFilled /></el-icon>
          <div class="info-text">
            <div class="info-label">昵称</div>
            <div class="info-value">{{ authStore.userInfo?.nickname }}</div>
          </div>
        </div>
        <div class="info-item">
          <el-icon :size="40" color="#E6A23C"><Key /></el-icon>
          <div class="info-text">
            <div class="info-label">角色</div>
            <div class="info-value">{{ authStore.userInfo?.roles.join(', ') }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>功能特性</span>
          </template>
          <ul class="feature-list">
            <li> Vue3 + TypeScript + Vite</li>
            <li> Element Plus UI组件库</li>
            <li> 用户认证与权限控制</li>
            <li> 国际化多语言支持</li>
            <li> 主题切换功能</li>
          </ul>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="changeLanguage">
              切换语言
            </el-button>
            <el-button type="success" @click="changeTheme">
              切换主题
            </el-button>
            <el-button type="warning" @click="viewDashboard">
              查看工作台
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>系统管理</span>
          </template>
          <div class="system-actions">
            <el-button 
              v-if="hasPermission('system:user')"
              type="primary" 
              :icon="User"
              @click="navigateTo('/system/user')"
            >
              用户管理
            </el-button>
            <el-button 
              v-if="hasPermission('system:role')"
              type="success" 
              :icon="UserFilled"
              @click="navigateTo('/system/role')"
            >
              角色管理
            </el-button>
            <el-button 
              v-if="hasPermission('system:menu')"
              type="warning" 
              :icon="Menu"
              @click="navigateTo('/system/menu')"
            >
              菜单管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { User, UserFilled, Key, Menu } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { storage } from '@/utils/storage'

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const { currentTheme, setTheme } = useTheme()

const changeLanguage = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  locale.value = newLocale
  storage.set('locale', newLocale)
}

const changeTheme = async () => {
  const themes = ['default', 'green', 'purple']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  const nextTheme = themes[nextIndex]
  if (nextTheme) {
    await setTheme(nextTheme)
  }
}

const viewDashboard = () => {
  router.push('/dashboard')
}

const navigateTo = (path: string) => {
  router.push(path)
}

const hasPermission = (permission: string): boolean => {
  return authStore.userInfo?.permissions.includes(permission) || false
}
</script>

<style scoped lang="scss">
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  h2 {
    margin: 0 0 10px;
    color: var(--color-text-primary);
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: var(--color-fill-light);
  border-radius: 8px;
  border: 1px solid var(--color-border-lighter);
  transition: all 0.3s;

  &:hover {
    background-color: var(--color-fill);
    box-shadow: var(--shadow-light);
  }
}

.info-text {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.feature-list {
  margin: 0;
  padding-left: 20px;
  color: var(--color-text-regular);

  li {
    margin-bottom: 10px;
    line-height: 1.8;
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .el-button {
    width: 100%;
    margin: 0;
  }
}

.system-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
</style>
