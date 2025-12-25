<template>
  <div class="view-header">
    <button class="small-btn outline" @click="$emit('back')">← 返回列表</button>
    <div class="header-info">
      <span class="header-main-text">{{ tenant.name }} - 詳細流水帳</span>
    </div>
    <div style="width: 80px;"></div>
  </div>

  <div class="history-container">
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
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['tenant'])
defineEmits(['back'])

// 假資料
const historyRecords = ref([
  { date: '2025/01/05', type: '租金', amount: 8500, note: '轉帳' },
  { date: '2025/01/05', type: '水電費', amount: 1200, note: '現金' }
])
</script>

<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px; }
.header-info { text-align: center; }
.header-main-text { font-size: 16px; font-weight: 600; color: #2e2622; display: block;}
.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; background: #e1d4c8; color: #2e2622; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }

.history-container { flex: 1; overflow-y: auto; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 0 4px; }
.simple-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.simple-table th, .simple-table td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
.type-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.type-rent { background: #dcfce7; color: #166534; }
.type-util { background: #ffedd5; color: #9a3412; }
</style>