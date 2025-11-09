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
              <!-- Contact Avatar -->
              <div class="w-12 h-12 bg-zoom-500 rounded-xl flex items-center justify-center text-white relative">
                <Icon :icon="getCategoryIcon(contact.category)" class="text-xl" />
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

    <!-- Enhanced Contact Detail Modal -->
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
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-cal text-gray-800 dark:text-white">Contact Details</h3>
            <button 
              @click="selectedContact = null"
              class="text-gray-500 hover:text-gray-700"
            >
              <Icon icon="material-symbols:close" class="text-2xl" />
            </button>
          </div>

          <!-- Contact Info -->
          <div class="space-y-6">
            <!-- Profile Header -->
            <div class="text-center">
              <div class="w-20 h-20 bg-zoom-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-3">
                <Icon :icon="getCategoryIcon(selectedContact.category)" />
              </div>
              <h4 class="text-lg font-semibold text-gray-800 dark:text-white font-poppins">
                {{ contactEngine.generateDisplayName(selectedContact) }}
              </h4>
              <p class="text-zoom-500 font-poppins">{{ selectedContact.position }}</p>
              <p class="text-gray-600 dark:text-gray-300 font-poppins">{{ selectedContact.company }}</p>
              
              <!-- Contact Score -->
              <div class="mt-2">
                <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <span>Contact Score:</span>
                  <span class="font-semibold text-zoom-500">
                    {{ contactEngine.calculateContactScore(selectedContact) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    class="bg-zoom-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${contactEngine.calculateContactScore(selectedContact)}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Social Media Links -->
            <div v-if="selectedContact.socialMedia && hasSocialMedia(selectedContact.socialMedia)" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h5 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
                <Icon icon="material-symbols:share" class="text-zoom-500" />
                <span>Social Media</span>
              </h5>
              <div class="flex justify-center space-x-4">
                <a 
                  v-for="platform in getSocialMediaPlatforms(selectedContact.socialMedia)"
                  :key="platform.name"
                  :href="platform.url"
                  target="_blank"
                  class="flex flex-col items-center space-y-1 hover:scale-110 transition-transform"
                  :title="platform.name"
                >
                  <Icon :icon="platform.icon" class="text-2xl" :style="{ color: platform.color }" />
                  <span class="text-xs text-gray-600 dark:text-gray-300">{{ platform.name }}</span>
                </a>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="space-y-3">
              <div v-if="selectedContact.phone" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center space-x-3">
                  <Icon icon="material-symbols:call" class="text-zoom-500 text-xl" />
                  <span class="font-poppins">Phone</span>
                </div>
                <a :href="`tel:${selectedContact.phone}`" class="text-zoom-500 hover:text-zoom-600 font-poppins">
                  {{ selectedContact.phone }}
                </a>
              </div>

              <div v-if="selectedContact.email" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center space-x-3">
                  <Icon icon="material-symbols:email" class="text-zoom-500 text-xl" />
                  <span class="font-poppins">Email</span>
                </div>
                <a :href="`mailto:${selectedContact.email}`" class="text-zoom-500 hover:text-zoom-600 font-poppins">
                  {{ selectedContact.email }}
                </a>
              </div>

              <div v-if="selectedContact.website" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center space-x-3">
                  <Icon icon="material-symbols:language" class="text-zoom-500 text-xl" />
                  <span class="font-poppins">Website</span>
                </div>
                <a :href="selectedContact.website" target="_blank" class="text-zoom-500 hover:text-zoom-600 font-poppins">
                  Visit Site
                </a>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center space-x-3">
                  <Icon icon="material-symbols:category" class="text-zoom-500 text-xl" />
                  <span class="font-poppins">Category</span>
                </div>
                <span class="text-zoom-500 font-poppins">{{ selectedContact.category }}</span>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex items-center space-x-3">
                  <Icon icon="material-symbols:schedule" class="text-zoom-500 text-xl" />
                  <span class="font-poppins">Scanned</span>
                </div>
                <span class="text-gray-600 dark:text-gray-300 font-poppins">
                  {{ formatDate(selectedContact.scannedAt) }}
                </span>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="selectedContact.notes" class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <h5 class="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center space-x-2">
                <Icon icon="material-symbols:notes" class="text-amber-500" />
                <span>Notes</span>
              </h5>
              <p class="text-amber-700 dark:text-amber-300 text-sm">{{ selectedContact.notes }}</p>
            </div>

            <!-- Website Preview -->
            <div v-if="selectedContact.website" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h5 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
                <Icon icon="material-symbols:visibility" class="text-zoom-500" />
                <span>Website Preview</span>
              </h5>
              <div class="aspect-video bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                <a 
                  :href="selectedContact.website" 
                  target="_blank"
                  class="text-center text-zoom-500 hover:text-zoom-600 transition-colors"
                >
                  <Icon icon="material-symbols:open-in-new" class="text-3xl mb-2" />
                  <p class="text-sm font-poppins">Open Website</p>
                  <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ selectedContact.website }}</p>
                </a>
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
                @click="shareContact(selectedContact)"
                class="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <Icon icon="material-symbols:share" class="text-xl" />
                <span>Share</span>
              </button>
              <button 
                @click="exportContact(selectedContact)"
                class="flex-1 btn-secondary flex items-center justify-center space-x-2"
              >
                <Icon icon="material-symbols:download" class="text-xl" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed, onMounted } from 'vue'
