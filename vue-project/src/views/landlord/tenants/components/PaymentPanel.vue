<template>
  <div class="view-header">
    <button class="small-btn outline" @click="$emit('back')">← 返回列表</button>
    <div class="header-info">
      <span class="header-main-text">{{ tenant.name }} - 繳費管理</span>
      <span class="header-sub-text">租約期間：{{ displayDateRange }}</span>
    </div>
    <div style="width: 80px;"></div>
  </div>

  <div class="payment-container">
    <table class="simple-table payment-table">
      <thead>
        <tr>
          <th>月份</th>
          <th width="60" class="text-center">房租</th>
          <th width="60" class="text-center">水費</th>
          <th width="60" class="text-center">電費</th>
          <th>房東私密備註</th> 
          <th width="70" class="text-center">狀態</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="displayMonths.length === 0">
          <td colspan="6" class="text-center" style="padding: 20px; color: #999;">
            尚未設定租約期間，或租約已過期
          </td>
        </tr>

        <tr v-for="month in displayMonths" :key="month" :class="{ 'current-month': month === currentMonthStr }">
          <td class="month-col">{{ month }}</td>
          
          <td class="text-center">
            <label class="checkbox-wrapper center">
              <input type="checkbox" 
                :checked="getRecord(month).rent" 
                @change="updateRecord(month, 'rent', $event.target.checked)"
              >
            </label>
          </td>

          <td class="text-center">
            <label class="checkbox-wrapper center">
              <input type="checkbox" 
                :checked="getRecord(month).water" 
                @change="updateRecord(month, 'water', $event.target.checked)"
              >
            </label>
          </td>

          <td class="text-center">
            <label class="checkbox-wrapper center">
              <input type="checkbox" 
                :checked="getRecord(month).electric" 
                @change="updateRecord(month, 'electric', $event.target.checked)"
              >
            </label>
          </td>

          <td>
            <input 
              type="text" 
              class="note-input"
              placeholder="僅房東可見..." 
              :value="getRecord(month).landlordNote" 
              @blur="updateNote(month, $event.target.value)"
            >
          </td>

          <td class="text-center">
            <span class="status-text" :class="isMonthCleared(month) ? 'ok' : 'pending'">
              {{ isMonthCleared(month) ? '已繳' : '未繳' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="payment-actions">
      <button class="small-btn" @click="$emit('back')">完成並返回</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import api from '@/utils/api'

const props = defineProps(['tenant'])
const emit = defineEmits(['back', 'refresh'])

const currentMonthStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
})

const displayDateRange = computed(() => {
  if (!props.tenant.leaseStart || !props.tenant.leaseEnd) return '未設定 (顯示最近 12 個月)'
  return `${props.tenant.leaseStart} ~ ${props.tenant.leaseEnd}`
})

const displayMonths = computed(() => {
  let start = props.tenant.leaseStart ? new Date(props.tenant.leaseStart) : new Date(new Date().getFullYear(), 0, 1)
  let end = props.tenant.leaseEnd ? new Date(props.tenant.leaseEnd) : new Date(new Date().getFullYear(), 11, 31)

  const months = []
  let current = new Date(start.getFullYear(), start.getMonth(), 1)
  const endDate = new Date(end.getFullYear(), end.getMonth(), 1)

  while (current <= endDate) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    months.push(`${y}/${m}`)
    current.setMonth(current.getMonth() + 1)
  }
  return months.reverse()
})

const getRecord = (month) => {
  if (!props.tenant.records) return {}
  return props.tenant.records[month] || {}
}

const isMonthCleared = (month) => {
  const r = getRecord(month)
  return r.rent && r.water && r.electric
}

// Checkbox 更新
const updateRecord = async (month, field, value) => {
  const newRecords = JSON.parse(JSON.stringify(props.tenant.records || {}))
  if (!newRecords[month]) newRecords[month] = {}
  newRecords[month][field] = value
  await saveToBackend(newRecords)
}

// ✨ Note 更新 (寫入 landlordNote)
const updateNote = async (month, value) => {
  const currentNote = getRecord(month).landlordNote || ''
  if (currentNote === value) return 

  const newRecords = JSON.parse(JSON.stringify(props.tenant.records || {}))
  if (!newRecords[month]) newRecords[month] = {}
  
  // 這裡只更新 landlordNote，不會影響到 hidden 的 tenantNote (前提是 records 物件裡有保留它)
  newRecords[month].landlordNote = value

  await saveToBackend(newRecords)
}

const saveToBackend = async (records) => {
  try {
    await api.put(`/api/landlord/tenants/${props.tenant.id}`, { records })
    emit('refresh')
    props.tenant.records = records // 暫時更新 UI
  } catch (error) {
    console.error('更新失敗', error)
    alert('儲存失敗，請檢查網路')
  }
}
</script>

<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px; }
.header-info { text-align: center; }
.header-main-text { font-size: 16px; font-weight: 600; color: #2e2622; display: block;}
.header-sub-text { font-size: 12px; color: #6b7280; }
.payment-container { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.payment-table { background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; width: 100%; border-collapse: collapse;}
.payment-table th, .payment-table td { padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; }
.current-month { background-color: #fffbeb; }
.text-center { text-align: center; }
.checkbox-wrapper.center { display: flex; justify-content: center; }
.month-col { font-weight: 600; color: #4b5563; font-family: monospace; }
.status-text { font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #f3f4f6; color: #6b7280; white-space: nowrap; }
.status-text.ok { background: #dcfce7; color: #166534; }
.status-text.pending { background: #ffedd5; color: #c2410c; }
.note-input { width: 100%; border: 1px solid transparent; background: transparent; padding: 4px; font-size: 13px; color: #4b5563; border-radius: 4px; }
.note-input:hover { border-color: #ddd; background: #f9f9f9; }
.note-input:focus { border-color: #a18c7b; background: #fff; outline: none; }
.payment-actions { text-align: center; margin-top: 10px; }
.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; background: #e1d4c8; color: #2e2622; font-family: "Iansui", sans-serif; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
</style>