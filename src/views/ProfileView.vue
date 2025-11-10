<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-cal text-zoom-600 dark:text-zoom-300 mb-2">My Business Card</h1>
        <p class="text-gray-600 dark:text-gray-300 font-poppins">Your digital business identity for global trade</p>
      </div>

      <!-- Profile Card -->
<div class="glass-card p-6 max-w-md mx-auto mb-8">
  <!-- Profile Image with Upload - FIXED -->
  <div class="flex justify-center mb-6 relative">
    <div class="relative group">
      <div 
        class="w-24 h-24 bg-zoom-500 rounded-2xl flex items-center justify-center text-white text-4xl cursor-pointer overflow-hidden border-2 border-zoom-300 border-dashed"
        @click="triggerImageUpload"
      >
        <img 
          v-if="profile.image && profile.image !== ''" 
          :src="profile.image" 
          class="w-full h-full object-cover"
          alt="Profile"
        >
        <div v-else class="text-center text-white/80">
          <Icon icon="material-symbols:person" class="text-3xl mb-1" />
          <p class="text-xs">Add Photo</p>
        </div>
      </div>
      
      <!-- FIXED: Proper file input binding -->
      <input 
        ref="imageInput"
        type="file" 
        accept="image/*"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="handleImageUpload"
      >
      
      <!-- Upload overlay -->
      <div class="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Icon icon="material-symbols:camera-enhance" class="text-white text-2xl" />
      </div>
      
      <!-- Remove image button -->
      <button 
        v-if="profile.image && profile.image !== ''"
        @click.stop="removeProfileImage"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        title="Remove photo"
      >
        <Icon icon="material-symbols:close" class="text-sm" />
      </button>
    </div>
  </div>

        <!-- Business Info Form -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:person" class="text-zoom-500 text-lg" />
              <span>Full Name *</span>
            </label>
            <input 
              v-model="profile.name"
              type="text" 
              placeholder="Your name"
              class="input-modern"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:work" class="text-zoom-500 text-lg" />
              <span>Position *</span>
            </label>
            <input 
              v-model="profile.position"
              type="text" 
              placeholder="CEO, Sales Manager, etc."
              class="input-modern"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:business-center" class="text-zoom-500 text-lg" />
              <span>Company *</span>
            </label>
            <input 
              v-model="profile.company"
              type="text" 
              placeholder="Your company"
              class="input-modern"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:category" class="text-zoom-500 text-lg" />
              <span>Business Category *</span>
            </label>
            <select v-model="profile.category" class="input-modern" required>
              <option value="">Select your business category</option>
              <option value="technology">Technology</option>
              <option value="import-export">Import/Export</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Professional Services</option>
              <option value="retail">Retail & Commerce</option>
              <option value="agriculture">Agriculture</option>
              <option value="construction">Construction</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="logistics">Logistics & Transport</option>
            </select>
          </div>

          <!-- ENHANCED LOCATION SECTION -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
              <Icon icon="material-symbols:location-on" class="text-zoom-500 text-lg" />
              <span>Business Location & Markets</span>
            </label>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Country -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Country</label>
                <select v-model="profile.location.country" class="input-modern">
                  <option value="">Select Country</option>
                  <optgroup label="African Countries">
                    <option v-for="country in africanCountries" :key="country" :value="country">
                      {{ country }}
                    </option>
                  </optgroup>
                  <option value="China">China (including Hong Kong SAR)</option>
                  <option value="India">India</option>
                  <option value="Russia">Russia</option>
                </select>
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">City</label>
                <input 
                  v-model="profile.location.city"
                  type="text" 
                  placeholder="Business city"
                  class="input-modern"
                >
              </div>

              <!-- Zip Code -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">ZIP/Postal Code</label>
                <input 
                  v-model="profile.location.zipCode"
                  type="text" 
                  placeholder="ZIP/Postal code"
                  class="input-modern"
                >
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Address</label>
                <input 
                  v-model="profile.location.address"
                  type="text" 
                  placeholder="Business address"
                  class="input-modern"
                >
              </div>

              <!-- Target Markets -->
              <div class="md:col-span-2">
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-2">Target Markets</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="market in targetMarkets" :key="market" class="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      :value="market" 
                      v-model="profile.targetMarkets"
                      class="rounded text-zoom-500 focus:ring-zoom-500"
                    >
                    <span class="text-sm">{{ marketLabel(market) }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:call" class="text-zoom-500 text-lg" />
              <span>Phone Number *</span>
            </label>
            <input 
              v-model="profile.phone"
              type="tel" 
              placeholder="+1234567890"
              class="input-modern"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:email" class="text-zoom-500 text-lg" />
              <span>Email *</span>
            </label>
            <input 
              v-model="profile.email"
              type="email" 
              placeholder="your@email.com"
              class="input-modern"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:language" class="text-zoom-500 text-lg" />
              <span>Website</span>
            </label>
            <input 
              v-model="profile.website"
              type="url" 
              placeholder="https://yourcompany.com"
              class="input-modern"
            >
          </div>

          <!-- ENHANCED Social Media Section with WeChat -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
              <Icon icon="material-symbols:share" class="text-zoom-500 text-lg" />
              <span>Social Media Profiles</span>
            </label>
            
            <div class="grid grid-cols-2 gap-3">
              <!-- LinkedIn -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:linkedin-icon" class="text-[#0077b5] text-xl" />
                <input 
                  v-model="profile.socialMedia.linkedin"
                  type="url" 
                  placeholder="LinkedIn URL"
                  class="input-modern text-sm"
                >
              </div>

              <!-- X -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:x" class="text-[#1da1f2] text-xl" />
                <input 
                  v-model="profile.socialMedia.twitter"
                  type="url" 
                  placeholder="X URL"
                  class="input-modern text-sm"
                >
              </div>

              <!-- Instagram -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:instagram-icon" class="text-[#e4405f] text-xl" />
                <input 
                  v-model="profile.socialMedia.instagram"
                  type="url" 
                  placeholder="Instagram URL"
                  class="input-modern text-sm"
                >
              </div>

              <!-- Facebook -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:facebook" class="text-[#1877f2] text-xl" />
                <input 
                  v-model="profile.socialMedia.facebook"
                  type="url" 
                  placeholder="Facebook URL"
                  class="input-modern text-sm"
                >
              </div>

              <!-- WhatsApp -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:whatsapp-icon" class="text-[#25d366] text-xl" />
                <input 
                  v-model="profile.socialMedia.whatsapp"
                  type="url" 
                  placeholder="WhatsApp URL"
                  class="input-modern text-sm"
                >
              </div>

              <!-- YouTube -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:youtube-icon" class="text-[#ff0000] text-xl" />
                <input 
                  v-model="profile.socialMedia.youtube"
                  type="url" 
                  placeholder="YouTube URL"
                  class="input-modern text-sm"
                >
              </div>

              <!-- WeChat -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:wechat" class="text-[#07C160] text-xl" />
                <input 
                  v-model="profile.socialMedia.wechat"
                  type="text" 
                  placeholder="WeChat ID"
                  class="input-modern text-sm"
                >
              </div>

              <!-- GitHub -->
              <div class="flex items-center space-x-2">
                <Icon icon="logos:github-icon" class="text-black dark:text-white text-xl" />
                <input 
                  v-model="profile.socialMedia.github"
                  type="url" 
                  placeholder="GitHub URL"
                  class="input-modern text-sm"
                >
              </div>
            </div>

            <!-- Social Media Preview -->
            <div v-if="hasSocialMedia" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Social Media Preview</h4>
              <div class="flex flex-wrap gap-2">
                <a 
                  v-for="platform in activeSocialMedia" 
                  :key="platform.name"
                  :href="platform.url"
                  target="_blank"
                  class="inline-flex items-center space-x-1 px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-xs border border-gray-200 dark:border-gray-500 hover:scale-105 transition-transform"
                  :title="platform.name"
                >
                  <Icon :icon="platform.icon" class="text-lg" :style="{ color: platform.color }" />
                  <span class="font-poppins">{{ platform.name }}</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Digital Flyers Section -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
              <Icon icon="material-symbols:description" class="text-zoom-500 text-lg" />
              <span>Digital Flyers (PDF, PNG, JPG)</span>
            </label>
            <div class="space-y-2">
              <div 
                v-for="(flyer, index) in profile.flyers" 
                :key="index"
                class="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl"
              >
                <div class="flex items-center space-x-3">
                  <Icon 
                    :icon="getFileIcon(flyer.name)" 
                    class="text-zoom-500 text-xl" 
                  />
                  <div>
                    <span class="text-sm font-poppins block">{{ flyer.name }}</span>
                    <span class="text-xs text-gray-500">{{ formatFileSize(flyer.size) }}</span>
                  </div>
                </div>
                <button 
                  @click="removeFlyer(index)"
                  class="text-red-500 hover:text-red-700 p-1"
                >
                  <Icon icon="material-symbols:delete" />
                </button>
              </div>
              
              <button 
                @click="triggerFlyerUpload"
                class="w-full py-3 border-2 border-dashed border-zoom-300 rounded-xl text-zoom-500 hover:bg-zoom-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon icon="material-symbols:add" class="text-lg" />
                <span>Add Flyer</span>
              </button>
              <input 
                ref="flyerInput"
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                class="hidden" 
                @change="handleFlyerUpload"
                multiple
              >
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <button 
          @click="saveProfile"
          :disabled="!isFormValid"
          class="btn-primary w-full mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon icon="material-symbols:save" class="text-xl" />
          <span>{{ isLoading ? 'Saving...' : 'Save Profile' }}</span>
        </button>
      </div>

      <!-- QR Code Preview -->
      <div v-if="isFormValid" class="glass-card p-6 max-w-md mx-auto text-center">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-center space-x-2">
          <Icon icon="material-symbols:qr-code-2" class="text-zoom-500" />
          <span>Your QR Code</span>
        </h3>
        <div class="bg-white p-4 rounded-2xl inline-block shadow-lg">
          <div class="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
            <img v-if="qrCode" :src="qrCode" alt="QR Code" class="w-full h-full object-contain" />
            <div v-else class="text-center text-gray-400">
              <Icon icon="material-symbols:qr-code-2" class="text-4xl mb-2" />
              <p class="text-xs">Complete profile to generate QR</p>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-4 font-poppins">
          Scan this code to share your business card
        </p>
        
        <!-- Enhanced QR Preview with Location & Markets -->
        <div v-if="hasSocialMedia || profile.location.country || profile.targetMarkets.length > 0" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-center space-x-2">
            <Icon icon="material-symbols:qr-code-2" class="text-zoom-500" />
            <span>QR Code Includes</span>
          </h4>
          <div class="flex justify-center flex-wrap gap-2">
            <div 
              v-for="platform in activeSocialMedia" 
              :key="platform.name"
              class="flex items-center space-x-1 px-2 py-1 bg-white dark:bg-gray-600 rounded-lg text-xs"
            >
              <Icon :icon="platform.icon" class="text-sm" :style="{ color: platform.color }" />
              <span class="font-poppins">{{ platform.name }}</span>
            </div>
            <div 
              v-if="profile.location.country"
              class="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded-lg text-xs"
            >
              <Icon icon="material-symbols:location-on" class="text-sm text-green-600 dark:text-green-400" />
              <span class="font-poppins">{{ profile.location.country }}</span>
            </div>
            <div 
              v-for="market in profile.targetMarkets"
              :key="market"
              class="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded-lg text-xs"
            >
              <Icon icon="material-symbols:public" class="text-sm text-blue-600 dark:text-blue-400" />
              <span class="font-poppins capitalize">{{ market }}</span>
            </div>
          </div>
        </div>
        
        <!-- Website Preview -->
        <button 
          v-if="profile.website"
          @click="showWebsitePreview = true"
          class="btn-secondary mt-4 flex items-center justify-center space-x-2 mx-auto"
        >
          <Icon icon="material-symbols:visibility" class="text-xl" />
          <span>Preview Website</span>
        </button>
      </div>
    </div>

    <!-- Website Preview Modal -->
    <div 
      v-if="showWebsitePreview"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showWebsitePreview = false"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold font-poppins">Website Preview: {{ profile.website }}</h3>
          <button 
            @click="showWebsitePreview = false"
            class="text-gray-500 hover:text-gray-700 p-1"
          >
            <Icon icon="material-symbols:close" class="text-xl" />
          </button>
        </div>
        <div class="p-4 h-96">
          <iframe 
            :src="profile.website" 
            class="w-full h-full rounded-lg border border-gray-200 dark:border-gray-600"
            frameborder="0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, onMounted, computed, nextTick } from 'vue' // ✅ ADD nextTick
import { useProfileStore } from '../stores/profile'
import { QREngine } from '../engines/QREngine'

const profileStore = useProfileStore()
const qrEngine = new QREngine()

const imageInput = ref<HTMLInputElement>()
const flyerInput = ref<HTMLInputElement>()
const showWebsitePreview = ref(false)
const qrCode = ref('')
const isLoading = ref(false)

// ✅ UPDATED PROFILE STRUCTURE WITH BETTER IMAGE HANDLING
const profile = ref({
  name: '',
  position: '',
  company: '',
  category: '',
  phone: '',
  email: '',
  website: '',
  image: '' as string, // ✅ CHANGED TO STRING ONLY
  flyers: [] as Array<{ name: string; file: File; size: number; type: string }>,
  socialMedia: {
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    youtube: '',
    wechat: '',
    github: ''
  },
  location: {
    country: '',
    city: '',
    zipCode: '',
    address: '',
    marketFocus: [] as ('africa' | 'china' | 'india' | 'russia')[]
  },
  targetMarkets: ['africa'] as ('africa' | 'china' | 'india' | 'russia')[]
})

// ✅ FIXED: PROPER IMAGE UPLOAD HANDLING
const triggerImageUpload = () => {
  console.log('📸 Triggering image upload...')
  // Ensure the input element is available
  if (imageInput.value) {
    imageInput.value.click()
  } else {
    console.error('❌ Image input element not found')
    // Try to find it again
    nextTick(() => {
      if (imageInput.value) {
        imageInput.value.click()
      } else {
        alert('Image upload not available. Please refresh the page.')
      }
    })
  }
}

const handleImageUpload = async (event: Event) => {
  console.log('🖼️ Handling image upload...')
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) {
    console.log('❌ No file selected')
    return
  }

  console.log('📁 File selected:', file.name, file.type, file.size)

  // Validate image file
  if (!file.type.startsWith('image/')) {
    alert('❌ Please select an image file (JPG, PNG, GIF, etc.)')
    resetFileInput()
    return
  }
  
  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('❌ Image size should be less than 5MB')
    resetFileInput()
    return
  }

  try {
    // Create a promise for file reading
    const imageDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        console.log('✅ Image loaded successfully')
        resolve(e.target?.result as string)
      }
      
      reader.onerror = () => {
        console.error('❌ Error reading file')
        reject(new Error('Failed to read image file'))
      }
      
      reader.readAsDataURL(file)
    })

    // Update profile image
    profile.value.image = imageDataUrl
    console.log('✅ Profile image updated')
    
    // Reset the file input to allow selecting the same file again
    resetFileInput()
    
  } catch (error) {
    console.error('❌ Error processing image:', error)
    alert('❌ Error processing image. Please try again.')
    resetFileInput()
  }
}

// ✅ NEW: REMOVE PROFILE IMAGE
const removeProfileImage = () => {
  if (confirm('Are you sure you want to remove your profile image?')) {
    profile.value.image = ''
    console.log('✅ Profile image removed')
  }
}

// ✅ NEW: RESET FILE INPUT
const resetFileInput = () => {
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// ✅ FIXED: LOAD SAVED PROFILE WITH BETTER IMAGE HANDLING
onMounted(async () => {
  console.log('🚀 Initializing profile...')
  await profileStore.initialize()
  
  if (profileStore.currentProfile) {
    const saved = profileStore.currentProfile
    console.log('📥 Loading saved profile:', saved)
    
    profile.value = { 
      ...profile.value, 
      ...saved,
      // Ensure image is properly handled
      image: saved.image || '',
      // Convert flyers to the format we need
      flyers: (saved.flyers || []).map((f: any) => ({
        name: f.name,
        file: f.file,
        size: f.size || 0,
        type: f.type || 'application/octet-stream'
      })),
      // Ensure social media object exists with WeChat
      socialMedia: saved.socialMedia || {
        linkedin: '',
        twitter: '',
        instagram: '',
        facebook: '',
        whatsapp: '',
        youtube: '',
        wechat: '',
        github: ''
      },
      // Ensure location exists
      location: saved.location || {
        country: '',
        city: '',
        zipCode: '',
        address: '',
        marketFocus: []
      },
      // Ensure target markets exist
      targetMarkets: saved.targetMarkets || ['africa']
    }
    
    console.log('✅ Profile loaded successfully')
    console.log('🖼️ Profile image status:', profile.value.image ? 'Has image' : 'No image')
    
    generateQRCode()
  }
})

// Rest of your methods remain the same...
const triggerFlyerUpload = () => {
  flyerInput.value?.click()
}

const handleFlyerUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  files.forEach(file => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      alert(`❌ File type not supported: ${file.name}. Please use PDF, JPG, or PNG files.`)
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`❌ File too large: ${file.name}. Maximum size is 10MB.`)
      return
    }

    profile.value.flyers.push({
      name: file.name,
      file: file,
      size: file.size,
      type: file.type
    })
  })
  
  // Reset input
  if (flyerInput.value) {
    flyerInput.value.value = ''
  }
}

