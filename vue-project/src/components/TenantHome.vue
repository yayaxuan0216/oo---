<template>
  <div class="tenant-page">
    <!-- 頂部導覽列 -->
    <header class="top-bar">
      <div class="logo-area">
        <span class="logo-icon">🏡</span>
        <span class="logo-text">CocoRoom 線上租屋</span>
      </div>

      <nav class="nav-links">
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'browse' }"
          @click="currentTab = 'browse'"
        >
          找房
        </button>
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'favorites' }"
          @click="currentTab = 'favorites'"
        >
          我的收藏
        </button>
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'profile' }"
          @click="currentTab = 'profile'"
        >
          我的資料
        </button>
      </nav>

      <div class="user-area">
        <span class="user-name">嗨，{{ tenantName }} 👋</span>
        <button class="logout-btn" @click="$emit('logout')">
          登出
        </button>
      </div>
    </header>

    <main class="content">
      <!-- 左側：搜尋 & 篩選區 -->
      <section class="filters">
        <h2 class="section-title">條件篩選</h2>

        <div class="filter-group">
          <label class="filter-label" for="keyword">關鍵字</label>
          <input
            id="keyword"
            v-model="filters.keyword"
            type="text"
            placeholder="輸入地點、房源名稱..."
          />
        </div>

        <div class="filter-group">
          <label class="filter-label" for="area">地區</label>
          <select id="area" v-model="filters.area">
            <option value="">不限</option>
            <option value="雲科大周邊">雲科大周邊</option>
            <option value="斗六市區">斗六市區</option>
            <option value="火車站附近">火車站附近</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="roomType">房型</label>
          <select id="roomType" v-model="filters.roomType">
            <option value="">不限</option>
            <option value="雅房">雅房</option>
            <option value="套房">套房</option>
            <option value="整層">整層</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="priceRange">價格範圍</label>
          <select id="priceRange" v-model="filters.priceRange">
            <option value="">不限</option>
            <option value="low">5000 以下</option>
            <option value="mid">5000 - 8000</option>
            <option value="high">8000 以上</option>
          </select>
        </div>

        <div class="filter-group">
          <span class="filter-label">設備需求</span>
          <label class="checkbox">
            <input type="checkbox" v-model="filters.withInternet" />
            有網路
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="filters.withWasher" />
            有洗衣機
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="filters.withAC" />
            有冷氣
          </label>
        </div>

        <button class="reset-btn" @click="resetFilters">
          清除條件
        </button>
      </section>

      <!-- 右側：內容區（依 Tab 切換） -->
      <section class="main-panel">
        <!-- 找房列表 -->
        <div v-if="currentTab === 'browse'">
          <h2 class="section-title">推薦房源</h2>
          <p class="section-subtitle">
            共找到 {{ filteredListings.length }} 筆符合條件的房源
          </p>

          <div class="listing-grid">
            <article
              v-for="house in filteredListings"
              :key="house.id"
              class="listing-card"
            >
              <div class="listing-header">
                <h3 class="listing-title">{{ house.title }}</h3>
                <button
                  class="favorite-btn"
                  :class="{ active: isFavorite(house.id) }"
                  @click="toggleFavorite(house.id)"
                >
                  <span v-if="isFavorite(house.id)">♥ 已收藏</span>
                  <span v-else>♡ 收藏</span>
                </button>
              </div>

              <p class="listing-price">{{ house.price.toLocaleString() }} 元/月</p>
              <p class="listing-meta">
                {{ house.area }} · {{ house.roomType }} · 距離學校約 {{ house.distance }} 分鐘
              </p>

              <div class="tags">
                <span
                  v-for="tag in house.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="listing-footer">
                <button class="secondary-btn" @click="showDetail(house)">
                  查看詳情
                </button>
                <button class="primary-outline-btn" @click="contactLandlord(house)">
                  聯絡房東
                </button>
              </div>
            </article>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div v-else-if="currentTab === 'favorites'">
          <h2 class="section-title">我的收藏</h2>
          <p class="section-subtitle" v-if="favoriteListings.length === 0">
            目前還沒有收藏任何房源，可以到「找房」頁面點選「♡ 收藏」。
          </p>

          <div class="listing-grid" v-else>
            <article
              v-for="house in favoriteListings"
              :key="house.id"
              class="listing-card"
            >
              <div class="listing-header">
                <h3 class="listing-title">{{ house.title }}</h3>
                <button
                  class="favorite-btn active"
                  @click="toggleFavorite(house.id)"
                >
                  ♥ 已收藏
                </button>
              </div>

              <p class="listing-price">{{ house.price.toLocaleString() }} 元/月</p>
              <p class="listing-meta">
                {{ house.area }} · {{ house.roomType }} · 距離學校約 {{ house.distance }} 分鐘
              </p>

              <div class="tags">
                <span
                  v-for="tag in house.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="listing-footer">
                <button class="secondary-btn" @click="showDetail(house)">
                  查看詳情
                </button>
                <button class="primary-outline-btn" @click="contactLandlord(house)">
                  聯絡房東
                </button>
              </div>
            </article>
          </div>
        </div>

        <!-- 我的資料 -->
        <div v-else-if="currentTab === 'profile'" class="profile-card">
          <h2 class="section-title">我的資料</h2>
          <div class="profile-item">
            <span class="profile-label">姓名：</span>
            <span class="profile-value">{{ tenantName }}</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">Email：</span>
            <span class="profile-value">tenant@example.com</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">身分：</span>
            <span class="profile-value">租客</span>
          </div>
          <div class="profile-item">
            <span class="profile-label">認證狀態：</span>
            <span class="profile-value badge">已上傳學生證（示意）</span>
          </div>
          <p class="profile-hint">＊此區可以之後再接註冊時填寫的真實資料</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 假的租客名字（之後可以從登入資料帶進來）
