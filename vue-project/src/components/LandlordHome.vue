<template>
  <div class="landlord-page">
    <!-- 頂部導覽列 -->
    <header class="top-bar">
      <div class="logo-area">
        <span class="logo-icon">🏠</span>
        <span class="logo-text">CocoRoom 房東後台</span>
      </div>

      <nav class="nav-links">
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'rent' }"
          @click="currentTab = 'rent'"
        >
          租件管理
        </button>
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'lease' }"
          @click="currentTab = 'lease'"
        >
          租約管理
        </button>
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'tenant' }"
          @click="currentTab = 'tenant'"
        >
          房客管理
        </button>
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'search' }"
          @click="currentTab = 'search'"
        >
          租屋搜尋
        </button>
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'map' }"
          @click="currentTab = 'map'"
        >
          地圖視覺
        </button>
        <button
          class="nav-btn"
          :class="{ active: currentTab === 'profile' }"
          @click="currentTab = 'profile'"
        >
          個人專區
        </button>
      </nav>

      <div class="user-area">
        <span class="user-name">房東 {{ landlordName }} 👋</span>
        <button class="logout-btn" @click="$emit('logout')">
          登出
        </button>
      </div>
    </header>

    <!-- 主內容 -->
    <main class="content">
      <!-- 1️⃣ 租件管理 -->
      <section v-if="currentTab === 'rent'" class="panel">
        <div class="panel-header">
          <h2 class="panel-title">租件管理</h2>
          <button class="primary-btn" @click="openRentalModal">
            ＋ 新增租件
          </button>
        </div>
        <p class="panel-hint">在這裡可以刊登、修改、下架你的租件。</p>

        <div class="card-list">
          <article
            v-for="item in rentals"
            :key="item.id"
            class="card"
          >
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  {{ item.title }}
                  <span v-if="item.status === 'active'" class="status-badge active">
                    上架中
                  </span>
                  <span v-else class="status-badge inactive">
                    已下架
                  </span>
                </h3>
                <p class="card-sub">
                  {{ item.area }} · {{ item.roomType }} · {{ item.price.toLocaleString() }} 元/月
                </p>
              </div>
            </div>

            <p class="card-desc">{{ item.description }}</p>

            <div class="tag-row">
              <span v-for="tag in item.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>

            <div class="card-actions">
              <button class="small-btn" @click="editRental(item)">編輯</button>
              <button
                class="small-btn outline"
                v-if="item.status === 'active'"
                @click="toggleRentalStatus(item, 'inactive')"
              >
                下架
              </button>
              <button
                class="small-btn outline"
                v-else
                @click="toggleRentalStatus(item, 'active')"
              >
                重新上架
              </button>
              <button class="small-btn danger" @click="deleteRental(item.id)">刪除</button>
            </div>
          </article>
        </div>
      </section>

      <!-- 2️⃣ 租約管理 -->
      <section v-else-if="currentTab === 'lease'" class="panel">
        <div class="panel-header">
          <h2 class="panel-title">租約管理</h2>
          <button class="primary-btn" @click="addLease">
            ＋ 新增租約
          </button>
        </div>
        <p class="panel-hint">
          管理你的電子租約，支援上傳電子簽章、刪除或典藏歷史租約（示意）。
        </p>

        <div class="card-list">
          <article
            v-for="lease in leases"
            :key="lease.id"
            class="card"
          >
            <div class="card-header">
              <div>
                <h3 class="card-title">
                  {{ lease.rentalTitle }}
                  <span class="badge-small" :class="lease.status === 'active' ? 'badge-active' : 'badge-archived'">
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
              <button class="small-btn danger" @click="deleteLease(lease.id)">
                刪除租約
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- 3️⃣ 房客管理 -->
      <section v-else-if="currentTab === 'tenant'" class="panel">
        <h2 class="panel-title">房客管理</h2>
        <p class="panel-hint">
          可查看各租件的房客名單、合約紀錄、付款紀錄，以及預約看房列表。
        </p>

        <!-- 已租出去的租件與房客 -->
        <h3 class="sub-title">已租出租件與房客名單</h3>
        <div class="card-list">
          <article
            v-for="group in tenantGroups"
            :key="group.rentalId"
            class="card"
          >
            <h3 class="card-title">{{ group.rentalTitle }}</h3>
            <p class="card-sub">
              目前房客：{{ group.tenants.length }} 位
            </p>

            <table class="simple-table">
              <thead>
                <tr>
                  <th>房客姓名</th>
                  <th>聯絡電話</th>
                  <th>合約狀態</th>
                  <th>付款狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in group.tenants" :key="t.id">
                  <td>{{ t.name }}</td>
                  <td>{{ t.phone }}</td>
                  <td>{{ t.contractStatus }}</td>
                  <td>{{ t.paymentStatus }}</td>
                  <td>
                    <button class="table-btn" @click="editTenant(t)">編輯</button>
                    <button class="table-btn danger" @click="removeTenant(t.id)">刪除</button>
                    <button class="table-btn outline" @click="viewTenantHistory(t)">
                      合約 / 付款紀錄
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <button class="small-btn" @click="addTenant(group.rentalId)">
              ＋ 新增房客
            </button>
          </article>
        </div>

        <!-- 預約清單 -->
        <h3 class="sub-title">預約清單</h3>
        <div class="card-list">
          <article
            v-for="reserve in reservations"
            :key="reserve.id"
            class="card"
          >
            <h3 class="card-title">{{ reserve.rentalTitle }}</h3>
            <p class="card-sub">
              房客：{{ reserve.guestName }} · 預約時間：{{ reserve.time }}
            </p>
            <p class="card-desc">
              備註：{{ reserve.note || '（無備註）' }} · 狀態：
              <span class="chip">
                {{ reserve.statusText }}
              </span>
            </p>
            <div class="card-actions">
              <button class="small-btn" @click="contactGuest(reserve)">線上聯絡房客</button>
              <button class="small-btn outline" @click="approveReservation(reserve)">同意預約</button>
              <button class="small-btn danger" @click="rejectReservation(reserve)">拒絕預約</button>
            </div>
          </article>
        </div>
      </section>

      <!-- 4️⃣ 租屋搜尋（房東也可以像租客一樣搜尋） -->
      <section v-else-if="currentTab === 'search'" class="panel">
        <h2 class="panel-title">租屋搜尋</h2>
        <p class="panel-hint">
          房東也可以用租客視角搜尋房源，了解市場行情（以下為示意資料）。
        </p>

        <div class="search-bar">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="輸入地點或關鍵字，例如：雲科大、火車站…"
          />
        </div>

        <div class="card-list">
          <article
            v-for="item in filteredSearchListings"
            :key="item.id"
            class="card"
          >
            <div class="card-header">
              <div>
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-sub">
                  {{ item.area }} · {{ item.roomType }} ·
                  {{ item.price.toLocaleString() }} 元/月
                </p>
              </div>
              <button
                class="favorite-small"
                :class="{ active: landlordFavorites.has(item.id) }"
                @click="toggleFavorite(item.id)"
              >
                <span v-if="landlordFavorites.has(item.id)">♥ 收藏中</span>
                <span v-else>♡ 收藏</span>
              </button>
            </div>

            <p class="card-desc">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <!-- 5️⃣ 地圖視覺功能（示意） -->
      <section v-else-if="currentTab === 'map'" class="panel">
  <h2 class="panel-title">地圖視覺</h2>
  <p class="panel-hint">
    已接上 Google Maps（示意），可根據租件座標顯示地標。
  </p>

  <div class="map-layout">
    <!-- ✨ Google Map 容器 -->
    <div class="map-box">
      <div id="landlord-map" class="map-canvas"></div>
    </div>

    <div class="map-side-list">
      <h3 class="sub-title">你的租件列表</h3>
      <ul class="map-list">
        <li
          v-for="item in rentals"
          :key="item.id"
          @click="focusOnRental(item)"
          class="map-list-item"
        >
          <span class="map-item-title">{{ item.title }}</span>
          <span class="map-item-sub">
            {{ item.area }} · {{ item.price.toLocaleString() }} 元/月
          </span>
        </li>
      </ul>
    </div>
  </div>
