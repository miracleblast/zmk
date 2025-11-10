<!-- src/components/SecureChatInterface.vue -->
<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
    <!-- Secure Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <!-- Contact Avatar with Encryption Badge -->
        <div class="relative">
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
          <!-- Encryption Badge -->
          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Icon icon="material-symbols:lock" class="text-white text-xs" />
          </div>
        </div>
        
        <div>
          <h3 class="font-semibold text-gray-800 dark:text-white">{{ contact.name }}</h3>
          <p class="text-xs text-gray-500 flex items-center space-x-1">
            <Icon icon="material-symbols:lock" class="text-green-500 text-xs" />
            <span>End-to-End Encrypted</span>
          </p>
        </div>
      </div>
      
      <div class="flex space-x-2">
        <button 
          @click="showSecurityInfo = true"
          class="p-2 text-gray-500 hover:text-zoom-500 transition-colors"
          title="Security Info"
        >
          <Icon icon="material-symbols:security" class="text-xl" />
        </button>
        <button 
          @click="$emit('close')"
          class="p-2 text-gray-500 hover:text-zoom-500 transition-colors"
        >
          <Icon icon="material-symbols:close" class="text-xl" />
        </button>
      </div>
    </div>

    <!-- Encrypted Messages Area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div 
        v-for="msg in decryptedMessages" 
        :key="msg.message.id"
        class="flex"
        :class="msg.message.senderId === 'me' ? 'justify-end' : 'justify-start'"
      >
        <div 
          class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl group relative"
          :class="msg.message.senderId === 'me' 
            ? 'bg-zoom-500 text-white rounded-br-none' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'"
        >
          <!-- Message Content -->
          <p class="text-sm">{{ msg.decryptedContent }}</p>
          
          <!-- Message Status & Time -->
          <div class="flex items-center justify-end space-x-2 mt-1">
            <span class="text-xs opacity-70">
              {{ formatTime(msg.message.timestamp) }}
            </span>
            <!-- Encryption Indicator -->
            <Icon 
              v-if="msg.message.encrypted"
              icon="material-symbols:lock" 
              class="text-xs opacity-50"
              title="End-to-End Encrypted"
            />
          </div>
          
          <!-- Security Badge (Hover) -->
          <div 
            v-if="msg.message.encrypted"
            class="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon icon="material-symbols:verified" class="text-xs" />
          </div>
        </div>
      </div>

      <!-- Encryption Welcome Message -->
      <div v-if="decryptedMessages.length === 0" class="text-center py-8">
        <div class="glass-card p-6 max-w-sm mx-auto">
          <Icon icon="material-symbols:lock" class="text-4xl text-green-500 mb-3" />
          <h4 class="font-semibold text-gray-800 dark:text-white mb-2">Secure Conversation</h4>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Messages in this chat are protected with end-to-end encryption. 
            Only you and {{ contact.name }} can read them.
          </p>
        </div>
      </div>
    </div>

    <!-- Secure Message Input -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex space-x-2">
        <input 
          v-model="newMessage"
          type="text"
          placeholder="Type a secure message..."
          class="flex-1 input-modern pr-10"
          :disabled="!isPremium"
          @keyup.enter="sendSecureMessage"
        >
        <!-- Encryption Indicator in Input -->
        <div class="absolute right-20 top-1/2 transform -translate-y-1/2">
          <Icon 
            icon="material-symbols:lock" 
            class="text-green-500 text-lg"
            title="End-to-End Encrypted"
          />
        </div>
        
        <button 
          @click="sendSecureMessage"
          :disabled="!newMessage.trim() || !isPremium"
          class="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          <Icon icon="material-symbols:send" />
        </button>
      </div>
      
      <!-- Security Status -->
      <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center space-x-1">
          <Icon icon="material-symbols:lock" class="text-green-500 text-sm" />
          <span>End-to-End Encrypted</span>
        </div>
        <span>Messages stay on your device</span>
      </div>
    </div>

    <!-- Security Info Modal -->
    <div 
      v-if="showSecurityInfo"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
      @click="showSecurityInfo = false"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Security Info</h3>
          <button @click="showSecurityInfo = false" class="text-gray-500 hover:text-gray-700">
            <Icon icon="material-symbols:close" class="text-xl" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <Icon icon="material-symbols:verified" class="text-green-500 text-2xl" />
            <div>
              <h4 class="font-semibold text-green-800 dark:text-green-200">End-to-End Encrypted</h4>
              <p class="text-sm text-green-700 dark:text-green-300">Messages are secured with AES-256 encryption</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Icon icon="material-symbols:devices" class="text-blue-500 text-2xl" />
            <div>
              <h4 class="font-semibold text-blue-800 dark:text-blue-200">Local Storage</h4>
              <p class="text-sm text-blue-700 dark:text-blue-300">All data stays on your device only</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <Icon icon="material-symbols:fingerprint" class="text-amber-500 text-2xl" />
            <div>
              <h4 class="font-semibold text-amber-800 dark:text-amber-200">Device Locked</h4>
              <p class="text-sm text-amber-700 dark:text-amber-300">Encryption key is unique to your device</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, watch, nextTick } from 'vue'
import { SecureChatEngine } from '../engines/SecureChatEngine'

const props = defineProps<{
  contact: any
}>()

const emit = defineEmits<{
  close: []
}>()

const secureChatEngine = new SecureChatEngine()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const decryptedMessages = ref<{message: any, decryptedContent: string}[]>([])
const showSecurityInfo = ref(false)
const isPremium = ref(true) // Would come from premium check

const sendSecureMessage = async () => {
  if (!newMessage.value.trim()) return
  
  try {
    await secureChatEngine.sendEncryptedMessage(props.contact.id, newMessage.value)
    newMessage.value = ''
    await loadEncryptedConversation()
    scrollToBottom()
  } catch (error) {
    console.error('❌ Failed to send secure message:', error)
    alert('Failed to send encrypted message. Please try again.')
  }
}

const loadEncryptedConversation = async () => {
  try {
    decryptedMessages.value = await secureChatEngine.getEncryptedConversation(props.contact.id)
  } catch (error) {
    console.error('❌ Failed to load encrypted conversation:', error)
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

// Load conversation when contact changes
watch(() => props.contact, async (newContact) => {
  if (newContact) {
    await loadEncryptedConversation()
    scrollToBottom()
  }
}, { immediate: true })
</script>