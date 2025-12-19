<template>
  <section class="panel">
    <div class="panel-header">
      <h2 class="panel-title">租件管理</h2>

      <!-- ✅ 改：新增租件改成跳頁 -->
      <button class="primary-btn" @click="goCreateRental" type="button">
        ＋ 新增租件
      </button>
    </div>

    <p class="panel-hint">在這裡可以刊登、修改、下架你的租件。</p>

    <div class="card-list">
      <article v-for="item in rentals" :key="item.id" class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">
              {{ item.title }}
              <span v-if="item.status === 'active'" class="status-badge active">上架中</span>
              <span v-else class="status-badge inactive">已下架</span>
            </h3>
            <p class="card-sub">{{ item.area }} · {{ item.roomType }} · {{ item.price }} 元/月</p>
          </div>
        </div>

        <p class="card-desc">{{ item.description }}</p>

        <div class="card-actions">
          <!-- ✅ 改：編輯改成跳頁 -->
          <button class="small-btn" @click="goEditRental(item)" type="button">編輯</button>
          <button class="small-btn danger" @click="deleteRental(item.id)" type="button">刪除</button>
        </div>
      </article>
    </div>

    <!-- ✅ 先保留（目前不會用到），你之後確定不用再整段刪掉 -->
    <div v-if="showRentalModal" class="modal-backdrop">
      <div class="modal-card">
        <h2 class="modal-title">{{ editingRental ? '編輯租件' : '新增租件' }}</h2>
        <form class="modal-form" @submit.prevent="submitRentalForm">
          <div class="modal-buttons">
            <button type="button" class="secondary-btn" @click="closeRentalModal">取消</button>
            <button type="submit" class="btn-primary">儲存</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 假資料
const rentals = ref([
  { id: 1, title: '雲科大旁溫馨套房', area: '雲科大周邊', price: 6500, roomType: '套房', status: 'active', tags: [], description: '...' },
  { id: 2, title: '斗六市區採光雅房', area: '斗六市區', price: 5500, roomType: '雅房', status: 'active', tags: [], description: '...' }
])

/** ✅ 新增：跳到租客的 RentalDetail，但用 new + edit 模式 */
const goCreateRental = () => {
  router.push({
    name: 'RentalDetail',
    params: { id: 'new' },
    query: { mode: 'edit' }
  })
}

/** ✅ 編輯：帶入該租件 id + edit 模式 */
const goEditRental = (item) => {
  router.push({
    name: 'RentalDetail',
    params: { id: item.id },
    query: { mode: 'edit' }
  })
}

/* ===== 以下先保留（目前不會用到）===== */
const showRentalModal = ref(false)
const editingRental = ref(null)
const rentalForm = ref({ title: '', area: '', roomType: '', price: 0, description: '', tagsText: '' })

const openRentalModal = () => {
  showRentalModal.value = true
  editingRental.value = null
}
const closeRentalModal = () => { showRentalModal.value = false }
const submitRentalForm = () => { showRentalModal.value = false }

/* ✅ 刪除先留著 */
const deleteRental = (id) => {
  rentals.value = rentals.value.filter((x) => x.id !== id)
}
</script>

<style scoped>
/* 原樣保留你的 CSS（你自己專案內再補齊其他樣式） */
.panel {
  max-width: 1100px;
  margin: 0 auto;
  background: #fffdf9;
  border-radius: 16px;
  padding: 16px 18px 18px;
}
</style>