</section>


      <!-- 6️⃣ 個人專區 -->
      <section v-else-if="currentTab === 'profile'" class="panel">
        <h2 class="panel-title">個人專區</h2>
        <p class="panel-hint">
          在這裡可以修改顯示名稱、查看收藏租件，並從右上角執行登出。
        </p>

        <div class="profile-section">
          <h3 class="sub-title">帳號基本資料</h3>
          <div class="profile-item">
            <span class="profile-label">顯示名稱：</span>
            <input
              v-model="landlordName"
              type="text"
              class="profile-input"
            />
          </div>
          <p class="profile-hint">＊此名稱會顯示在系統中的房東標示處。</p>
        </div>

        <div class="profile-section">
          <h3 class="sub-title">收藏租件（從「租屋搜尋」收藏）</h3>
          <p v-if="favoriteSearchListings.length === 0" class="panel-hint">
            目前還沒有收藏任何租件，可以到「租屋搜尋」頁面按下「♥ 收藏」。
          </p>

          <ul v-else class="favorite-list">
            <li v-for="item in favoriteSearchListings" :key="item.id">
              <span class="map-item-title">{{ item.title }}</span>
              <span class="map-item-sub">
                {{ item.area }} · {{ item.price.toLocaleString() }} 元/月
              </span>
            </li>
          </ul>
        </div>
      </section>
    </main>

        <!-- ✨ 新增/編輯租件彈窗 -->
    <div v-if="showRentalModal" class="modal-backdrop">
      <div class="modal-card">
        <h2 class="modal-title">
          {{ editingRental ? '編輯租件' : '新增租件' }}
        </h2>

        <form class="modal-form" @submit.prevent="submitRentalForm">
          <div class="form-row">
            <label>租件名稱</label>
            <input
              v-model="rentalForm.title"
              type="text"
              placeholder="例如：雲科大旁溫馨套房"
            />
          </div>

          <div class="form-row">
            <label>地區</label>
            <select v-model="rentalForm.area">
              <option value="">請選擇地區</option>
              <option value="雲科大周邊">雲科大周邊</option>
              <option value="斗六市區">斗六市區</option>
              <option value="火車站附近">火車站附近</option>
            </select>
          </div>

          <div class="form-row">
            <label>房型</label>
            <select v-model="rentalForm.roomType">
              <option value="">請選擇房型</option>
              <option value="雅房">雅房</option>
              <option value="套房">套房</option>
              <option value="整層">整層</option>
            </select>
          </div>

          <div class="form-row">
            <label>租金（元/月）</label>
            <input
              v-model.number="rentalForm.price"
              type="number"
              min="0"
              placeholder="例如：7000"
            />
          </div>

          <div class="form-row">
            <label>描述</label>
            <textarea
              v-model="rentalForm.description"
              rows="3"
              placeholder="簡單描述周邊環境、設備、注意事項..."
            ></textarea>
          </div>

          <div class="form-row">
            <label>標籤（逗號分隔）</label>
            <input
              v-model="rentalForm.tagsText"
              type="text"
              placeholder="例如：含水費, 含網路, 有冷氣"
            />
          </div>

          <div class="modal-buttons">
            <button type="button" class="secondary-btn" @click="closeRentalModal">
              取消
            </button>
            <button type="submit" class="btn-primary">
              {{ editingRental ? '儲存變更' : '新增租件' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 房東名稱（個人專區可修改）
const landlordName = ref('小房東')

// 當前分頁
const currentTab = ref('rent') // rent / lease / tenant / search / map / profile

// 1️⃣ 租件管理假資料（含假座標）
const rentals = ref([
  {
    id: 1,
    title: '雲科大旁溫馨套房',
    area: '雲科大周邊',
    price: 6500,
    roomType: '套房',
    status: 'active',
    tags: ['含水費', '含網路', '有冷氣'],
    description: '走路 5 分鐘到雲科大，生活機能方便。',
    lat: 23.7075,
    lng: 120.4305
  },
  {
    id: 2,
    title: '斗六市區採光雅房',
    area: '斗六市區',
    price: 5500,
    roomType: '雅房',
    status: 'active',
    tags: ['近夜市', '有洗衣機'],
    description: '近斗六市區鬧區，附近有夜市與便利商店。',
    lat: 23.707,
    lng: 120.429
  },
  {
    id: 3,
    title: '火車站附近電梯大樓套房',
    area: '火車站附近',
    price: 8000,
    roomType: '套房',
    status: 'inactive',
    tags: ['電梯大樓', '可機車位', '含管理費'],
    description: '走路 5 分鐘到斗六火車站，通勤方便。',
    lat: 23.709,
    lng: 120.4255
  }
])

// —— Google Maps 相關 ——

// 地圖與 marker
const map = ref(null)
const markers = ref([])

// 初始化地圖
const initMap = () => {
  const el = document.getElementById('landlord-map')
  if (!el) return

  if (!window.google || !window.google.maps) {
    console.warn('Google Maps 尚未載入或 API Key 有問題')
    return
  }

  // 只初始化一次
  if (!map.value) {
  map.value = new window.google.maps.Map(el, {
    center: { lat: 23.708, lng: 120.429 },
    zoom: 14,
    // ✨ 把「地圖 / 衛星」改成小一點的下拉式控制
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: window.google.maps.ControlPosition.TOP_RIGHT
    }
  })
}

  updateMarkers()
}

// 建立 / 更新 markers
const updateMarkers = () => {
  if (!map.value || !window.google || !window.google.maps) return

  // 清掉舊的 marker
  markers.value.forEach((m) => m.setMap(null))
  markers.value = []

  rentals.value.forEach((rental) => {
    if (!rental.lat || !rental.lng) return

    const marker = new window.google.maps.Marker({
      position: { lat: rental.lat, lng: rental.lng },
      map: map.value,
      title: rental.title
    })

    const info = new window.google.maps.InfoWindow({
      content: `
        <div style="font-size:13px;">
          <strong>${rental.title}</strong><br/>
          ${rental.area} · ${rental.roomType}<br/>
          ${rental.price.toLocaleString()} 元/月
        </div>
      `
    })

    marker.addListener('click', () => {
      info.open(map.value, marker)
    })

    markers.value.push(marker)
  })
}

// 點右側列表 → 聚焦到該租件
const focusOnRental = (rental) => {
  if (!map.value || !window.google || !window.google.maps) return
  if (!rental.lat || !rental.lng) return

  const pos = { lat: rental.lat, lng: rental.lng }
  map.value.panTo(pos)
  map.value.setZoom(16)
}

// ✨ 新增/編輯租件彈窗狀態
const showRentalModal = ref(false)
const editingRental = ref(null) // 如果是編輯，就存原本那個 item，新增時為 null

const rentalForm = ref({
  title: '',
  area: '',
  roomType: '',
  price: 0,
  description: '',
  tagsText: ''
})

// 開啟「新增租件」彈窗
const openRentalModal = () => {
  editingRental.value = null
  rentalForm.value = {
    title: '',
    area: '',
    roomType: '',
    price: 0,
    description: '',
    tagsText: ''
  }
  showRentalModal.value = true
}

// 開啟「編輯租件」彈窗
const editRental = (item) => {
  editingRental.value = item
  rentalForm.value = {
    title: item.title,
    area: item.area,
    roomType: item.roomType,
    price: item.price,
    description: item.description,
    tagsText: item.tags.join(', ')
  }
  showRentalModal.value = true
}

// 關閉彈窗
const closeRentalModal = () => {
  showRentalModal.value = false
}

// 提交彈窗表單（新增或更新）
const submitRentalForm = () => {
  if (!rentalForm.value.title || !rentalForm.value.area || !rentalForm.value.roomType) {
    alert('請至少填寫租件名稱、地區與房型')
    return
  }

  const tags =
    rentalForm.value.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

  if (editingRental.value) {
    // 編輯模式 → 更新原本的 item
    editingRental.value.title = rentalForm.value.title
    editingRental.value.area = rentalForm.value.area
    editingRental.value.roomType = rentalForm.value.roomType
    editingRental.value.price = rentalForm.value.price
    editingRental.value.description = rentalForm.value.description
    editingRental.value.tags = tags
    alert('租件已更新（示意）')
  } else {
    // 新增模式（這裡沒有填 lat / lng，之後可再補）
    const newItem = {
      id: Date.now(),
      title: rentalForm.value.title,
      area: rentalForm.value.area,
      roomType: rentalForm.value.roomType,
      price: rentalForm.value.price,
      status: 'active',
      tags,
      description: rentalForm.value.description || '新增的租件（示意）。'
    }
    rentals.value = [newItem, ...rentals.value]
    alert('租件已新增（示意）')
  }

  showRentalModal.value = false
}

// 切換上架 / 下架
const toggleRentalStatus = (item, newStatus) => {
  item.status = newStatus
  alert(`已將「${item.title}」狀態改為：${newStatus === 'active' ? '上架中' : '已下架'}（示意）。`)
}

// 刪除租件
const deleteRental = (id) => {
  if (!confirm('確定要刪除這個租件嗎？')) return
  rentals.value = rentals.value.filter((r) => r.id !== id)
}

// 2️⃣ 租約管理假資料
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

const addLease = () => {
  const rentalTitle = window.prompt('請輸入租件名稱：', '新的租約租件')
  const tenantName = window.prompt('請輸入房客姓名：', '房客姓名')
  if (!rentalTitle || !tenantName) return
  const period = window.prompt('請輸入租約期間：', '2025/03 - 2026/02') || '未填寫'
  const newLease = {
    id: Date.now(),
    rentalId: 0,
    rentalTitle,
    tenantName,
    period,
    lastUpdate: '2025/01/01',
    hasESign: false,
    status: 'active'
  }
  leases.value = [newLease, ...leases.value]
}

const uploadESign = (lease) => {
  alert(`上傳/更新「${lease.rentalTitle} - ${lease.tenantName}」的電子簽章（示意）。`)
  lease.hasESign = true
  lease.lastUpdate = '2025/01/15（示意日期）'
}

const archiveLease = (lease) => {
  if (!confirm('確定要將此租約移到典藏嗎？')) return
  lease.status = 'archived'
}

const deleteLease = (id) => {
  if (!confirm('確定要刪除此租約嗎？')) return
  leases.value = leases.value.filter((l) => l.id !== id)
}

// 3️⃣ 房客管理：租客清單
const tenants = ref([
  {
    id: 1,
    rentalId: 1,
    rentalTitle: '雲科大旁溫馨套房',
    name: '小明',
    phone: '0912-345-678',
    contractStatus: '簽約中',
    paymentStatus: '本月已繳'
  },
  {
    id: 2,
    rentalId: 1,
    rentalTitle: '雲科大旁溫馨套房',
    name: '小華',
    phone: '0922-111-333',
    contractStatus: '即將到期',
    paymentStatus: '本月未繳'
  },
  {
    id: 3,
    rentalId: 2,
    rentalTitle: '斗六市區電梯雅房',
    name: '小美',
    phone: '0933-222-444',
    contractStatus: '生效中',
    paymentStatus: '本月已繳'
  }
])

// 依租件分組房客（避免和 Google map 混淆，這裡改叫 groupMap）
const tenantGroups = computed(() => {
  const groupMap = new Map()
  tenants.value.forEach((t) => {
    if (!groupMap.has(t.rentalId)) {
      groupMap.set(t.rentalId, {
        rentalId: t.rentalId,
        rentalTitle: t.rentalTitle,
        tenants: []
      })
    }
    groupMap.get(t.rentalId).tenants.push(t)
  })
  return Array.from(groupMap.values())
})

const addTenant = (rentalId) => {
  const rental = rentals.value.find((r) => r.id === rentalId)
  const name = window.prompt('請輸入房客姓名：', '')
  const phone = window.prompt('請輸入房客電話：', '')
  if (!name || !phone) return
  tenants.value.push({
    id: Date.now(),
    rentalId,
    rentalTitle: rental ? rental.title : '未知租件',
    name,
    phone,
    contractStatus: '新合約',
    paymentStatus: '待繳費'
  })
}

const editTenant = (t) => {
  const newName = window.prompt('修改房客姓名：', t.name) || t.name
  const newPhone = window.prompt('修改房客電話：', t.phone) || t.phone
  t.name = newName
  t.phone = newPhone
  alert('房客資訊已更新（示意）。')
}

const removeTenant = (id) => {
  if (!confirm('確定要刪除這位房客紀錄嗎？')) return
  tenants.value = tenants.value.filter((t) => t.id !== id)
}

const viewTenantHistory = (t) => {
  alert(
    `房客：${t.name}\n` +
      `合約紀錄、付款紀錄等詳細內容（示意）\n\n` +
      `之後可以跳轉到專門的詳情頁。`
  )
}

// 預約管理
const reservations = ref([
  {
    id: 1,
    rentalId: 1,
    rentalTitle: '雲科大旁溫馨套房',
    guestName: '小新',
    time: '2025/01/20  14:00',
    note: '希望可以看頂樓曬衣空間',
    status: 'pending',
    statusText: '待回覆'
  },
  {
    id: 2,
    rentalId: 2,
    rentalTitle: '斗六市區電梯雅房',
    guestName: '小美朋友',
    time: '2025/01/22  10:30',
    note: '',
    status: 'pending',
    statusText: '待回覆'
  }
])

const contactGuest = (reserve) => {
  alert(
    `準備與 ${reserve.guestName} 線上聯絡（示意）：\n` +
      `可以開啟聊天室 / 發送訊息給對方。`
  )
}

const approveReservation = (reserve) => {
  reserve.status = 'approved'
  reserve.statusText = '已同意'
}

const rejectReservation = (reserve) => {
  reserve.status = 'rejected'
  reserve.statusText = '已拒絕'
}

// 4️⃣ 房東版租屋搜尋
const searchKeyword = ref('')
const searchListings = ref([
  {
    id: 101,
    title: '雲科大旁學生套房',
    area: '雲科大周邊',
    price: 6800,
    roomType: '套房',
    description: '市場上常見的學生套房範例。'
  },
  {
    id: 102,
    title: '斗六市區頂樓加蓋雅房',
    area: '斗六市區',
    price: 5200,
    roomType: '雅房',
    description: '競品參考用。'
  },
  {
    id: 103,
    title: '火車站旁電梯大樓套房',
    area: '火車站附近',
    price: 9000,
    roomType: '套房',
    description: '設備新穎，含管理費。'
  }
])

const landlordFavorites = ref(new Set())

const filteredSearchListings = computed(() => {
  if (!searchKeyword.value) return searchListings.value
  const kw = searchKeyword.value.toLowerCase()
  return searchListings.value.filter((item) => {
    const text = (item.title + item.area + item.description).toLowerCase()
    return text.includes(kw)
  })
})

const toggleFavorite = (id) => {
  const set = landlordFavorites.value
  if (set.has(id)) {
    set.delete(id)
  } else {
    set.add(id)
  }
  landlordFavorites.value = new Set(set)
}

const favoriteSearchListings = computed(() =>
  searchListings.value.filter((item) => landlordFavorites.value.has(item.id))
)

// 🔄 生命週期與監聽：確保切到地圖分頁時才初始化

onMounted(() => {
  if (currentTab.value === 'map') {
    setTimeout(() => {
      initMap()
    }, 300)
  }
})

watch(currentTab, (tab) => {
  if (tab === 'map') {
    setTimeout(() => {
      initMap()
    }, 300)
  }
})

// 租件資料有變動時，更新標記
watch(
  rentals,
  () => {
    updateMarkers()
  },
  { deep: true }
)
</script>

<style scoped>
.landlord-page {
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

/* 主內容 */
.content {
  padding: 18px 24px 24px;
}

.panel {
  max-width: 1100px;
  margin: 0 auto;
  background: #fffdf9;
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
  border: 1px solid rgba(242, 230, 220, 0.9);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #2e2622;
}

.panel-hint {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.sub-title {
  margin-top: 16px;
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
  color: #2e2622;
}

/* 卡片列表 */
.card-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  padding: 10px 12px 10px;
  border-radius: 12px;
  background: #fefbf7;
  border: 1px solid #e1d4c8;
  box-shadow: 0 2px 8px rgba(46, 38, 34, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2e2622;
}

.card-sub {
  font-size: 13px;
  color: #6b7280;
}

.card-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #4b5563;
}

.tag-row {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f2e6dc;
  font-size: 11px;
  color: #4a2c21;
}

.status-badge {
  margin-left: 6px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
}

.status-badge.active {
  background: #dcfce7;
  color: #14532d;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* 按鈕 */
.primary-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: #a18c7b;
  color: #f2e6dc;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s ease;
  font-family: "Iansui", sans-serif;
}

.primary-btn:hover {
  background: #4a2c21;
}

.card-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.small-btn {
  border: none;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  font-family: "Iansui", sans-serif;
  background: #e1d4c8;
  color: #2e2622;
  transition: 0.2s ease;
}

.small-btn:hover {
  background: #d3c2b1;
}

.small-btn.outline {
  background: transparent;
  border: 1px solid #a18c7b;
  color: #4a2c21;
}

.small-btn.outline:hover {
  background: #a18c7b;
  color: #f2e6dc;
}

.small-btn.danger {
  background: #fee2e2;
  color: #991b1b;
}

.small-btn.danger:hover {
  background: #fecaca;
}

.badge-small {
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
}

.badge-active {
  background: #dcfce7;
  color: #166534;
}

.badge-archived {
  background: #e5e7eb;
  color: #374151;
}

.chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: #e1d4c8;
  color: #4a2c21;
}

/* 房客管理表格 */
.simple-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
  font-size: 13px;
}

