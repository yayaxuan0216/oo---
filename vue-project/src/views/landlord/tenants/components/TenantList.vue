<template>
  <h2 class="panel-title">房客管理</h2>
  <p class="panel-hint">可查看現任與歷史房客名單，並管理每月詳細繳費狀況。</p>

  <div class="tab-container">
    <button class="tab-btn" :class="{ active: tenantTab === 'active' }" @click="tenantTab = 'active'">
      📍 現任房客 (依房源)
    </button>
    <button class="tab-btn" :class="{ active: tenantTab === 'history' }" @click="tenantTab = 'history'">
      📂 歷史紀錄
    </button>
  </div>

  <div v-if="tenantTab === 'active'" class="tab-content">
    
    <div v-if="rentals.length === 0" class="empty-state">
      目前沒有任何房源資料，請先至「房源管理」建立物件。
    </div>

    <div v-else class="card-list">
      <article v-for="item in activeRentalCards" :key="item.rentalId" class="card">
        <h3 class="card-title">{{ item.rentalTitle }}</h3>
        
        <div v-if="item.tenants.length > 0">
          <p class="card-sub">目前房客：{{ item.tenants.length }} 位</p>
          <table class="simple-table">
            <thead>
              <tr>
                <th>房客姓名</th>
                <th>聯絡電話</th>
                <th>租約期間</th>
                <th width="120">本月繳費</th>
                <th width="160">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in item.tenants" :key="t.id">
                <td>{{ t.name }}</td>
                
                <td>{{ t.phone }}</td>

                <td class="date-cell">
                  <div class="date-content">
                    <div v-if="t.leaseStart && t.leaseEnd">
                      <div class="date-text">{{ formatDate(t.leaseStart) }}</div>
                      <div class="date-sep">~</div>
                      <div class="date-text">{{ formatDate(t.leaseEnd) }}</div>
                    </div>
                    <span v-else class="text-gray-small">未設定</span>
                    
                    <button class="edit-date-btn" title="修改租約期間" @click.stop="$emit('edit-lease', t)">
                      🖊️
                    </button>
                  </div>
                </td>

                <td>
                  <button 
                    class="payment-status-btn" 
                    :class="isCurrentMonthPaid(t) ? 'paid' : 'unpaid'"
                    @click="$emit('open-payment', t)"
                  >
                    <span class="icon">{{ isCurrentMonthPaid(t) ? '✅' : '⚠️' }}</span>
                    {{ isCurrentMonthPaid(t) ? '已清' : '未繳' }}
                  </button>
                </td>

                <td class="action-cell">
                  <button class="table-btn chat-btn" @click="$emit('open-chat', t)">💬</button>
                  <button class="table-btn" @click="$emit('edit-tenant', t)">編輯</button>
                  <button class="table-btn warning" @click="$emit('archive-tenant', t)">退租</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="no-tenant-state">
          <p>🏠 此物件目前閒置中 (無房客)</p>
        </div>
        
        <button class="small-btn add-btn" @click="$emit('open-add', item.rentalId)">
          ＋ 在此房源新增房客
        </button>
      </article>
    </div>
  </div>

  <div v-if="tenantTab === 'history'" class="tab-content">
    <div v-if="historyTenantGroups.length === 0" class="empty-state">尚無歷史租客資料</div>

    <div class="card-list">
      <article v-for="group in historyTenantGroups" :key="group.rentalId" class="card history-card">
        <h3 class="card-title text-gray">{{ group.rentalTitle }} (已搬離)</h3>
        <table class="simple-table history-table">
          <thead>
            <tr>
              <th>房客姓名</th>
              <th>聯絡電話</th>
              <th>原租約期間</th>
              <th>備註</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in group.tenants" :key="t.id">
              <td>{{ t.name }}</td>
              <td>{{ t.phone }}</td>
              
              <td class="date-cell">
                <div v-if="t.leaseStart && t.leaseEnd">
                  <div class="date-text">{{ formatDate(t.leaseStart) }}</div>
                  <div class="date-sep">~</div>
                  <div class="date-text">{{ formatDate(t.leaseEnd) }}</div>
                </div>
                <span v-else class="text-gray-small">未設定</span>
              </td>

              <td><span class="text-gray-small">歷史資料</span></td>
              <td class="action-cell">
                <button class="table-btn outline" @click="$emit('restore-tenant', t)">還原</button>
                <button class="table-btn outline" @click="$emit('open-history', t)">紀錄</button>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['tenants', 'rentals'])
