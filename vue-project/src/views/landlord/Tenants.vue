<template>
  <section class="panel">
    
    <template v-if="currentView === 'list'">
      <h2 class="panel-title">房客管理</h2>
      <p class="panel-hint">
        可查看現任與歷史房客名單、合約紀錄、付款紀錄。
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
                <th width="80">租金</th>
                <th width="80">水電費</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in group.tenants" :key="t.id">
                <td>{{ t.name }}</td>
                <td>{{ t.phone }}</td>
                <td>{{ t.contractStatus }}</td>
                
                <td>
                  <label class="checkbox-wrapper">
                    <input type="checkbox" v-model="t.rentPaid">
                    <span :class="['status-label', t.rentPaid ? 'paid' : 'unpaid']">
                      {{ t.rentPaid ? '已繳' : '未繳' }}
                    </span>
                  </label>
                </td>

                <td>
                  <label class="checkbox-wrapper">
                    <input type="checkbox" v-model="t.utilityPaid">
                    <span :class="['status-label', t.utilityPaid ? 'paid' : 'unpaid']">
                      {{ t.utilityPaid ? '已繳' : '未繳' }}
                    </span>
                  </label>
                </td>

                <td>
                  <button class="table-btn chat-btn" @click="openChat(t)">💬 聊天</button>
                  <button class="table-btn" @click="editTenant(t)">編輯</button>
                  <button class="table-btn warning" @click="moveToHistory(t)">封存</button>
                  <button class="table-btn outline" @click="viewTenantHistory(t)">
                    紀錄
                  </button>
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
                <th>繳費狀況</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in group.tenants" :key="t.id">
                <td>{{ t.name }}</td>
                <td>{{ t.phone }}</td>
                <td>
                   <span v-if="!t.rentPaid || !t.utilityPaid" class="badge-alert">尚有未繳項目</span>
                   <span v-else class="badge-ok">已結清</span>
                </td>
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
          <span class="header-main-text">{{ currentHistoryTenant.name }} - 繳費紀錄</span>
          <span class="header-sub-text">房租：$8,500 / 月</span>
        </div>
        <div style="width: 80px;"></div>
      </div>

      <div class="history-container">
        <div class="summary-cards">
          <div class="summary-card">
            <span class="summary-label">累計繳納租金</span>
            <span class="summary-value">$25,500</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">累計繳納水電</span>
            <span class="summary-value">$3,600</span>
          </div>
        </div>

        <div class="table-container">
          <table class="simple-table record-table">
            <thead>
              <tr>
                <th>繳費日期</th>
                <th>項目</th>
                <th>金額</th>
                <th>方式/備註</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in historyRecords" :key="index">
                <td class="date-col">{{ record.date }}</td>
                <td>
                  <span :class="['type-badge', record.type === '租金' ? 'type-rent' : 'type-util']">
                    {{ record.type }}
                  </span>
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
const currentView = ref('list') // 'list', 'chat', 'history'
const currentChatTenant = ref(null)
const currentHistoryTenant = ref(null) // 新增：當前查看紀錄的房客
const inputMessage = ref('')
const chatContainerRef = ref(null)
const chatMessages = ref([])
const historyRecords = ref([]) // 新增：紀錄資料

