<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <h3 class="modal-title">修改租約期間</h3>
      <p class="modal-sub">{{ tenant.name }} - {{ tenant.rentalTitle }}</p>

      <div class="form-group date-row">
        <div class="half">
          <label>租約開始 (Start)</label>
          <input type="date" v-model="form.leaseStart">
        </div>
        <div class="half">
          <label>租約結束 (End)</label>
          <input type="date" v-model="form.leaseEnd">
        </div>
      </div>

      <div class="modal-actions">
        <button class="small-btn outline" @click="$emit('close')">取消</button>
        <button class="small-btn primary" @click="handleConfirm">儲存變更</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps(['tenant'])
const emit = defineEmits(['close', 'confirm'])

const form = reactive({
  leaseStart: props.tenant.leaseStart || '',
  leaseEnd: props.tenant.leaseEnd || ''
})

const handleConfirm = () => {
  if (!form.leaseStart || !form.leaseEnd) {
    alert('請完整選擇起訖日期')
    return
  }
  // 回傳新的日期給父層
  emit('confirm', { ...form })
}
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.modal-box { background: #fff; width: 90%; max-width: 350px; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: popIn 0.2s ease; }
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-title { font-size: 18px; font-weight: 600; color: #2e2622; margin-bottom: 4px; }
.modal-sub { font-size: 13px; color: #666; margin-bottom: 16px; }

.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: #4b5563; margin-bottom: 4px; }
.form-group input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-family: "Iansui", sans-serif; box-sizing: border-box; }
.form-group input:focus { border-color: #a18c7b; outline: none; }

.date-row { display: flex; gap: 10px; }
.half { flex: 1; }

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.small-btn { border: none; padding: 6px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; background: #e1d4c8; color: #2e2622; font-family: "Iansui", sans-serif; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
.small-btn.primary { background: #a18c7b; color: white; }
</style>