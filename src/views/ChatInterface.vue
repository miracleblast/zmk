<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <div 
          class="w-10 h-10 rounded-xl flex items-center justify-center text-white relative overflow-hidden"
          :class="contact.image ? 'bg-transparent' : 'bg-zoom-500'"
        >
          <img 
            v-if="contact.image && contact.image !== ''"
            :src="contact.image"
            class="w-full h-full object-cover"
            alt="Profile"
          >
          <Icon v-else icon="material-symbols:person" class="text-xl" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800 dark:text-white">{{ contact.name }}</h3>
          <p class="text-xs text-gray-500">{{ contact.position }} at {{ contact.company }}</p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button @click="$emit('close')" class="p-2 text-gray-500 hover:text-zoom-500 transition-colors">
          <Icon icon="material-symbols:close" class="text-xl" />
        </button>
      </div>
    </div>

    <!-- Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="flex"
        :class="message.senderId === 'me' ? 'justify-end' : 'justify-start'"
      >
        <div 
          class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl"
          :class="message.senderId === 'me' 
            ? 'bg-zoom-500 text-white rounded-br-none' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'"
        >
          <p class="text-sm">{{ message.content }}</p>
          <p class="text-xs opacity-70 mt-1 text-right">
            {{ formatTime(message.timestamp) }}
          </p>
          <!-- Message Status -->
          <div v-if="message.senderId === 'me'" class="flex justify-end mt-1">
            <Icon 
              :icon="getMessageStatusIcon(message.status)" 
              class="text-xs"
              :class="getMessageStatusColor(message.status)"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="messages.length === 0 && !isLoading" class="text-center py-8">
        <div class="glass-card p-6 max-w-sm mx-auto">
          <Icon icon="material-symbols:chat" class="text-4xl text-zoom-500 mb-3" />
          <h4 class="font-semibold text-gray-800 dark:text-white mb-2">Start a Conversation</h4>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            No messages yet. Send your first message to {{ contact.name }}
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="flex justify-center space-x-2">
          <div class="w-2 h-2 bg-zoom-500 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-zoom-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-zoom-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <p class="text-sm text-gray-500 mt-2">Loading messages...</p>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex space-x-2">
        <input 
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 input-modern"
          :disabled="!isPremium || isSending"
          @keyup.enter="sendMessage"
          maxlength="1000"
        >
        <button 
          @click="sendMessage"
          :disabled="!newMessage.trim() || !isPremium || isSending"
          class="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="isSending" icon="eos-icons:loading" class="text-xl" />
          <Icon v-else icon="material-symbols:send" />
        </button>
      </div>
      
      <!-- Character Count -->
      <div class="flex justify-between items-center mt-2">
        <span class="text-xs text-gray-500">
          {{ newMessage.length }}/1000
        </span>
        
        <!-- Premium Required Notice -->
        <div v-if="!isPremium" class="flex items-center space-x-2 text-amber-600">
          <Icon icon="material-symbols:lock" class="text-sm" />
          <span class="text-xs">Premium feature</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { SecureChatEngine } from '../engines/SecureChatEngine'

const props = defineProps<{
  contact: any
}>()

const emit = defineEmits<{
  close: []
}>()

const chatStore = useChatStore()
const secureChatEngine = new SecureChatEngine()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const messages = ref<any[]>([])
const isLoading = ref(false)
const isSending = ref(false)
const isPremium = ref(true) // In production, this would check actual premium status

// ✅ PRODUCTION: LOAD REAL MESSAGES
const loadMessages = async () => {
  if (!props.contact?.id) return
  
  isLoading.value = true
  try {
    console.log('📥 Loading messages for contact:', props.contact.id)
    
    // Use SecureChatEngine to get encrypted messages
    const encryptedMessages = await secureChatEngine.getEncryptedConversation(props.contact.id)
    messages.value = encryptedMessages.map(item => ({
      ...item.message,
      content: item.decryptedContent
    }))
    
    console.log('✅ Loaded', messages.value.length, 'messages')
    scrollToBottom()
    
  } catch (error) {
    console.error('❌ Failed to load messages:', error)
  } finally {
    isLoading.value = false
  }
}

// ✅ PRODUCTION: SEND REAL ENCRYPTED MESSAGE
const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.contact?.id) return
  
  isSending.value = true
  const messageContent = newMessage.value.trim()
  
  try {
    console.log('📤 Sending message to:', props.contact.id)
    
    // Send encrypted message using SecureChatEngine
    const messageId = await secureChatEngine.sendEncryptedMessage(props.contact.id, messageContent)
    
    // Add to local state immediately for better UX
    messages.value.push({
      id: messageId,
      contactId: props.contact.id,
      senderId: 'me',
      content: messageContent,
      timestamp: new Date(),
      messageType: 'text',
      status: 'sent',
      encrypted: true
    })
    
    newMessage.value = ''
    scrollToBottom()
    console.log('✅ Message sent successfully')
    
  } catch (error) {
    console.error('❌ Failed to send message:', error)
    alert('Failed to send message. Please try again.')
  } finally {
    isSending.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getMessageStatusIcon = (status: string) => {
  const icons = {
    sent: 'material-symbols:check',
    delivered: 'material-symbols:check',
    read: 'material-symbols:check'
  }
  return icons[status as keyof typeof icons] || 'material-symbols:schedule'
}

const getMessageStatusColor = (status: string) => {
  const colors = {
    sent: 'text-gray-400',
    delivered: 'text-gray-600',
    read: 'text-zoom-500'
  }
  return colors[status as keyof typeof colors] || 'text-gray-400'
}

// Load messages when contact changes
watch(() => props.contact, async (newContact) => {
  if (newContact) {
    await loadMessages()
  }
}, { immediate: true })

// Auto-refresh messages every 30 seconds
onMounted(() => {
  const refreshInterval = setInterval(async () => {
    if (props.contact?.id) {
      await loadMessages()
    }
  }, 30000)

  // Cleanup on unmount
  return () => clearInterval(refreshInterval)
})
</script>