const tenantName = ref('user')

// 當前分頁：找房 / 收藏 / 我的資料
const currentTab = ref('browse')

// 假資料：房源列表
const listings = ref([
  {
    id: 1,
    title: '雲科大旁溫馨雅房',
    area: '雲科大周邊',
    price: 5500,
    roomType: '雅房',
    distance: 5,
    tags: ['含水費', '含網路', '有冷氣'],
    landlordName: '王先生',
    landlordPhone: '0912-345-678'
  },
  {
    id: 2,
    title: '斗六市區採光套房',
    area: '斗六市區',
    price: 7000,
    roomType: '套房',
    distance: 10,
    tags: ['獨立衛浴', '近公車站', '有洗衣機'],
    landlordName: '陳小姐',
    landlordPhone: '0987-111-222'
  },
  {
    id: 3,
    title: '火車站附近電梯大樓套房',
    area: '火車站附近',
    price: 8500,
    roomType: '套房',
    distance: 8,
    tags: ['電梯大樓', '可機車位', '含管理費'],
    landlordName: '林先生',
    landlordPhone: '0933-222-333'
  },
  {
    id: 4,
    title: '雲科大旁學生友善整層出租',
    area: '雲科大周邊',
    price: 12000,
    roomType: '整層',
    distance: 6,
    tags: ['適合多人合租', '可開伙', '近學餐'],
    landlordName: '張先生',
    landlordPhone: '0955-444-555'
  }
])

// 收藏的房源 ID
const favoriteIds = ref(new Set())

// 篩選條件
const filters = ref({
  keyword: '',
  area: '',
  roomType: '',
  priceRange: '',
  withInternet: false,
  withWasher: false,
  withAC: false
})

// 判斷是否為收藏
const isFavorite = (id) => {
  return favoriteIds.value.has(id)
}

// 切換收藏
const toggleFavorite = (id) => {
  const set = favoriteIds.value
  if (set.has(id)) {
    set.delete(id)
  } else {
    set.add(id)
  }
  // 觸發更新（因為 Set 本身不是深度 reactive）
  favoriteIds.value = new Set(set)
}

// 依篩選條件計算顯示的房源
const filteredListings = computed(() => {
  return listings.value.filter((house) => {
    // 關鍵字：比對標題 + 地區
    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      const text = (house.title + house.area).toLowerCase()
      if (!text.includes(kw)) return false
    }

    // 地區
    if (filters.value.area && house.area !== filters.value.area) {
      return false
    }

    // 房型
    if (filters.value.roomType && house.roomType !== filters.value.roomType) {
      return false
    }

    // 價格範圍
    if (filters.value.priceRange === 'low' && house.price >= 5000) {
      return false
    }
    if (
      filters.value.priceRange === 'mid' &&
      (house.price < 5000 || house.price > 8000)
    ) {
      return false
    }
    if (filters.value.priceRange === 'high' && house.price <= 8000) {
      return false
    }

    // 設備需求（用 tags 簡單假裝）
    if (filters.value.withInternet && !house.tags.includes('含網路')) {
      return false
    }
    if (filters.value.withWasher && !house.tags.includes('有洗衣機')) {
      return false
    }
    if (filters.value.withAC && !house.tags.includes('有冷氣')) {
      return false
    }

    return true
  })
})

