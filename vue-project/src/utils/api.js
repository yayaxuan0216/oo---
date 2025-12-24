import axios from 'axios';

// 建立一個 axios 的實例 (Instance)
const api = axios.create({
  // 這裡就是魔法！它會自動讀取我們剛剛設定的變數
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;