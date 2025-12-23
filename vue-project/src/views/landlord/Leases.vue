<template>
  <section class="panel">
    <div class="panel-header">
      <h2 class="panel-title">租約管理</h2>
      <button class="primary-btn" @click="openAddModal">
        ＋ 新增租約
      </button>
    </div>
    <p class="panel-hint">
      管理你的電子租約，支援上傳電子簽章、刪除或典藏歷史租約。
    </p>

    <div class="card-list">
      <article v-for="lease in leases" :key="lease.id" class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">
              {{ lease.rentalTitle }}
              <span
                class="badge-small"
                :class="lease.status === 'active' ? 'badge-active' : 'badge-archived'"
              >
                {{ lease.status === 'active' ? '有效中' : '已典藏' }}
              </span>
            </h3>
            <p class="card-sub">
              房客：{{ lease.tenantName }} · 期間：{{ lease.period }}
            </p>
          </div>
        </div>

        <p class="card-desc">
          上次更新：{{ lease.lastUpdate }} · 電子簽章：
          <span class="chip">{{ lease.hasESign ? '已上傳' : '未上傳' }}</span>
        </p>

        <div class="card-actions">
          <button class="small-btn" @click="uploadESign(lease)">上傳 / 更新電子簽章</button>
          
          <button
            class="small-btn outline"
            v-if="lease.status === 'active'"
            @click="archiveLease(lease)"
          >
            典藏租約
          </button>

          <button
            class="small-btn outline"
            v-if="lease.status === 'archived'"
            @click="restoreLease(lease)"
          >
            復原租約
          </button>

          <button class="small-btn danger" @click="deleteLease(lease.id)">
            刪除租約
          </button>
        </div>
      </article>
    </div>

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-box">
        <h3 class="modal-title">新增租約</h3>
        <p class="modal-sub">請輸入以下資訊以建立新合約</p>
        
        <div class="form-group">
          <label>租件名稱</label>
          <input type="text" v-model="tempLeaseForm.rentalTitle" placeholder="例如：雲科大旁溫馨套房">
        </div>

        <div class="form-group">
          <label>房客姓名</label>
          <input type="text" v-model="tempLeaseForm.tenantName" placeholder="例如：王小明">
        </div>

        <div class="form-group">
          <label>租約期間</label>
          <input type="text" v-model="tempLeaseForm.period" placeholder="例如：2025/03 - 2026/02">
        </div>

        <div class="modal-actions">
          <button class="small-btn outline" @click="closeAddModal">取消</button>
          <button class="small-btn primary" @click="confirmAddLease">確定新增</button>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref } from 'vue'

const leases = ref([
  {
    id: 1,
    rentalId: 1,
    rentalTitle: '雲科大旁溫馨套房',
    tenantName: '小明',
    period: '2025/02 - 2026/01',
    lastUpdate: '2025/01/10',
    hasESign: true,
    status: 'active'
  },
  {
    id: 2,
    rentalId: 2,
    rentalTitle: '斗六市區電梯雅房',
    tenantName: '小美',
    period: '2024/09 - 2025/06',
    lastUpdate: '2024/09/15',
    hasESign: false,
    status: 'archived'
  }
])

// --- Modal 相關狀態與邏輯 ---
const showAddModal = ref(false)
const tempLeaseForm = ref({ rentalTitle: '', tenantName: '', period: '' })

const openAddModal = () => {
  tempLeaseForm.value = { rentalTitle: '', tenantName: '', period: '' }
  showAddModal.value = true
}

const closeAddModal = () => { showAddModal.value = false }

const confirmAddLease = () => {
  const { rentalTitle, tenantName, period } = tempLeaseForm.value
  if (!rentalTitle || !tenantName || !period) { alert('請填寫完整租約資訊'); return }
  leases.value.unshift({
    id: Date.now(),
    rentalId: 0,
    rentalTitle,
    tenantName,
    period,
    lastUpdate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    hasESign: false,
    status: 'active'
  })
  closeAddModal()
}

// --- 操作功能 ---
const uploadESign = (lease) => {
  alert(`上傳/更新「${lease.rentalTitle} - ${lease.tenantName}」的電子簽章（示意）。`)
  lease.hasESign = true
  lease.lastUpdate = '2025/01/15'
}

const archiveLease = (lease) => {
  if (!confirm('確定要將此租約移到典藏嗎？')) return
  lease.status = 'archived'
}

// [新增] 復原租約功能
const restoreLease = (lease) => {
  if (!confirm('確定要還原此租約為「有效中」狀態嗎？')) return
  lease.status = 'active'
}

const deleteLease = (id) => {
  if (!confirm('確定要刪除此租約嗎？')) return
  leases.value = leases.value.filter((l) => l.id !== id)
}
</script>

<style scoped>
/* 原有樣式保持不變 */
.badge-small { margin-left: 6px; padding: 2px 6px; border-radius: 999px; font-size: 11px; }
.badge-active { background: #dcfce7; color: #166534; }
.badge-archived { background: #e5e7eb; color: #374151; }
.chip { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; background: #e1d4c8; color: #4a2c21; }

.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); position: relative; }
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
.card-list { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.card { padding: 10px 12px 10px; border-radius: 12px; background: #fefbf7; border: 1px solid #e1d4c8; box-shadow: 0 2px 8px rgba(46, 38, 34, 0.08); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-title { font-size: 16px; font-weight: 600; color: #2e2622; }
.card-sub { font-size: 13px; color: #6b7280; }
.card-desc { margin-top: 4px; font-size: 13px; color: #4b5563; }
.card-actions { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }

.primary-btn { border: none; padding: 6px 12px; border-radius: 999px; background: #a18c7b; color: #f2e6dc; font-size: 13px; cursor: pointer; transition: 0.2s ease; font-family: "Iansui", sans-serif; }
.primary-btn:hover { background: #4a2c21; }

.small-btn { border: none; padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer; font-family: "Iansui", sans-serif; background: #e1d4c8; color: #2e2622; transition: 0.2s ease; }
.small-btn:hover { background: #d3c2b1; }
.small-btn.outline { background: transparent; border: 1px solid #a18c7b; color: #4a2c21; }
.small-btn.outline:hover { background: #a18c7b; color: #f2e6dc; }
.small-btn.danger { background: #fee2e2; color: #991b1b; }
.small-btn.danger:hover { background: #fecaca; }
.small-btn.primary { background: #a18c7b; color: white; }
.small-btn.primary:hover { background: #8b7362; }

/* Modal 樣式 */
.modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); border-radius: 16px; }
.modal-box { background: #fff; width: 90%; max-width: 350px; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: popIn 0.2s ease; }
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.modal-title { font-size: 18px; font-weight: 600; color: #2e2622; margin-bottom: 4px; }
.modal-sub { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: #4b5563; margin-bottom: 4px; }
.form-group input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-family: "Iansui", sans-serif; box-sizing: border-box; font-size: 14px; }
.form-group input:focus { border-color: #a18c7b; outline: none; box-shadow: 0 0 0 2px rgba(161, 140, 123, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.modal-actions button { padding: 6px 16px; font-size: 13px; }
</style>