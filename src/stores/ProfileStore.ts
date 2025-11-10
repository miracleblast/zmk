// src/stores/profile.ts
import { defineStore } from 'pinia'
import type { BusinessProfile, EnhancedSocialMedia, GlobalBusinessLocation } from '../engines/StorageEngine'
import { StorageEngine } from '../engines/StorageEngine'

export interface EnhancedBusinessProfile extends BusinessProfile {
  // No need to redefine - using updated interfaces from StorageEngine
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    currentProfile: null as EnhancedBusinessProfile | null,
    isEditing: false,
    isLoading: false
  }),

  actions: {
    async initialize() {
      try {
        const storage = new StorageEngine()
        const profile = await storage.getCurrentProfile()
        
        // ✅ FIXED: PROPERLY HANDLE NULL/UNDEFINED VALUES
        this.currentProfile = {
          ...(profile || this.getDefaultProfile()),
          socialMedia: profile?.socialMedia || this.getDefaultSocialMedia(),
          location: profile?.location || this.getDefaultLocation(),
          targetMarkets: profile?.targetMarkets || ['africa']
        } as EnhancedBusinessProfile
        
        console.log('✅ Profile store initialized with global business focus')
      } catch (error) {
        console.error('❌ Profile store initialization failed:', error)
        this.currentProfile = this.getDefaultProfile() as EnhancedBusinessProfile
      }
    },

    // ✅ NEW: DEFAULT PROFILE TEMPLATE
    getDefaultProfile(): Partial<BusinessProfile> {
      return {
        id: 'current',
        name: '',
        position: '',
        company: '',
        email: '',
        phone: '',
        category: '',
        flyers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },

    // ✅ NEW: DEFAULT SOCIAL MEDIA
    getDefaultSocialMedia(): EnhancedSocialMedia {
      return {
        linkedin: '',
        twitter: '',
        instagram: '',
        facebook: '',
        whatsapp: '',
        youtube: '',
        wechat: '',
        github: ''
      }
    },

    // ✅ NEW: DEFAULT LOCATION
    getDefaultLocation(): GlobalBusinessLocation {
      return {
        country: '',
        city: '',
        zipCode: '',
        address: '',
        marketFocus: []
      }
    },

    async saveProfile(profileData: Partial<EnhancedBusinessProfile>) {
      this.isLoading = true
      
      try {
        const storage = new StorageEngine()
        
        // ✅ FIXED: CONVERT TO PLAIN OBJECT BEFORE SAVING
        const plainProfileData = JSON.parse(JSON.stringify(profileData))
        await storage.saveProfile(plainProfileData)
        
        // Refresh the current profile from storage
        await this.initialize()
        
        console.log('✅ Profile saved successfully with global business data')
        return true
        
      } catch (error) {
        console.error('❌ Error saving profile:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    setProfile(profile: EnhancedBusinessProfile | null) {
      this.currentProfile = profile
    },

    updateProfile(updates: Partial<EnhancedBusinessProfile>) {
      if (this.currentProfile) {
        // ✅ FIXED: CONVERT TO PLAIN OBJECT BEFORE UPDATING
        const plainUpdates = JSON.parse(JSON.stringify(updates))
        this.currentProfile = { 
          ...this.currentProfile, 
          ...plainUpdates, 
          updatedAt: new Date()
        }
      }
    },

    setEditing(editing: boolean) {
      this.isEditing = editing
    },

    async addFlyer(flyer: { name: string; file: File }) {
      const newFlyer = {
        name: flyer.name,
        file: flyer.file,
        type: flyer.file.type,
        size: flyer.file.size
      }
      
      if (this.currentProfile) {
        const flyers = [...(this.currentProfile.flyers || []), newFlyer]
        await this.saveProfile({ flyers })
      }
    },

    async removeFlyer(index: number) {
      if (this.currentProfile?.flyers) {
        const flyers = this.currentProfile.flyers.filter((_, i) => i !== index)
        await this.saveProfile({ flyers })
      }
    },

    getCurrentProfile(): EnhancedBusinessProfile | null {
      return this.currentProfile
    },

    // Social media specific methods
    updateSocialMedia(platform: keyof EnhancedSocialMedia, url: string) {
      if (this.currentProfile) {
        const socialMedia = { 
          ...this.currentProfile.socialMedia, 
          [platform]: url 
        }
        this.updateProfile({ socialMedia })
      }
    },

    hasSocialMedia(): boolean {
      if (!this.currentProfile?.socialMedia) return false
      
      const socialUrls = Object.values(this.currentProfile.socialMedia) as string[]
      return socialUrls.some(url => url && typeof url === 'string' && url.trim() !== '')
    },

    getActiveSocialMedia(): Array<{ platform: keyof EnhancedSocialMedia; url: string }> {
      if (!this.currentProfile?.socialMedia) return []
      
      const activePlatforms: Array<{ platform: keyof EnhancedSocialMedia; url: string }> = []
      
      Object.entries(this.currentProfile.socialMedia).forEach(([platform, url]) => {
        if (url && typeof url === 'string' && url.trim() !== '') {
          activePlatforms.push({
            platform: platform as keyof EnhancedSocialMedia,
            url: url.trim()
          })
        }
      })
      
      return activePlatforms
    },

    validateSocialMedia(): { isValid: boolean; errors: string[] } {
      const errors: string[] = []
      
      if (!this.currentProfile?.socialMedia) {
        return { isValid: true, errors: [] }
      }
      
      Object.entries(this.currentProfile.socialMedia).forEach(([platform, url]) => {
        if (url && typeof url === 'string' && url.trim() !== '') {
          // Special handling for WeChat (can be ID, not URL)
          if (platform === 'wechat') {
            // WeChat can be just an ID, no URL validation needed
            return;
          }
          
          try {
            new URL(url)
          } catch {
            errors.push(`Invalid URL for ${platform}: ${url}`)
          }
        }
      })
      
      return {
        isValid: errors.length === 0,
        errors
      }
    },

    // ✅ GET AFRICAN COUNTRIES FOR DROPDOWN
    getAfricanCountries(): string[] {
      return [
        // North Africa
        'Algeria', 'Egypt', 'Libya', 'Morocco', 'Sudan', 'Tunisia', 'Western Sahara',
        // West Africa
        'Benin', 'Burkina Faso', 'Cape Verde', 'Ivory Coast', 'Gambia', 'Ghana', 'Guinea', 
        'Guinea-Bissau', 'Liberia', 'Mali', 'Mauritania', 'Niger', 'Nigeria', 'Senegal', 
        'Sierra Leone', 'Togo',
        // Central Africa
        'Angola', 'Cameroon', 'Central African Republic', 'Chad', 'Congo', 
        'Democratic Republic of the Congo', 'Equatorial Guinea', 'Gabon', 'São Tomé and Príncipe',
        // East Africa
        'Burundi', 'Comoros', 'Djibouti', 'Eritrea', 'Ethiopia', 'Kenya', 'Madagascar', 
        'Malawi', 'Mauritius', 'Mozambique', 'Rwanda', 'Seychelles', 'Somalia', 'South Sudan', 
        'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe',
        // Southern Africa
        'Botswana', 'Eswatini', 'Lesotho', 'Namibia', 'South Africa'
      ];
    },

    // ✅ GET TARGET MARKET OPTIONS
    getTargetMarkets(): ('africa' | 'china' | 'india' | 'russia')[] {
      return ['africa', 'china', 'india', 'russia'];
    },

    // ✅ GET MARKET DISPLAY LABEL
    getMarketLabel(market: 'africa' | 'china' | 'india' | 'russia'): string {
      const labels = {
        africa: 'Africa',
        china: 'China (including Hong Kong SAR)',
        india: 'India',
        russia: 'Russia'
      };
      return labels[market];
    },

    // ✅ NEW: RESET PROFILE TO DEFAULTS
    async resetProfile() {
      this.currentProfile = this.getDefaultProfile() as EnhancedBusinessProfile
      await this.saveProfile(this.currentProfile)
    }
  }
})