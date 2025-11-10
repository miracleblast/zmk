<!-- src/components/ChatInterface.vue -->
<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-zoom-500 rounded-xl flex items-center justify-center text-white">
          <Icon icon="material-symbols:person" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-800 dark:text-white">{{ contact.name }}</h3>
          <p class="text-xs text-gray-500">{{ contact.position }} at {{ contact.company }}</p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button class="p-2 text-gray-500 hover:text-zoom-500 transition-colors">
          <Icon icon="material-symbols:call" />
        </button>
        <button class="p-2 text-gray-500 hover:text-zoom-500 transition-colors">
          <Icon icon="material-symbols:video-call" />
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
        </div>
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
          :disabled="!isPremium"
          @keyup.enter="sendMessage"
        >
        <button 
          @click="sendMessage"
          :disabled="!newMessage.trim() || !isPremium"
          class="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="material-symbols:send" />
        </button>
      </div>
      
      <!-- Premium Required Notice -->
      <div v-if="!isPremium" class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 text-amber-800">
            <Icon icon="material-symbols:lock" class="text-amber-600" />
            <span class="text-sm font-medium">Premium Feature</span>
          </div>
          <button 
            @click="upgradeToPremium"
            class="text-xs bg-amber-500 text-white px-3 py-1 rounded-full hover:bg-amber-600 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
        <p class="text-xs text-amber-700 mt-1">
          Chat with your business contacts securely
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'

const props = defineProps<{
  contact: any
}>()

const chatStore = useChatStore()
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()

const isPremium = ref(false) // Would come from your premium check

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  
  try {
    await chatStore.sendMessage(props.contact.id, newMessage.value)
    newMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
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

const upgradeToPremium = () => {
  // Navigate to premium upgrade page
  console.log('Navigate to premium upgrade')
}

// Load conversation when contact changes
watch(() => props.contact, async (newContact) => {
  if (newContact) {
    await chatStore.loadConversation(newContact.id)
    scrollToBottom()
  }
}, { immediate: true })
</script>