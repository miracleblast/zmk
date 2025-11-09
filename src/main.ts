import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './style.css'

// Initialize stores
const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

// Initialize stores after app is mounted
import { useAppStore } from './stores/app'
import { useProfileStore } from './stores/profile'
import { useContactsStore } from './stores/contacts'

const initializeStores = async () => {
  const appStore = useAppStore()
  const profileStore = useProfileStore()
  const contactsStore = useContactsStore()

  await appStore.initialize()
  await profileStore.initialize()
  await contactsStore.initialize()
}

initializeStores().catch(console.error)