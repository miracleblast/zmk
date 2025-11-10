// src/engines/StorageEngine.ts
import { openDB } from 'idb';

export interface GlobalBusinessLocation {
  country: string;
  city: string;
  zipCode?: string;
  address?: string;
  timezone?: string;
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
  wechat?: string;
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
  location?: GlobalBusinessLocation;
  socialMedia?: EnhancedSocialMedia;
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
  id: string;
  contactId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  messageType: 'text' | 'image' | 'file' | 'contact';
  status: 'sent' | 'delivered' | 'read';
  encrypted?: boolean;
}

export interface ChatConversation {
  id: string;
  contactId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class StorageEngine {
  private dbName = 'ZoomkaDB';
  private version = 5; // ✅ INCREASED VERSION TO FORCE DB UPDATE

  async initDB() {
    return openDB(this.dbName, this.version, {
      upgrade(db, oldVersion) {
        console.log(`🔄 Upgrading database from version ${oldVersion} to ${db.version}`);
        
        // ✅ COMPLETE DATABASE REBUILD TO ENSURE ALL TABLES EXIST
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
          console.log('✅ Created profiles store');
        }
        
        if (!db.objectStoreNames.contains('contacts')) {
          const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
          contactStore.createIndex('scannedAt', 'scannedAt');
          contactStore.createIndex('category', 'category');
          contactStore.createIndex('company', 'company');
          console.log('✅ Created contacts store');
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
          console.log('✅ Created settings store');
        }
        
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
          console.log('✅ Created categories store');
        }
        
        // ✅ ENSURED CHAT TABLES ARE CREATED
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('contactId', 'contactId');
          messageStore.createIndex('timestamp', 'timestamp');
          console.log('✅ Created messages store');
        }
        
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
          conversationStore.createIndex('lastMessageTime', 'lastMessageTime');
          conversationStore.createIndex('contactId', 'contactId');
          console.log('✅ Created conversations store');
        }
      },
    });
  }

  // Chat methods
  async saveMessage(message: ChatMessage): Promise<void> {
    const db = await this.initDB();
    await db.put('messages', message);
  }

  async getMessages(contactId: string): Promise<ChatMessage[]> {
    const db = await this.initDB();
    return db.getAllFromIndex('messages', 'contactId', contactId);
  }

  async saveConversation(conversation: ChatConversation): Promise<void> {
    const db = await this.initDB();
    await db.put('conversations', conversation);
  }

  async getConversations(): Promise<ChatConversation[]> {
    const db = await this.initDB();
    return db.getAllFromIndex('conversations', 'lastMessageTime');
  }

  async markMessagesAsRead(contactId: string): Promise<void> {
    const db = await this.initDB();
    const messages = await this.getMessages(contactId);
    
    const tx = db.transaction('messages', 'readwrite');
    for (const message of messages) {
      if (message.senderId !== 'me' && message.status !== 'read') {
        await tx.store.put({ ...message, status: 'read' });
      }
    }
    await tx.done;
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

  // ✅ FIXED: PROPERLY HANDLE PROXY OBJECTS AND CLONING
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

    // ✅ FIXED: DESTRUCTURE PROXY OBJECTS TO PLAIN OBJECTS
    if (profileData.location) {
      baseProfile.location = {
        country: String(profileData.location.country || ''),
        city: String(profileData.location.city || ''),
        zipCode: String(profileData.location.zipCode || ''),
        address: String(profileData.location.address || ''),
        marketFocus: Array.isArray(profileData.location.marketFocus) 
          ? [...profileData.location.marketFocus] 
          : [],
        languages: Array.isArray(profileData.location.languages) 
          ? [...profileData.location.languages] 
          : []
      };
      console.log('📍 Saving location data:', baseProfile.location);
    }

    // ✅ FIXED: PROPERLY HANDLE SOCIAL MEDIA
    if (profileData.socialMedia) {
      baseProfile.socialMedia = {
        linkedin: String(profileData.socialMedia.linkedin || ''),
        twitter: String(profileData.socialMedia.twitter || ''),
        instagram: String(profileData.socialMedia.instagram || ''),
        facebook: String(profileData.socialMedia.facebook || ''),
        whatsapp: String(profileData.socialMedia.whatsapp || ''),
        youtube: String(profileData.socialMedia.youtube || ''),
        wechat: String(profileData.socialMedia.wechat || ''),
        github: String(profileData.socialMedia.github || '')
      };
    }

    // ✅ FIXED: PROPERLY HANDLE TARGET MARKETS
    if (profileData.targetMarkets) {
      baseProfile.targetMarkets = Array.isArray(profileData.targetMarkets) 
        ? [...profileData.targetMarkets] 
        : ['africa'];
    }

    // Process image
    if (profileData.image && this.isFileObject(profileData.image)) {
      baseProfile.image = await this.fileToBase64(profileData.image as any);
    } else if (profileData.image) {
      baseProfile.image = String(profileData.image);
    }

    // Process flyers
    if (profileData.flyers && profileData.flyers.length > 0) {
      baseProfile.flyers = await Promise.all(
        profileData.flyers.map(async (flyer: any) => {
          if (flyer.file && this.isFileObject(flyer.file)) {
            return {
              name: String(flyer.name),
              data: await this.fileToBase64(flyer.file),
              type: String(flyer.file.type),
              size: Number(flyer.file.size)
            };
          }
          return {
            name: String(flyer.name),
            data: String(flyer.data),
            type: String(flyer.type),
            size: Number(flyer.size)
          };
        })
      );
    }

    // Update other fields
    if (profileData.name) baseProfile.name = String(profileData.name);
    if (profileData.position) baseProfile.position = String(profileData.position);
    if (profileData.company) baseProfile.company = String(profileData.company);
    if (profileData.category) baseProfile.category = String(profileData.category);
    if (profileData.phone) baseProfile.phone = String(profileData.phone);
    if (profileData.email) baseProfile.email = String(profileData.email);
    if (profileData.website) baseProfile.website = String(profileData.website);
    
    // Always update timestamp
    baseProfile.updatedAt = new Date();

    console.log('💾 Saving complete profile to database');
    console.log('📍 Location:', baseProfile.location);
    console.log('🎯 Target Markets:', baseProfile.targetMarkets);
    
    // ✅ FIXED: USE JSON PARSE/STRINGIFY TO ENSURE PLAIN OBJECT
    const profileToSave = JSON.parse(JSON.stringify(baseProfile));
    await db.put('profiles', profileToSave);
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

  // ✅ NEW: CLEAR DATABASE (FOR DEVELOPMENT/TESTING)
  async clearDatabase(): Promise<void> {
    try {
      const db = await this.initDB();
      await db.clear('profiles');
      await db.clear('contacts');
      await db.clear('messages');
      await db.clear('conversations');
      console.log('🗑️ Database cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear database:', error);
    }
  }

  // ✅ NEW: GET DATABASE INFO
  async getDatabaseInfo(): Promise<{ stores: string[]; version: number }> {
    const db = await this.initDB();
    return {
      stores: Array.from(db.objectStoreNames),
      version: db.version
    };
  }
}