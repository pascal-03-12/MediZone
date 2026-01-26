import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/medication/:id',
      name: 'medication-detail',
      component: () => import('../views/MedicationDetailView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (authStore.loading) {
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated && !authStore.loading) {
    next('/login')
  } else {
    next()
  }
})

export default router
