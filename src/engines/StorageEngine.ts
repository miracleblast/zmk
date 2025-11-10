import { openDB } from 'idb';
// ADD THIS SOCIAL MEDIA INTERFACE
export interface GlobalBusinessLocation {
  country: string;
  city: string;
  zipCode?: string;
  address?: string;
  timezone?: string;
  // SPECIFIC FIELDS FOR TARGET MARKETS
  marketFocus?: ('africa' | 'china' | 'india' | 'russia')[];
  languages?: string[];
}

export interface EnhancedSocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  youtube?: string;
  wechat?: string;  // ✅ REPLACED TIKTOK WITH WECHAT
  github?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  website?: string;
  image?: string;
  flyers: { 
    name: string; 
    data: string;
    type: string;
    size: number;
  }[];
  // ✅ ENHANCED LOCATION FOR GLOBAL BUSINESS
  location?: GlobalBusinessLocation;
  socialMedia?: EnhancedSocialMedia;
  // ✅ BUSINESS SPECIFIC FIELDS
  businessScope?: string;
  targetMarkets?: ('africa' | 'china' | 'india' | 'russia')[];
  preferredLanguages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScannedContact {
  id: string;
  name: string;
  position: string;
  company: string;
  email?: string;
  phone?: string;
  category: string;
  website?: string;
  image?: string;
  rawData: string;
  scannedAt: Date;
  notes?: string;
  tags: string[];
  // ✅ ENHANCED FIELDS
  socialMedia?: EnhancedSocialMedia;
  location?: GlobalBusinessLocation;
  targetMarkets?: ('africa' | 'china' | 'india' | 'russia')[];
}

export interface AppSettings {
  language: string;
  isDarkMode: boolean;
  autoSave: boolean;
  vibration: boolean;
  sound: boolean;
}

export interface ChatMessage {
  id: string
  contactId: string
  senderId: string
  content: string
  timestamp: Date
  messageType: 'text' | 'image' | 'file' | 'contact'
  status: 'sent' | 'delivered' | 'read'
  encrypted?: boolean
}

export interface ChatConversation {
  id: string
  contactId: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  createdAt: Date
  updatedAt: Date
}

export class StorageEngine {
  private dbName = 'ZoomkaDB';
  private version = 4;

  async initDB() {
    return openDB(this.dbName, this.version, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('contacts')) {
          const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
          contactStore.createIndex('scannedAt', 'scannedAt');
          contactStore.createIndex('category', 'category');
          contactStore.createIndex('company', 'company');
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
            // Add chat tables
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' })
        messageStore.createIndex('contactId', 'contactId')
        messageStore.createIndex('timestamp', 'timestamp')
      }
      
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' })
        conversationStore.createIndex('lastMessageTime', 'lastMessageTime')
      }
    },
  })
}

// Chat methods
async saveMessage(message: ChatMessage): Promise<void> {
  const db = await this.initDB()
  await db.put('messages', message)
}

async getMessages(contactId: string): Promise<ChatMessage[]> {
  const db = await this.initDB()
  return db.getAllFromIndex('messages', 'contactId', contactId)
}

async saveConversation(conversation: ChatConversation): Promise<void> {
  const db = await this.initDB()
  await db.put('conversations', conversation)
}

async getConversations(): Promise<ChatConversation[]> {
  const db = await this.initDB()
  return db.getAllFromIndex('conversations', 'lastMessageTime')
}

