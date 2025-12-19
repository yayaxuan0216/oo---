import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const landlordName = ref('小房東')
  const tenantName = ref('User')
  const role = ref('landlord') // or 'tenant'

  const setLandlordName = (name) => {
    landlordName.value = name
  }

  return {
    landlordName,
    tenantName,
    role,
    setLandlordName
  }
})