// ✨ 記得加入 'edit-lease'
defineEmits([
  'open-payment', 'open-chat', 'open-history', 'open-add', 
  'edit-tenant', 'archive-tenant', 'restore-tenant', 'remove-tenant', 
  'edit-lease'
])

const tenantTab = ref('active')

// 日期格式化 helper
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace(/-/g, '/')
}

const activeRentalCards = computed(() => {
  if (!props.rentals) return []

  return props.rentals.map(rental => {
    const myTenants = (props.tenants || []).filter(t => 
      t.rentalId === rental.id && t.status !== 'history'
    )

    return {
      rentalId: rental.id,
      rentalTitle: rental.title,
      tenants: myTenants
    }
  })
})

const historyTenantGroups = computed(() => {
  const groupMap = new Map()
  const historyList = (props.tenants || []).filter(t => t.status === 'history')
  
  historyList.forEach((t) => {
    const rId = t.rentalId || 'unknown'
    const rTitle = t.rentalTitle || '未知房源'
    if (!groupMap.has(rId)) {
      groupMap.set(rId, { rentalId: rId, rentalTitle: rTitle, tenants: [] })
    }
    groupMap.get(rId).tenants.push(t)
  })
  return Array.from(groupMap.values())
})

const getCurrentMonthStr = () => {
  const now = new Date()
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
}

const isCurrentMonthPaid = (t) => {
  const month = getCurrentMonthStr()
  if (!t.records) return false
  const r = t.records[month]
  return r && r.rent && r.water && r.electric
}
</script>

<style scoped>
/* 樣式保持不變 */
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; margin-bottom: 10px; }
.tab-container { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 0; }
.tab-btn { background: none; border: none; padding: 8px 16px; font-size: 15px; font-weight: 600; color: #6b7280; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; margin-bottom: -2px; font-family: "Iansui", sans-serif; }
.tab-btn:hover { color: #a18c7b; }
.tab-btn.active { color: #2e2622; border-bottom: 3px solid #a18c7b; }
.tab-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.card-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-bottom: 10px; padding-right: 4px; }
.card { padding: 10px 12px 10px; border-radius: 12px; background: #fefbf7; border: 1px solid #e1d4c8; margin-bottom: 10px; }
.card-title { font-size: 16px; font-weight: 600; color: #2e2622; margin-bottom: 8px; }
.card-sub { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
.no-tenant-state { padding: 15px; background: rgba(255,255,255,0.5); border-radius: 8px; text-align: center; color: #888; font-size: 13px; margin-bottom: 10px; border: 1px dashed #ccc; }
.simple-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 12px; font-size: 13px; }
.simple-table th, .simple-table td { border-bottom: 1px solid #e5e7eb; padding: 6px; text-align: left; vertical-align: middle; }
.simple-table th { background: #f9fafb; color: #4b5563; }
.table-btn { border: none; padding: 4px 8px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-right: 4px; font-family: "Iansui", sans-serif; background: #e5e7eb; color: #374151; }
.table-btn:hover { background: #d1d5db; }
.table-btn.outline { background: transparent; border: 1px solid #9ca3af; }
.table-btn.warning { background: #fee2e2; color: #991b1b; }
.table-btn.chat-btn { background: #e0f2fe; color: #0369a1; }
.payment-status-btn { display: flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; border: 1px solid transparent; cursor: pointer; font-size: 12px; }
.payment-status-btn.paid { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
.payment-status-btn.unpaid { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
.add-btn { display: block; width: 100%; margin-top: 5px; padding: 8px 0; font-weight: 600; font-size: 13px; background: #e1d4c8; border: none; border-radius: 8px; cursor: pointer; color: #2e2622;}
.add-btn:hover { background: #d3c2b1; }
.empty-state { font-size: 13px; color: #9ca3af; text-align: center; padding: 20px; border: 1px dashed #d1d5db; border-radius: 8px; }
.text-gray { color: #6b7280; }

/* ✨ 日期與修改按鈕樣式 */
.date-cell { min-width: 100px; }
.date-content { display: flex; align-items: center; gap: 6px; }
.date-text { font-family: monospace; font-size: 12px; color: #4b5563; line-height: 1.2; }
.date-sep { font-size: 12px; color: #9ca3af; text-align: center; line-height: 1; margin: 1px 0; }
.text-gray-small { color: #9ca3af; font-size: 12px; }

/* ✨ 修改按鈕 */
.edit-date-btn {
  background: none; border: none; cursor: pointer; font-size: 12px;
  padding: 4px; border-radius: 4px; opacity: 0.6; transition: all 0.2s;
}
.edit-date-btn:hover { opacity: 1; background-color: #f3f4f6; transform: scale(1.1); }
</style>