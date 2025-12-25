<template>
  <div class="living-container">
    
    <header class="header">
      <h2>🏠 我的租屋</h2>
      <div v-if="loading" class="loading">載入中...</div>
      <div v-else-if="allRentals.length > 0" class="rental-switcher">
        <h3 v-if="allRentals.length === 1">{{ currentRental.rentalTitle }}</h3>
        <select v-else v-model="currentIndex" class="rental-select">
          <option v-for="(item, index) in allRentals" :key="index" :value="index">
            📍 {{ item.rentalTitle }}
          </option>
        </select>
        <p class="status-badge">入住中</p>
      </div>
      <div v-else class="empty-state">目前無租屋資料</div>
    </header>

    <div v-if="currentRental">
      <div class="tabs">
        <button :class="['tab-btn', currentTab === 'bills' ? 'active' : '']" @click="currentTab = 'bills'">
          💰 帳務水電
        </button>
        <button :class="['tab-btn', currentTab === 'chat' ? 'active' : '']" @click="currentTab = 'chat'">
          💬 聯絡房東
        </button>
      </div>

      <div v-if="currentTab === 'bills'" class="content-area">
        <div v-if="!currentRental.bills || currentRental.bills.length === 0" class="empty-state">
          目前沒有繳費紀錄
        </div>

        <div v-else class="bill-list">
          <div v-for="bill in currentRental.bills" :key="bill.month" class="bill-card">
            
            <div class="bill-header">
              <span class="month">{{ bill.month }}</span>
              <span :class="['status-tag', bill.isPaid ? 'paid' : 'unpaid']">
                {{ bill.isPaid ? '✅ 全部繳清' : '⚠️ 尚未繳清' }}
              </span>
            </div>
            
            <div class="bill-details">
              <div class="item">
                <span class="label">房租</span>
                <span :class="bill.items.rent ? 'check' : 'cross'">{{ bill.items.rent ? '已繳' : '未繳' }}</span>
              </div>
              <div class="item">
                <span class="label">水費</span>
                <span :class="bill.items.water ? 'check' : 'cross'">{{ bill.items.water ? '已繳' : '未繳' }}</span>
              </div>
              <div class="item">
                <span class="label">電費</span>
                <span :class="bill.items.electric ? 'check' : 'cross'">{{ bill.items.electric ? '已繳' : '未繳' }}</span>
              </div>
            </div>

            <div class="bill-note-section">
              <div class="note-label">📝 我的備註 (僅自己可見)：</div>
              <input 
                type="text" 
                class="tenant-note-input"
                placeholder="例: 已轉帳末五碼 12345"
                :value="bill.note"
                @blur="updateMyNote(bill.month, $event.target.value)"
              >
            </div>

          </div>
        </div>
      </div>

      <div v-if="currentTab === 'chat'" class="content-area chat-area">
        <div class="chat-header-hint">正在聯絡：{{ currentRental.rentalTitle }} 的房東</div>
        <div class="chat-messages">
             <div class="msg other"><div class="bubble">您好，這裡是 {{ currentRental.rentalTitle }}</div></div>
        </div>
        <div class="chat-input-box">
             <input type="text" placeholder="傳送訊息..." v-model="msgInput">
             <button @click="sendMsg">傳送</button>
        </div>
      </div>
    
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

const currentTab = ref('bills')
const loading = ref(false)
const msgInput = ref('')
const allRentals = ref([])
const currentIndex = ref(0)
const currentUser = JSON.parse(localStorage.getItem('currentUser'))

const currentRental = computed(() => {
  if (allRentals.value.length === 0) return null
  return allRentals.value[currentIndex.value]
})

const fetchLivingInfo = async () => {
  if (!currentUser || !currentUser.id) return
  try {
    loading.value = true
    const res = await api.get(`/api/tenant/portal/info?uid=${currentUser.id}`)
    if (res.data.success) {
      allRentals.value = res.data.data
      currentIndex.value = 0
    }
  } catch (error) {
    console.error('載入失敗', error)
  } finally {
    loading.value = false
  }
}