const removeFlyer = (index: number) => {
  profile.value.flyers.splice(index, 1)
}

const getFileIcon = (filename: string) => {
  if (filename.toLowerCase().endsWith('.pdf')) return 'material-symbols:description'
  if (filename.toLowerCase().match(/\.(jpg|jpeg|png)$/)) return 'material-symbols:image'
  return 'material-symbols:description'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const saveProfile = async () => {
  if (!isFormValid.value) {
    alert('❌ Please fill in all required fields (marked with *)')
    return
  }

  isLoading.value = true

  try {
    console.log('💾 Saving profile with image:', profile.value.image ? 'Yes' : 'No')
    await profileStore.saveProfile(profile.value)
    await generateQRCode()
    
    alert('✅ Profile saved successfully! Your QR code is ready.')
  } catch (error) {
    console.error('❌ Error saving profile:', error)
    alert('❌ Error saving profile. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const generateQRCode = async () => {
  if (!isFormValid.value) return

  try {
    // Use the QREngine to generate QR code with enhanced data
    const qrData = {
      name: profile.value.name,
      position: profile.value.position,
      company: profile.value.company,
      email: profile.value.email,
      phone: profile.value.phone,
      website: profile.value.website,
      category: profile.value.category,
      socialMedia: profile.value.socialMedia,
      location: profile.value.location,
      targetMarkets: profile.value.targetMarkets
      // Note: We don't include the image in QR code to keep it small
    }
    
    qrCode.value = await qrEngine.generateQR(JSON.stringify(qrData))
  } catch (error) {
    console.error('❌ Error generating QR code:', error)
    // Fallback to simple QR code
    qrCode.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profile.value.name + ' - ' + profile.value.company)}`
  }
}

// Your computed properties remain the same...
const isFormValid = computed(() => {
  return profile.value.name && 
         profile.value.position && 
         profile.value.company && 
         profile.value.category && 
         profile.value.phone && 
         profile.value.email
})

const hasSocialMedia = computed(() => {
  return Object.values(profile.value.socialMedia).some(url => url && url.trim() !== '')
})

const activeSocialMedia = computed(() => {
  const platforms = [
    { name: 'LinkedIn', url: profile.value.socialMedia.linkedin, icon: 'logos:linkedin-icon', color: '#0077b5' },
    { name: 'X', url: profile.value.socialMedia.twitter, icon: 'logos:x', color: '#000000' },
    { name: 'Instagram', url: profile.value.socialMedia.instagram, icon: 'logos:instagram-icon', color: '#e4405f' },
    { name: 'Facebook', url: profile.value.socialMedia.facebook, icon: 'logos:facebook', color: '#1877f2' },
    { name: 'WhatsApp', url: profile.value.socialMedia.whatsapp, icon: 'logos:whatsapp-icon', color: '#25d366' },
    { name: 'YouTube', url: profile.value.socialMedia.youtube, icon: 'logos:youtube-icon', color: '#ff0000' },
    { name: 'WeChat', url: profile.value.socialMedia.wechat, icon: 'logos:wechat', color: '#07C160' },
    { name: 'GitHub', url: profile.value.socialMedia.github, icon: 'logos:github-icon', color: '#000000' }
  ]
  return platforms.filter(platform => platform.url && platform.url.trim() !== '')
})

const africanCountries = computed(() => profileStore.getAfricanCountries())
const targetMarkets = computed(() => profileStore.getTargetMarkets())
const marketLabel = (market: 'africa' | 'china' | 'india' | 'russia') => profileStore.getMarketLabel(market)
</script>