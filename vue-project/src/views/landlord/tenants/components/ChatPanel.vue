<template>
  <div class="view-header">
    <button class="small-btn outline" @click="$emit('back')">← 返回列表</button>
    <div class="header-info">
      <span class="header-main-text">{{ tenant.name }}</span>
      <span class="header-sub-text">{{ tenant.rentalTitle }}</span>
    </div>
    <button class="small-btn icon-btn" @click="fetchMessages" title="重新整理">🔄</button>
  </div>

  <div class="chat-container" ref="chatContainerRef">
    <div v-if="loading" class="loading-text">載入中...</div>
    <div v-else-if="chatMessages.length === 0" class="empty-text">尚無對話紀錄，打個招呼吧！👋</div>

    <div v-for="(msg, index) in chatMessages" :key="index" :class="['message-row', msg.isMe ? 'me' : 'other']">
      <div class="bubble">
        <p>{{ msg.text }}</p>
        <span class="time">{{ formatTime(msg.createdAt) }}</span>
      </div>
    </div>
  </div>

  <div class="chat-input-area">
    <input 
      type="text" 
      v-model="inputMessage" 
      @keyup.enter="sendMessage" 
      placeholder="輸入訊息..." 
      class="chat-input"
      :disabled="sending"
    >
    <button class="send-btn" @click="sendMessage" :disabled="sending">
      {{ sending ? '...' : '傳送' }}
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import api from '@/utils/api'


const props = defineProps(['tenant'])
defineEmits(['back'])

const inputMessage = ref('')
const chatContainerRef = ref(null)
const chatMessages = ref([])
const loading = ref(false)
const sending = ref(false)

const currentUser = JSON.parse(localStorage.getItem('currentUser'))

// 1. 透過 API 取得訊息
const fetchMessages = async () => {
  if (!currentUser || !props.tenant.uid) return
  
  // 只有第一次載入時顯示 Loading，手動重新整理時不顯示
  if (chatMessages.value.length === 0) loading.value = true
  
  try {
    const res = await api.get('/api/chat/history', {
      params: {
        senderId: currentUser.uid,
        receiverId: props.tenant.uid,
        role: 'landlord'
      }
    })

    if (res.data.success) {
      chatMessages.value = res.data.data.map(msg => ({
        ...msg,
        // 判斷是否為自己發的
        isMe: msg.senderId === currentUser.uid
      }))
      scrollToBottom()
    }
  } catch (error) {
    console.error('載入失敗', error)
  } finally {
    loading.value = false
  }
}

// 2. 發送訊息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return

  const textToSend = inputMessage.value
  inputMessage.value = '' 
  sending.value = true

  try {
    await api.post('/api/chat/send', {
      senderId: currentUser.uid,
      receiverId: props.tenant.uid,
      message: textToSend,
      senderRole: 'landlord'
    })
    
    // ✨ 發送成功後，立刻重新抓取一次最新訊息
    await fetchMessages()
    
  } catch (error) {
    console.error('發送失敗', error)
    alert('訊息發送失敗')
    inputMessage.value = textToSend
  } finally {
    sending.value = false
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
/* 樣式保持不變，新增 icon-btn */
.view-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px; }
.header-info { text-align: center; }
.header-main-text { font-size: 16px; font-weight: 600; color: #2e2622; display: block;}
.header-sub-text { font-size: 12px; color: #6b7280; }
.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; background: #e1d4c8; color: #2e2622; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
.icon-btn { font-size: 14px; padding: 4px 8px; } /* 重新整理按鈕 */

.chat-container { flex: 1; background: #fefbf7; border-radius: 8px; border: 1px solid #e1d4c8; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.loading-text, .empty-text { text-align: center; color: #999; font-size: 13px; margin-top: 20px; }

.message-row { display: flex; width: 100%; }
.message-row.me { justify-content: flex-end; } .message-row.other { justify-content: flex-start; } 
.bubble { max-width: 70%; padding: 8px 12px; border-radius: 12px; font-size: 14px; line-height: 1.5; background: #fff; border: 1px solid #e5e7eb; }
.message-row.me .bubble { background: #a18c7b; color: #fff; border: none; }
.time { display: block; font-size: 10px; margin-top: 4px; opacity: 0.7; text-align: right; }

.chat-input-area { margin-top: 12px; display: flex; gap: 8px; }
.chat-input { flex: 1; padding: 10px; border-radius: 99px; border: 1px solid #d1d5db; outline: none; font-family: "Iansui", sans-serif;}
.send-btn { background: #a18c7b; color: white; border: none; padding: 0 20px; border-radius: 99px; cursor: pointer; font-family: "Iansui", sans-serif;}
.send-btn:disabled { background: #ccc; cursor: not-allowed; }
</style>