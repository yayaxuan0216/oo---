<template>
  <section class="panel">
    
    <div class="panel-header">
      <h2 class="title">房客管理</h2>
      
      <div class="actions">
        <select v-model="selectedRentalId" class="rental-filter">
          <option value="">全部租件 ({{ tenants.length }}人)</option>
          <option v-for="rental in rentals" :key="rental.id" :value="rental.id">
            🏠 {{ rental.title }}
          </option>
        </select>

        <button class="btn-add" @click="showAddModal = true">
          <span class="icon">+</span> 新增房客
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      資料讀取中...
    </div>

    <TenantList 
      v-else-if="currentView === 'list'"
      :tenants="filteredTenants"  
      :rentals="rentals"
      @open-payment="toPayment"
      @open-chat="toChat"
      @open-history="toHistory"
      @edit-tenant="handleEditTenant"
      @archive-tenant="handleArchiveTenant"
      @restore-tenant="handleRestoreTenant"
      @remove-tenant="handleRemoveTenant"
      @edit-lease="openEditLease" 
    />

    <PaymentPanel 
      v-else-if="currentView === 'payment'"
      :tenant="currentTargetTenant"
      @back="backToList"
    />

    <ChatPanel 
      v-else-if="currentView === 'chat'"
      :tenant="currentTargetTenant"
      @back="backToList"
    />

    <HistoryPanel 
      v-else-if="currentView === 'history'"
      :tenant="currentTargetTenant"
      @back="backToList"
    />

    <AddTenantModal 
      v-if="showAddModal"
      :rentals="rentals"
      :initial-rental-id="selectedRentalId"
      @close="showAddModal = false"
      @confirm="handleAddConfirm"
    />

    <EditLeaseModal
      v-if="showEditLeaseModal"
      :tenant="editingTenant"
      @close="showEditLeaseModal = false"
      @confirm="handleUpdateLease"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api' 

// 引入子組件
import TenantList from './components/TenantList.vue'
import PaymentPanel from './components/PaymentPanel.vue'
import ChatPanel from './components/ChatPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import AddTenantModal from './components/AddTenantModal.vue'
import EditLeaseModal from './components/EditLeaseModal.vue' // ✨ 別忘了引入這個檔案

// --- 狀態管理 ---
const currentView = ref('list')
const currentTargetTenant = ref(null)
const showAddModal = ref(false)
const loading = ref(false)
const currentUser = ref(null)

const tenants = ref([]) 
const rentals = ref([]) 

// 篩選狀態
const selectedRentalId = ref('')

// ✨ 修改日期相關狀態
const showEditLeaseModal = ref(false)
const editingTenant = ref(null)

// 計算屬性：篩選房客
const filteredTenants = computed(() => {
  if (!selectedRentalId.value) return tenants.value
  return tenants.value.filter(t => t.rentalId === selectedRentalId.value)
})

// --- API 邏輯 ---

const fetchTenants = async () => {
  if (!currentUser.value || !currentUser.value.uid) return
  try {
    loading.value = true
    const res = await api.get(`/api/landlord/tenants?landlordId=${currentUser.value.uid}`)
    if (res.data.success) {
      tenants.value = res.data.data.map(t => ({
        ...t,
        rentalId: t.currentRentalId,     
        rentalTitle: t.currentRentalTitle, 
        records: t.records || {}         
      }))
    }
  } catch (error) {
    console.error('載入房客失敗:', error)
  } finally {
    loading.value = false
  }
}

const fetchRentals = async () => {
  if (!currentUser.value || !currentUser.value.uid) return
  try {
    const res = await api.get(`/api/rentals/list?landlordId=${currentUser.value.uid}`)
    if (res.data.success) {
      rentals.value = res.data.data
    }
  } catch (error) {
    console.error('載入房源失敗:', error)
  }
}

const handleAddConfirm = async (formData) => {
  if (!currentUser.value) return alert('請重新登入')
  try {
    const payload = {
      landlordId: currentUser.value.uid,
      name: formData.name,
      phone: formData.phone,
      uid: formData.uid, 
      rentalId: formData.rentalId,
      rentalTitle: formData.rentalId 
        ? (rentals.value.find(r => r.id === formData.rentalId)?.title || '') 
        : '',
      leaseStart: formData.leaseStart, 
      leaseEnd: formData.leaseEnd
    }

    const res = await api.post('/api/landlord/tenants', payload)
    
    if (res.data.success) {
      alert('新增成功！')
      showAddModal.value = false
      fetchTenants() 
    }
  } catch (error) {
    console.error(error)
    const msg = error.response?.data?.message || '未知錯誤'
    alert('新增失敗：' + msg)
  }
}

