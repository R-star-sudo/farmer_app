
import { LanguageCode } from './constants/translations';

export type Language = LanguageCode;

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DIAGNOSIS = 'DIAGNOSIS',
  WEATHER = 'WEATHER',
  CHAT = 'CHAT',
  FINANCE = 'FINANCE',
  MARKETPLACE = 'MARKETPLACE',
  PROFILE = 'PROFILE',
  CALENDAR = 'CALENDAR',
  FERTILIZER = 'FERTILIZER',
  CHOUPAL = 'CHOUPAL'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for display
  timestamp: number;
  sources?: { title: string; uri: string }[];
}

export interface DiagnosisResult {
  title: string;
  summary: string[];
  additional?: string[];
}

export interface MarketListing {
  id: string;
  crop: string; // Used as "Equipment Name" for rentals
  quantity: string;
  price: string;
  location: string;
  description: string;
  seller: string;
  time: string;
  type: 'buy' | 'sell' | 'rent';
  // Extended fields for sellers (Crops)
  seedType?: string;
  fertilizer?: string;
  harvestDate?: string;
  // Extended fields for rentals (Equipment)
  equipmentBrand?: string;
  equipmentPower?: string; // e.g. "50 HP"
}

export interface MarketPrice {
  mandi: string;
  crop: string;
  price: string;
  trend: 'up' | 'down' | 'stable';
  distance: string;
}

export interface User {
  id?: string;
  email: string;
  name: string;
  location?: string;
}

export interface Scheme {
  name: string;
  benefit: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  location: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
  tags?: string[]; // AI generated tags
}
