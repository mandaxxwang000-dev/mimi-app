export type CatCategory = 'stray_spotting' | 'emergency_rescue' | 'partner_venue';

export interface CatSpot {
  id: string;
  user_id: string;
  image_url: string;
  title: string;
  notes: string;
  category: CatCategory;
  lat: number;
  lng: number;
  like_count: number;
  created_at: string;
}

export interface VenueDeal {
  id: string;
  name: string;
  description: string;
  deal_type: string;
  image_url: string;
  badge: string;
  price: string;
  address: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  verified: boolean;
  address: string;
  image_url: string;
  lat: number;
  lng: number;
  created_at: string;
}

export const CATEGORY_META: Record<
  CatCategory,
  { label: string; color: string; short: string }
> = {
  stray_spotting: { label: 'Stray Spotting', color: '#2D6A4F', short: 'Stray' },
  emergency_rescue: { label: 'Emergency Rescue', color: '#B91C1C', short: 'Rescue' },
  partner_venue: { label: 'Partner Venue', color: '#B45309', short: 'Venue' },
};