// 收藏列表
const favoriteListings = computed(() => {
  return listings.value.filter((house) => favoriteIds.value.has(house.id))
})

// 清除條件
const resetFilters = () => {
  filters.value = {
    keyword: '',
    area: '',
    roomType: '',
    priceRange: '',
    withInternet: false,
    withWasher: false,
    withAC: false
  }
}

// 查看詳情（目前先用 alert 模擬）
const showDetail = (house) => {
  alert(
    `房源名稱：${house.title}\n` +
      `地區：${house.area}\n` +
      `租金：${house.price} 元/月\n` +
      `房型：${house.roomType}\n` +
      `距離學校：約 ${house.distance} 分鐘\n` +
      `設備：${house.tags.join('、')}\n` +
      `房東：${house.landlordName}`
  )
}

// 聯絡房東（先用 alert 模擬）
const contactLandlord = (house) => {
  alert(
    `準備聯絡房東：${house.landlordName}\n` +
      `電話：${house.landlordPhone}\n` +
      `房源：${house.title}`
  )
}
</script>

<style scoped>
.tenant-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2e6dc; /* creme */
  font-family: "Iansui", sans-serif;
}

/* 頂部導覽列 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #4a2c21; /* coco */
  color: #f2e6dc;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 22px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: transparent;
  color: #f2e6dc;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s ease;
}

.nav-btn:hover {
  background: rgba(242, 230, 220, 0.18);
}

.nav-btn.active {
  background: #f2e6dc;
  color: #4a2c21;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.logout-btn {
  border: 1px solid #f2e6dc;
  background: transparent;
  color: #f2e6dc;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s ease;
}

.logout-btn:hover {
  background: #f2e6dc;
  color: #4a2c21;
}

/* 主內容區 */
.content {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 16px;
  padding: 18px 24px 24px;
}

/* 左側篩選區 */
.filters {
  background: #fffaf5;
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2e2622; /* choco */
  margin-bottom: 6px;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.filter-group {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 13px;
  color: #4a2c21;
}

.filters input,
.filters select {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #d1c7bf;
  font-size: 13px;
  outline: none;
  background: white;
}

.filters input:focus,
.filters select:focus {
  border-color: #a18c7b; /* mocha */
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4a2c21;
}

.reset-btn {
  margin-top: 12px;
  border: none;
  width: 100%;
  padding: 8px 0;
  border-radius: 999px;
  background: #e1d4c8;
  color: #4a2c21;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s ease;
}

.reset-btn:hover {
  background: #d3c2b1;
}

/* 右側主內容 */
.main-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.listing-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.listing-card {
  background: #fffdf9;
  border-radius: 16px;
  padding: 14px 14px 12px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
  border: 1px solid rgba(242, 230, 220, 0.9);
}

.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.listing-title {
  font-size: 16px;
  font-weight: 600;
  color: #2e2622;
  margin-bottom: 4px;
}

.favorite-btn {
  border: none;
  background: #f2e6dc;
  color: #4a2c21;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s ease;
}

.favorite-btn:hover {
  background: #e1d4c8;
}

.favorite-btn.active {
  background: #4a2c21;
  color: #f2e6dc;
}

.listing-price {
  font-size: 18px;
  font-weight: 700;
  color: #a18c7b;
  margin-top: 4px;
}

.listing-meta {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f2e6dc;
  color: #4a2c21;
}

.listing-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.secondary-btn,
.primary-outline-btn {
  flex: 1;
  border-radius: 999px;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s ease;
  font-family: "Iansui", sans-serif;
}

.secondary-btn {
  border: none;
  background: #e1d4c8;
  color: #2e2622;
}

.secondary-btn:hover {
  background: #d3c2b1;
}

.primary-outline-btn {
  border: 1px solid #a18c7b;
  background: transparent;
  color: #4a2c21;
}

.primary-outline-btn:hover {
  background: #a18c7b;
  color: #f2e6dc;
}

/* 我的資料 */
.profile-card {
  background: #fffdf9;
  border-radius: 16px;
  padding: 14px 16px 16px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
  border: 1px solid rgba(242, 230, 220, 0.9);
}

.profile-item {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  font-size: 14px;
}

.profile-label {
  color: #4a2c21;
  min-width: 70px;
}

.profile-value {
  color: #2e2622;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e1d4c8;
  font-size: 12px;
}

.profile-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 10px;
}
</style>
