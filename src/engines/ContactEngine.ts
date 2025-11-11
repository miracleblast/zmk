import type { ScannedContact, EnhancedSocialMedia, GlobalBusinessLocation } from './StorageEngine'

export interface EnhancedContact extends ScannedContact {
  socialMedia?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
    whatsapp?: string
    youtube?: string
    wechat?: string;
    github?: string
  }
  flyers?: Array<{
    name: string
    data: string // base64
    type: string
    size: number
  }>
  notes?: string
  rating?: number // 1-5 stars
  lastContacted?: Date
}

export class ContactEngine {
  
  // ✅ ENHANCED PARSING WITH GLOBAL BUSINESS INTELLIGENCE
  parseAndEnhanceContact(qrData: string, rawData: string = ''): ScannedContact {
    const baseContact = this.parseQRData(qrData)
    
    return {
      ...baseContact,
      rawData,
      socialMedia: this.extractEnhancedSocialMedia(qrData),
      location: this.extractLocationInfo(qrData),
      targetMarkets: this.detectTargetMarkets(qrData),
      tags: [...baseContact.tags, 'enhanced', 'global-business'],
      scannedAt: new Date()
    }
  }

  // ✅ ENHANCED SOCIAL MEDIA EXTRACTION
  private extractEnhancedSocialMedia(data: string): EnhancedSocialMedia | undefined {
    const social: EnhancedSocialMedia = {}
    
    // LinkedIn - Global Professional
    const linkedinMatch = data.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/g)
    if (linkedinMatch) social.linkedin = linkedinMatch[0]
    
