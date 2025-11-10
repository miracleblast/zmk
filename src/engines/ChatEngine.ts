// src/engines/ChatEngine.ts
import { StorageEngine } from "./StorageEngine"
import type { ChatMessage, ChatConversation } from "./StorageEngine"

export class ChatEngine {
  private storage: StorageEngine
  
  constructor() {
    this.storage = new StorageEngine()
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

  // Encrypt message content (premium feature)
  private encryptMessage(content: string): string {
    const key = 'zoomka-chat-key'
    return btoa(
      content.split('').map((char, i) => 
        char.charCodeAt(0) ^ key.charCodeAt(i % key.length)
      ).join(',')
    )
  }

  private decryptMessage(encryptedContent: string): string {
    const key = 'zoomka-chat-key'
    const bytes = atob(encryptedContent).split(',').map(Number)
    return bytes.map((byte, i) => 
      String.fromCharCode(byte ^ key.charCodeAt(i % key.length))
    ).join('')
  }
}

// Export interfaces for use in other files
export type { ChatMessage, ChatConversation }