async markMessagesAsRead(contactId: string): Promise<void> {
  const db = await this.initDB()
  const messages = await this.getMessages(contactId)
  
  const tx = db.transaction('messages', 'readwrite')
  messages.forEach(message => {
    if (message.senderId !== 'me' && message.status !== 'read') {
      tx.store.put({ ...message, status: 'read' })
    }
  })
  await tx.done
}

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private base64ToFile(base64: string, filename: string, type: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime || type });
  }

  // SIMPLIFIED: No complex object merging
  async saveProfile(profileData: Partial<BusinessProfile>): Promise<void> {
    const db = await this.initDB();
    const existingProfile = await this.getCurrentProfile();
    
    // Start with existing profile or defaults
    const baseProfile: BusinessProfile = existingProfile || {
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
    };

    // Process image
    if (profileData.image && this.isFileObject(profileData.image)) {
      baseProfile.image = await this.fileToBase64(profileData.image as any);
    } else if (profileData.image) {
      baseProfile.image = profileData.image as string;
    }

    // Process flyers
    if (profileData.flyers && profileData.flyers.length > 0) {
      baseProfile.flyers = await Promise.all(
        profileData.flyers.map(async (flyer: any) => {
          if (flyer.file && this.isFileObject(flyer.file)) {
            return {
              name: flyer.name,
              data: await this.fileToBase64(flyer.file),
              type: flyer.file.type,
              size: flyer.file.size
            };
          }
          return flyer;
        })
      );
    }

    // Update other fields
    if (profileData.name) baseProfile.name = profileData.name;
    if (profileData.position) baseProfile.position = profileData.position;
    if (profileData.company) baseProfile.company = profileData.company;
    if (profileData.category) baseProfile.category = profileData.category;
    if (profileData.phone) baseProfile.phone = profileData.phone;
    if (profileData.email) baseProfile.email = profileData.email;
    if (profileData.website) baseProfile.website = profileData.website;
    
    // Always update timestamp
    baseProfile.updatedAt = new Date();

    console.log('💾 Saving profile to database');
    await db.put('profiles', baseProfile);
  }

  private isFileObject(value: any): boolean {
    return value instanceof File || 
           (typeof value === 'object' && value !== null && 'size' in value && 'type' in value && 'name' in value);
  }

  async getCurrentProfile(): Promise<BusinessProfile | null> {
    try {
      const db = await this.initDB();
      const profile = await db.get('profiles', 'current');
      
      if (!profile) return null;

      // Convert base64 flyers back to File objects for UI
      if (profile.flyers) {
        profile.flyers = profile.flyers.map((flyer: any) => ({
          ...flyer,
          file: this.base64ToFile(flyer.data, flyer.name, flyer.type)
        }));
      }
      
      return profile;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

// NUCLEAR OPTION - COMPLETE DATA CLEANING
async saveContact(contact: Omit<ScannedContact, 'id'>): Promise<string> {
  const db = await this.initDB();
  const id = Date.now().toString();
  
  // ✅ MANUALLY CREATE EVERY FIELD AS PRIMITIVE
  const contactWithId = {
    id: id,
    name: contact.name ? String(contact.name) : 'Unknown Contact',
    position: contact.position ? String(contact.position) : '',
    company: contact.company ? String(contact.company) : '',
    email: contact.email ? String(contact.email) : '',
    phone: contact.phone ? String(contact.phone) : '',
    category: contact.category ? String(contact.category) : 'General',
    website: contact.website ? String(contact.website) : '',
    image: contact.image ? String(contact.image) : '',
    rawData: contact.rawData ? String(contact.rawData) : '',
    scannedAt: contact.scannedAt ? new Date(contact.scannedAt).toISOString() : new Date().toISOString(),
    notes: contact.notes ? String(contact.notes) : '',
    tags: Array.isArray(contact.tags) ? contact.tags.map(t => String(t)) : ['qr-scanned'],
    socialMedia: contact.socialMedia ? JSON.parse(JSON.stringify(contact.socialMedia)) : undefined
  };
  
  console.log('💾 Nuclear clean contact:', contactWithId);
  
  try {
    await db.put('contacts', contactWithId);
    return id;
  } catch (error) {
    console.error('❌ Nuclear save failed:', error);
    throw error;
  }
}

  async getContacts(): Promise<ScannedContact[]> {
    const db = await this.initDB();
    return db.getAllFromIndex('contacts', 'scannedAt');
  }

  async getContactsByCategory(category: string): Promise<ScannedContact[]> {
    const db = await this.initDB();
    return db.getAllFromIndex('contacts', 'category', category);
  }

  async searchContacts(query: string): Promise<ScannedContact[]> {
    const db = await this.initDB();
    const allContacts = await this.getContacts();
    
    return allContacts.filter(contact =>
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.company.toLowerCase().includes(query.toLowerCase()) ||
      contact.position.toLowerCase().includes(query.toLowerCase()) ||
      contact.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  async deleteContact(id: string): Promise<void> {
    const db = await this.initDB();
    await db.delete('contacts', id);
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const db = await this.initDB();
    const currentSettings = await this.getSettings();
    const mergedSettings: AppSettings = {
      language: 'en',
      isDarkMode: false,
      autoSave: true,
      vibration: true,
      sound: true,
      ...currentSettings,
      ...settings
    };
    await db.put('settings', { ...mergedSettings, id: 'app' });
  }

  async getSettings(): Promise<AppSettings> {
    const db = await this.initDB();
    const settings = await db.get('settings', 'app');
    return settings || {
      language: 'en',
      isDarkMode: false,
      autoSave: true,
      vibration: true,
      sound: true
    };
  }

async getCategories(): Promise<any[]> {
  return [
    {
      id: 'technology',
      name: 'Technology',
      icon: 'material-symbols:code',
      subcategories: [
        { id: 'software', name: 'Software Development', icon: 'material-symbols:code' },
        { id: 'hardware', name: 'Hardware', icon: 'material-symbols:computer' },
        { id: 'ai', name: 'Artificial Intelligence', icon: 'material-symbols:smart-toy' },
        { id: 'cybersecurity', name: 'Cybersecurity', icon: 'material-symbols:shield' }
      ]
    },
    {
      id: 'import-export',
      name: 'Import/Export',
      icon: 'material-symbols:airplane-ticket',
      subcategories: [
        { id: 'electronics', name: 'Electronics', icon: 'material-symbols:devices' },
        { id: 'textiles', name: 'Textiles', icon: 'material-symbols:checkroom' },
        { id: 'agriculture', name: 'Agriculture', icon: 'material-symbols:agriculture' },
        { id: 'automotive', name: 'Automotive', icon: 'material-symbols:directions-car' }
      ]
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      icon: 'material-symbols:factory',
      subcategories: [
        { id: 'machinery', name: 'Machinery', icon: 'material-symbols:build' },
        { id: 'textiles', name: 'Textiles', icon: 'material-symbols:checkroom' },
        { id: 'food', name: 'Food Processing', icon: 'material-symbols:restaurant' },
        { id: 'chemicals', name: 'Chemicals', icon: 'material-symbols:science' }
      ]
    },
    {
      id: 'services',
      name: 'Services',
      icon: 'material-symbols:engineering',
      subcategories: [
        { id: 'consulting', name: 'Consulting', icon: 'material-symbols:groups' },
        { id: 'logistics', name: 'Logistics', icon: 'material-symbols:local-shipping' },
        { id: 'finance', name: 'Financial', icon: 'material-symbols:attach-money' },
        { id: 'healthcare', name: 'Healthcare', icon: 'material-symbols:medical-services' }
      ]
    },
    {
      id: 'retail',
      name: 'Retail',
      icon: 'material-symbols:storefront',
      subcategories: [
        { id: 'ecommerce', name: 'E-commerce', icon: 'material-symbols:shopping-cart' },
        { id: 'wholesale', name: 'Wholesale', icon: 'material-symbols:inventory' },
        { id: 'fashion', name: 'Fashion', icon: 'material-symbols:checkroom' },
        { id: 'electronics', name: 'Electronics', icon: 'material-symbols:devices' }
      ]
      }
    ];
  }
}