// 房客資料
const tenants = ref([
  { id: 1, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '小明', phone: '0912-345-678', contractStatus: '簽約中', rentPaid: true, utilityPaid: true, isHistory: false },
  { id: 2, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '小華', phone: '0922-111-333', contractStatus: '即將到期', rentPaid: false, utilityPaid: false, isHistory: false },
  { id: 3, rentalId: 2, rentalTitle: '斗六市區電梯雅房', name: '小美', phone: '0933-222-444', contractStatus: '生效中', rentPaid: true, utilityPaid: true, isHistory: false },
  { id: 4, rentalId: 1, rentalTitle: '雲科大旁溫馨套房', name: '老陳', phone: '0900-888-999', contractStatus: '已退租', rentPaid: true, utilityPaid: true, isHistory: true }
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

// --- 房客管理邏輯 ---
const addTenant = (rentalId) => { /*...同前...*/ 
  const rental = rentals.find(r => r.id === rentalId)
  const name = window.prompt('房客姓名：')
  const phone = window.prompt('房客電話：')
  if(name && phone) tenants.value.push({ id: Date.now(), rentalId, rentalTitle: rental.title, name, phone, contractStatus: '新合約', rentPaid: false, utilityPaid: false, isHistory: false })
}
const editTenant = (t) => { t.name = window.prompt('修改姓名：', t.name) || t.name }
const moveToHistory = (t) => { if (confirm(`將「${t.name}」封存至歷史？`)) { t.isHistory = true; t.contractStatus = '已退租' } }
const restoreTenant = (t) => { if (confirm(`還原「${t.name}」至現任？`)) { t.isHistory = false; t.contractStatus = '續約中' } }
const removeTenant = (id) => { if (confirm('永久刪除？')) tenants.value = tenants.value.filter(t => t.id !== id) }

// --- [新增] 查看歷史紀錄功能 ---
const viewTenantHistory = (t) => {
  currentHistoryTenant.value = t
  currentView.value = 'history'
  
  // 模擬生成資料 (實際專案應從後端 API 獲取)
  historyRecords.value = [
    { date: '2025/01/05', type: '租金', amount: 8500, note: '銀行轉帳 (末五碼 1234)' },
    { date: '2025/01/05', type: '水電費', amount: 1200, note: '電費 4.5度/元' },
    { date: '2024/12/05', type: '租金', amount: 8500, note: '現金支付' },
    { date: '2024/12/05', type: '水電費', amount: 1150, note: '包含公共電費' },
    { date: '2024/11/05', type: '租金', amount: 8500, note: '銀行轉帳' },
    { date: '2024/11/05', type: '水電費', amount: 1250, note: '-' },
  ]
}

// --- 聊天室功能邏輯 ---
const openChat = (tenant) => {
  currentChatTenant.value = tenant
  currentView.value = 'chat'
  chatMessages.value = [{ text: '你好，房租收到了嗎？', isMe: false, time: '昨天 10:00' }]
  scrollToBottom()
}
const backToList = () => { currentView.value = 'list'; currentChatTenant.value = null; currentHistoryTenant.value = null } // 統一返回
const sendMessage = () => { /*...同前...*/ 
  if(!inputMessage.value.trim()) return
  const time = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2,'0')
  chatMessages.value.push({ text: inputMessage.value, isMe: true, time })
  inputMessage.value = ''; scrollToBottom()
}
const scrollToBottom = async () => { await nextTick(); if (chatContainerRef.value) chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight }
</script>

<style scoped>
/* --- 共用樣式 --- */
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
.checkbox-wrapper { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 12px; user-select: none; }
.checkbox-wrapper input { cursor: pointer; accent-color: #a18c7b; } 
.status-label { font-weight: 500; }
.status-label.paid { color: #059669; }
.status-label.unpaid { color: #d97706; }

/* 歷史租客 */
.history-title { color: #6b7280; border-top: 2px dashed #e5e7eb; padding-top: 20px; }
.history-card { background: #f3f4f6; border-color: #e5e7eb; opacity: 0.9; }
.badge-alert { color: #d97706; font-weight: bold; font-size: 11px; }
.badge-ok { color: #059669; font-size: 11px; }
.empty-state { font-size: 13px; color: #9ca3af; text-align: center; padding: 12px; border: 1px dashed #d1d5db; border-radius: 8px; margin-bottom: 10px; }

/* --- 檢視標題區 (Chat & History 共用) --- */
.view-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px; }
.header-info { text-align: center; }
.header-main-text { display: block; font-size: 16px; font-weight: 600; color: #2e2622; }
.header-sub-text { font-size: 12px; color: #6b7280; }

/* --- 聊天室樣式 --- */
.chat-container { flex: 1; background: #fefbf7; border-radius: 8px; border: 1px solid #e1d4c8; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.message-row { display: flex; width: 100%; }
.message-row.me { justify-content: flex-end; } .message-row.other { justify-content: flex-start; } 
.bubble { max-width: 70%; padding: 8px 12px; border-radius: 12px; font-size: 14px; line-height: 1.5; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.message-row.me .bubble { background: #a18c7b; color: #fff; border-bottom-right-radius: 2px; }
.message-row.other .bubble { background: #fff; color: #374151; border: 1px solid #e5e7eb; border-bottom-left-radius: 2px; }
.bubble .time { display: block; font-size: 10px; margin-top: 4px; opacity: 0.8; text-align: right; }
.chat-input-area { margin-top: 12px; display: flex; gap: 8px; }
.chat-input { flex: 1; padding: 10px; border-radius: 99px; border: 1px solid #d1d5db; outline: none; transition: 0.2s; font-family: "Iansui", sans-serif; }
.chat-input:focus { border-color: #a18c7b; box-shadow: 0 0 0 2px rgba(161, 140, 123, 0.2); }
.send-btn { background: #a18c7b; color: white; border: none; padding: 0 20px; border-radius: 99px; cursor: pointer; font-weight: 600; }

/* --- [新增] 紀錄模式專用樣式 --- */
.history-container { flex: 1; display: flex; flex-direction: column; gap: 16px; overflow: hidden; }
.summary-cards { display: flex; gap: 12px; }
.summary-card { flex: 1; background: #fff; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.summary-label { font-size: 12px; color: #6b7280; }
.summary-value { font-size: 18px; font-weight: 700; color: #2e2622; margin-top: 4px; }

.table-container { flex: 1; overflow-y: auto; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 0 4px; }
.record-table th { position: sticky; top: 0; background: #f3f4f6; z-index: 1; }
.record-table td { padding: 10px 8px; }
.type-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.type-rent { background: #dcfce7; color: #166534; } /* 租金：綠底 */
.type-util { background: #ffedd5; color: #9a3412; } /* 水電：橘底 */
.amount-col { font-family: monospace; font-weight: 600; color: #374151; font-size: 14px; }
.date-col { color: #6b7280; font-size: 12px; }
.note-col { color: #6b7280; font-size: 12px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 卡片與按鈕基本樣式 */
.card { padding: 10px 12px 10px; border-radius: 12px; background: #fefbf7; border: 1px solid #e1d4c8; box-shadow: 0 2px 8px rgba(46, 38, 34, 0.08); margin-bottom: 10px; }
.card-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.card-sub { font-size: 13px; color: #6b7280; }
.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; font-family: "Iansui", sans-serif; background: #e1d4c8; color: #2e2622; transition: 0.2s ease; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
</style>