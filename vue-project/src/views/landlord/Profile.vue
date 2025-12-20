<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2 class="section-title">房東個人專區</h2>
      <p class="panel-hint">在這裡管理您的顯示名稱、聯絡資訊與帳號安全。</p>

      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img 
            :src="profile.avatar || defaultAvatar" 
            class="avatar-preview" 
            alt="房東頭貼"
          />
        </div>
        
        <label class="upload-btn">
          📷 更換頭貼
          <input 
            type="file" 
            accept="image/*" 
            @change="handleFileChange" 
            style="display: none;" 
          />
        </label>
        <p class="hint-text">建議大小 500KB 以內</p>
      </div>

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">基本資料</h3>
        
        <div class="input-group">
          <label>顯示名稱 (房客會看到的稱呼)</label>
          <input 
            v-model="profile.name" 
            type="text" 
            placeholder="例如：王先生、快樂房東" 
            class="custom-input"
          />
        </div>

        <div class="input-group">
          <label>聯絡 Email</label>
          <input 
            v-model="profile.email" 
            type="email" 
            placeholder="請輸入 Email" 
            class="custom-input"
          />
        </div>

        <div class="input-group">
          <label>手機號碼 (帳號)</label>
          <input 
            v-model="profile.phone" 
            type="text" 
            class="custom-input readonly" 
            readonly
          />
        </div>
      </div>

      <hr class="divider" />

      <div class="form-section">
        <h3 class="sub-title">帳號安全</h3>
        <button class="action-link-btn" @click="goToChangePassword">
          🔑 修改密碼
        </button>
      </div>

      <div class="action-buttons">
        <button class="save-btn" @click="handleSave">儲存變更</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 預設頭貼 (房東版預設圖)
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/236/236832.png'

const profile = ref({
  name: '',
  email: '',
  phone: '',
  avatar: ''
})

// 🟢 初始化：從 localStorage 讀取目前房東資料
onMounted(() => {
  const userStr = localStorage.getItem('currentUser')
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      // 確保只讀取屬於房東的資料
      if (user.role !== 'landlord') {
        alert('身分錯誤')
        router.push('/Login')
        return
      }

      profile.value.name = user.name || ''
      profile.value.email = user.email || ''
      profile.value.phone = user.phone || '' // 手機號碼
      profile.value.avatar = user.avatar || ''
    } catch (e) {
      console.error('解析使用者資料失敗', e)
    }
  } else {
    router.push('/Login')
  }
})

// 📸 處理圖片上傳
const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const MAX_SIZE = 500 * 1024 // 500KB
  if (file.size > MAX_SIZE) {
    alert('圖片太大了！請選擇 500KB 以下的圖片。')
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(file)
  
  reader.onload = (e) => {
    profile.value.avatar = e.target.result
  }
}

// 💾 儲存資料
const handleSave = async () => {
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return

  const user = JSON.parse(userStr)

  const payload = {
    userId: user.id,
    role: user.role, // 這裡會是 'landlord'，後端會自動判斷去更新 landlords 集合
    name: profile.value.name,
    email: profile.value.email,
    avatar: profile.value.avatar
  }

  try {
    const response = await fetch('http://localhost:3000/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      alert('✅ 房東資料已更新！')

      // 同步更新 LocalStorage
      const updatedUser = {
        ...user,
        name: profile.value.name,
        email: profile.value.email,
        avatar: profile.value.avatar
      }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
      // 重新整理頁面以確保側邊欄頭貼更新 (選用)
      // window.location.reload()
      
    } else {
      alert('更新失敗：' + data.message)
    }

  } catch (error) {
    console.error('API Error:', error)
    alert('無法連線到伺服器')
  }
}

// 導航
const goToChangePassword = () => {
  // 假設房東的修改密碼頁面路徑是這個，若還沒做可以先導回首頁或共用租客的頁面
  // 建議建立: src/views/landlord/ChangePassword.vue
  router.push('/LandlordHome/change-password') 
}
</script>

<style scoped>
/* 頁面容器 */
.profile-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

/* 卡片樣式 */
.profile-card {
  width: 100%;
  max-width: 600px; /* 房東表格可能較寬一點 */
  background: #fffdf9;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(46, 38, 34, 0.08);
  border: 1px solid rgba(161, 140, 123, 0.2);
}

.section-title {
  text-align: center;
  font-size: 24px;
  color: #4a2c21;
  margin-bottom: 8px;
  font-weight: 700;
}

.panel-hint {
  text-align: center;
  font-size: 14px;
  color: #8b7e74;
  margin-bottom: 24px;
}

/* 📸 頭貼樣式 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid #a18c7b;
  padding: 3px;
  background: white;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f2e6dc;
}

.upload-btn {
  font-size: 14px;
  color: #4a2c21;
  border: 1px solid #d1c7bf;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.upload-btn:hover {
  background: #f2e6dc;
  border-color: #a18c7b;
  transform: translateY(-1px);
}

.hint-text {
  font-size: 12px;
  color: #9ca3af;
}

/* 分隔線 */
.divider {
  border: none;
  border-top: 1px dashed #e5e7eb;
  margin: 24px 0;
}

/* 表單區塊 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-title {
  font-size: 18px;
  color: #2e2622;
  font-weight: 600;
  margin-bottom: 4px;
  border-left: 4px solid #a18c7b;
  padding-left: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 14px;
  color: #4a2c21;
  font-weight: 500;
}

.custom-input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1c7bf;
  font-size: 15px;
  outline: none;
  font-family: "Iansui", sans-serif;
  background: #fff;
  transition: 0.2s;
}

.custom-input:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 3px rgba(161, 140, 123, 0.15);
}

.custom-input.readonly {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

/* 按鈕區 */
.action-link-btn {
  width: 100%;
  text-align: left;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 12px 16px;
  border-radius: 10px;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
}

.action-link-btn:hover {
  background: #f9fafb;
  border-color: #a18c7b;
  color: #a18c7b;
}

.action-buttons {
  margin-top: 32px;
}

.save-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: #4a2c21;
  color: #fffdf9;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 10px rgba(74, 44, 33, 0.2);
}

.save-btn:hover {
  background: #2e2622;
  transform: translateY(-1px);
}

.save-btn:active {
  transform: translateY(0);
}
</style>