    // Twitter/X - Global Business
    const twitterMatch = data.match(/(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/g)
    if (twitterMatch) social.twitter = twitterMatch[0]
    
    // Instagram - Visual Business
    const instagramMatch = data.match(/(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+/g)
    if (instagramMatch) social.instagram = instagramMatch[0]
    
    // Facebook - Business Pages
    const facebookMatch = data.match(/(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+/g)
    if (facebookMatch) social.facebook = facebookMatch[0]
    
    // WhatsApp - Global Business Communication
    const whatsappMatch = data.match(/(https?:\/\/)?(wa\.me\/[0-9]+|whatsapp\.com)/g)
    if (whatsappMatch) social.whatsapp = whatsappMatch[0]

    // YouTube - Business Channels
    const youtubeMatch = data.match(/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[a-zA-Z0-9_-]+/g)
    if (youtubeMatch) social.youtube = youtubeMatch[0]

    // ✅ WECHAT - CHINA BUSINESS (REPLACED TIKTOK)
    const wechatMatch = data.match(/(wechat|weixin)/gi)
    if (wechatMatch) {
      // Extract WeChat ID from various formats
      const wechatIdMatch = data.match(/(?:wechat|weixin)[:\s]*([a-zA-Z0-9_-]+)/i)
      if (wechatIdMatch) social.wechat = wechatIdMatch[1]
    }

    // GitHub - Tech Businesses
    const githubMatch = data.match(/(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+/g)
    if (githubMatch) social.github = githubMatch[0]
    
    return Object.keys(social).length > 0 ? social : undefined
  }

  // ✅ LOCATION INTELLIGENCE FOR TARGET MARKETS
  private extractLocationInfo(data: string): GlobalBusinessLocation | undefined {
    const location: GlobalBusinessLocation = {
      country: '',
      city: '',
      marketFocus: []
    }

    // DETECT AFRICAN COUNTRIES
    const africanCountries = this.getAfricanCountries();
    const africaMatch = africanCountries.find(country => 
      data.toLowerCase().includes(country.toLowerCase())
    );
    if (africaMatch) {
      location.country = africaMatch;
      location.marketFocus?.push('africa');
    }

    // DETECT CHINA & HONG KONG
    if (data.match(/(china|chinese|beijing|shanghai|shenzhen|hong\s*kong)/gi)) {
      location.country = location.country || 'China';
      location.marketFocus?.push('china');
    }

    // DETECT INDIA
    if (data.match(/(india|indian|mumbai|delhi|bangalore)/gi)) {
      location.country = location.country || 'India';
      location.marketFocus?.push('india');
    }

    // DETECT RUSSIA
    if (data.match(/(russia|russian|moscow|saint\s*petersburg)/gi)) {
      location.country = location.country || 'Russia';
      location.marketFocus?.push('russia');
    }

    // DETECT CITIES
    const cityMatch = data.match(/(?:based in|located in|from)\s+([A-Za-z\s]+),?\s*(?:[A-Za-z\s]*)/i);
    if (cityMatch && cityMatch[1]) {
      location.city = cityMatch[1].trim();
    }

    return location.country ? location : undefined;
  }

  // ✅ TARGET MARKET DETECTION
  private detectTargetMarkets(data: string): ('africa' | 'china' | 'india' | 'russia')[] {
    const markets: ('africa' | 'china' | 'india' | 'russia')[] = [];
    const lowerData = data.toLowerCase();

    // AFRICA BUSINESS DETECTION
    if (lowerData.match(/(africa|african|import.*africa|export.*africa)/g)) {
      markets.push('africa');
    }

    // CHINA BUSINESS DETECTION
    if (lowerData.match(/(china|chinese|manufactur.*china|sourc.*china)/g)) {
      markets.push('china');
    }

    // INDIA BUSINESS DETECTION
    if (lowerData.match(/(india|indian|outsourc.*india|tech.*india)/g)) {
      markets.push('india');
    }

    // RUSSIA BUSINESS DETECTION
    if (lowerData.match(/(russia|russian|energy.*russia|commodit.*russia)/g)) {
      markets.push('russia');
    }

    return markets.length > 0 ? markets : ['africa']; // Default to Africa focus
  }

  // ✅ COMPREHENSIVE AFRICAN COUNTRIES LIST
  private getAfricanCountries(): string[] {
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
  }

  // Parse QR data with enhanced logic
private parseQRData(data: string): ScannedContact {
  // JSON format - ENHANCED WITH PROFILE PICTURE SUPPORT
  if (data.startsWith('{') && data.endsWith('}')) {
    try {
      const jsonData = JSON.parse(data)
      console.log('📱 Parsing JSON QR data:', jsonData)
      
      // ✅ ENHANCED PROFILE PICTURE HANDLING
      let profileImage = ''
      if (jsonData.image || jsonData.photo || jsonData.avatar || jsonData.profilePicture) {
        profileImage = jsonData.image || jsonData.photo || jsonData.avatar || jsonData.profilePicture
        console.log('🖼️ Found profile image in QR data:', profileImage.substring(0, 50) + '...')
      }
      
      // ✅ ENHANCED TAGS BASED ON BUSINESS CATEGORY
      const businessTags = this.generateBusinessTags(jsonData)
      
      // ✅ CREATE CLEAN CONTACT WITH PROFILE PICTURE
      const contact: ScannedContact = {
        id: Date.now().toString(),
        name: jsonData.name || jsonData.fullName || 'Unknown Contact',
        position: jsonData.position || jsonData.title || jsonData.jobTitle || '',
        company: jsonData.company || jsonData.organization || jsonData.business || '',
        email: jsonData.email || jsonData.mail || '',
        phone: jsonData.phone || jsonData.tel || jsonData.mobile || '',
        website: jsonData.website || jsonData.url || jsonData.web || '',
        category: jsonData.category || jsonData.industry || 'General',
        image: profileImage, // ✅ PROFILE PICTURE INCLUDED
        rawData: data,
        scannedAt: new Date(),
        notes: jsonData.notes || jsonData.description || jsonData.bio || '',
        tags: businessTags, // ✅ MEANINGFUL BUSINESS TAGS
        socialMedia: this.cleanSocialMedia(
          jsonData.socialMedia || jsonData.socials || this.extractSocialMediaFromJSON(jsonData)
        ),
        location: this.extractLocationInfo(data),
        targetMarkets: this.detectTargetMarkets(data)
      };
      
      console.log('✅ Contact created with image:', contact.image ? 'Yes' : 'No')
      console.log('🏷️ Business tags:', businessTags)
      return contact;
    } catch (error) {
      console.error('JSON parsing failed:', error)
      return this.parseTextData(data)
    }
  }
    
    // Pipe-separated format
    if (data.includes('|')) {
      return this.parsePipeSeparated(data)
    }
    
    // URL format
    if (data.startsWith('http')) {
      return this.parseUrlData(data)
    }
    
    // Fallback - plain text
    return this.parseTextData(data)
  }

private generateBusinessTags(jsonData: any): string[] {
  const tags = ['business-contact']
  
  // Remove generic tags and add meaningful ones
  if (jsonData.category) {
    const categoryTag = jsonData.category.toLowerCase().replace(/\s+/g, '-')
    if (categoryTag !== 'general') {
      tags.push(categoryTag)
    }
  }
  
  // Add industry-specific tags
  if (jsonData.industry) {
    tags.push(jsonData.industry.toLowerCase().replace(/\s+/g, '-'))
  }
  
  // Add business role tags
  if (jsonData.position) {
    const position = jsonData.position.toLowerCase()
    if (position.includes('ceo') || position.includes('founder') || position.includes('owner')) {
      tags.push('executive')
    }
    if (position.includes('manager') || position.includes('director') || position.includes('head')) {
      tags.push('management')
    }
    if (position.includes('sales') || position.includes('business development')) {
      tags.push('sales')
    }
    if (position.includes('tech') || position.includes('developer') || position.includes('engineer')) {
      tags.push('technology')
    }
  }
  
  // Add location-based tags
  if (jsonData.location) {
    tags.push('has-location')
  }
  
  // Add social media presence tags
  if (jsonData.socialMedia) {
    const socialCount = Object.keys(jsonData.socialMedia).filter(key => 
      jsonData.socialMedia[key] && jsonData.socialMedia[key] !== ''
    ).length
    if (socialCount > 0) {
      tags.push('social-media')
    }
  }
  
  return [...new Set(tags)] // Remove duplicates
}


// ✅ ADD CLEAN SOCIAL MEDIA HELPER
private cleanSocialMedia(socialMedia: any): EnhancedSocialMedia | undefined {
  if (!socialMedia) return undefined;
  
  const cleanSocial: EnhancedSocialMedia = {};
  
  // Only include string values
  if (typeof socialMedia.linkedin === 'string') cleanSocial.linkedin = socialMedia.linkedin;
  if (typeof socialMedia.twitter === 'string') cleanSocial.twitter = socialMedia.twitter;
  if (typeof socialMedia.instagram === 'string') cleanSocial.instagram = socialMedia.instagram;
  if (typeof socialMedia.facebook === 'string') cleanSocial.facebook = socialMedia.facebook;
  if (typeof socialMedia.whatsapp === 'string') cleanSocial.whatsapp = socialMedia.whatsapp;
  if (typeof socialMedia.youtube === 'string') cleanSocial.youtube = socialMedia.youtube;
  if (typeof socialMedia.wechat === 'string') cleanSocial.wechat = socialMedia.wechat;
  if (typeof socialMedia.github === 'string') cleanSocial.github = socialMedia.github;
  
  return Object.keys(cleanSocial).length > 0 ? cleanSocial : undefined;
}
  // Extract social media from JSON object
   private extractSocialMediaFromJSON(jsonData: any): EnhancedSocialMedia | undefined { // ✅ USE SocialMedia TYPE
    const social: EnhancedSocialMedia = {} // ✅ USE SocialMedia TYPE
    
    if (jsonData.linkedin) social.linkedin = jsonData.linkedin
    if (jsonData.twitter) social.twitter = jsonData.twitter
    if (jsonData.x) social.twitter = jsonData.x // Handle X platform
    if (jsonData.instagram) social.instagram = jsonData.instagram
    if (jsonData.facebook) social.facebook = jsonData.facebook
    if (jsonData.whatsapp) social.whatsapp = jsonData.whatsapp
    if (jsonData.youtube) social.youtube = jsonData.youtube
    if (jsonData.wechat) social.wechat = jsonData.wechat
    if (jsonData.github) social.github = jsonData.github
    
    return Object.keys(social).length > 0 ? social : undefined
  }


  private parsePipeSeparated(data: string): ScannedContact {
    const parts = data.split('|')
    return {
      id: Date.now().toString(),
      name: parts[0]?.trim() || 'Unknown Contact',
      position: parts[1]?.trim() || '',
      company: parts[2]?.trim() || '',
      email: parts[3]?.trim() || '',
      phone: parts[4]?.trim() || '',
      website: parts[5]?.trim() || '',
      category: parts[6]?.trim() || 'Scanned',
      rawData: data,
      scannedAt: new Date(),
      tags: ['qr-scanned', 'pipe-format']
    }
  }

  private parseUrlData(data: string): ScannedContact {
    return {
      id: Date.now().toString(),
      name: 'Website Contact',
      position: '',
      company: 'From Website',
      email: '',
      phone: '',
      website: data,
      category: 'Website',
      rawData: data,
      scannedAt: new Date(),
      tags: ['qr-scanned', 'website']
    }
  }

  private parseTextData(data: string): ScannedContact {
    return {
      id: Date.now().toString(),
      name: 'Scanned Contact',
      position: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      category: 'General',
      rawData: data,
      scannedAt: new Date(),
      notes: data,
      tags: ['qr-scanned', 'text']
    }
  }

  // Enhanced vCard parsing
  private parseVCard(vcardData: string): ScannedContact {
    const lines = vcardData.split('\n')
    const contact: any = {
      id: Date.now().toString(),
      name: '',
      position: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      category: 'vCard',
      rawData: vcardData,
      scannedAt: new Date(),
      tags: ['qr-scanned', 'vcard']
    }
    
    lines.forEach(line => {
      if (line.startsWith('FN:')) contact.name = line.substring(3).trim()
      else if (line.startsWith('ORG:')) contact.company = line.substring(4).trim()
      else if (line.startsWith('TEL:')) contact.phone = line.substring(4).trim()
      else if (line.startsWith('EMAIL:')) contact.email = line.substring(6).trim()
      else if (line.startsWith('TITLE:')) contact.position = line.substring(6).trim()
      else if (line.startsWith('URL:')) contact.website = line.substring(4).trim()
      else if (line.startsWith('NOTE:')) contact.notes = (contact.notes || '') + line.substring(5).trim() + ' '
    })
    
    return contact
  }

  // Generate contact display name
  generateDisplayName(contact: EnhancedContact): string {
    if (contact.name && contact.name !== 'Scanned Contact' && contact.name !== 'Website Contact') {
      return contact.name
    }
    
    if (contact.company) {
      return `${contact.position ? contact.position + ' at ' : ''}${contact.company}`
    }
    
    return 'Unknown Contact'
  }

  // Format contact for display
  formatContactInfo(contact: EnhancedContact): {
    displayName: string
    subtitle: string
    description: string
  } {
    const displayName = this.generateDisplayName(contact)
    
    let subtitle = ''
    if (contact.position && contact.company) {
      subtitle = `${contact.position} at ${contact.company}`
    } else if (contact.position) {
      subtitle = contact.position
    } else if (contact.company) {
      subtitle = contact.company
    }
    
    let description = ''
    if (contact.email) description += `📧 ${contact.email}\n`
    if (contact.phone) description += `📞 ${contact.phone}\n`
    if (contact.website) description += `🌐 ${contact.website}\n`
    if (contact.notes) description += `📝 ${contact.notes}`
    
    return { displayName, subtitle, description: description.trim() }
  }

  // Validate contact data
  validateContact(contact: EnhancedContact): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!contact.name || contact.name.trim() === '') {
      errors.push('Name is required')
    }
    
    if (!contact.email && !contact.phone && !contact.website) {
      errors.push('At least one contact method (email, phone, or website) is required')
    }
    
    if (contact.email && !this.isValidEmail(contact.email)) {
      errors.push('Invalid email format')
    }
    
    if (contact.website && !this.isValidUrl(contact.website)) {
      errors.push('Invalid website URL')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Export contact to vCard
  exportToVCard(contact: EnhancedContact): string {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.name}`,
      contact.position && `TITLE:${contact.position}`,
      contact.company && `ORG:${contact.company}`,
      contact.email && `EMAIL:${contact.email}`,
      contact.phone && `TEL:${contact.phone}`,
      contact.website && `URL:${contact.website}`,
      contact.notes && `NOTE:${contact.notes}`,
      'END:VCARD'
    ].filter(Boolean).join('\n')
    
    return vcard
  }

  // Calculate contact score based on completeness
  calculateContactScore(contact: EnhancedContact): number {
    let score = 0
    const maxScore = 100
    
    // Name (20 points)
    if (contact.name && contact.name !== 'Scanned Contact') score += 20
    
    // Contact info (60 points)
    if (contact.email) score += 20
    if (contact.phone) score += 20
    if (contact.website) score += 20
    
    // Additional info (20 points)
    if (contact.position) score += 10
    if (contact.company) score += 10
    
    return Math.min(score, maxScore)
  }
}