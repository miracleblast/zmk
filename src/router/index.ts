import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'scanner',
      component: () => import('../views/ScannerView.vue')
    },
    {
      path: '/https-test',
      name: 'https-test',
      component: () => import('../views/HTTPSTest.vue')
    },
    {
      path: '/camera-test',
      name: 'camera-test', 
      component: () => import('../views/CameraTest.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/contacts',
      name: 'contacts', 
      component: () => import('../views/ContactsView.vue')
    },
    {
      path: '/chat',  // ✅ NEW CHAT ROUTE
      name: 'chat',
      component: () => import('../views/ChatView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    }
  ]
})

export { router }