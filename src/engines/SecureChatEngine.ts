// src/engines/SecureChatEngine.ts
import { StorageEngine } from './StorageEngine'
import type { ChatMessage, ChatConversation } from './StorageEngine'

export interface EncryptedMessage {
  id: string
  contactId: string
  encryptedContent: string
  timestamp: Date
}

export class SecureChatEngine {
  private storage: StorageEngine
  private encryptionKey: string
  
  constructor() {
    this.storage = new StorageEngine()
    this.encryptionKey = this.generateSimpleKey()
  }

  // ✅ SIMPLIFIED: Use a simple, consistent key for testing
  private generateSimpleKey(): string {
    // Use a fixed key for now to ensure both devices can decrypt
    const fixedKey = 'zoomka-chat-fixed-key-2024'
    return fixedKey.padEnd(32, '0').substring(0, 32)
  }

  // ✅ SIMPLIFIED ENCRYPTION
  async sendEncryptedMessage(contactId: string, content: string): Promise<string> {
    try {
      console.log('🔐 Encrypting message for:', contactId)
      
      // Simple XOR encryption for testing
      const encryptedContent = this.simpleEncrypt(content, this.encryptionKey)
      
      const secureMessage: EncryptedMessage = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        contactId,
        encryptedContent: encryptedContent,
        timestamp: new Date()
      }

      // Save to storage
      await this.storage.saveMessage(this.convertToChatMessage(secureMessage))
      await this.updateEncryptedConversation(contactId, 'New message', secureMessage.timestamp)
      
      console.log('✅ Message sent successfully')
      return secureMessage.id
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      throw new Error('Failed to send message')
    }
  }

  // ✅ SIMPLE XOR ENCRYPTION (Both devices can decrypt)
  private simpleEncrypt(content: string, key: string): string {
    let result = ''
    for (let i = 0; i < content.length; i++) {
      const charCode = content.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }
    return btoa(result) // Base64 encode
  }

  private simpleDecrypt(encryptedContent: string, key: string): string {
    try {
      const decoded = atob(encryptedContent)
      let result = ''
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        result += String.fromCharCode(charCode)
      }
      return result
    } catch (error) {
      console.error('❌ Simple decryption failed:', error)
      return '🔒 Unable to decrypt message'
    }
  }

  // ✅ SIMPLIFIED DECRYPTION
  async decryptMessage(encryptedMessage: EncryptedMessage): Promise<string> {
    try {
      console.log('🔓 Decrypting message...')
      
      const decryptedContent = this.simpleDecrypt(encryptedMessage.encryptedContent, this.encryptionKey)
      
      if (!decryptedContent) {
        console.error('❌ Decryption resulted in empty text')
        return '🔒 Unable to decrypt message'
      }

      console.log('✅ Message decrypted successfully')
      return decryptedContent
    } catch (error) {
      console.error('❌ Decryption failed:', error)
      return '🔒 Unable to decrypt message'
    }
  }

  // ✅ FIXED: GET AND DECRYPT CONVERSATION
  async getEncryptedConversation(contactId: string): Promise<{message: ChatMessage, decryptedContent: string}[]> {
    try {
      const messages = await this.storage.getMessages(contactId)
      const decryptedMessages = []
      
      console.log(`📥 Loading ${messages.length} messages for contact ${contactId}`)
      
      for (const message of messages) {
        if (message.encrypted) {
          try {
            const encryptedMsg: EncryptedMessage = {
              id: message.id,
              contactId: message.contactId,
              encryptedContent: message.content,
              timestamp: message.timestamp
            }
            
            const decryptedContent = await this.decryptMessage(encryptedMsg)
            decryptedMessages.push({
              message,
              decryptedContent
            })
            
          } catch (error) {
            console.error('❌ Failed to decrypt message:', error)
            decryptedMessages.push({
              message,
              decryptedContent: '🔒 Failed to decrypt message'
            })
          }
        } else {
          // Plain text message (fallback)
          decryptedMessages.push({
            message,
            decryptedContent: message.content
          })
        }
      }
      
      return decryptedMessages
    } catch (error) {
      console.error('❌ Failed to load conversation:', error)
      return []
    }
  }

  private convertToChatMessage(secureMessage: EncryptedMessage): ChatMessage {
    return {
      id: secureMessage.id,
      contactId: secureMessage.contactId,
      senderId: 'me',
      content: secureMessage.encryptedContent,
      timestamp: secureMessage.timestamp,
      messageType: 'text',
      status: 'sent',
      encrypted: true
    }
  }

  private async updateEncryptedConversation(contactId: string, lastMessage: string, timestamp: Date) {
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

  // ✅ TEST METHOD
  async testEncryption(): Promise<boolean> {
    try {
      const testMessage = 'Hello Zoomka! ' + Date.now()
      const messageId = await this.sendEncryptedMessage('test_contact', testMessage)
      const messages = await this.getEncryptedConversation('test_contact')
      
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.decryptedContent === testMessage) {
        console.log('✅ Encryption/Decryption test PASSED')
        return true
      } else {
        console.error('❌ Encryption/Decryption test FAILED')
        console.log('Expected:', testMessage)
        console.log('Got:', lastMessage?.decryptedContent)
        return false
      }
    } catch (error) {
      console.error('❌ Encryption test error:', error)
      return false
    }
  }
}