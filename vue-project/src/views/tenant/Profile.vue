<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2 class="section-title">我的資料</h2>

      <ProfileInfo 
        v-model:name="profile.name"
        :email="profile.email"
      />

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">帳號安全</h3>
        <button class="action-link-btn" @click="goToChangePassword">
          🔑 修改密碼
        </button>
      </div>

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">我的收藏</h3>
        <p class="hint">您目前收藏了 {{ favoriteCount }} 個房源。</p>
        <button class="favorite-link-btn" @click="goToFavorites">
          ❤️ 前往查看我的收藏清單
        </button>
      </div>

      <div class="action-buttons">
        <button class="save-btn" @click="handleSave">儲存基本資料</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProfileInfo from './components/ProfileInfo.vue'

const router = useRouter()

const profile = ref({
  name: '',
  email: ''
})

const favoriteCount = ref(0) // 暫時先寫死，之後再串收藏功能

// 1. 頁面載入時，從 localStorage 抓資料
onMounted(() => {
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    const user = JSON.parse(userStr)
    // 假設 user 物件裡有 name, email (如果登入時沒回傳 email，這裡可能會是空的)
    profile.value.name = user.name || ''
    profile.value.email = user.email || user.phone || '' // 如果沒有 email 就顯示電話
  }
})

const goToChangePassword = () => {
  router.push('/TenantHome/change-password')
}

const goToFavorites = () => {
  router.push('/TenantHome/favorites')
}

// 2. 處理儲存邏輯 (連接後端)
const handleSave = async () => {
  try {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) return
    const user = JSON.parse(userStr)

    // 發送請求
    const response = await fetch('http://localhost:3000/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,      // 告訴後端是誰
        role: user.role,      // 告訴後端查哪張表
        name: profile.value.name,
        email: profile.value.email
      })
    })

    const data = await response.json()

    if (data.success) {
      alert('✅ 基本資料已更新！')
      
      // ✨ 重要：更新 localStorage 裡的資料，這樣重整頁面名字才會變
      user.name = profile.value.name
      // 如果有改 email 也更新
      // user.email = profile.value.email 
      localStorage.setItem('currentUser', JSON.stringify(user))
      
    } else {
      alert('更新失敗：' + data.message)
    }
  } catch (error) {
    console.error(error)
    alert('無法連線到伺服器')
  }
}
</script>

<style scoped>
/* ...保留原本的樣式... */
.profile-container {
  display: flex;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 40px;
}
.profile-card {
  width: 100%;
  max-width: 500px;
  background: #fffdf9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
  border: 1px solid rgba(242, 230, 220, 0.9);
}
.section-title { font-size: 20px; font-weight: 600; color: #2e2622; margin-bottom: 20px; text-align: center; }
.sub-title { font-size: 16px; font-weight: 600; color: #4a2c21; margin-bottom: 12px; }
.divider { border: none; border-top: 1px dashed #e5e7eb; margin: 20px 0; }
.hint { font-size: 12px; color: #9ca3af; margin-bottom: 10px; margin-top: -8px; }

/* 連結按鈕樣式 (收藏頁 & 修改密碼 通用) */
.favorite-link-btn, .action-link-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  font-family: "Iansui", sans-serif;
  margin-bottom: 8px;
}

/* 收藏按鈕 (粉紅) */
.favorite-link-btn {
  background: #fff0f0;
  color: #e11d48;
  border: 1px solid #fecdd3;
}
.favorite-link-btn:hover { background: #ffe4e6; }

/* ✨ 修改密碼按鈕 (藍色或灰色系) */
.action-link-btn {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}
.action-link-btn:hover { background: #dbeafe; }

/* 儲存按鈕 */
.action-buttons { margin-top: 30px; }
.save-btn {
  width: 100%;
  padding: 14px;
  background: #4a2c21;
  color: #f2e6dc;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
  transition: 0.2s;
}
.save-btn:hover { background: #2e2622; }
</style>