.simple-table th,
.simple-table td {
  border-bottom: 1px solid #e5e7eb;
  padding: 4px 6px;
  text-align: left;
}

.simple-table th {
  background: #f9fafb;
  color: #4b5563;
}

.table-btn {
  border: none;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;
  margin-right: 4px;
  font-family: "Iansui", sans-serif;
  background: #e5e7eb;
  color: #374151;
}

.table-btn.outline {
  background: transparent;
  border: 1px solid #9ca3af;
}

.table-btn.danger {
  background: #fee2e2;
  color: #991b1b;
}

/* 租屋搜尋 */
.search-bar {
  margin-top: 10px;
  margin-bottom: 8px;
}

.search-bar input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid #d1c7bf;
  font-size: 14px;
  outline: none;
  font-family: "Iansui", sans-serif;
}

.search-bar input:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

.favorite-small {
  border: none;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;
  background: #f2e6dc;
  color: #4a2c21;
}

.favorite-small.active {
  background: #4a2c21;
  color: #f2e6dc;
}

/* 地圖視覺 */
.map-layout {
  margin-top: 12px;
  display: flex;
  flex-direction: column; /* 垂直排版：上面地圖、下面列表 */
  gap: 12px;
}

.map-canvas {
  width: 100%;
  height: 400px;
  border-radius: 14px;
}

