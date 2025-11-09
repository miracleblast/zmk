import QRCode from 'qrcode';
import type { BusinessProfile } from './StorageEngine';

export class QREngine {
  async generateQR(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0066ff',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('QR Generation error:', err);
      return '';
    }
  }

  async generateBusinessCardQR(profile: BusinessProfile): Promise<string> {
    // Clean profile data for QR (remove large files)
    const qrProfile = {
      name: profile.name,
      position: profile.position,
      company: profile.company,
      email: profile.email,
      phone: profile.phone,
      category: profile.category,
      website: profile.website
    };
    
    const data = JSON.stringify(qrProfile);
    return this.generateQR(data);
  }

  parseQRData(data: string): Partial<BusinessProfile> | null {
    try {
      const parsed = JSON.parse(data);
      return {
        name: parsed.name || '',
        position: parsed.position || '',
        company: parsed.company || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        category: parsed.category || '',
        website: parsed.website || ''
      };
    } catch {
      return null;
    }
  }

  async generateVCard(profile: BusinessProfile): Promise<string> {
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `ORG:${profile.company}`,
      `TITLE:${profile.position}`,
      profile.email && `EMAIL:${profile.email}`,
      profile.phone && `TEL:${profile.phone}`,
      profile.website && `URL:${profile.website}`,
      'END:VCARD'
    ].filter(Boolean).join('\n');

    return this.generateQR(vCard);
  }
}