<template>
  <div>
    <!-- ① 租客登入後的頁面 -->
    <TenantHome
      v-if="currentView === 'tenantHome'"
      @logout="handleLogout"
    />

    <!-- ② 還沒登入／註冊／忘記密碼時的頁面 -->
    <div v-else class="page">
      <!-- 登入頁 -->
      <div class="login-card" v-if="currentView === 'login'">
        <h1 class="title">🏡 使用者登入 🏡</h1>
        <form class="form" @submit.prevent="handleLogin">
          <!-- 帳號 -->
          <div class="form-group">
            <label for="username">帳號</label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="請輸入帳號"
            />
          </div>

          <!-- 密碼 -->
          <div class="form-group">
            <label for="password">密碼</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="請輸入密碼"
            />
          </div>

          <!-- 登入按鈕 -->
          <button type="submit" class="btn-primary">
            登入
          </button>
        </form>

        <!-- 底下的連結區 -->
        <div class="bottom-links">
          <button class="link-btn" type="button" @click="handleForgotPassword">
            忘記密碼？
          </button>

          <div class="signup">
            還沒有帳號？
            <button class="link-btn" type="button" @click="goToRoleSelect">
              立即註冊
            </button>
          </div>
        </div>
      </div>

      <!-- 忘記密碼頁 -->
      <ForgotPassword
        v-else-if="currentView === 'forgotPassword'"
        @back-login="backToLogin"
      />

      <!-- 身分選擇頁 -->
      <RegChoose
        v-else-if="currentView === 'roleSelect'"
        @select-role="handleRoleSelect"
        @back="backToLogin"
      />

      <!-- 註冊頁 -->
      <RegisterForm
        v-else-if="currentView === 'register'"
        :role="selectedRole"
        @back="currentView = 'roleSelect'"
        @back-login="backToLogin"
        @registered="handleRegistered"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RegChoose from './components/RegChoose.vue'
import RegisterForm from './components/RegisterForm.vue'
import ForgotPassword from './components/ForgotPassword.vue'
import TenantHome from './components/TenantHome.vue'

const currentView = ref('login')
const selectedRole = ref('')
const username = ref('')
const password = ref('')

// 登入
const handleLogin = () => {
  if (!username.value || !password.value) {
    alert('請輸入帳號與密碼')
    return
  }
  
  currentView.value = 'tenantHome'
}

// 忘記密碼
const handleForgotPassword = () => {
  currentView.value = 'forgotPassword'
}

// 從登入頁 → 身分選擇頁
const goToRoleSelect = () => {
  currentView.value = 'roleSelect'
}

// 在 RegChoose 裡選擇身分後
const handleRoleSelect = (role) => {
  selectedRole.value = role
  currentView.value = 'register'
}

  // 回登入頁
const backToLogin = () =>{
  currentView.value = 'login'
}

// 註冊完成
const handleRegistered = (payload) => {
  console.log('註冊完成資料：', payload)
  alert('註冊完成！')
  currentView.value = 'login'
}

// 登出（從租客首頁按右上角「登出」會呼叫這個）
const handleLogout = () => {
  if (!confirm('確定要登出嗎？')) return
  username.value = ''
  password.value = ''
  currentView.value = 'login'
}
</script>

<style>
@font-face {
  font-family: "Iansui";
  src: url("/src/assets/fonts/Iansui-Regular.woff2") format("woff2"),
       url("/src/assets/fonts/Iansui-Regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
</style>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
  font-family: "Iansui", sans-serif;
}

.login-card {
  width: 360px;
  padding: 24px 28px 28px;
  border-radius: 16px;
  background: #F2E6DC;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.title {
  font-family: "Iansui", sans-serif;
  text-align: center;
  margin-bottom: 20px;
  font-size: 30px;
  font-weight: 600;
  color: #2E2622;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 14px;
  color: #374151;
  font-family: "Iansui", sans-serif;
}

input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 16px;
  outline: none;
  font-family: "Iansui", sans-serif;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.btn-primary {
  margin-top: 8px;
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  background: #a18c7b;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
}

.btn-primary:hover {
  background: #4a2c21;
}

.bottom-links {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  font-family: "Iansui", sans-serif;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: #2563eb;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
}

.link-btn:hover {
  text-decoration: underline;
}

.signup {
  display: flex;
  gap: 4px;
  align-items: center;
  color: #6b7280;
}
</style>
