<template>
  <div class="login-card">
    <h1 class="title">選擇身分</h1>
    <p class="helper-text">請選擇你要註冊的身分</p>

    <div class="role-options">
      <button class="role-btn tenant" @click="emitSelect('tenant')">
        我是租客 👩‍💼
      </button>
      <button class="role-btn landlord" @click="emitSelect('landlord')">
        我是房東 👩‍💼
      </button>
    </div>

    <button class="link-btn back-link" type="button" @click="$emit('back')">
      ← 回到登入頁
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['select-role', 'back'])

const emitSelect = (role) => {
  emit('select-role', role)
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
.login-card {
  width: 360px;
  padding: 24px 28px 28px;
  border-radius: 16px;
  background: #f2e6dc;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 30px;
  font-weight: 600;
  color: #2e2622;
}

.helper-text {
  text-align: center;
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 16px;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.role-btn {
  width: 100%;
  padding: 15px 0;              
  font-size: 18px;
  font-weight: 600;
  font-family: "Iansui", sans-serif;

  border: 3px solid #ffffff;     
  border-radius: 20px;          
  background: #fff9f2;           
  color: #5c4a3e;              

  cursor: pointer;
  transition: 0.2s ease;

  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.role-btn.tenant {
  background: #fff0db;       
  color: #8a4b13;
}

.role-btn.tenant:hover {
  background: #ffe4c2;
  transform: translateY(-2px);   
  box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}

.role-btn.landlord {
  background: #e8f4ff;       
  color: #0a568b;
}

.role-btn.landlord:hover {
  background: #d5ecff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.12);
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: #2563eb;
  cursor: pointer;
  margin-top: 12px;
  font-size: 13px;
  font-family: "Iansui", sans-serif;
}

.link-btn:hover {
  text-decoration: underline;
}
</style>
