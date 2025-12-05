<template>
  <div class="login-card">
    <h1 class="title">註冊 - {{ roleLabel }}</h1>
    <p class="helper-text">
      請填寫以下資料完成 {{ roleLabel }} 註冊
    </p>

    <form class="form" @submit.prevent="handleSubmit">
      <!-- 姓名 -->
      <div class="form-group">
        <label for="name">姓名</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="請輸入姓名"
        />
      </div>

      <!-- 電話 -->
      <div class="form-group">
        <label for="phone">電話</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          placeholder="請輸入聯絡電話"
        />
      </div>

      <!-- 地址 -->
      <div class="form-group">
        <label for="address">地址</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          placeholder="請輸入聯絡地址"
        />
      </div>

      <!-- 性別 -->
      <div class="form-group">
        <label for="gender">性別</label>
        <select id="gender" v-model="form.gender">
          <option value="" disabled>請選擇性別</option>
          <option value="female">女性</option>
          <option value="male">男性</option>
          <option value="other">其他 / 不透露</option>
        </select>
      </div>

      <!-- 密碼 -->
      <div class="form-group">
        <label for="password">密碼</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="請設定密碼"
        />
      </div>

      <!-- 確認密碼 -->
      <div class="form-group">
        <label for="passwordConfirm">確認密碼</label>
        <input
          id="passwordConfirm"
          v-model="form.passwordConfirm"
          type="password"
          placeholder="請再次輸入密碼"
        />
      </div>

      <!-- 上傳學生證或身分證 -->
      <div class="form-group">
        <label for="idFile">上傳學生證或身分證</label>
        <input
          id="idFile"
          type="file"
          accept="image/*,.pdf"
          @change="handleFileChange"
        />
        <p v-if="fileName" class="file-name">
          已選擇檔案：{{ fileName }}
        </p>
      </div>

      <button type="submit" class="btn-primary">
        送出註冊
      </button>
    </form>

    <div class="bottom-links">
      <button class="link-btn" type="button" @click="$emit('back')">
        ← 回到身分選擇
      </button>
      <button class="link-btn" type="button" @click="$emit('back-login')">
        ← 回到登入頁
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  role: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['back', 'back-login', 'registered'])

const roleLabel = computed(() => {
  if (props.role === 'tenant') return '租客'
  if (props.role === 'landlord') return '房東'
  return '使用者'
})

const form = ref({
  name: '',
  phone: '',
  address: '',
  gender: '',
  password: '',
  passwordConfirm: '',
  idFile: null
})

const fileName = ref('')

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    form.value.idFile = file
    fileName.value = file.name
  } else {
    form.value.idFile = null
    fileName.value = ''
  }
}

const handleSubmit = () => {
  const f = form.value

  if (!f.name || !f.phone || !f.address || !f.gender || !f.password || !f.passwordConfirm) {
    alert('請填寫所有必填欄位')
    return
  }

  if (f.password !== f.passwordConfirm) {
    alert('兩次輸入的密碼不一致')
    return
  }

  if (!f.idFile) {
    alert('請上傳學生證或身分證')
    return
  }

  alert(
    `模擬註冊成功：\n` +
    `身分：${roleLabel.value}\n` +
    `姓名：${f.name}\n` +
    `電話：${f.phone}\n` +
    `地址：${f.address}\n` +
    `性別：${f.gender}\n` +
    `上傳檔案：${f.idFile.name}`
  )

  emit('registered', {
    role: props.role,
    name: f.name,
    phone: f.phone,
    address: f.address,
    gender: f.gender,
    password: f.password,
    idFileName: f.idFile.name
  })
}
</script>

<style scoped>
.login-card {
  width: 380px;
  padding: 24px 28px 28px;
  border-radius: 16px;
  background: #f2e6dc;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  font-family: "Iansui", sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 26px;
  font-weight: 600;
  color: #2e2622;
}

.helper-text {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
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
}

input,
select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  font-family: "Iansui", sans-serif;
  background: white;
}

input:focus,
select:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.25);
}

.file-name {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.btn-primary {
  margin-top: 8px;
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  background: #a18c7b;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
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
</style>
