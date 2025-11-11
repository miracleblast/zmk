<template>
  <div class="min-h-screen pb-20">
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-cal text-zoom-600 dark:text-zoom-400 mb-2">Business Card Scanner</h1>
        <p class="text-gray-600 dark:text-gray-300 font-poppins">
          Point camera at QR code to scan
        </p>
      </div>

      <!-- Scanner Container -->
      <div class="glass-card p-4 mb-6">
        <!-- Camera Preview -->
        <div class="relative rounded-2xl overflow-hidden bg-black mb-4">
          <!-- Placeholder when camera is inactive -->
          <div v-show="!isCameraActive" class="w-full h-96 flex items-center justify-center bg-gray-800">
            <div class="text-center p-8">
              <Icon icon="material-symbols:qr-code-scanner" class="text-6xl text-gray-400 mb-4" />
              <p class="text-gray-400 font-poppins mb-4">Camera ready to scan</p>
              <button 
                @click="initializeCamera" 
                :disabled="isLoading"
                class="btn-primary disabled:opacity-50 text-lg py-4 px-8"
              >
                <Icon icon="material-symbols:play-arrow" class="text-2xl mr-3" />
                {{ isLoading ? 'Starting Camera...' : 'Start Scanner' }}
              </button>
            </div>
          </div>

          <!-- VIDEO ELEMENT -->
          <video 
            v-show="isCameraActive"
            ref="videoElement"
            class="w-full h-96 object-cover"
            playsinline
            webkit-playsinline
            muted
          ></video>
          
          <!-- Scanner Overlay -->
          <div v-if="isCameraActive" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="border-4 border-zoom-500 rounded-3xl w-80 h-80 relative shadow-2xl shadow-zoom-500/25">
              <!-- Corner decorations -->
              <div class="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-zoom-500 rounded-tl-lg"></div>
              <div class="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-zoom-500 rounded-tr-lg"></div>
              <div class="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-zoom-500 rounded-bl-lg"></div>
              <div class="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-zoom-500 rounded-br-lg"></div>
              
              <!-- Scanning Animation -->
              <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-zoom-500 to-transparent animate-pulse"></div>
            </div>
          </div>

          <!-- Camera Controls Overlay -->
          <div v-if="isCameraActive" class="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <!-- Manual Capture Button -->
            <button 
              @click="manualCapture"
              class="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-lg transition-all"
              title="Manual Capture"
            >
              <Icon icon="material-symbols:photo-camera" class="text-2xl" />
            </button>
            
            <!-- Flash Toggle -->
            <button 
              @click="toggleFlash"
              class="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-lg transition-all"
              :title="flashOn ? 'Flash On' : 'Flash Off'"
            >
              <Icon :icon="flashOn ? 'material-symbols:flash-on' : 'material-symbols:flash-off'" class="text-2xl" />
            </button>
            
            <!-- Switch Camera -->
            <button 
              @click="switchCamera"
              class="bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-lg transition-all"
              :title="usingFrontCamera ? 'Switch to Back Camera' : 'Switch to Front Camera'"
            >
              <Icon icon="material-symbols:flip-camera-ios" class="text-2xl" />
            </button>
          </div>
        </div>

        <!-- Scanner Status -->
        <div v-if="isCameraActive" class="text-center mb-4">
          <div class="flex items-center justify-center space-x-3 text-zoom-600 mb-2">
            <div class="w-3 h-3 bg-zoom-600 rounded-full animate-bounce"></div>
            <div class="w-3 h-3 bg-zoom-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-3 h-3 bg-zoom-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <span class="text-lg font-semibold font-poppins">Scanning for QR Codes...</span>
          </div>
          <p class="text-sm text-gray-500">Point at QR code or use Manual Capture</p>
          
          <!-- Manual Capture Hint -->
          <div v-if="showManualHint" class="mt-2 p-3 bg-amber-100 border border-amber-400 rounded-lg">
            <p class="text-amber-800 text-sm flex items-center justify-center space-x-2">
              <Icon icon="material-symbols:info" class="text-amber-600" />
              <span>Auto-scan not working? Try <strong>Manual Capture</strong> button below!</span>
            </p>
          </div>
        </div>

        <!-- Manual Capture Controls -->
        <div v-if="isCameraActive" class="flex justify-center space-x-4">
          <button 
            @click="manualCapture"
            class="bg-zoom-500 hover:bg-zoom-600 text-white py-4 px-8 rounded-2xl transition-all duration-300 flex items-center space-x-3 text-lg shadow-lg"
          >
            <Icon icon="material-symbols:photo-camera" class="text-2xl" />
            <span>Manual Capture</span>
          </button>
          
          <button 
            @click="stopScanner"
            class="bg-red-500 hover:bg-red-600 text-white py-4 px-8 rounded-2xl transition-all duration-300 flex items-center space-x-3 text-lg shadow-lg"
          >
            <Icon icon="material-symbols:stop" class="text-2xl" />
            <span>Stop Scanner</span>
          </button>
        </div>
      </div>

      <!-- ENHANCED Scan Result with ContactEngine -->
      <div v-if="enhancedContact" class="glass-card p-6 mb-6 animate-slide-up">
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-3">
          <Icon icon="material-symbols:check-circle" class="text-green-500 text-2xl" />
          <span>Contact Scanned Successfully!</span>
        </h3>
        
        <!-- Enhanced Contact Preview -->
        <div class="bg-white/50 dark:bg-gray-700/50 rounded-2xl p-6 mb-4">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-16 h-16 bg-zoom-500 rounded-2xl flex items-center justify-center text-white text-2xl">
              <Icon icon="material-symbols:person" />
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-800 dark:text-white">
                {{ enhancedContact.name }}
              </h4>
              <p class="text-zoom-500">{{ enhancedContact.position }}</p>
              <p class="text-gray-600 dark:text-gray-300">{{ enhancedContact.company }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="enhancedContact.email" class="flex items-center space-x-2">
              <Icon icon="material-symbols:email" class="text-zoom-500" />
              <span class="text-gray-600 dark:text-gray-300">Email:</span>
              <span class="font-medium">{{ enhancedContact.email }}</span>
            </div>
            <div v-if="enhancedContact.phone" class="flex items-center space-x-2">
              <Icon icon="material-symbols:call" class="text-zoom-500" />
              <span class="text-gray-600 dark:text-gray-300">Phone:</span>
              <span class="font-medium">{{ enhancedContact.phone }}</span>
            </div>
            <div v-if="enhancedContact.website" class="flex items-center space-x-2">
              <Icon icon="material-symbols:language" class="text-zoom-500" />
              <span class="text-gray-600 dark:text-gray-300">Website:</span>
              <span class="font-medium truncate">{{ enhancedContact.website }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon icon="material-symbols:category" class="text-zoom-500" />
              <span class="text-gray-600 dark:text-gray-300">Category:</span>
              <span class="font-medium">{{ enhancedContact.category }}</span>
            </div>
          </div>

          <!-- Social Media Preview -->
          <div v-if="enhancedContact.socialMedia && hasSocialMedia(enhancedContact.socialMedia)" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <h5 class="font-medium text-gray-800 dark:text-white mb-2">Social Media:</h5>
            <div class="flex flex-wrap gap-2">
              <a 
                v-for="platform in getSocialMediaPlatforms(enhancedContact.socialMedia)"
                :key="platform.name"
                :href="platform.url"
                target="_blank"
                class="inline-flex items-center space-x-1 px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-xs border border-gray-200 dark:border-gray-500 hover:scale-105 transition-transform"
                :title="platform.name"
              >
                <Icon :icon="platform.icon" class="text-sm" :style="{ color: platform.color }" />
                <span>{{ platform.name }}</span>
              </a>
            </div>
          </div>

          <!-- Contact Score -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-300">Contact Score:</span>
              <span class="font-semibold text-zoom-500">
                {{ contactEngine.calculateContactScore(enhancedContact) }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
              <div 
                class="bg-zoom-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${contactEngine.calculateContactScore(enhancedContact)}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button @click="saveContact" class="flex-1 btn-primary text-lg py-4">
            <Icon icon="material-symbols:save" class="text-xl mr-2" />
            Save to Contacts
          </button>
          <button @click="clearResult" class="flex-1 btn-secondary text-lg py-4">
            <Icon icon="material-symbols:refresh" class="text-xl mr-2" />
            Scan Another
          </button>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="debugMode" class="glass-card p-4 text-center text-sm text-gray-500">
        <p>Camera: {{ usingFrontCamera ? 'Front' : 'Back' }}</p>
        <p>Scanning: {{ isCameraActive ? 'Active' : 'Inactive' }}</p>
        <p>Auto-scan attempts: {{ scanAttempts }}</p>
        <p v-if="enhancedContact">Contact Type: {{ enhancedContact.tags?.join(', ') }}</p>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { ScannerEngine } from '../engines/ScannerEngine'
import { ContactEngine } from '../engines/ContactEngine'
import { useContactsStore } from '../stores/contacts'

const contactsStore = useContactsStore()
const scannerEngine = new ScannerEngine()
const contactEngine = new ContactEngine() // ✅ INITIALIZE CONTACT ENGINE

const videoElement = ref<HTMLVideoElement | null>(null)
const isCameraActive = ref(false)
const isLoading = ref(false)
const scanResult = ref<string | null>(null)
const enhancedContact = ref<any>(null) // ✅ ADD ENHANCED CONTACT REF
const flashOn = ref(false)
const usingFrontCamera = ref(false)
const showManualHint = ref(false)
const scanAttempts = ref(0)
const debugMode = ref(true) // Set to false in production

// Show manual hint after 5 seconds if no QR found
let manualHintTimeout: number | null = null

onMounted(() => {
  console.log('📱 Scanner mounted')
})

onUnmounted(() => {
  if (manualHintTimeout) clearTimeout(manualHintTimeout)
  stopScanner()
})

// ✅ ENHANCED SCAN HANDLER WITH PROFILE PICTURE SUPPORT
const handleScanResult = (qrData: string) => {
  console.log('📱 Raw QR data:', qrData)
  
  try {
    // ✅ USE ContactEngine TO PARSE AND ENHANCE THE CONTACT
    const contact = contactEngine.parseAndEnhanceContact(qrData)
    console.log('🎯 Enhanced contact:', contact)
    console.log('🖼️ Profile picture available:', contact.image ? 'Yes' : 'No')
    
    scanResult.value = qrData
    enhancedContact.value = contact
    
    if (manualHintTimeout) clearTimeout(manualHintTimeout)
    
  } catch (error) {
    console.error('❌ Contact parsing failed:', error)
    // Fallback to basic parsing
    scanResult.value = qrData
    enhancedContact.value = parseScannedData(qrData)
  }
}

const initializeCamera = async () => {
  console.log('🎬 Starting camera...')
  
  await nextTick()
  
  if (!videoElement.value) {
    await new Promise(resolve => setTimeout(resolve, 200))
    await nextTick()
    
    if (!videoElement.value) {
      alert('Camera element not ready. Please refresh and try again.')
      return
    }
  }

  isLoading.value = true
  scanAttempts.value = 0

  try {
    const success = await scannerEngine.initializeScanner(videoElement.value, usingFrontCamera.value)
    
    if (success) {
      isCameraActive.value = true
      console.log('✅ Camera started - Auto-scanning active')
      
      // ✅ START AUTO SCANNING WITH ContactEngine
      scannerEngine.startContinuousScanning(handleScanResult)
      
      // Show manual hint after 8 seconds if no QR found
      manualHintTimeout = window.setTimeout(() => {
        showManualHint.value = true
      }, 8000)
      
    } else {
      alert('Camera failed to start. Please check permissions.')
    }
  } catch (error) {
    console.error('❌ Scanner error:', error)
    alert('Scanner error: ' + (error as Error).message)
  } finally {
    isLoading.value = false
  }
}

const manualCapture = async () => {
  if (!isCameraActive.value) return
  
  console.log('📸 Manual capture triggered')
  scanAttempts.value++
  
  try {
    const result = await scannerEngine.manualCapture()
    
    if (result) {
      console.log('✅ MANUAL CAPTURE: QR Code Found!', result)
      // ✅ USE ContactEngine FOR MANUAL CAPTURE TOO
      handleScanResult(result)
    } else {
      console.log('❌ Manual capture: No QR code found')
    }
  } catch (error) {
    console.error('❌ Manual capture error:', error)
  }
}

const switchCamera = async () => {
  if (!videoElement.value) return
  
  console.log('📸 Switching camera...')
  usingFrontCamera.value = !usingFrontCamera.value
  
  try {
    const success = await scannerEngine.switchCamera(videoElement.value)
    
    if (success) {
      console.log('✅ Camera switched to:', usingFrontCamera.value ? 'front' : 'back')
      // ✅ RESTART SCANNING WITH ContactEngine
      scannerEngine.startContinuousScanning(handleScanResult)
    } else {
      alert('Failed to switch camera')
    }
  } catch (error) {
    console.error('❌ Camera switch error:', error)
  }
}

const stopScanner = () => {
  console.log('🛑 Stopping scanner')
  scannerEngine.stopScanner()
  isCameraActive.value = false
  scanResult.value = null
  enhancedContact.value = null // ✅ CLEAR ENHANCED CONTACT
  flashOn.value = false
  showManualHint.value = false
  if (manualHintTimeout) clearTimeout(manualHintTimeout)
}

const toggleFlash = () => {
  flashOn.value = !flashOn.value
  console.log('🔦 Flash:', flashOn.value ? 'ON' : 'OFF')
}

// ✅ UPDATED SAVE CONTACT WITH ENHANCED DATA
const saveContact = async () => {
  if (enhancedContact.value) {
    try {
      console.log('💾 Attempting to save contact:', enhancedContact.value);
      
      // ✅ CREATE A CLEAN COPY WITHOUT ANY POTENTIAL NON-SERIALIZABLE DATA
      const contactToSave = {
        ...enhancedContact.value,
        scannedAt: new Date(), // Ensure it's a fresh date object
        socialMedia: enhancedContact.value.socialMedia ? { ...enhancedContact.value.socialMedia } : undefined
      };
      
      await contactsStore.addContact(contactToSave);
      console.log('✅ Contact saved successfully!');
      alert('✅ Contact saved successfully!');
      clearResult();
      
    } catch (error) {
      console.error('❌ Error saving contact:', error);
      
      // ✅ MORE SPECIFIC ERROR HANDLING
      if (error instanceof Error) {
        if (error.message.includes('clone')) {
          alert('❌ Data format error. Please try scanning again.');
        } else {
          alert('❌ Error saving contact: ' + error.message);
        }
      } else {
        alert('❌ Unknown error saving contact');
      }
    }
  }
}

const clearResult = () => {
  scanResult.value = null
  enhancedContact.value = null // ✅ CLEAR ENHANCED CONTACT
  showManualHint.value = false
  initializeCamera()
}

// ✅ SOCIAL MEDIA HELPER FUNCTIONS
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

// Keep old parsing as fallback
const parseScannedData = (data: string) => {
  if (data.startsWith('BEGIN:VCARD')) {
    return parseVCard(data)
  }
  
  if (data.includes('|')) {
    const parts = data.split('|')
    return {
      name: parts[0]?.trim() || 'Unknown Contact',
      position: parts[1]?.trim() || '',
      company: parts[2]?.trim() || '',
      email: parts[3]?.trim() || '',
      phone: parts[4]?.trim() || '',
      website: parts[5]?.trim() || '',
      category: 'Scanned',
      scannedAt: new Date().toISOString(),
      tags: ['qr-scanned']
    }
  }
  
  return {
    name: 'Scanned Contact',
    notes: data,
    category: 'Scanned',
    scannedAt: new Date().toISOString(),
    tags: ['qr-scanned', 'text']
  }
}

const parseVCard = (vcardData: string) => {
  const lines = vcardData.split('\n')
  const contact: any = {
    name: '',
    position: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    category: 'Scanned',
    scannedAt: new Date().toISOString(),
    tags: ['qr-scanned', 'vcard']
  }
  
  lines.forEach(line => {
    if (line.startsWith('FN:')) contact.name = line.substring(3).trim()
    else if (line.startsWith('ORG:')) contact.company = line.substring(4).trim()
    else if (line.startsWith('TEL:')) contact.phone = line.substring(4).trim()
    else if (line.startsWith('EMAIL:')) contact.email = line.substring(6).trim()
    else if (line.startsWith('TITLE:')) contact.position = line.substring(6).trim()
    else if (line.startsWith('URL:')) contact.website = line.substring(4).trim()
  })
  
  return contact
}
</script>

<style scoped>
/* Clean CSS without any Vue template syntax */
.scanner-overlay {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
}

/* Smooth transitions */
video {
  transition: all 0.3s ease-in-out;
}

/* Pulse animation for scanning */
@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(400%); }
}

.scan-line {
  animation: scan-line 2s ease-in-out infinite;
}
.scanner-overlay {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
}

video {
  transition: all 0.3s ease-in-out;
}

@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(400%); }
}

.scan-line {
  animation: scan-line 2s ease-in-out infinite;
}
</style>