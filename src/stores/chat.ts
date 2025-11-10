// src/stores/chat.ts
import { defineStore } from 'pinia'
import { ChatEngine } from '../engines/ChatEngine'
import type { ChatMessage, ChatConversation } from '../engines/StorageEngine'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as ChatConversation[],
    activeConversation: null as string | null,
    messages: [] as ChatMessage[],
    isPremium: false
  }),

  actions: {
    async initialize() {
      const chatEngine = new ChatEngine()
      this.conversations = await chatEngine.getConversations()
    },

    async sendMessage(contactId: string, content: string) {
      if (!this.isPremium) {
        throw new Error('Chat feature requires premium subscription')
      }

      const chatEngine = new ChatEngine()
      await chatEngine.sendMessage(contactId, content)
      
      // Refresh messages
      this.messages = await chatEngine.getConversation(contactId)
    },

    async loadConversation(contactId: string) {
      const chatEngine = new ChatEngine()
      this.messages = await chatEngine.getConversation(contactId)
      this.activeConversation = contactId
      
      // Mark as read
      await chatEngine.markAsRead(contactId)
    },

    setPremiumStatus(isPremium: boolean) {
      this.isPremium = isPremium
    }
  }
})