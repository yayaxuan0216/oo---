import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: '/',
      redirect: '/TenantHome'
    },

    /* ---------- Auth ---------- */
    {
      path: '/Login',
      name: 'Login',
      component: () => import('../components/Login.vue')
    },
    {
      path: '/ForgotPassword',
      component: () => import('../components/ForgotPassword.vue')
    },
    {
      path: '/RegChoose',
      component: () => import('../components/RegChoose.vue')
    },
    {
      path: '/Register',
      name: 'Register',
      component: () => import('../components/RegisterForm.vue')
    },

    /* ---------- Landlord ---------- */
    {
      path: '/LandlordHome',
      component: () => import('../views/LandlordHome.vue'),
      children: [
        { path: '', redirect: '/LandlordHome/rent' },
        { path: 'rent', name: 'LandlordRent', component: () => import('../views/landlord/Rentals.vue') },
        { path: 'lease', name: 'LandlordLease', component: () => import('../views/landlord/Leases.vue') },
        { path: 'tenant', name: 'LandlordTenant', component: () => import('../views/landlord/Tenants.vue') },
        { path: 'search', name: 'LandlordSearch', component: () => import('../views/landlord/Search.vue') },
        { path: 'map', name: 'LandlordMap', component: () => import('../views/landlord/MapVisual.vue') },
        { path: 'profile', name: 'LandlordProfile', component: () => import('../views/landlord/Profile.vue') }
      ]
    },

    /* ---------- Tenant ---------- */
    {
      path: '/TenantHome',
      component: () => import('../views/TenantHome.vue'),
      children: [
        { path: '', redirect: '/TenantHome/browse' },
        { path: 'browse', name: 'TenantBrowse', component: () => import('../views/tenant/Browse.vue') },
        { path: 'favorites', name: 'TenantFavorites', component: () => import('../views/tenant/Favorites.vue') },
        { path: 'profile', name: 'TenantProfile', component: () => import('../views/tenant/Profile.vue') },
        { path: 'change-password', component: () => import('../views/tenant/ChangePassword.vue') },
        { path: 'reservations', component: () => import('../views/tenant/Reservations.vue') },
        { path: 'contracts', component: () => import('../views/tenant/Contracts.vue') },

        // ✅ 房源詳情
        {
          path: 'rental/:id',
          name: 'RentalDetail',
          component: () => import('../views/tenant/RentalDetail.vue')
        },

        // ✅ Tenant 地圖找房
        {
          path: 'map',
          name: 'TenantMap',
          component: () => import('../views/tenant/TenantMap.vue')
        }
      ]
    }
  ]
});

export default router;