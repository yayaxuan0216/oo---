import axios from 'axios';

const api = axios.create({
  // 👇 改成空字串 (Empty String)
  // 因為你的 Leases.vue 裡面已經寫了 '/api/contracts'，這裡不需要再加前綴了
  baseURL: '', 
  
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;