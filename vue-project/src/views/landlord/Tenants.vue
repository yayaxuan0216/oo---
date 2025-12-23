<template>
  <section class="panel">
    
    <template v-if="currentView === 'list'">
      <h2 class="panel-title">房客管理</h2>
      <p class="panel-hint">
        可查看現任與歷史房客名單，並管理每月詳細繳費狀況。
      </p>

      <h3 class="sub-title">📍 現任房客名單</h3>
      <div v-if="activeTenantGroups.length === 0" class="empty-state">目前沒有現任房客</div>

      <div class="card-list">
        <article v-for="group in activeTenantGroups" :key="group.rentalId" class="card">
          <h3 class="card-title">{{ group.rentalTitle }}</h3>
          <p class="card-sub">目前房客：{{ group.tenants.length }} 位</p>

          <table class="simple-table">
            <thead>
              <tr>
                <th>房客姓名</th>
                <th>聯絡電話</th>
                <th>合約狀態</th>
                <th width="140">本月繳費狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in group.tenants" :key="t.id">
                <td>{{ t.name }}</td>
                <td>{{ t.phone }}</td>
                <td>{{ t.contractStatus }}</td>
                
                <td>
                  <button 
                    class="payment-status-btn" 
                    :class="isCurrentMonthPaid(t) ? 'paid' : 'unpaid'"
                    @click="openPayment(t)"
                  >
                    <span class="icon">{{ isCurrentMonthPaid(t) ? '✅' : '⚠️' }}</span>
                    {{ isCurrentMonthPaid(t) ? '本月已清' : '管理繳費' }}
                  </button>
                </td>

                <td>
                  <button class="table-btn chat-btn" @click="openChat(t)">💬 聊天</button>
                  <button class="table-btn" @click="editTenant(t)">編輯</button>
                  <button class="table-btn warning" @click="moveToHistory(t)">封存</button>
                  <button class="table-btn outline" @click="viewTenantHistory(t)">紀錄</button>
                </td>
              </tr>
            </tbody>
          </table>
          <button class="small-btn" @click="addTenant(group.rentalId)">＋ 新增房客</button>
        </article>
      </div>

      <h3 class="sub-title history-title">📂 歷史租客專區</h3>
      <div v-if="historyTenantGroups.length === 0" class="empty-state">尚無歷史租客資料</div>

      <div class="card-list">
        <article v-for="group in historyTenantGroups" :key="group.rentalId" class="card history-card">
          <h3 class="card-title text-gray">{{ group.rentalTitle }} (已搬離)</h3>
          
          <table class="simple-table history-table">
            <thead>
              <tr>
                <th>房客姓名</th>
                <th>聯絡電話</th>
                <th>備註</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in group.tenants" :key="t.id">
                <td>{{ t.name }}</td>
                <td>{{ t.phone }}</td>
                <td><span class="text-gray">歷史資料</span></td>
                <td>
                  <button class="table-btn outline" @click="restoreTenant(t)">還原</button>
                  <button class="table-btn danger" @click="removeTenant(t.id)">永久刪除</button>
                  <button class="table-btn outline" @click="viewTenantHistory(t)">過往紀錄</button>
                </td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>
    </template>


    <template v-else-if="currentView === 'payment'">
      <div class="view-header">
        <button class="small-btn outline" @click="backToList">← 返回列表</button>
        <div class="header-info">
          <span class="header-main-text">{{ currentPaymentTenant.name }} - 繳費管理</span>
          <span class="header-sub-text">請勾選已繳納的項目</span>
        </div>
        <div style="width: 80px;"></div>
      </div>

      <div class="payment-container">
        <table class="simple-table payment-table">
          <thead>
            <tr>
              <th>月份</th>
              <th width="80" class="text-center">房租</th>
              <th width="80" class="text-center">水費</th>
              <th width="80" class="text-center">電費</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="month in displayMonths" :key="month">
              <td class="month-col">{{ month }}</td>
              
              <td class="text-center">
                <label class="checkbox-wrapper center">
                  <input type="checkbox" v-model="getRecord(currentPaymentTenant, month).rent">
                </label>
              </td>

              <td class="text-center">
                <label class="checkbox-wrapper center">
                  <input type="checkbox" v-model="getRecord(currentPaymentTenant, month).water">
                </label>
              </td>

              <td class="text-center">
                <label class="checkbox-wrapper center">
                  <input type="checkbox" v-model="getRecord(currentPaymentTenant, month).electric">
                </label>
              </td>

              <td>
                <span class="status-text" :class="isMonthCleared(currentPaymentTenant, month) ? 'ok' : 'pending'">
                  {{ isMonthCleared(currentPaymentTenant, month) ? '已繳清' : '未繳清' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="payment-actions">
           <button class="small-btn" @click="backToList">完成並返回</button>
        </div>
      </div>
    </template>


    <template v-else-if="currentView === 'chat'">
      <div class="view-header">
        <button class="small-btn outline" @click="backToList">← 返回列表</button>
        <div class="header-info">
          <span class="header-main-text">{{ currentChatTenant.name }}</span>
          <span class="header-sub-text">{{ currentChatTenant.rentalTitle }}</span>
        </div>
        <div style="width: 80px;"></div> 
      </div>

      <div class="chat-container" ref="chatContainerRef">
        <div v-for="(msg, index) in chatMessages" :key="index" :class="['message-row', msg.isMe ? 'me' : 'other']">
          <div class="bubble">
            <p>{{ msg.text }}</p>
            <span class="time">{{ msg.time }}</span>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <input type="text" v-model="inputMessage" @keyup.enter="sendMessage" placeholder="輸入訊息..." class="chat-input">
        <button class="send-btn" @click="sendMessage">傳送</button>
      </div>
    </template>


    <template v-else-if="currentView === 'history'">
      <div class="view-header">
        <button class="small-btn outline" @click="backToList">← 返回列表</button>
        <div class="header-info">
          <span class="header-main-text">{{ currentHistoryTenant.name }} - 詳細流水帳</span>
        </div>
        <div style="width: 80px;"></div>
      </div>

      <div class="history-container">
        <div class="table-container">
          <table class="simple-table record-table">
            <thead>
              <tr>
                <th>繳費日期</th>
                <th>項目</th>
                <th>金額</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in historyRecords" :key="index">
                <td class="date-col">{{ record.date }}</td>
                <td>
                  <span :class="['type-badge', record.type === '租金' ? 'type-rent' : 'type-util']">{{ record.type }}</span>
                </td>
                <td class="amount-col">${{ record.amount.toLocaleString() }}</td>
                <td class="note-col">{{ record.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

  </section>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// --- 資料與狀態 ---
const currentView = ref('list') // 'list', 'chat', 'history', 'payment'
const currentChatTenant = ref(null)
const currentHistoryTenant = ref(null)
const currentPaymentTenant = ref(null)

const inputMessage = ref('')
const chatContainerRef = ref(null)
const chatMessages = ref([])
const historyRecords = ref([])

// 時間與日期相關工具
const getCurrentMonthStr = () => {
  const now = new Date()
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
}

const displayMonths = computed(() => {
  const months = []
  const date = new Date()
  for (let i = 0; i < 6; i++) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    months.push(`${y}/${m}`)
    date.setMonth(date.getMonth() - 1)
  }
  return months
})

// 房客資料
const tenants = ref([
  { 
    id: 1, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '小明', phone: '0912345678', contractStatus: '簽約中', isHistory: false,
    records: {} 
  },
  { 
    id: 2, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '小華', phone: '0922111333', contractStatus: '即將到期', isHistory: false,
    records: {}
  },
  { 
    id: 3, rentalId: 2, rentalTitle: '斗六市區電梯雅房', name: '小美', phone: '0933222444', contractStatus: '生效中', isHistory: false,
    records: {}
  },
  { 
    id: 4, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '老陳', phone: '0900888999', contractStatus: '已退租', isHistory: true,
    records: {}
  }
])
const rentals = [{ id: 1, title: '雲科大旁溫馨套房' }, { id: 2, title: '斗六市區電梯雅房' }]

const groupTenants = (tenantList) => {
  const groupMap = new Map()
  tenantList.forEach((t) => {
    if (!groupMap.has(t.rentalId)) groupMap.set(t.rentalId, { rentalId: t.rentalId, rentalTitle: t.rentalTitle, tenants: [] })
    groupMap.get(t.rentalId).tenants.push(t)
  })
  return Array.from(groupMap.values())
}

const activeTenantGroups = computed(() => groupTenants(tenants.value.filter(t => !t.isHistory)))
const historyTenantGroups = computed(() => groupTenants(tenants.value.filter(t => t.isHistory)))

// --- 繳費管理邏輯 ---
const openPayment = (t) => { currentPaymentTenant.value = t; currentView.value = 'payment' }
const getRecord = (t, month) => {
  if (!t.records[month]) t.records[month] = { rent: false, water: false, electric: false }
  return t.records[month]
}
const isMonthCleared = (t, month) => { const r = getRecord(t, month); return r.rent && r.water && r.electric }
const isCurrentMonthPaid = (t) => { return isMonthCleared(t, getCurrentMonthStr()) }

// --- 房客管理邏輯 ---
const addTenant = (rentalId) => {
  const rental = rentals.find(r => r.id === rentalId)
  const name = window.prompt('房客姓名：')
  const phone = window.prompt('房客電話：')
  if(name && phone) tenants.value.push({ id: Date.now(), rentalId, rentalTitle: rental.title, name, phone, contractStatus: '新合約', isHistory: false, records: {} })
}
const editTenant = (t) => { t.name = window.prompt('修改姓名：', t.name) || t.name }
const moveToHistory = (t) => { if (confirm(`將「${t.name}」封存至歷史？`)) { t.isHistory = true; t.contractStatus = '已退租' } }
const restoreTenant = (t) => { if (confirm(`還原「${t.name}」至現任？`)) { t.isHistory = false; t.contractStatus = '續約中' } }
const removeTenant = (id) => { if (confirm('永久刪除？')) tenants.value = tenants.value.filter(t => t.id !== id) }

// --- 歷史紀錄邏輯 ---
const viewTenantHistory = (t) => {
  currentHistoryTenant.value = t; currentView.value = 'history'
  historyRecords.value = [ { date: '2025/01/05', type: '租金', amount: 8500, note: '轉帳' }, { date: '2025/01/05', type: '水電費', amount: 1200, note: '現金' } ]
}

// --- 聊天室邏輯 ---
const openChat = (tenant) => {
  currentChatTenant.value = tenant; currentView.value = 'chat'
  chatMessages.value = [{ text: '你好，房租收到了嗎？', isMe: false, time: '昨天 10:00' }]
  scrollToBottom()
}

const backToList = () => { 
  currentView.value = 'list'
  currentChatTenant.value = null; currentHistoryTenant.value = null; currentPaymentTenant.value = null 
} 

const sendMessage = () => {
  if(!inputMessage.value.trim()) return
  
  const now = new Date()
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`

  // 1. 顯示我的訊息
  chatMessages.value.push({ text: inputMessage.value, isMe: true, time })
  inputMessage.value = ''
  scrollToBottom()

  // 2. [新增] 模擬房客延遲回覆
  setTimeout(() => {
    const replyNow = new Date()
    const replyTime = `${replyNow.getHours()}:${String(replyNow.getMinutes()).padStart(2, '0')}`
    
    chatMessages.value.push({ 
      text: '好的，收到！', 
      isMe: false, 
      time: replyTime 
    })
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = async () => { await nextTick(); if (chatContainerRef.value) chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight }
</script>

<style scoped>
/* 共用樣式 */
.sub-title { margin-top: 24px; margin-bottom: 8px; font-size: 18px; font-weight: 700; color: #2e2622; display: flex; align-items: center; gap: 8px; }
.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); height: 85vh; display: flex; flex-direction: column; overflow: hidden; }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; margin-bottom: 10px; }
.card-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-bottom: 10px; padding-right: 4px; } 

/* 表格與按鈕 */
.simple-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
.simple-table th, .simple-table td { border-bottom: 1px solid #e5e7eb; padding: 6px 6px; text-align: left; vertical-align: middle; }
.simple-table th { background: #f9fafb; color: #4b5563; }
.table-btn { border: none; padding: 3px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; margin-right: 4px; font-family: "Iansui", sans-serif; background: #e5e7eb; color: #374151; transition: 0.2s; }
.table-btn:hover { background: #d1d5db; }
.table-btn.outline { background: transparent; border: 1px solid #9ca3af; }
.table-btn.danger { background: #fee2e2; color: #991b1b; }
.table-btn.warning { background: #ffedd5; color: #9a3412; }
.table-btn.chat-btn { background: #e0f2fe; color: #0369a1; font-weight: 600; } 

/* 繳費狀態按鈕 */
.payment-status-btn { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; font-size: 13px; font-family: "Iansui", sans-serif; transition: 0.2s; width: 100%; justify-content: center; }
.payment-status-btn.paid { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
.payment-status-btn.paid:hover { background: #d1fae5; }
.payment-status-btn.unpaid { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
.payment-status-btn.unpaid:hover { background: #ffedd5; }
.payment-status-btn .icon { font-size: 12px; }

/* 繳費管理頁面樣式 */
.payment-container { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.payment-table { background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; }
.payment-table th { position: sticky; top: 0; z-index: 1; }
.text-center { text-align: center !important; }
.checkbox-wrapper.center { justify-content: center; }
.month-col { font-weight: 600; color: #4b5563; }
.status-text { font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #f3f4f6; color: #6b7280; }
.status-text.ok { background: #dcfce7; color: #166534; }
.status-text.pending { background: #ffedd5; color: #c2410c; }
.payment-actions { text-align: center; margin-top: 10px; }

/* 檢視標題區 */
.view-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px; }
.header-info { text-align: center; }
.header-main-text { display: block; font-size: 16px; font-weight: 600; color: #2e2622; }
.header-sub-text { font-size: 12px; color: #6b7280; }

/* 聊天室與歷史樣式 */
.chat-container { flex: 1; background: #fefbf7; border-radius: 8px; border: 1px solid #e1d4c8; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.message-row { display: flex; width: 100%; }
.message-row.me { justify-content: flex-end; } .message-row.other { justify-content: flex-start; } 
.bubble { max-width: 70%; padding: 8px 12px; border-radius: 12px; font-size: 14px; line-height: 1.5; background: #fff; border: 1px solid #e5e7eb; }
.message-row.me .bubble { background: #a18c7b; color: #fff; border: none; }
.chat-input-area { margin-top: 12px; display: flex; gap: 8px; }
.chat-input { flex: 1; padding: 10px; border-radius: 99px; border: 1px solid #d1d5db; outline: none; }
.send-btn { background: #a18c7b; color: white; border: none; padding: 0 20px; border-radius: 99px; cursor: pointer; }

.history-container { flex: 1; overflow-y: auto; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 0 4px; }
.type-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.type-rent { background: #dcfce7; color: #166534; }
.type-util { background: #ffedd5; color: #9a3412; }
.empty-state { font-size: 13px; color: #9ca3af; text-align: center; padding: 12px; border: 1px dashed #d1d5db; border-radius: 8px; margin-bottom: 10px; }
.text-gray { color: #6b7280; }

.checkbox-wrapper { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 12px; user-select: none; }
.checkbox-wrapper input { cursor: pointer; accent-color: #a18c7b; width: 16px; height: 16px; } 

.card { padding: 10px 12px 10px; border-radius: 12px; background: #fefbf7; border: 1px solid #e1d4c8; margin-bottom: 10px; }
.card-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.card-sub { font-size: 13px; color: #6b7280; }
.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; background: #e1d4c8; color: #2e2622; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
</style>