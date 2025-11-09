import { defineStore } from 'pinia'
import { StorageEngine } from '../engines/StorageEngine'

export interface AppState {
  isDarkMode: boolean
  language: string
  isLoading: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    isDarkMode: false,
    language: 'en',
    isLoading: false
  }),

  actions: {
    async initialize() {  // ADD THIS METHOD
      const storage = new StorageEngine()
      const settings = await storage.getSettings()
      this.isDarkMode = settings.isDarkMode || false
      this.language = settings.language || 'en'
      
      // Apply dark mode to document
      document.documentElement.classList.toggle('dark', this.isDarkMode)
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('zoomka-dark-mode', JSON.stringify(this.isDarkMode))
      document.documentElement.classList.toggle('dark', this.isDarkMode)
      
      const storage = new StorageEngine()
      storage.saveSettings({ isDarkMode: this.isDarkMode })
    },

    setLanguage(lang: string) {
      this.language = lang
      localStorage.setItem('zoomka-language', lang)
      
      const storage = new StorageEngine()
      storage.saveSettings({ language: lang })
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    }
  },

  getters: {
    currentTheme: (state) => state.isDarkMode ? 'dark' : 'light'
  }
})