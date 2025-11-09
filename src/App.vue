<template>
  <div :class="['min-h-screen bg-gradient-to-br from-zoom-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 pb-20 transition-colors duration-300', { 'dark': isDarkMode }]">
    <!-- Main Content -->
    <RouterView />
    
    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 glass border-t border-white/20 backdrop-blur-xl z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-3">
          <RouterLink 
            v-for="nav in navigation" 
            :key="nav.name"
            :to="nav.path"
            class="flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 group"
            :class="[$route.name === nav.name ? 'text-zoom-500 scale-110' : 'text-gray-500 hover:text-zoom-400']"
          >
            <Icon :icon="nav.icon" class="text-2xl transition-transform duration-300 group-hover:scale-110" />
            <span class="text-xs font-medium font-poppins">{{ nav.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const isDarkMode = ref(false)
const navigation = ref([
  { name: 'scanner', path: '/', label: 'Scan', icon: 'material-symbols:qr-code-scanner' },
  { name: 'profile', path: '/profile', label: 'My Card', icon: 'material-symbols:person' },
  { name: 'contacts', path: '/contacts', label: 'Contacts', icon: 'material-symbols:contacts' },
  { name: 'settings', path: '/settings', label: 'Settings', icon: 'material-symbols:settings' }
])

// Dark mode logic
onMounted(() => {
  const saved = localStorage.getItem('zoomka-dark-mode')
  isDarkMode.value = saved ? JSON.parse(saved) : false
  updateDarkMode()
})

const updateDarkMode = () => {
  localStorage.setItem('zoomka-dark-mode', JSON.stringify(isDarkMode.value))
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}
</script>