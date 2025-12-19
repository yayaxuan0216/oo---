<template>
  <div class="detail-page">
    <!-- Header -->
    <div class="nav-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <span class="page-title">房源詳情</span>
      <div style="width: 32px;"></div>
    </div>

    <!-- 圖片 -->
    <div class="image-gallery" :class="{ 'edit-mode': isEditMode }">
      <img
        v-for="(img, index) in rental.images"
        :key="index"
        :src="img"
        class="gallery-img"
      />
      <div class="image-counter">1 / {{ rental.images.length }}</div>
    </div>

    <div class="content-container">
      <!-- 主資訊 -->
      <div class="main-info">
        <!-- 標題 -->
        <input
          v-if="isEditMode"
          v-model="rental.title"
          class="edit-input title-input"
        />
        <h1 v-else class="title">{{ rental.title }}</h1>

        <!-- 價格 -->
        <input
          v-if="isEditMode"
          type="number"
          v-model.number="rental.price"
          class="edit-input price-input"
        />
        <p v-else class="price">{{ rental.price.toLocaleString() }} 元/月</p>

        <div class="tags">
          <span class="tag">{{ rental.area }}</span>
          <span class="tag">{{ rental.roomType }}</span>
          <span class="tag">{{ rental.size }} 坪</span>
          <span class="tag">樓層 {{ rental.floor }}F</span>
        </div>
      </div>

      <hr class="divider" />

      <!-- 房東卡片 -->
      <section class="landlord-card">
        <div class="landlord-avatar">
          <span class="avatar-placeholder">👤</span>
        </div>
        <div class="landlord-info">
          <h3 class="landlord-name">
            {{ landlord.name }}
            <span class="landlord-gender">
              {{ landlord.gender === 'male' ? '先生' : '小姐' }}
            </span>
          </h3>
          <p class="landlord-meta">性別：{{ landlord.gender === 'male' ? '男' : '女' }}</p>
          <p class="landlord-meta">聯絡方式：{{ landlord.phone }}</p>
        </div>
      </section>

      <!-- 屋況 -->
      <section class="section">
        <h3 class="section-title">屋況簡介</h3>
        <textarea
          v-if="isEditMode"
          v-model="rental.description"
          class="edit-textarea"
        />
        <p v-else class="description">{{ rental.description }}</p>
      </section>

      <hr class="divider" />

      <!-- 編輯按鈕（只給房東） -->
      <div v-if="isEditMode" class="edit-actions">
        <button class="save-btn" @click="saveRental">儲存變更</button>
        <button class="cancel-btn" @click="goBack">取消</button>
      </div>

      <div style="height: 80px;"></div>
    </div>

    <!-- 底部操作列（租客才顯示） -->
    <div v-if="!isEditMode" class="bottom-action-bar">
      <button class="contact-btn" @click="contactLandlord">
        聯絡房東
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/* 房東資料（示意） */
const landlord = ref({
  name: '王',
  gender: 'male',
  phone: '0912-345-678'
})

/* 租件資料（示意） */
const rental = ref({
  id: 1,
  title: '雲科大旁溫馨套房',
  price: 5500,
  area: '雲科大周邊',
  roomType: '套房',
  size: 6,
  floor: 3,
  description: '步行 5 分鐘可達雲科大，生活機能佳。',
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'
  ]
})

onMounted(() => {
  console.log('房源 ID：', route.params.id)
})

const goBack = () => router.back()

const saveRental = () => {
  alert('模擬儲存成功（之後接 API）')
  router.back()
}

const contactLandlord = () => {
  alert(`聯絡房東 ${landlord.value.name}`)
}
</script>

<style scoped>
.edit-input,
.edit-textarea {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #d1c7bf;
  font-size: 15px;
  margin-bottom: 8px;
}

.edit-textarea {
  min-height: 100px;
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.save-btn {
  background: #4a2c21;
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
}

.cancel-btn {
  background: #e5e7eb;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
}

/* 房東編輯模式：圖片縮小 */
.image-gallery.edit-mode {
  height: 140px;          /* 原本 250px → 改小 */
}

/* 編輯模式下圖片不要太壓迫 */
.image-gallery.edit-mode .gallery-img {
  object-fit: cover;
}
</style>
