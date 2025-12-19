<template>
  <section class="panel">
    <h2 class="panel-title">地圖找房</h2>
    <p class="panel-hint">
      以地圖顯示推薦房源（示意），點列表或地標可快速查看。
    </p>

    <div class="map-layout">
      <div class="map-box">
        <div id="tenant-map" class="map-canvas"></div>
      </div>

      <div class="map-side-list">
        <h3 class="sub-title">推薦房源列表</h3>

        <ul class="map-list">
          <li
            v-for="item in listings"
            :key="item.id"
            class="map-list-item"
            @click="focusOnRental(item)"
          >
            <span class="map-item-title">{{ item.title }}</span>
            <span class="map-item-sub">
              {{ item.area }} · {{ item.roomType }} · {{ item.price.toLocaleString() }} 元/月
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, shallowRef, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * ✅ 租客：用推薦房源的假資料（跟 Browse 類似）
 * 你如果之後做 Pinia / API，這裡就改成從 store 或後端拿資料即可
 */
const listings = ref([
  {
    id: 1,
    title: '雲科大旁溫馨雅房',
    area: '雲科大周邊',
    roomType: '雅房',
    price: 5500,
    lat: 23.7075,
    lng: 120.5408
  },
  {
    id: 2,
    title: '斗六市區採光套房',
    area: '斗六市區',
    roomType: '套房',
    price: 7000,
    lat: 23.707,
    lng: 120.5415
  },
  {
    id: 3,
    title: '火車站附近電梯大樓套房',
    area: '火車站附近',
    roomType: '套房',
    price: 8500,
    lat: 23.709,
    lng: 120.5425
  }
])

const map = shallowRef(null)
const markers = shallowRef([])

const initMap = () => {
  const el = document.getElementById('tenant-map')
  if (!el) return

  if (!window.google || !window.google.maps) {
    console.warn('Google Maps API 未載入，地圖無法顯示。')
    el.innerHTML =
      '<div style="padding:20px;text-align:center;color:#666;">Google Maps API 未載入 (請確認 index.html 有引入 script)</div>'
    return
  }

  // ✅ 避免重複初始化
  if (!map.value) {
    map.value = new window.google.maps.Map(el, {
      center: { lat: 23.7094, lng: 120.5410 },
      zoom: 14,

      // ✅ 讓「地圖/衛星」控制更小：改成下拉選單
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },

      // 可選：把街景小人關掉，畫面更乾淨
      streetViewControl: false,

      // 可選：縮放按鈕放右下
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      }
    })
  }

  updateMarkers()
}

const updateMarkers = () => {
  if (!map.value || !window.google) return

  // 清掉舊 marker
  markers.value.forEach(m => m.setMap(null))
  markers.value = []

  listings.value.forEach(item => {
    if (!item.lat || !item.lng) return

    const marker = new window.google.maps.Marker({
      position: { lat: item.lat, lng: item.lng },
      map: map.value,
      title: item.title
    })

    const info = new window.google.maps.InfoWindow({
      content: `
        <div style="font-size:13px;line-height:1.5;">
          <b>${item.title}</b><br/>
          ${item.area} · ${item.roomType}<br/>
          ${item.price.toLocaleString()} 元/月<br/>
          <span style="color:#666;">點一下可看詳情</span>
        </div>
      `
    })

    // ✅ 點 marker：開 info
    marker.addListener('click', () => {
      info.open(map.value, marker)
    })

    // ✅ 再加一個「點 marker 直接跳詳情」：雙擊更直覺
    marker.addListener('dblclick', () => {
      router.push({ name: 'RentalDetail', params: { id: item.id } })
    })

    markers.value.push(marker)
  })
}

const focusOnRental = (item) => {
  if (!map.value) return
  if (!item.lat || !item.lng) return

  const pos = { lat: item.lat, lng: item.lng }
  map.value.panTo(pos)
  map.value.setZoom(16)
}

// 進頁面就初始化
onMounted(() => {
  initMap()
})
</script>

<style scoped>
.map-layout { margin-top: 12px; display: flex; flex-direction: column; gap: 12px; }
.map-box { border-radius: 16px; padding: 0; background: #fef3c7; border: 1px solid #facc15; height: 420px; }
.map-canvas { width: 100%; height: 100%; border-radius: 14px; }

.map-side-list { border-radius: 16px; padding: 10px 12px; background: #fefbf7; border: 1px solid #e1d4c8; }
.map-list { list-style: none; padding: 0; margin: 6px 0 0; }
.map-list-item { padding: 8px 10px; border-bottom: 1px dashed #e5e7eb; cursor: pointer; border-radius: 10px; }
.map-list-item:hover { background-color: #f3f4f6; }

.map-item-title { display: block; font-size: 13px; color: #2e2622; font-weight: 600; }
.map-item-sub { display: block; font-size: 12px; color: #6b7280; }

.sub-title { font-size: 16px; font-weight: 600; color: #2e2622; }

/* 共用樣式 */
.panel { max-width: 1100px; margin: 0 auto; background: #fffdf9; border-radius: 16px; padding: 16px 18px 18px; box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12); border: 1px solid rgba(242, 230, 220, 0.9); }
.panel-title { font-size: 20px; font-weight: 600; color: #2e2622; }
.panel-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
</style>
