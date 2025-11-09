import { defineStore } from 'pinia'
import type { ScannedContact } from '../engines/StorageEngine'
import { StorageEngine } from '../engines/StorageEngine'

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    contacts: [] as ScannedContact[],
    selectedContact: null as ScannedContact | null,
    searchQuery: '',
    selectedCategory: 'all'
  }),

  actions: {
    async initialize() {  // ADD THIS METHOD
      const storage = new StorageEngine()
      this.contacts = await storage.getContacts()
    },

    async setContacts(contacts: ScannedContact[]) {
      this.contacts = contacts
    },

    async addContact(contact: Omit<ScannedContact, 'id'>) {
      const storage = new StorageEngine()
      const id = await storage.saveContact(contact)
      const newContact: ScannedContact = { ...contact, id }
      this.contacts.unshift(newContact)
    },

    async removeContact(id: string) {
      const storage = new StorageEngine()
      await storage.deleteContact(id)
      this.contacts = this.contacts.filter(contact => contact.id !== id)
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    setSelectedCategory(category: string) {
      this.selectedCategory = category
    },

    async searchContacts(query: string): Promise<ScannedContact[]> {
      const storage = new StorageEngine()
      return storage.searchContacts(query)
    },

    getContactsByCategory(category: string): ScannedContact[] {
      return this.contacts.filter(contact => contact.category === category)
    },

    getRecentContacts(limit: number = 10): ScannedContact[] {
      return this.contacts
        .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
        .slice(0, limit)
    }
  },

  getters: {
    filteredContacts: (state) => {
      let contacts = state.contacts

      if (state.searchQuery) {
        contacts = contacts.filter(contact =>
          contact.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          contact.company.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          contact.position.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          contact.category.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }

      if (state.selectedCategory !== 'all') {
        contacts = contacts.filter(contact => contact.category === state.selectedCategory)
      }

      return contacts.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
    },

    categories: (state) => {
      const categories = new Set(state.contacts.map(contact => contact.category))
      return Array.from(categories).filter(Boolean)
    },

    contactsCount: (state) => state.contacts.length
  }
})