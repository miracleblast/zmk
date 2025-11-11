// src/engines/NotificationEngine.ts
export class NotificationEngine {
  private permission: NotificationPermission = 'default'

  async initialize() {
    if (!('Notification' in window)) {
      console.warn('❌ This browser does not support notifications')
      return false
    }

    try {
      this.permission = await Notification.requestPermission()
      
      if (this.permission === 'granted') {
        console.log('✅ Notification permission granted')
        return true
      } else {
        console.warn('❌ Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error)
      return false
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}) {
    if (this.permission !== 'granted') {
      console.warn('❌ Cannot show notification - permission not granted')
      return false
    }

    try {
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        // ✅ REMOVED: vibrate: [200, 100, 200], - Not supported in NotificationOptions
        ...options
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return true
    } catch (error) {
      console.error('❌ Error showing notification:', error)
      return false
    }
  }

  // Chat notifications
  async showChatNotification(contactName: string, message: string) {
    return this.showNotification(`New message from ${contactName}`, {
      body: message,
      icon: '/pwa-192x192.png',
      tag: 'chat-message',
      requireInteraction: true
    })
  }

  // Scan notifications
  async showScanNotification(contactName: string) {
    return this.showNotification('Contact scanned successfully', {
      body: `Added ${contactName} to your contacts`,
      icon: '/pwa-192x192.png',
      tag: 'contact-scanned'
    })
  }

  // Update notifications
  async showUpdateNotification(version: string) {
    return this.showNotification('Update available', {
      body: `Zoomka ${version} is available. Tap to update.`,
      icon: '/pwa-192x192.png',
      tag: 'app-update',
      requireInteraction: true
    })
  }
async testNotification() {
  const result = await this.showNotification('Test Notification', {
    body: 'Zoomka notifications are working!',
    icon: '/pwa-192x192.png'
  })
  
  if (result) {
    console.log('✅ Notification test successful')
  } else {
    console.log('❌ Notification test failed')
  }
}
  // License notifications
  async showLicenseNotification() {
    return this.showNotification('License activated', {
      body: 'Premium features are now available',
      icon: '/pwa-192x192.png',
      tag: 'license-activated'
    })
  }

  canShowNotifications(): boolean {
    return this.permission === 'granted'
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission
  }
}
