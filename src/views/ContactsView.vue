<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-cal text-zoom-600 dark:text-zoom-300 mb-2">Contacts</h1>
        <p class="text-gray-600 dark:text-gray-300 font-poppins">Your scanned business connections</p>
      </div>

      <!-- Search Bar -->
      <div class="glass-card p-4 mb-6 max-w-md mx-auto">
        <div class="flex items-center space-x-3">
          <Icon icon="material-symbols:search" class="text-zoom-500 text-xl" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search contacts by name, company, or category..."
            class="flex-1 bg-transparent border-none focus:outline-none text-gray-800 dark:text-white placeholder-gray-500 font-poppins"
            @input="handleSearch"
          >
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="material-symbols:close" class="text-lg" />
          </button>
        </div>
      </div>

      <!-- Alibaba-style Category Navigation -->
      <div class="max-w-md mx-auto mb-6">
        <div class="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
          <button 
            v-for="category in categories"
            :key="category.id"
            @click="setActiveCategory(category.id)"
            class="flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 whitespace-nowrap"
            :class="activeCategory === category.id 
              ? 'bg-zoom-500 text-white shadow-lg shadow-zoom-500/25' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-zoom-100 dark:hover:bg-zoom-900'"
          >
            <Icon :icon="category.icon" class="text-lg" />
            <span class="font-poppins text-sm">{{ category.name }}</span>
            <span 
              v-if="getContactCount(category.id) > 0"
              class="bg-white text-zoom-500 rounded-full px-2 py-1 text-xs font-semibold min-w-6 text-center"
            >
              {{ getContactCount(category.id) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Contacts Grid -->
      <div class="max-w-md mx-auto">
        <div class="grid gap-3">
          <div 
            v-for="contact in filteredContacts" 
            :key="contact.id"
            class="glass-card p-4 transition-all duration-300 hover:scale-105 cursor-pointer group"
            @click="viewContact(contact)"
          >
            <div class="flex items-center space-x-4">
              <!-- Contact Avatar with Profile Picture -->
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center text-white relative overflow-hidden"
                :class="contact.image ? 'bg-transparent' : 'bg-zoom-500'"
              >
                <!-- Show profile picture if available -->
                <img 
                  v-if="contact.image && contact.image !== ''"
                  :src="contact.image"
                  class="w-full h-full object-cover"
                  alt="Profile"
                >
                <!-- Fallback to icon if no image -->
                <div v-else class="flex items-center justify-center w-full h-full">
                  <Icon :icon="getCategoryIcon(contact.category)" class="text-xl" />
                </div>
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <!-- Contact Info -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 dark:text-white font-poppins truncate">
                  {{ contactEngine.generateDisplayName(contact) }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 font-poppins truncate">
                  {{ contact.position }} <span v-if="contact.company">at {{ contact.company }}</span>
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-xs text-zoom-500 font-montserrat bg-zoom-100 dark:bg-zoom-900 px-2 py-1 rounded-full">
                    {{ contact.category }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(contact.scannedAt) }}
                  </span>
                  <!-- Contact Score -->
                  <span 
                    v-if="contactEngine.calculateContactScore(contact) > 50"
                    class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                    :title="`Contact completeness: ${contactEngine.calculateContactScore(contact)}%`"
                  >
                    ⭐ {{ contactEngine.calculateContactScore(contact) }}%
                  </span>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <!-- Chat Button -->
                <button 
                  @click.stop="openChat(contact)"
                  class="p-2 text-green-500 hover:bg-green-500 hover:text-white rounded-full transition-colors relative"
                  :title="hasChatConversation(contact.id) ? 'Continue Chat' : 'Start Chat'"
                >
                  <Icon icon="material-symbols:chat" class="text-lg" />
                  <!-- Unread badge -->
                  <div 
                    v-if="getUnreadCount(contact.id) > 0"
                    class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    {{ getUnreadCount(contact.id) }}
                  </div>
                </button>
                
                <button 
                  v-if="contact.phone"
                  @click.stop="callContact(contact)"
                  class="p-2 text-green-500 hover:bg-green-500 hover:text-white rounded-full transition-colors"
                >
                  <Icon icon="material-symbols:call" class="text-lg" />
                </button>
                <button 
                  v-if="contact.email"
                  @click.stop="emailContact(contact)"
                  class="p-2 text-blue-500 hover:bg-blue-500 hover:text-white rounded-full transition-colors"
                >
                  <Icon icon="material-symbols:email" class="text-lg" />
                </button>
              </div>
            </div>

            <!-- Social Media Icons -->
            <div v-if="contact.socialMedia && hasSocialMedia(contact.socialMedia)" class="flex space-x-2 mt-3">
              <a 
                v-if="contact.socialMedia.linkedin"
                :href="contact.socialMedia.linkedin"
                target="_blank"
                @click.stop
                class="text-[#0077b5] hover:scale-110 transition-transform"
                title="LinkedIn"
              >
                <Icon icon="logos:linkedin-icon" class="text-lg" />
              </a>
              <a 
                v-if="contact.socialMedia.twitter"
                :href="contact.socialMedia.twitter"
                target="_blank"
                @click.stop
                class="text-[#1da1f2] hover:scale-110 transition-transform"
                title="Twitter"
              >
                <Icon icon="logos:twitter" class="text-lg" />
              </a>
              <a 
                v-if="contact.socialMedia.instagram"
                :href="contact.socialMedia.instagram"
                target="_blank"
                @click.stop
                class="text-[#e4405f] hover:scale-110 transition-transform"
                title="Instagram"
              >
                <Icon icon="logos:instagram-icon" class="text-lg" />
              </a>
              <a 
                v-if="contact.socialMedia.facebook"
                :href="contact.socialMedia.facebook"
                target="_blank"
                @click.stop
                class="text-[#1877f2] hover:scale-110 transition-transform"
                title="Facebook"
              >
                <Icon icon="logos:facebook" class="text-lg" />
              </a>
              <a 
                v-if="contact.socialMedia.wechat"
                :href="formatWeChatUrl(contact.socialMedia.wechat)"
                target="_blank"
                @click.stop
                class="text-[#07C160] hover:scale-110 transition-transform"
                title="WeChat"
              >
                <Icon icon="logos:wechat" class="text-lg" />
              </a>
              <a 
                v-if="contact.socialMedia.whatsapp"
                :href="contact.socialMedia.whatsapp"
                target="_blank"
                @click.stop
                class="text-[#25d366] hover:scale-110 transition-transform"
                title="WhatsApp"
              >
                <Icon icon="logos:whatsapp-icon" class="text-lg" />
              </a>
            </div>

            <!-- Tags -->
            <div v-if="contact.tags && contact.tags.length > 0" class="flex flex-wrap gap-1 mt-3">
              <span 
                v-for="tag in contact.tags"
                :key="tag"
                class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredContacts.length === 0" class="text-center py-12">
          <Icon 
            :icon="searchQuery ? 'material-symbols:search-off' : 'material-symbols:contact-page-outline'" 
            class="text-6xl text-gray-400 mb-4" 
          />
          <h3 class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2 font-poppins">
            {{ getEmptyStateMessage }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 font-poppins">
            {{ getEmptyStateDescription }}
          </p>
          <button 
            v-if="!searchQuery"
            @click="$router.push('/')"
            class="btn-primary mt-4 flex items-center justify-center space-x-2"
          >
            <Icon icon="material-symbols:qr-code-scanner" class="text-xl" />
            <span>Scan Your First Contact</span>
          </button>
        </div>
      </div>
    </div>

 <!-- Enhanced Contact Detail Modal with ALL information -->
<div 
  v-if="selectedContact"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  @click="selectedContact = null"
>
  <div 
    class="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
    @click.stop
  >
    <div class="p-6">
      <!-- Header with Profile Picture -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <!-- Large Profile Picture -->
          <div 
            class="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl overflow-hidden bg-zoom-500"
          >
            <img 
              v-if="selectedContact.image && selectedContact.image !== ''"
              :src="selectedContact.image"
              class="w-full h-full object-cover"
              alt="Profile"
              @error="selectedContact.image = ''"
            >
            <Icon v-else :icon="getCategoryIcon(selectedContact.category)" class="text-3xl" />
          </div>
          <div>
            <h3 class="text-xl font-cal text-gray-800 dark:text-white">{{ selectedContact.name }}</h3>
            <p class="text-zoom-500">{{ selectedContact.position }}</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm">{{ selectedContact.company }}</p>
          </div>
        </div>
        <button 
          @click="selectedContact = null"
          class="text-gray-500 hover:text-gray-700"
        >
          <Icon icon="material-symbols:close" class="text-2xl" />
        </button>
      </div>

      <!-- Contact Info Sections -->
      <div class="space-y-4">
        
        <!-- Contact Methods -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <h4 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
            <Icon icon="material-symbols:contact-page" class="text-zoom-500" />
            <span>Contact Information</span>
          </h4>
          <div class="space-y-2">
            <div v-if="selectedContact.phone" class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-300">Phone:</span>
              <a :href="`tel:${selectedContact.phone}`" class="text-zoom-500 hover:text-zoom-600 font-semibold">
                {{ selectedContact.phone }}
              </a>
            </div>
            <div v-if="selectedContact.email" class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-300">Email:</span>
              <a :href="`mailto:${selectedContact.email}`" class="text-zoom-500 hover:text-zoom-600 font-semibold">
                {{ selectedContact.email }}
              </a>
            </div>
            <div v-if="selectedContact.website" class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-300">Website:</span>
              <a :href="selectedContact.website" target="_blank" class="text-zoom-500 hover:text-zoom-600 font-semibold">
                Visit Website
              </a>
            </div>
          </div>
        </div>

        <!-- Location Information -->
        <div v-if="selectedContact.location && (selectedContact.location.country || selectedContact.location.city)" class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <h4 class="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center space-x-2">
            <Icon icon="material-symbols:location-on" class="text-green-500" />
            <span>Location</span>
          </h4>
          <div class="space-y-2">
            <div v-if="selectedContact.location.country" class="flex justify-between">
              <span class="text-green-700 dark:text-green-300">Country:</span>
              <span class="font-semibold">{{ selectedContact.location.country }}</span>
            </div>
            <div v-if="selectedContact.location.city" class="flex justify-between">
              <span class="text-green-700 dark:text-green-300">City:</span>
              <span class="font-semibold">{{ selectedContact.location.city }}</span>
            </div>
            <div v-if="selectedContact.location.address" class="flex justify-between">
              <span class="text-green-700 dark:text-green-300">Address:</span>
              <span class="font-semibold text-right">{{ selectedContact.location.address }}</span>
            </div>
            <div v-if="selectedContact.location.zipCode" class="flex justify-between">
              <span class="text-green-700 dark:text-green-300">ZIP Code:</span>
              <span class="font-semibold">{{ selectedContact.location.zipCode }}</span>
            </div>
          </div>
        </div>

        <!-- Target Markets -->
        <div v-if="selectedContact.targetMarkets && selectedContact.targetMarkets.length > 0" class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center space-x-2">
            <Icon icon="material-symbols:public" class="text-purple-500" />
            <span>Target Markets</span>
          </h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="market in selectedContact.targetMarkets"
              :key="market"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
            >
              <Icon :icon="getMarketIcon(market)" class="text-sm mr-1" />
              {{ market.charAt(0).toUpperCase() + market.slice(1) }}
            </span>
          </div>
        </div>

        <!-- Social Media -->
        <div v-if="selectedContact.socialMedia && hasSocialMedia(selectedContact.socialMedia)" class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center space-x-2">
            <Icon icon="material-symbols:share" class="text-blue-500" />
            <span>Social Media</span>
          </h4>
          <div class="flex flex-wrap gap-3">
            <a 
              v-for="platform in getSocialMediaPlatforms(selectedContact.socialMedia)"
              :key="platform.name"
              :href="platform.url"
              target="_blank"
              class="flex flex-col items-center space-y-1 hover:scale-110 transition-transform"
              :title="platform.name"
            >
              <Icon :icon="platform.icon" class="text-2xl" :style="{ color: platform.color }" />
              <span class="text-xs text-blue-700 dark:text-blue-300">{{ platform.name }}</span>
            </a>
          </div>
        </div>

        <!-- Digital Flyers -->
        <div v-if="selectedContact.flyers && selectedContact.flyers.length > 0" class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
          <h4 class="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center space-x-2">
            <Icon icon="material-symbols:description" class="text-amber-500" />
            <span>Digital Flyers ({{ selectedContact.flyers.length }})</span>
          </h4>
          <div class="space-y-2">
            <div 
              v-for="(flyer, index) in selectedContact.flyers" 
              :key="index"
              class="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <Icon 
                  :icon="getFileIcon(flyer.name)" 
                  class="text-amber-500 text-xl" 
                />
                <div>
                  <span class="text-sm font-semibold block">{{ flyer.name }}</span>
                  <span class="text-xs text-gray-500">{{ formatFileSize(flyer.size) }}</span>
                </div>
              </div>
              <button 
                @click="downloadFlyer(flyer)"
                class="text-amber-500 hover:text-amber-700 p-1"
                title="Download Flyer"
              >
                <Icon icon="material-symbols:download" />
              </button>
            </div>
          </div>
        </div>

        <!-- Business Tags -->
        <div v-if="selectedContact.tags && selectedContact.tags.length > 0" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <h4 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
            <Icon icon="material-symbols:label" class="text-gray-500" />
            <span>Business Tags</span>
          </h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tag in selectedContact.tags"
              :key="tag"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
            >
              {{ tag.replace(/-/g, ' ').replace('qr scanned', 'QR Code') }}
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4">
          <button 
            @click="deleteContact(selectedContact.id)"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <Icon icon="material-symbols:delete" class="text-xl" />
            <span>Delete</span>
          </button>
          <button 
            @click="startChat(selectedContact)"
            class="flex-1 btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Icon icon="material-symbols:chat" class="text-xl" />
            <span>Start Chat</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


    <!-- Chat Modal -->
    <div 
      v-if="activeChatContact"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeChat"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col"
        @click.stop
      >
        <ChatInterface :contact="activeChatContact" @close="closeChat" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContactsStore } from '../stores/contacts'
import { useChatStore } from '../stores/chat'
import { StorageEngine } from '../engines/StorageEngine'
import { ContactEngine } from '../engines/ContactEngine'
import ChatInterface from '../components/ChatInterface.vue'

const router = useRouter()
const contactsStore = useContactsStore()
const chatStore = useChatStore()
const storageEngine = new StorageEngine()
const contactEngine = new ContactEngine()

const searchQuery = ref('')
const activeCategory = ref('all')
const selectedContact = ref<any>(null)
const activeChatContact = ref<any>(null)
const categories = ref<any[]>([])

// ✅ ENHANCED ALIBABA-STYLE CATEGORIES WITH SUB-CATEGORIES
const alibabaCategories = [
  {
    id: 'technology',
    name: 'Technology',
    icon: 'material-symbols:code',
    color: 'bg-blue-500',
    subcategories: [
      { id: 'software', name: 'Software Development' },
      { id: 'hardware', name: 'Hardware & Electronics' },
      { id: 'ai-ml', name: 'AI & Machine Learning' },
      { id: 'cybersecurity', name: 'Cybersecurity' },
      { id: 'cloud', name: 'Cloud Services' }
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'material-symbols:factory',
    color: 'bg-green-500',
    subcategories: [
      { id: 'electronics-mfg', name: 'Electronics Manufacturing' },
      { id: 'textiles', name: 'Textiles & Apparel' },
      { id: 'automotive', name: 'Automotive Parts' },
      { id: 'machinery', name: 'Industrial Machinery' },
      { id: 'food-processing', name: 'Food Processing' }
    ]
  },
  {
    id: 'import-export',
    name: 'Import/Export',
    icon: 'material-symbols:airplane-ticket',
    color: 'bg-purple-500',
    subcategories: [
      { id: 'electronics-trade', name: 'Electronics Trade' },
      { id: 'commodities', name: 'Commodities' },
      { id: 'raw-materials', name: 'Raw Materials' },
      { id: 'consumer-goods', name: 'Consumer Goods' },
      { id: 'agricultural', name: 'Agricultural Products' }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'material-symbols:engineering',
    color: 'bg-orange-500',
    subcategories: [
      { id: 'consulting', name: 'Business Consulting' },
      { id: 'logistics', name: 'Logistics & Shipping' },
      { id: 'finance', name: 'Financial Services' },
      { id: 'it-services', name: 'IT Services' },
      { id: 'professional', name: 'Professional Services' }
    ]
  },
  {
    id: 'retail',
    name: 'Retail & Commerce',
    icon: 'material-symbols:storefront',
    color: 'bg-red-500',
    subcategories: [
      { id: 'ecommerce', name: 'E-commerce' },
      { id: 'wholesale', name: 'Wholesale' },
      { id: 'retail-chains', name: 'Retail Chains' },
      { id: 'fashion', name: 'Fashion & Apparel' },
      { id: 'consumer-electronics', name: 'Consumer Electronics' }
    ]
  }
]


onMounted(async () => {
  categories.value = await storageEngine.getCategories()
  // Load contacts if not already loaded
  if (contactsStore.contacts.length === 0) {
    const contacts = await storageEngine.getContacts()
    contactsStore.setContacts(contacts)
  }
  
  // Initialize chat store
  await chatStore.initialize()
})

const filteredContacts = computed(() => {
  let contacts = contactsStore.contacts

  // Apply search filter
  if (searchQuery.value) {
    contacts = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      contact.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Apply category filter
  if (activeCategory.value !== 'all') {
    contacts = contacts.filter(contact => contact.category === activeCategory.value)
  }

  return contacts.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
})
// Add these methods to your ContactsView.vue script section

const getFileIcon = (filename: string) => {
  if (filename.toLowerCase().endsWith('.pdf')) return 'material-symbols:description'
  if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'material-symbols:image'
  if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) return 'material-symbols:description'
  return 'material-symbols:insert-drive-file'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getContactCount = (categoryId: string) => {
  if (categoryId === 'all') return contactsStore.contacts.length
  return contactsStore.contacts.filter(contact => contact.category === categoryId).length
}

const getEmptyStateMessage = computed(() => {
  if (searchQuery.value) return 'No contacts found'
  if (activeCategory.value !== 'all') return `No contacts in ${activeCategory.value}`
  return 'No contacts yet'
})

const getEmptyStateDescription = computed(() => {
  if (searchQuery.value) return 'Try adjusting your search terms'
  if (activeCategory.value !== 'all') return 'Try scanning more business cards in this category'
  return 'Scan your first business card to get started'
})

const getCategoryIcon = (category: string) => {
  const found = categories.value.find(cat => cat.id === category)
  return found?.icon || 'material-symbols:person'
}

// ✅ FIXED: PROPER SOCIAL MEDIA CHECK
const hasSocialMedia = (socialMedia: any) => {
  if (!socialMedia) return false
  return Object.values(socialMedia).some(value => value && value !== '')
}

// ✅ FIXED: PROPER SOCIAL MEDIA PLATFORMS WITH CORRECT SYNTAX
const getSocialMediaPlatforms = (socialMedia: any) => {
  const platforms = []
  
  if (socialMedia.linkedin && socialMedia.linkedin !== '') {
    platforms.push({ 
      name: 'LinkedIn', 
      url: socialMedia.linkedin, 
      icon: 'logos:linkedin-icon', 
      color: '#0077b5' 
    })
  }
  
  if (socialMedia.twitter && socialMedia.twitter !== '') {
    platforms.push({ 
      name: 'Twitter', 
      url: socialMedia.twitter, 
      icon: 'logos:twitter', 
      color: '#1da1f2' 
    })
  }
  
  if (socialMedia.instagram && socialMedia.instagram !== '') {
    platforms.push({ 
      name: 'Instagram', 
      url: socialMedia.instagram, 
      icon: 'logos:instagram-icon', 
      color: '#e4405f' 
    })
  }
  
  if (socialMedia.facebook && socialMedia.facebook !== '') {
    platforms.push({ 
      name: 'Facebook', 
      url: socialMedia.facebook, 
      icon: 'logos:facebook', 
      color: '#1877f2' 
    })
  }
  
  if (socialMedia.wechat && socialMedia.wechat !== '') {
    platforms.push({ 
      name: 'WeChat', 
      url: formatWeChatUrl(socialMedia.wechat), 
      icon: 'logos:wechat', 
      color: '#07C160' 
    })
  }
  
  if (socialMedia.whatsapp && socialMedia.whatsapp !== '') {
    platforms.push({ 
      name: 'WhatsApp', 
      url: socialMedia.whatsapp, 
      icon: 'logos:whatsapp-icon', 
      color: '#25d366' 
    })
  }
  
  if (socialMedia.youtube && socialMedia.youtube !== '') {
    platforms.push({ 
      name: 'YouTube', 
      url: socialMedia.youtube, 
      icon: 'logos:youtube-icon', 
      color: '#ff0000' 
    })
  }
  
  if (socialMedia.github && socialMedia.github !== '') {
    platforms.push({ 
      name: 'GitHub', 
      url: socialMedia.github, 
      icon: 'logos:github-icon', 
      color: '#000000' 
    })
  }
  
  return platforms
}

// ✅ FIXED: PROPER WECHAT URL FORMATTING
const formatWeChatUrl = (wechatId: string) => {
  // WeChat IDs can be formatted for QR code or direct messaging
  if (wechatId.startsWith('http')) {
    return wechatId
  }
  return `weixin://dl/chat?${wechatId}`
}

// ✅ CHAT FUNCTIONALITY
const hasChatConversation = (contactId: string) => {
  return chatStore.getUnreadCount(contactId) > 0 || chatStore.getConversationByContactId(contactId)
}

const getUnreadCount = (contactId: string) => {
  return chatStore.getUnreadCount(contactId)
}

const openChat = (contact: any) => {
  activeChatContact.value = contact
}

const closeChat = () => {
  activeChatContact.value = null
}

const setActiveCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  searchQuery.value = ''
  // You can add logic here to show subcategories
  console.log('Selected category:', categoryId)
}

// Add a method to get subcategories for display
const getSubcategories = (categoryId: string) => {
  const category = alibabaCategories.find(cat => cat.id === categoryId)
  return category?.subcategories || []
}

const handleSearch = () => {
  // Search is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

// ✅ ENHANCED CONTACT CARD WITH PROFILE PICTURE AND FLYERS
const viewContact = (contact: any) => {
  selectedContact.value = contact
  console.log('👤 Viewing contact with image:', contact.image ? 'Yes' : 'No')
  console.log('📁 Contact flyers:', contact.flyers?.length || 0)
}
// ✅ NEW: DOWNLOAD FLYER METHOD
const downloadFlyer = (flyer: any) => {
  if (flyer.data && flyer.data.startsWith('data:')) {
    const link = document.createElement('a')
    link.href = flyer.data
    link.download = flyer.name
    link.click()
  } else {
    alert('Flyer data not available for download')
  }
}

// ✅ NEW: START CHAT WITH CONTACT
const startChat = (contact: any) => {
  // Use chat store to create conversation
  const contactId = chatStore.generateContactId(JSON.stringify(contact))
  activeChatContact.value = { ...contact, id: contactId }
  selectedContact.value = null // Close contact modal
}

const callContact = (contact: any) => {
  if (contact.phone) {
    window.open(`tel:${contact.phone}`, '_self')
  }
}

const emailContact = (contact: any) => {
  if (contact.email) {
    window.open(`mailto:${contact.email}`, '_self')
  }
}

const deleteContact = async (contactId: string) => {
  if (confirm('Are you sure you want to delete this contact?')) {
    await storageEngine.deleteContact(contactId)
    contactsStore.removeContact(contactId)
    selectedContact.value = null
  }
}

const getMarketIcon = (market: string) => {
  const icons = {
    africa: 'emojione:flag-for-south-africa',
    china: 'emojione:flag-for-china',
    india: 'emojione:flag-for-india',
    russia: 'emojione:flag-for-russia'
  }
  return icons[market as keyof typeof icons] || 'material-symbols:public'
}



const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>