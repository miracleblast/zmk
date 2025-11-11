// src/stores/chat.ts
import { defineStore } from 'pinia'
import { ChatEngine } from '../engines/ChatEngine'
import type { ChatMessage, ChatConversation } from '../engines/StorageEngine'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as ChatConversation[],
    activeConversation: null as string | null,
    messages: [] as ChatMessage[],
    isPremium: true, // ✅ SET TO TRUE TO REMOVE BLOCKING
    isInitialized: false,
    contactIdMap: new Map<string, string>()
  }),

    actions: {
    async sendMessage(contactId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
      // ✅ REMOVED PREMIUM CHECK - No blocking
      try {
        const chatEngine = new ChatEngine()
        const messageId = await chatEngine.sendMessage(contactId, content, type)
        
        // Refresh messages for active conversation
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

    // ✅ GENERATE CONTACT ID FROM QR DATA
    generateContactId(qrData: string): string {
      // Create consistent ID from QR data
      const hash = this.simpleHash(qrData)
      return `contact_${hash}`
    },

    // ✅ FIXED: REMOVE PRIVATE MODIFIER IN PINIA STORE
    simpleHash(str: string): string {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36).substring(0, 8)
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

    // ✅ GET OR CREATE CONVERSATION FROM CONTACT DATA
    async getOrCreateConversation(contactData: any): Promise<string> {
      const contactId = this.generateContactId(JSON.stringify(contactData))
      
      // Check if conversation exists
      let conversation = this.conversations.find(c => c.contactId === contactId)
      
      if (!conversation) {
        // Create new conversation
        const chatEngine = new ChatEngine()
        const newConversation: ChatConversation = {
          id: `conv_${contactId}`,
          contactId: contactId,
          lastMessage: 'Start a conversation',
          lastMessageTime: new Date(),
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        // ✅ FIXED: USE saveConversation METHOD (need to add it to ChatEngine)
        await this.saveConversation(newConversation)
        this.conversations.push(newConversation)
      }
      
      return contactId
    },

    // ✅ ADD MISSING saveConversation METHOD
    async saveConversation(conversation: ChatConversation): Promise<void> {
      const chatEngine = new ChatEngine()
      // We need to add this method to ChatEngine.ts
      // For now, we'll add it directly to the store
      try {
        // This is a temporary implementation
        const existingIndex = this.conversations.findIndex(c => c.id === conversation.id)
        if (existingIndex >= 0) {
          this.conversations[existingIndex] = conversation
        } else {
          this.conversations.push(conversation)
        }
      } catch (error) {
        console.error('❌ Failed to save conversation:', error)
      }
    },

    setPremiumStatus(isPremium: boolean) {
      this.isPremium = isPremium
    },

    // Get conversation by contact ID
    getConversationByContactId(contactId: string): ChatConversation | undefined {
      return this.conversations.find(conv => conv.contactId === contactId)
    },

    // Get unread count for specific contact
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
      this.contactIdMap.clear()
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