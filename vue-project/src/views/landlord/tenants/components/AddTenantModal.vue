<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <h3 class="modal-title">新增房客</h3>
      
      <div class="form-group">
        <label>選擇房源</label>
        <select v-model="form.rentalId" :disabled="!!initialRentalId">
          <option value="" disabled>請選擇</option>
          <option v-for="r in displayRentals" :key="r.id" :value="r.id">
            {{ r.title }}
          </option>
        </select>
        <p v-if="initialRentalId" class="hint-text lock-hint">
          🔒 已鎖定目前篩選的租件
        </p>
      </div>
      
      <div class="form-group">
        <label>房客聯絡電話 (輸入後自動搜尋)</label>
        <div class="input-wrapper">
          <input 
            type="text" 
            v-model="form.phone" 
            placeholder="請輸入電話並按 Enter"
            @blur="handleSearch" 
            @keyup.enter="handleSearch"
            :disabled="searching"
          >
          <span v-if="searching" class="status-icon loading">⏳</span>
          <span v-if="searchStatus === 'found'" class="status-icon success">✅</span>
          <span v-if="searchStatus === 'not-found'" class="status-icon error">❌</span>
        </div>
        <p class="hint-text" :class="searchStatus">{{ searchHint }}</p>
      </div>

      <div class="form-group">
        <label>房客姓名</label>
        <input type="text" v-model="form.name" placeholder="自動帶入或手動輸入">
      </div>

      <div class="form-group date-row">
        <div class="half">
          <label>租約開始</label>
          <input type="date" v-model="form.leaseStart">
        </div>
        <div class="half">
          <label>租約結束</label>
          <input type="date" v-model="form.leaseEnd">
        </div>
      </div>

      <div class="modal-actions">
        <button class="small-btn outline" @click="$emit('close')">取消</button>
        <button class="small-btn primary" @click="handleConfirm" :disabled="searching">確定新增</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue' // ✨ 記得引入 computed
import api from '@/utils/api'

// ✨ 1. 新增接收 initialRentalId
const props = defineProps(['rentals', 'initialRentalId'])
const emit = defineEmits(['close', 'confirm'])

const today = new Date()
const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1))
const formatDate = (date) => date.toISOString().split('T')[0]

// ✨ 2. 計算要顯示的租件列表
// 如果有指定 ID，就只回傳那一個租件；否則回傳全部
const displayRentals = computed(() => {
  if (props.initialRentalId) {
    return props.rentals.filter(r => r.id === props.initialRentalId)
  }
  return props.rentals
})

const form = reactive({
  // ✨ 3. 預設值優先使用傳入的 ID，沒有才選列表第一個
  rentalId: props.initialRentalId || (props.rentals[0]?.id || ''),
  name: '',
  phone: '',
  uid: null,
  leaseStart: formatDate(today),
  leaseEnd: formatDate(nextYear)
})

const searching = ref(false)
const searchStatus = ref('')
const searchHint = ref('')

const handleSearch = async () => {
  if (!form.phone) return
  if (searching.value) return

  try {
    searching.value = true
    searchStatus.value = ''
    searchHint.value = '搜尋中...'

    const res = await api.get(`/api/user/search?phone=${form.phone}`)
    
    if (res.data.success) {
      const userData = res.data.data
      form.name = userData.name 
      form.uid = userData.uid
      searchStatus.value = 'found'
      searchHint.value = '已找到註冊會員'
    }

  } catch (error) {
    if (error.response && error.response.status === 404) {
      searchStatus.value = 'not-found'
      searchHint.value = '查無此人，請手動輸入'
      form.uid = null 
    } else {
      console.error(error)
      searchHint.value = '搜尋錯誤'
    }
  } finally {
    searching.value = false
  }
}

const handleConfirm = () => {
  if (!form.name || !form.phone || !form.rentalId) {
    alert('請填寫完整資料')
    return
  }
  emit('confirm', { ...form })
}
</script>

<style scoped>
/* 維持原有樣式，新增 lock-hint */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.modal-box { background: #fff; width: 90%; max-width: 400px; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: popIn 0.2s ease; }
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-title { font-size: 18px; font-weight: 600; color: #2e2622; margin-bottom: 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: #4b5563; margin-bottom: 4px; }
.input-wrapper { position: relative; }
.form-group input, .form-group select { width: 100%; padding: 8px; padding-right: 30px; border: 1px solid #d1d5db; border-radius: 6px; font-family: "Iansui", sans-serif; box-sizing: border-box; }
.form-group input:focus { border-color: #a18c7b; outline: none; }
.date-row { display: flex; gap: 10px; }
.half { flex: 1; }

.status-icon { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 14px; }
.loading { animation: spin 1s infinite linear; }
@keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }

.hint-text { font-size: 11px; margin-top: 4px; height: 14px; }
.hint-text.found { color: #166534; }
.hint-text.not-found { color: #b91c1c; }

/* ✨ 新增鎖定提示樣式 */
.lock-hint { color: #a18c7b; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.small-btn { border: none; padding: 6px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; background: #e1d4c8; color: #2e2622; font-family: "Iansui", sans-serif; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
.small-btn.primary { background: #a18c7b; color: white; }
.small-btn.primary:disabled { background: #ccc; cursor: not-allowed; }
</style>