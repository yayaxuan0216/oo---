<template>
  <div class="tenant-page">
    <header class="top-bar">
      <div class="logo-area">
        <span class="logo-icon">🏡</span>
        <span class="logo-text">CocoRoom 線上租屋</span>
      </div>

      <nav class="nav-links">
        <router-link to="/TenantHome/browse" class="nav-btn">找房</router-link>
        <router-link to="/TenantHome/favorites" class="nav-btn">我的收藏</router-link>
        <router-link to="/TenantHome/profile" class="nav-btn">我的資料</router-link>
      </nav>

      <div class="user-area">
        <span class="user-name">嗨，{{ tenantName }} 👋</span>
        <button class="logout-btn" @click="handleLogout">登出</button>
      </div>
    </header>

    <main class="main-container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tenantName = ref('User') // 之後可改為從 Pinia 或 API 取得

const handleLogout = () => {
  router.push('/Login')
}
</script>

<style scoped>
.tenant-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2e6dc;
  font-family: "Iansui", sans-serif;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #4a2c21;
  color: #f2e6dc;
}

.logo-area { display: flex; align-items: center; gap: 8px; }
.logo-icon { font-size: 22px; }
.logo-text { font-size: 18px; font-weight: 600; }

.nav-links { display: flex; gap: 8px; }

.nav-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: transparent;
  color: #f2e6dc;
  text-decoration: none;
  font-size: 14px;
  transition: 0.2s ease;
}

.nav-btn:hover { background: rgba(242, 230, 220, 0.18); }

/* Vue Router 自動加的 class */
.router-link-active {
  background: #f2e6dc;
  color: #4a2c21;
}

.user-area { display: flex; align-items: center; gap: 10px; font-size: 14px; }

.logout-btn {
  border: 1px solid #f2e6dc;
  background: transparent;
  color: #f2e6dc;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s ease;
}
.logout-btn:hover { background: #f2e6dc; color: #4a2c21; }

.main-container {
  /* 這裡不設定 grid，讓子頁面自己決定排版 */
  flex: 1;
  padding: 18px 24px 24px;
}
</style>