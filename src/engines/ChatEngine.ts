// src/engines/ChatEngine.ts
import { StorageEngine } from "./StorageEngine"
import type { ChatMessage, ChatConversation } from "./StorageEngine"

export class ChatEngine {
  private storage: StorageEngine
  
  constructor() {
    this.storage = new StorageEngine()
  }

  // ✅ ADD MISSING saveConversation METHOD
  async saveConversation(conversation: ChatConversation): Promise<void> {
    await this.storage.saveConversation(conversation)
  }

  // Send message to contact
  async sendMessage(contactId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<string> {
    const message: ChatMessage = {
      id: Date.now().toString(),
      contactId,
      senderId: 'me',
      content,
      timestamp: new Date(),
      messageType: type,
      status: 'sent'
    }

    await this.storage.saveMessage(message)
    await this.updateConversation(contactId, content, message.timestamp)
    
    return message.id
  }

  // ✅ FIXED: IMPLEMENT MISSING METHOD
  private async updateConversation(contactId: string, lastMessage: string, timestamp: Date) {
    const conversation: ChatConversation = {
      id: `conv_${contactId}`,
      contactId,
      lastMessage,
      lastMessageTime: timestamp,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await this.storage.saveConversation(conversation)
  }

  // Get conversation with contact
  async getConversation(contactId: string): Promise<ChatMessage[]> {
    return this.storage.getMessages(contactId)
  }

  // Get all conversations
  async getConversations(): Promise<ChatConversation[]> {
    return this.storage.getConversations()
  }

  // Mark messages as read
  async markAsRead(contactId: string): Promise<void> {
    await this.storage.markMessagesAsRead(contactId)
  }

  // ✅ REMOVED: Unused encryptMessage and decryptMessage methods
  // These were causing the "declared but never read" warnings
}

// Export interfaces for use in other files
export type { ChatMessage, ChatConversation }