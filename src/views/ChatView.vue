<template>
  <div class="min-h-screen pb-20">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-cal text-zoom-600 dark:text-zoom-300 mb-2">Chat</h1>
        <p class="text-gray-600 dark:text-gray-300 font-poppins">Your secure business conversations</p>
      </div>

      <!-- Conversations List -->
      <div class="max-w-md mx-auto">
        <div class="glass-card p-4 mb-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-800 dark:text-white">Conversations</h3>
            <span class="text-xs bg-zoom-500 text-white px-2 py-1 rounded-full">
              {{ conversations.length }}
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="flex justify-center space-x-2 mb-4">
            <div class="w-2 h-2 bg-zoom-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-zoom-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-zoom-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
          <p class="text-gray-500">Loading conversations...</p>
        </div>

        <!-- Conversations -->
        <div v-else class="space-y-3">
          <div 
            v-for="conversation in conversations" 
            :key="conversation.id"
            class="glass-card p-4 transition-all duration-300 hover:scale-105 cursor-pointer group relative"
            @click="openConversation(conversation)"
          >
            <div class="flex items-center space-x-3">
              <!-- Contact Avatar -->
              <div class="relative">
                <div 
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-white relative overflow-hidden"
                  :class="conversation.contact.image ? 'bg-transparent' : 'bg-zoom-500'"
                >
                  <img 
                    v-if="conversation.contact.image && conversation.contact.image !== ''"
                    :src="conversation.contact.image"
                    class="w-full h-full object-cover"
                    alt="Profile"
                  >
                  <Icon v-else icon="material-symbols:person" class="text-xl" />
                </div>
                <!-- Online Indicator -->
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <!-- Conversation Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-semibold text-gray-800 dark:text-white truncate">
                    {{ conversation.contact.name }}
                  </h4>
                  <span class="text-xs text-gray-500">
                    {{ formatTime(conversation.lastMessageTime) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">
                  {{ conversation.lastMessage }}
                </p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-zoom-500 font-montserrat bg-zoom-100 dark:bg-zoom-900 px-2 py-1 rounded-full">
                    {{ conversation.contact.category }}
                  </span>
                  <div class="flex items-center space-x-1">
                    <Icon 
                      v-if="conversation.unreadCount > 0"
                      icon="material-symbols:mark-unread-chat-alt" 
                      class="text-zoom-500 text-sm"
                    />
                    <Icon 
                      icon="material-symbols:lock" 
                      class="text-green-500 text-xs"
                      title="End-to-End Encrypted"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Unread Badge -->
            <div 
              v-if="conversation.unreadCount > 0"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
            >
              {{ conversation.unreadCount }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && conversations.length === 0" class="text-center py-12">
          <Icon icon="material-symbols:chat" class="text-6xl text-gray-400 mb-4" />
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2 font-poppins">
            No conversations yet
          </h3>
          <p class="text-gray-500 dark:text-gray-400 font-poppins mb-4">
            Start chatting with your business contacts
          </p>
          <button 
            @click="$router.push('/contacts')"
            class="btn-primary flex items-center justify-center space-x-2 mx-auto"
          >
            <Icon icon="material-symbols:contacts" class="text-xl" />
            <span>Browse Contacts</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Chat Modal -->
    <div 
      v-if="activeConversation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeConversation"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col"
        @click.stop
      >
        <ChatInterface 
          :contact="activeConversation" 
          @close="closeConversation" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContactsStore } from '../stores/contacts'
import { useChatStore } from '../stores/chat'
import ChatInterface from '../components/ChatInterface.vue'

const router = useRouter()
const contactsStore = useContactsStore()
const chatStore = useChatStore()

const conversations = ref<any[]>([])
const activeConversation = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  await loadConversations()
})

// ✅ PRODUCTION: LOAD REAL CONVERSATIONS FROM CHAT STORE
const loadConversations = async () => {
  isLoading.value = true
  try {
    console.log('📥 Loading conversations from chat store...')
    
    // Initialize chat store
    await chatStore.initialize()
    
    // Get real conversations from chat store
    const chatConversations = await chatStore.getConversations()
    
    // Map to UI format with contact data
    const contacts = contactsStore.contacts
    
    conversations.value = chatConversations.map(conv => {
      const contact = contacts.find(c => c.id === conv.contactId) || {
        id: conv.contactId,
        name: 'Unknown Contact',
        position: '',
        company: '',
        category: 'General',
        image: ''
      }
      
      return {
        id: conv.id,
        contactId: conv.contactId,
        contact: contact,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount,
        isPinned: conv.isPinned,
        isMuted: conv.isMuted
      }
    }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    
    console.log('✅ Loaded', conversations.value.length, 'conversations')
    
  } catch (error) {
    console.error('❌ Failed to load conversations:', error)
    conversations.value = []
  } finally {
    isLoading.value = false
  }
}

const openConversation = (conversation: any) => {
  activeConversation.value = conversation.contact
  // Mark as read when opening
  if (conversation.unreadCount > 0) {
    chatStore.markAsRead(conversation.contactId)
  }
}

const closeConversation = () => {
  activeConversation.value = null
  // Refresh conversations to update unread counts
  loadConversations()
}

const formatTime = (date: Date) => {
  const now = new Date()
  const messageDate = new Date(date)
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffInHours < 168) { // 7 days
    return messageDate.toLocaleDateString('en-US', { 
      weekday: 'short'
    })
  } else {
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
}
</script>