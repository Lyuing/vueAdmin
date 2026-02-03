<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <h2>{{ t('menu.home') }}</h2>
      <p>{{ t('basic.name') }}</p>
      <el-divider />
      <div class="info-grid">
        <div class="info-item">
          <el-icon :size="40" color="#409EFF"><User /></el-icon>
          <div class="info-text">
            <div class="info-label">{{ t('basic.username') }}</div>
            <div class="info-value">{{ authStore.userInfo?.username }}</div>
          </div>
        </div>
        <div class="info-item">
          <el-icon :size="40" color="#67C23A"><UserFilled /></el-icon>
          <div class="info-text">
            <div class="info-label">{{ t('basic.realName') }}</div>
            <div class="info-value">{{ authStore.userInfo?.realName }}</div>
          </div>
        </div>
        <div class="info-item">
          <el-icon :size="40" color="#E6A23C"><Key /></el-icon>
          <div class="info-text">
            <div class="info-label">{{ t('basic.role') }}</div>
            <div class="info-value">{{ authStore.userInfo?.roles.join(', ') }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { User, UserFilled, Key } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useNavigationStore } from '@/stores/navigation'
import { onMounted } from 'vue'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const navigationStore = useNavigationStore()

// 跳转到已加载的第一个导航页面
const redirectPage = () => {
  const findFirstPath = (menus: any[]): string | undefined => {
    for (const menu of menus) {
      if (menu.path && !menu.hidden && menu.permissionCode !== 'menu:welcome') {
        return menu.path
      }
      if (menu.children && menu.children.length > 0) {
        const path = findFirstPath(menu.children)
        if (path) return path
      }
    }
    return undefined
  }

  const firstPath = findFirstPath(navigationStore.menuTree)
  if (firstPath) {
    router.push(firstPath)
  }
}

onMounted(() => {
  redirectPage()
})
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