.map-box {
  border-radius: 16px;
  padding: 0;
  background: #fef3c7;
  border: 1px solid #facc15;
}

.map-title {
  font-size: 16px;
  font-weight: 600;
  color: #78350f;
}

.map-hint {
  font-size: 13px;
  color: #92400e;
  margin-bottom: 8px;
}

.map-grid {
  margin-top: 6px;
  border-radius: 12px;
  border: 1px dashed #fbbf24;
  padding: 10px;
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
}

.map-dot {
  font-size: 14px;
  color: #b45309;
}

.map-side-list {
  border-radius: 16px;
  padding: 10px 12px;
  background: #fefbf7;
  border: 1px solid #e1d4c8;
}

.map-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
}

.map-list li {
  padding: 4px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.map-item-title {
  display: block;
  font-size: 13px;
  color: #2e2622;
}

.map-item-sub {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

/* 個人專區 */
.profile-section {
  margin-top: 12px;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.profile-label {
  min-width: 80px;
  font-size: 14px;
  color: #4a2c21;
}

.profile-input {
  flex: 1;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #d1c7bf;
  font-size: 14px;
  outline: none;
  font-family: "Iansui", sans-serif;
}

.profile-input:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

.profile-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.favorite-list {
  list-style: none;
  padding: 0;
  margin-top: 6px;
}

.favorite-list li {
  padding: 4px 0;
  border-bottom: 1px dashed #e5e7eb;
}

/* ✨ 新增/編輯租件彈窗樣式 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-card {
  width: 420px;
  max-width: 90vw;
  background: #fffdf9;
  border-radius: 16px;
  padding: 18px 20px 20px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
  border: 1px solid #e1d4c8;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2e2622;
  margin-bottom: 10px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row label {
  font-size: 13px;
  color: #4a2c21;
}

.form-row input,
.form-row select,
.form-row textarea {
  padding: 7px 9px;
  border-radius: 8px;
  border: 1px solid #d1c7bf;
  font-size: 14px;
  outline: none;
  font-family: "Iansui", sans-serif;
  background: #fffdf9;
}

.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  border-color: #a18c7b;
  box-shadow: 0 0 0 1px rgba(161, 140, 123, 0.4);
}

.modal-buttons {
  margin-top: 4px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal-buttons .btn-primary,
.modal-buttons .secondary-btn {
  flex: 0 0 auto;
  padding-inline: 16px;
}

</style>