// ✨ 重點 3：處理開啟修改視窗
const openEditLease = (tenant) => {
  console.log('開啟修改日期視窗:', tenant.name) // Debug 用
  editingTenant.value = tenant
  showEditLeaseModal.value = true
}

// ✨ 重點 4：處理實際更新日期
const handleUpdateLease = async (dateData) => {
  if (!editingTenant.value) return

  try {
    // 呼叫更新 API
    await api.put(`/api/landlord/tenants/${editingTenant.value.id}`, {
      leaseStart: dateData.leaseStart,
      leaseEnd: dateData.leaseEnd
    })

    // 直接更新前端顯示，不用重抓 API
    editingTenant.value.leaseStart = dateData.leaseStart
    editingTenant.value.leaseEnd = dateData.leaseEnd
    
    alert('租約日期更新成功！')
    showEditLeaseModal.value = false

  } catch (error) {
    console.error(error)
    alert('更新失敗')
  }
}

// 其他操作邏輯
const handleEditTenant = async (tenant) => {
  const newName = window.prompt('修改姓名：', tenant.name)
  if (!newName || newName === tenant.name) return
  try {
    await api.put(`/api/landlord/tenants/${tenant.id}`, { name: newName })
    tenant.name = newName 
    alert('更新成功')
  } catch (error) { alert('更新失敗') }
}

const handleArchiveTenant = async (tenant) => {
  if (!confirm(`確定將「${tenant.name}」標記為退租？`)) return
  try {
    await api.put(`/api/landlord/tenants/${tenant.id}`, {
      status: 'history',
      currentRentalId: null, 
      currentRentalTitle: `${tenant.rentalTitle} (已退租)`
    })
    fetchTenants() 
  } catch (error) { alert('退租操作失敗') }
}

const handleRestoreTenant = async (tenant) => {
  if (!confirm(`確定還原「${tenant.name}」？`)) return
  try {
    await api.put(`/api/landlord/tenants/${tenant.id}`, { status: 'active' })
    fetchTenants()
  } catch (error) { alert('還原失敗') }
}

const handleRemoveTenant = async (id) => {
  alert('為保護帳務資料，目前僅支援封存(退租)功能。')
}

// 畫面切換
const backToList = () => { currentView.value = 'list'; currentTargetTenant.value = null }
const toPayment = (t) => { currentTargetTenant.value = t; currentView.value = 'payment' }
const toChat = (t) => { currentTargetTenant.value = t; currentView.value = 'chat' }
const toHistory = (t) => { currentTargetTenant.value = t; currentView.value = 'history' }

onMounted(() => {
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr)
      if (!currentUser.value.uid && currentUser.value.id) currentUser.value.uid = currentUser.value.id
      
      if (currentUser.value.uid) {
        fetchRentals()
        fetchTenants()
      }
    } catch (e) { console.error(e) }
  }
})
</script>

<style scoped>
/* 樣式保持您原本的設定 */
.panel { 
  max-width: 1100px; margin: 0 auto; 
  background: #fffdf9; border-radius: 16px; 
  padding: 16px 18px 18px; 
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); 
  border: 1px solid rgba(242, 230, 220, 0.9); 
  height: 85vh; 
  display: flex; flex-direction: column; position: relative; 
}

.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e5e7eb;
}

.title { font-size: 20px; font-weight: 600; color: #4a2c21; margin: 0; }

.actions { display: flex; gap: 10px; }

.rental-filter {
  padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; color: #374151; background-color: white;
  cursor: pointer; outline: none; font-family: "Iansui", sans-serif; min-width: 150px;
}

.btn-add {
  background-color: #a18c7b; color: white; border: none;
  padding: 6px 16px; border-radius: 8px; font-size: 14px;
  cursor: pointer; display: flex; align-items: center; gap: 4px;
}
.btn-add:hover { opacity: 0.9; }

.loading-state {
  display: flex; justify-content: center; align-items: center; height: 100%;
  color: #888; font-size: 14px;
}
</style>