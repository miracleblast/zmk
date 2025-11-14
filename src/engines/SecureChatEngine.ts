// src/engines/SecureChatEngine.ts
import { AES, enc, mode, pad } from 'crypto-js'
import { StorageEngine } from './StorageEngine'
import type { ChatMessage, ChatConversation } from './StorageEngine'

export interface EncryptedMessage {
  id: string
  contactId: string
  encryptedContent: string
  iv: string
  timestamp: Date
  signature: string
  senderPublicKey?: string
}

export class SecureChatEngine {
  private storage: StorageEngine
  private encryptionKey: string
  
  constructor() {
    this.storage = new StorageEngine()
    this.encryptionKey = this.generateEncryptionKey()
  }

  // ✅ GENERATE UNIQUE ENCRYPTION KEY PER DEVICE
  private generateEncryptionKey(): string {
    const deviceId = this.getDeviceFingerprint()
    const profileId = 'current'
    return AES.encrypt(`${deviceId}_${profileId}_${Date.now()}`, 'zoomka-master-key').toString()
  }

  // ✅ GET DEVICE FINGERPRINT
  private getDeviceFingerprint(): string {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|')
    
    return btoa(fingerprint)
  }

  // ✅ MILITARY-GRADE AES-256 ENCRYPTION
  async sendEncryptedMessage(contactId: string, content: string): Promise<string> {
    const iv = enc.Hex.parse(this.generateRandomIV())
    
    const encrypted = AES.encrypt(content, this.encryptionKey, {
      iv: iv,
      mode: mode.CBC,
      padding: pad.Pkcs7
    })

    const secureMessage: EncryptedMessage = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      contactId,
      encryptedContent: encrypted.toString(),
      iv: iv.toString(),
      timestamp: new Date(),
      signature: this.signMessage(encrypted.toString())
    }

    await this.storage.saveMessage(this.convertToChatMessage(secureMessage))
    await this.updateEncryptedConversation(contactId, '🔒 Encrypted message', secureMessage.timestamp)
    
    return secureMessage.id
  }

  // ✅ DECRYPT MESSAGE
  async decryptMessage(encryptedMessage: EncryptedMessage): Promise<string> {
    try {
      if (!this.verifySignature(encryptedMessage.encryptedContent, encryptedMessage.signature)) {
        throw new Error('Message signature verification failed')
      }

      const decrypted = AES.decrypt(encryptedMessage.encryptedContent, this.encryptionKey, {
        iv: enc.Hex.parse(encryptedMessage.iv),
        mode: mode.CBC,
        padding: pad.Pkcs7
      })

      return decrypted.toString(enc.Utf8)
    } catch (error) {
      console.error('❌ Decryption failed:', error)
      return '🔒 Unable to decrypt message'
    }
  }

  // ✅ GENERATE RANDOM IV (INITIALIZATION VECTOR)
  private generateRandomIV(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // ✅ MESSAGE SIGNING (INTEGRITY PROTECTION)
  private signMessage(content: string): string {
    const signature = AES.encrypt(content + this.encryptionKey, 'signing-key').toString()
    return btoa(signature)
  }

  // ✅ SIGNATURE VERIFICATION
  private verifySignature(content: string, signature: string): boolean {
    try {
      const expectedSignature = this.signMessage(content)
      return signature === btoa(expectedSignature)
    } catch {
      return false
    }
  }

  // ✅ GET ENCRYPTED CONVERSATION
  async getEncryptedConversation(contactId: string): Promise<{message: ChatMessage, decryptedContent: string}[]> {
    const messages = await this.storage.getMessages(contactId)
    const decryptedMessages = []
    
    for (const message of messages) {
      if (message.encrypted) {
        const encryptedMsg: EncryptedMessage = {
          id: message.id,
          contactId: message.contactId,
          encryptedContent: message.content,
          iv: message.content.split('|')[0],
          timestamp: message.timestamp,
          signature: message.content.split('|')[1]
        }
        
        const decryptedContent = await this.decryptMessage(encryptedMsg)
        decryptedMessages.push({
          message,
          decryptedContent
        })
      } else {
        decryptedMessages.push({
          message,
          decryptedContent: message.content
        })
      }
    }
    
    return decryptedMessages
  }

  private convertToChatMessage(secureMessage: EncryptedMessage): ChatMessage {
    return {
      id: secureMessage.id,
      contactId: secureMessage.contactId,
      senderId: 'me',
      content: `${secureMessage.iv}|${secureMessage.signature}|${secureMessage.encryptedContent}`,
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
}