// ✨ 新增：更新備註 API 呼叫
const updateMyNote = async (month, value) => {
  // 樂觀更新：先更新畫面上的資料避免跳動
  const rental = allRentals.value[currentIndex.value]
  const targetBill = rental.bills.find(b => b.month === month)
  if (targetBill) targetBill.note = value

  try {
    await api.post('/api/tenant/portal/note', {
      uid: currentUser.id,
      month: month,
      note: value
    })
    console.log('備註更新成功')
  } catch (error) {
    console.error('更新備註失敗', error)
    alert('儲存失敗，請檢查網路')
  }
}

const sendMsg = () => {
  if (!msgInput.value.trim() || !currentRental.value) return
  alert(`傳送給房東 (${currentRental.value.landlordId}): ${msgInput.value}`)
  msgInput.value = ''
}

onMounted(() => {
  fetchLivingInfo()
})
</script>

<style scoped>
.living-container { max-width: 600px; margin: 0 auto; padding: 16px; background: #fffdf9; min-height: 90vh; }
.header { text-align: center; margin-bottom: 20px; }
.rental-select { font-size: 18px; font-weight: bold; padding: 8px; border: 1px solid #a18c7b; border-radius: 8px; color: #4a2c21; background: white; width: 100%; max-width: 300px; text-align: center; margin-bottom: 8px; font-family: "Iansui", sans-serif; }
.status-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 12px; padding: 2px 8px; border-radius: 99px; margin-top: 4px; }
.tabs { display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 16px; }
.tab-btn { flex: 1; padding: 12px; background: none; border: none; font-size: 15px; font-weight: 600; color: #9ca3af; cursor: pointer; }
.tab-btn.active { color: #a18c7b; border-bottom: 3px solid #a18c7b; margin-bottom: -2px; }

/* 帳單卡片 */
.bill-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.bill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed #eee; padding-bottom: 8px; }
.month { font-size: 18px; font-weight: 700; color: #374151; font-family: monospace; }
.status-tag { font-size: 12px; padding: 4px 8px; border-radius: 6px; font-weight: bold; }
.status-tag.paid { background: #ecfdf5; color: #047857; }
.status-tag.unpaid { background: #fff7ed; color: #c2410c; }
.bill-details { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.item { flex: 1; display: flex; flex-direction: column; align-items: center; background: #f9fafb; padding: 10px; border-radius: 8px; font-size: 13px; }
.item .label { color: #6b7280; margin-bottom: 4px; }
.check { color: #10b981; font-weight: 600; font-size: 15px; }
.cross { color: #ef4444; font-weight: 600; font-size: 15px; }

/* ✨ 備註輸入框樣式 */
.bill-note-section { background: #fdfdfd; border: 1px solid #f0f0f0; padding: 8px 12px; border-radius: 8px; }
.note-label { font-size: 12px; color: #888; margin-bottom: 4px; }
.tenant-note-input { width: 100%; border: none; background: transparent; font-size: 14px; color: #4b5563; border-bottom: 1px dashed #ddd; padding: 4px 0; outline: none; }
.tenant-note-input:focus { border-bottom-color: #a18c7b; }

.chat-area { display: flex; flex-direction: column; height: 50vh; }
.chat-messages { flex: 1; overflow-y: auto; padding: 10px; background: #f3f4f6; border-radius: 8px; margin-bottom: 10px; }
.msg { display: flex; margin-bottom: 8px; }
.msg.me { justify-content: flex-end; }
.msg .bubble { padding: 8px 12px; border-radius: 12px; background: #fff; border: 1px solid #e5e7eb; max-width: 80%; font-size: 14px; }
.msg.me .bubble { background: #a18c7b; color: white; border: none; }
.chat-input-box { display: flex; gap: 8px; }
.chat-input-box input { flex: 1; padding: 10px; border-radius: 99px; border: 1px solid #d1d5db; outline: none; }
.chat-input-box button { background: #a18c7b; color: white; border: none; padding: 0 20px; border-radius: 99px; }
.empty-state { text-align: center; color: #999; margin-top: 20px; }
.loading { text-align: center; padding: 20px; color: #666; }
</style>