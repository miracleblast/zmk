// src/stores/chat.ts
import { defineStore } from 'pinia'
import { ChatEngine } from '../engines/ChatEngine'
import type { ChatMessage, ChatConversation } from '../engines/StorageEngine'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as ChatConversation[],
    activeConversation: null as string | null,
    messages: [] as ChatMessage[],
    isPremium: true, // In production, this would check actual subscription
    isInitialized: false
  }),

  actions: {
    async initialize() {
      if (this.isInitialized) return
      
      try {
        const chatEngine = new ChatEngine()
        this.conversations = await chatEngine.getConversations()
        this.isInitialized = true
        console.log('✅ Chat store initialized with', this.conversations.length, 'conversations')
      } catch (error) {
        console.error('❌ Failed to initialize chat store:', error)
        throw error
      }
    },

    async sendMessage(contactId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
      if (!this.isPremium) {
        throw new Error('Chat feature requires premium subscription')
      }

      try {
        const chatEngine = new ChatEngine()
        const messageId = await chatEngine.sendMessage(contactId, content, type)
        
        // Refresh messages for the active conversation
        if (this.activeConversation === contactId) {
          await this.loadConversation(contactId)
        }
        
        // Refresh conversations list
        await this.initialize()
        
        return messageId
      } catch (error) {
        console.error('❌ Failed to send message:', error)
        throw error
      }
    },

    async loadConversation(contactId: string) {
      try {
        const chatEngine = new ChatEngine()
        this.messages = await chatEngine.getConversation(contactId)
        this.activeConversation = contactId
        
        // Mark as read
        await this.markAsRead(contactId)
        
        console.log('✅ Loaded', this.messages.length, 'messages for contact:', contactId)
      } catch (error) {
        console.error('❌ Failed to load conversation:', error)
        throw error
      }
    },

    async markAsRead(contactId: string) {
      try {
        const chatEngine = new ChatEngine()
        await chatEngine.markAsRead(contactId)
        
        // Update local state
        const conversation = this.conversations.find(c => c.contactId === contactId)
        if (conversation) {
          conversation.unreadCount = 0
        }
      } catch (error) {
        console.error('❌ Failed to mark messages as read:', error)
      }
    },

    async getConversations(): Promise<ChatConversation[]> {
      if (!this.isInitialized) {
        await this.initialize()
      }
      return this.conversations
    },

    setPremiumStatus(isPremium: boolean) {
      this.isPremium = isPremium
    },

    // Get conversation by contact ID
    getConversationByContactId(contactId: string): ChatConversation | undefined {
      return this.conversations.find(conv => conv.contactId === contactId)
    },

    // Get unread count for a specific contact
    getUnreadCount(contactId: string): number {
      const conversation = this.getConversationByContactId(contactId)
      return conversation?.unreadCount || 0
    },

    // Get total unread count across all conversations
    getTotalUnreadCount(): number {
      return this.conversations.reduce((total, conv) => total + conv.unreadCount, 0)
    },

    // Clear all messages (for logout or reset)
    clear() {
      this.conversations = []
      this.messages = []
      this.activeConversation = null
      this.isInitialized = false
    }
  },

  getters: {
    hasUnreadMessages: (state) => {
      return state.conversations.some(conv => conv.unreadCount > 0)
    },
    
    pinnedConversations: (state) => {
      return state.conversations.filter(conv => conv.isPinned)
    },
    
    recentConversations: (state) => {
      return state.conversations
        .filter(conv => !conv.isMuted)
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    }
  }
})