import { useContactsStore } from '../stores/contacts'
import { StorageEngine } from '../engines/StorageEngine'
import { ContactEngine } from '../engines/ContactEngine'

const contactsStore = useContactsStore()
const storageEngine = new StorageEngine()
const contactEngine = new ContactEngine()

const searchQuery = ref('')
const activeCategory = ref('all')
const activeSubcategory = ref('all')
const selectedContact = ref<any>(null)
const categories = ref<any[]>([])

// Alibaba-style categories
const alibabaCategories = [
  {
    id: 'technology',
    name: 'Technology',
    icon: 'material-symbols:code',
    subcategories: [
      { id: 'software', name: 'Software' },
      { id: 'hardware', name: 'Hardware' },
      { id: 'ai', name: 'AI & ML' },
      { id: 'cybersecurity', name: 'Cybersecurity' }
    ]
  },
  {
    id: 'import-export',
    name: 'Import/Export',
    icon: 'material-symbols:airplane-ticket',
    subcategories: [
      { id: 'electronics', name: 'Electronics' },
      { id: 'textiles', name: 'Textiles' },
      { id: 'agriculture', name: 'Agriculture' },
      { id: 'automotive', name: 'Automotive' }
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'material-symbols:factory',
    subcategories: [
      { id: 'machinery', name: 'Machinery' },
      { id: 'textiles', name: 'Textiles' },
      { id: 'food', name: 'Food Processing' },
      { id: 'chemicals', name: 'Chemicals' }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'material-symbols:engineering',
    subcategories: [
      { id: 'consulting', name: 'Consulting' },
      { id: 'logistics', name: 'Logistics' },
      { id: 'finance', name: 'Financial' },
      { id: 'healthcare', name: 'Healthcare' }
    ]
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: 'material-symbols:storefront',
    subcategories: [
      { id: 'ecommerce', name: 'E-commerce' },
      { id: 'wholesale', name: 'Wholesale' },
      { id: 'fashion', name: 'Fashion' },
      { id: 'electronics', name: 'Electronics' }
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
})

const activeSubcategories = computed(() => {
  if (activeCategory.value === 'all') return []
  const category = categories.value.find(cat => cat.id === activeCategory.value)
  return category?.subcategories || []
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

const hasSocialMedia = (socialMedia: any) => {
  return socialMedia && Object.values(socialMedia).some(value => value !== undefined)
}

const getSocialMediaPlatforms = (socialMedia: any) => {
  const platforms = []
  if (socialMedia.linkedin) platforms.push({ name: 'LinkedIn', url: socialMedia.linkedin, icon: 'logos:linkedin-icon', color: '#0077b5' })
  if (socialMedia.twitter) platforms.push({ name: 'Twitter', url: socialMedia.twitter, icon: 'logos:twitter', color: '#1da1f2' })
  if (socialMedia.instagram) platforms.push({ name: 'Instagram', url: socialMedia.instagram, icon: 'logos:instagram-icon', color: '#e4405f' })
  if (socialMedia.facebook) platforms.push({ name: 'Facebook', url: socialMedia.facebook, icon: 'logos:facebook', color: '#1877f2' })
  if (socialMedia.whatsapp) platforms.push({ name: 'WhatsApp', url: socialMedia.whatsapp, icon: 'logos:whatsapp-icon', color: '#25d366' })
  return platforms
}

const setActiveCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  activeSubcategory.value = 'all'
  searchQuery.value = ''
}

const setActiveSubcategory = (subcategoryId: string) => {
  activeSubcategory.value = subcategoryId
}

const handleSearch = () => {
  // Search is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const viewContact = (contact: any) => {
  selectedContact.value = contact
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

const shareContact = (contact: any) => {
  const shareText = `Contact: ${contact.name} - ${contact.position} at ${contact.company}`
  if (navigator.share) {
    navigator.share({
      title: 'Business Contact',
      text: shareText,
      url: window.location.href
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText)
    alert('Contact info copied to clipboard!')
  }
}

const exportContact = (contact: any) => {
  const vcard = contactEngine.exportToVCard(contact)
  const blob = new Blob([vcard], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${contact.name.replace(/\s+/g, '_')}.vcf`
  a.click()
  URL.revokeObjectURL(url)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>