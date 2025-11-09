<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-cal text-zoom-600 dark:text-zoom-300 mb-2">Settings</h1>
        <p class="text-gray-600 dark:text-gray-300 font-poppins">Customize your Zoomka experience</p>
      </div>

      <!-- Settings Cards -->
      <div class="max-w-md mx-auto space-y-4">
        <!-- Language Settings -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Icon icon="material-symbols:translate" class="text-zoom-500" />
            <span>{{ $t('language') }}</span>
          </h3>
          <div class="space-y-3">
            <button 
              v-for="lang in languages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              class="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 border-2"
              :class="currentLanguage === lang.code 
                ? 'bg-zoom-500 text-white border-zoom-500 shadow-lg shadow-zoom-500/25' 
                : 'bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white border-gray-200 dark:border-gray-600 hover:border-zoom-300'"
            >
              <div class="flex items-center space-x-3">
                <Icon :icon="lang.flag" class="text-2xl" />
                <div class="text-left">
                  <div class="font-semibold font-poppins">{{ lang.name }}</div>
                  <div class="text-sm opacity-80">{{ lang.nativeName }}</div>
                </div>
              </div>
              <Icon 
                v-if="currentLanguage === lang.code"
                icon="material-symbols:check-circle" 
                class="text-xl" 
              />
            </button>
          </div>
        </div>

        <!-- Appearance -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Icon icon="material-symbols:palette" class="text-zoom-500" />
            <span>{{ $t('appearance') }}</span>
          </h3>
          <div class="space-y-3">
            <button 
              @click="toggleDarkMode"
              class="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300"
              :class="isDarkMode 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' 
                : 'bg-zoom-500 text-white shadow-lg shadow-zoom-500/25'"
            >
              <span class="flex items-center space-x-3">
                <Icon :icon="isDarkMode ? 'material-symbols:dark-mode' : 'material-symbols:light-mode'" class="text-xl" />
                <span class="font-poppins">{{ isDarkMode ? $t('darkMode') : $t('lightMode') }}</span>
              </span>
              <div class="flex items-center space-x-2">
                <Icon :icon="isDarkMode ? 'material-symbols:night-sight-auto' : 'material-symbols:sunny'" class="text-lg" />
                <Icon v-if="!isDarkMode" icon="material-symbols:check-circle" />
              </div>
            </button>
          </div>
        </div>

        <!-- Notifications -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Icon icon="material-symbols:notifications" class="text-zoom-500" />
            <span>{{ $t('notifications') }}</span>
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon icon="material-symbols:vibration" class="text-zoom-500 text-xl" />
                <div>
                  <div class="font-poppins font-medium">{{ $t('vibration') }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('vibrationDesc') }}</div>
                </div>
              </div>
              <button 
                @click="toggleVibration"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.vibration ? 'bg-zoom-500' : 'bg-gray-300 dark:bg-gray-600'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.vibration ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon icon="material-symbols:volume-up" class="text-zoom-500 text-xl" />
                <div>
                  <div class="font-poppins font-medium">{{ $t('sounds') }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('soundsDesc') }}</div>
                </div>
              </div>
              <button 
                @click="toggleSound"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.sound ? 'bg-zoom-500' : 'bg-gray-300 dark:bg-gray-600'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.sound ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon icon="material-symbols:auto-awesome" class="text-zoom-500 text-xl" />
                <div>
                  <div class="font-poppins font-medium">{{ $t('autoSave') }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('autoSaveDesc') }}</div>
                </div>
              </div>
              <button 
                @click="toggleAutoSave"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.autoSave ? 'bg-zoom-500' : 'bg-gray-300 dark:bg-gray-600'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.autoSave ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Storage Management -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Icon icon="material-symbols:database" class="text-zoom-500" />
            <span>{{ $t('storage') }}</span>
          </h3>
          <div class="space-y-3">
            <!-- Storage Stats -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-300">{{ $t('contacts') }}</span>
                <span class="text-zoom-500 font-semibold">{{ contactsCount }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-300">{{ $t('profiles') }}</span>
                <span class="text-zoom-500 font-semibold">{{ profilesCount }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-300">{{ $t('flyers') }}</span>
                <span class="text-zoom-500 font-semibold">{{ flyersCount }}</span>
              </div>
              <div class="flex justify-between text-sm border-t border-gray-200 dark:border-gray-600 pt-2">
                <span class="text-gray-600 dark:text-gray-300 font-semibold">{{ $t('totalUsage') }}</span>
                <span class="text-zoom-500 font-semibold">{{ totalUsage }}</span>
              </div>
            </div>

            <!-- Storage Actions -->
            <div class="flex space-x-2 pt-2">
              <button 
                @click="exportData"
                class="flex-1 btn-secondary flex items-center justify-center space-x-2 py-2"
              >
                <Icon icon="material-symbols:download" class="text-lg" />
                <span class="text-sm">{{ $t('exportData') }}</span>
              </button>
              <button 
                @click="clearData"
                class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Icon icon="material-symbols:delete" class="text-lg" />
                <span class="text-sm">{{ $t('clearData') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- App Information -->
        <div class="glass-card p-6 text-center">
          <Icon icon="logos:rocket-icon" class="text-4xl text-zoom-500 mb-4" />
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2 font-cal">Zoomka</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 font-poppins mb-1">made with Hope from Tchad by Harambee.</p>
          <p class="text-sm text-gray-600 dark:text-gray-300 font-poppins mb-1">Version 1.0.0</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 font-poppins">
            {{ $t('appDescription') }}
          </p>
          
          <!-- Social Links -->
          <div class="flex justify-center space-x-4 mb-4">
            <button class="text-gray-500 hover:text-zoom-500 transition-colors">
              <Icon icon="logos:telegram" class="text-xl" />
            </button>
            <button class="text-gray-500 hover:text-zoom-500 transition-colors">
              <Icon icon="logos:instagram-icon" class="text-xl" />
            </button>
            <button class="text-gray-500 hover:text-zoom-500 transition-colors">
              <Icon icon="logos:github-icon" class="text-xl" />
            </button>
            <button class="text-gray-500 hover:text-zoom-500 transition-colors">
              <Icon icon="simple-icons:xmpp" class="text-xl" />
            </button>
            <button class="text-gray-500 hover:text-zoom-500 transition-colors">
              <Icon icon="simple-icons:session" class="text-xl" />
            </button>
          </div>

          <!-- App Actions -->
          <div class="space-y-2">
            <button class="w-full btn-secondary flex items-center justify-center space-x-2 py-2">
              <Icon icon="material-symbols:rate-review" class="text-lg" />
              <span class="text-sm">{{ $t('rateApp') }}</span>
            </button>
            <button class="w-full btn-secondary flex items-center justify-center space-x-2 py-2">
              <Icon icon="material-symbols:share" class="text-lg" />
              <span class="text-sm">{{ $t('shareApp') }}</span>
            </button>
            <button class="w-full btn-secondary flex items-center justify-center space-x-2 py-2">
              <Icon icon="material-symbols:help" class="text-lg" />
              <span class="text-sm">{{ $t('helpSupport') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useContactsStore } from '../stores/contacts'
import { useProfileStore } from '../stores/profile'
import { StorageEngine } from '../engines/StorageEngine'

const appStore = useAppStore()
const contactsStore = useContactsStore()
const profileStore = useProfileStore()
const storageEngine = new StorageEngine()

const settings = ref({
  vibration: true,
  sound: true,
  autoSave: true
})

// UPDATED GLOBAL SOUTH LANGUAGES 
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'circle-flags:uk' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: 'circle-flags:tz' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'circle-flags:eg' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文', flag: 'circle-flags:cn' },
  { code: 'yue', name: 'Chinese (Cantonese)', nativeName: '廣東話', flag: 'circle-flags:hk' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: 'circle-flags:in' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'circle-flags:ru' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: 'circle-flags:ng' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: 'circle-flags:ng' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: 'circle-flags:ng' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: 'circle-flags:za' }
]

const isDarkMode = computed(() => appStore.isDarkMode)
const currentLanguage = computed(() => appStore.language)

const contactsCount = computed(() => contactsStore.contacts.length)
const profilesCount = computed(() => profileStore.currentProfile ? 1 : 0)
const flyersCount = computed(() => profileStore.currentProfile?.flyers?.length || 0)
const totalUsage = computed(() => {
  const contactsSize = contactsCount.value * 2 // ~2KB per contact
  const profilesSize = profilesCount.value * 5 // ~5KB per profile
  const flyersSize = flyersCount.value * 100 // ~100KB per flyer
  const totalKB = contactsSize + profilesSize + flyersSize
  return totalKB > 1024 ? `${(totalKB / 1024).toFixed(1)} MB` : `${totalKB} KB`
})

onMounted(async () => {
  // Load settings
  const savedSettings = await storageEngine.getSettings()
  settings.value = { ...settings.value, ...savedSettings }
})

const toggleDarkMode = () => {
  appStore.toggleDarkMode()
}

const changeLanguage = (langCode: string) => {
  appStore.setLanguage(langCode)
  // In a real app, you'd update the i18n locale here
  alert(`Language changed to ${languages.find(l => l.code === langCode)?.name}`)
}

const toggleVibration = () => {
  settings.value.vibration = !settings.value.vibration
  saveSettings()
}

const toggleSound = () => {
  settings.value.sound = !settings.value.sound
  saveSettings()
}

const toggleAutoSave = () => {
  settings.value.autoSave = !settings.value.autoSave
  saveSettings()
}

const saveSettings = async () => {
  await storageEngine.saveSettings(settings.value)
}

const exportData = () => {
  const data = {
    contacts: contactsStore.contacts,
    profile: profileStore.currentProfile,
    settings: settings.value,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `zoomka-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  alert('Data exported successfully!')
}

const clearData = () => {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    // Clear all data from stores and storage
    contactsStore.setContacts([])
    profileStore.setProfile(null)
    
    // Clear IndexedDB
    indexedDB.deleteDatabase('ZoomkaDB')
    
    alert('All data cleared successfully!')
    // Reload the app
    window.location.reload()
  }
}

// Temporary i18n function until we set up proper i18n
const $t = (key: string) => {
  const translations: { [key: string]: { [key: string]: string } } = {
    en: {
      language: 'Language',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      notifications: 'Notifications',
      vibration: 'Vibration',
      vibrationDesc: 'Vibrate on scan success',
      sounds: 'Sounds',
      soundsDesc: 'Play sound effects',
      autoSave: 'Auto Save',
      autoSaveDesc: 'Automatically save scanned contacts',
      storage: 'Storage',
      contacts: 'Contacts',
      profiles: 'Profiles',
      flyers: 'Flyers',
      totalUsage: 'Total Usage',
      exportData: 'Export',
      clearData: 'Clear Data',
      appDescription: 'Zoom your business across Africa',
      rateApp: 'Rate App',
      shareApp: 'Share App',
      helpSupport: 'Help & Support'
    },
    sw: {
      language: 'Lugha',
      appearance: 'Muonekano',
      darkMode: 'Hali ya Giza',
      lightMode: 'Hali ya Mwanga',
      notifications: 'Arifa',
      vibration: 'Mtikisiko',
      vibrationDesc: 'Tikisa wakati wa mafanikio ya kuchanganua',
      sounds: 'Sauti',
      soundsDesc: 'Cheza athari za sauti',
      autoSave: 'Hifadhi Otomatiki',
      autoSaveDesc: 'Hifadhi mawasiliano yaliyochanganuliwa kiotomatiki',
      storage: 'Hifadhi',
      contacts: 'Mawasiliano',
      profiles: 'Wasifu',
      flyers: 'Flyers',
      totalUsage: 'Jumla ya Matumizi',
      exportData: 'Hamisha',
      clearData: 'Futa Data',
      appDescription: 'Zoom biashara yako barani Afrika',
      rateApp: 'Kadiria Programu',
      shareApp: 'Shiriki Programu',
      helpSupport: 'Msaada & Usaidizi'
    },
    ar: {
      language: 'اللغة',
      appearance: 'المظهر',
      darkMode: 'الوضع الليلي',
      lightMode: 'الوضع العادي',
      notifications: 'الإشعارات',
      vibration: 'الاهتزاز',
      vibrationDesc: 'اهتزاز عند نجاح المسح',
      sounds: 'الأصوات',
      soundsDesc: 'تشغيل المؤثرات الصوتية',
      autoSave: 'حفظ تلقائي',
      autoSaveDesc: 'حفظ الجهات اللى بتتسح أوتوماتيك',
      storage: 'التخزين',
      contacts: 'الجهات',
      profiles: 'البروفايلات',
      flyers: 'الفلayers',
      totalUsage: 'إجمالي الاستخدام',
      exportData: 'تصدير',
      clearData: 'مسح البيانات',
      appDescription: 'طور business بتاعك فى أفريقيا',
      rateApp: 'قيم التطبيق',
      shareApp: 'شارك التطبيق',
      helpSupport: 'المساعدة والدعم'
    },
    zh: {
      language: '语言',
      appearance: '外观',
      darkMode: '深色模式',
      lightMode: '浅色模式',
      notifications: '通知',
      vibration: '振动',
      vibrationDesc: '扫描成功时振动',
      sounds: '声音',
      soundsDesc: '播放音效',
      autoSave: '自动保存',
      autoSaveDesc: '自动保存扫描的联系人',
      storage: '存储',
      contacts: '联系人',
      profiles: '个人资料',
      flyers: '传单',
      totalUsage: '总使用量',
      exportData: '导出',
      clearData: '清除数据',
      appDescription: '在非洲扩展您的业务',
      rateApp: '评价应用',
      shareApp: '分享应用',
      helpSupport: '帮助与支持'
    },
    hi: {
      language: 'भाषा',
      appearance: 'रूप',
      darkMode: 'डार्क मोड',
      lightMode: 'लाइट मोड',
      notifications: 'सूचनाएं',
      vibration: 'कंपन',
      vibrationDesc: 'स्कैन सफल होने पर कंपन',
      sounds: 'ध्वनियाँ',
      soundsDesc: 'ध्वनि प्रभाव चलाएं',
      autoSave: 'ऑटो सेव',
      autoSaveDesc: 'स्कैन किए गए संपर्क स्वचालित रूप से सहेजें',
      storage: 'स्टोरेज',
      contacts: 'संपर्क',
      profiles: 'प्रोफाइल',
      flyers: 'फ्लायर्स',
      totalUsage: 'कुल उपयोग',
      exportData: 'निर्यात',
      clearData: 'डेटा साफ करें',
      appDescription: 'अफ्रीका में अपने व्यवसाय को ज़ूम करें',
      rateApp: 'ऐप रेट करें',
      shareApp: 'ऐप शेयर करें',
      helpSupport: 'मदद और सहायता'
    },
    ru: {
      language: 'Язык',
      appearance: 'Внешний вид',
      darkMode: 'Тёмный режим',
      lightMode: 'Светлый режим',
      notifications: 'Уведомления',
      vibration: 'Вибрация',
      vibrationDesc: 'Вибрация при успешном сканировании',
      sounds: 'Звуки',
      soundsDesc: 'Воспроизводить звуковые эффекты',
      autoSave: 'Автосохранение',
      autoSaveDesc: 'Автоматически сохранять сканированные контакты',
      storage: 'Хранилище',
      contacts: 'Контакты',
      profiles: 'Профили',
      flyers: 'Флаеры',
      totalUsage: 'Общее использование',
      exportData: 'Экспорт',
      clearData: 'Очистить данные',
      appDescription: 'Развивайте свой бизнес в Африке',
      rateApp: 'Оценить приложение',
      shareApp: 'Поделиться приложением',
      helpSupport: 'Помощь и поддержка'
    },
    yo: {
      language: 'Ede',
      appearance: 'Iririsi',
      darkMode: 'Ipo Dudu',
      lightMode: 'Ipo Imọlẹ',
      notifications: 'Iwifunni',
      vibration: 'Gbigbon',
      vibrationDesc: 'Gbon nigbati o ṣayẹwo ni aṣeyọri',
      sounds: 'Awọn ohun',
      soundsDesc: 'Ṣe awọn ipa ohun',
      autoSave: 'Ifipamọ Aifọwọyi',
      autoSaveDesc: 'Fi awọn olubasọrọ ti a ṣayẹwo pamọ laifọwọyi',
      storage: 'Ibi Ipamọ',
      contacts: 'Awọn Olubasọrọ',
      profiles: 'Awọn Profaili',
      flyers: 'Awọn Flyers',
      totalUsage: 'Lilo Lapapọ',
      exportData: 'Jade',
      clearData: 'Nu Data',
      appDescription: 'Ṣe iṣẹ́ rẹ nla ni Afrika',
      rateApp: 'Iwọn App',
      shareApp: 'Pin App',
      helpSupport: 'Iranlọwọ & Atilẹyin'
    },
    ig: {
      language: 'Asụsụ',
      appearance: 'Ọdịdị',
      darkMode: 'Ọnọdụ Ọchịchịrị',
      lightMode: 'Ọnọdụ Ìhè',
      notifications: 'Mmata',
      vibration: 'Mgbagharị',
      vibrationDesc: 'Ma jijiji mgbe ị ga-enyocha ihe ịga nke ọma',
      sounds: 'Ụda',
      soundsDesc: 'Gwuo mmetụta ụda',
      autoSave: 'Chekwaa Akpaka',
      autoSaveDesc: 'Chekwaa kọntaktị ndị a nyochara na akpaka',
      storage: 'Nchekwa',
      contacts: 'Kọntaktị',
      profiles: 'Profaịlụ',
      flyers: 'Flyers',
      totalUsage: 'Ngụkọta Ojiji',
      exportData: 'Bupụ',
      clearData: 'Hichapụ Data',
      appDescription: 'Mepee azụmahịa gị n Africa',
      rateApp: 'Tụọ Ngwa',
      shareApp: 'Kekọrịta Ngwa',
      helpSupport: 'Enyemaka & Nkwado'
    },
    zu: {
      language: 'Ulimi',
      appearance: 'Ukubukeka',
      darkMode: 'Imodi Emnyama',
      lightMode: 'Imodi Ekhaleni',
      notifications: 'Izaziso',
      vibration: 'Ukudlidlizela',
      vibrationDesc: 'Dlidlizela lapho uphumelela ekuhloleni',
      sounds: 'Imisindo',
      soundsDesc: 'Dlala imisindo yomthelela',
      autoSave: 'Ukulondolozela Othomathikhi',
      autoSaveDesc: 'Londoloza oxhumana nabo abahloliwe ngokuthomathikhi',
      storage: 'Isitoreji',
      contacts: 'Oxhumana Nabo',
      profiles: 'Amaphrofayili',
      flyers: 'Amaflyers',
      totalUsage: 'Isetshenziswa Sephelele',
      exportData: 'Khipha',
      clearData: 'Sula Idatha',
      appDescription: 'Khulisa ibhizinisi lakho e-Afrika',
      rateApp: 'Hlela Uhlelo',
      shareApp: 'Yabela Ngohlelo',
      helpSupport: 'Usizo & Nwesekelo'
    },
    ha: {
      language: 'Harshe',
      appearance: 'Bayyanar',
      darkMode: 'Yanayin Duhu',
      lightMode: 'Yanayin Haskakawa',
      notifications: 'Sanarwa',
      vibration: 'Jijjiga',
      vibrationDesc: 'Yi jijjiga lokacin nasarar dubawa',
      sounds: 'Sautuna',
      soundsDesc: 'Kunna tasirin sauti',
      autoSave: 'Ajiyewa Ta kansa',
      autoSaveDesc: 'Ajiye lambobin sadarwa da aka duba ta kansa',
      storage: 'Ma ajiya',
      contacts: 'Lambobin Sadarwa',
      profiles: 'Bayanan Mai Amfani',
      flyers: 'Fareti',
      totalUsage: 'Jimlar Amfani',
      exportData: 'Fitarwa',
      clearData: 'Share Bayanai',
      appDescription: 'Ƙara kasuwancin ku a Afirka',
      rateApp: 'Kimanta App',
      shareApp: 'Raba App',
      helpSupport: 'Taimako & Tallafawa'
    },
    yue: {
  language: '語言',
  appearance: '外觀',
  darkMode: '深色模式',
  lightMode: '淺色模式',
  notifications: '通知',
  vibration: '震動',
  vibrationDesc: '掃描成功時震動',
  sounds: '聲音',
  soundsDesc: '播放音效',
  autoSave: '自動保存',
  autoSaveDesc: '自動保存掃描嘅聯絡人',
  storage: '儲存',
  contacts: '聯絡人',
  profiles: '個人資料',
  flyers: '傳單',
  totalUsage: '總使用量',
  exportData: '導出',
  clearData: '清除數據',
  appDescription: '擴展你嘅業務到非洲',
  rateApp: '評價應用',
  shareApp: '分享應用',
  helpSupport: '幫助與支持'
}
  }
  
  return translations[currentLanguage.value]?.[key] || translations.en[key] || key
}

</script>