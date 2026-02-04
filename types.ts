
export enum UserRole {
  ADMIN = 'Admin',
  FINANCE = 'Finance',
  OPERATIONS = 'Operations'
}

export type Tab = 'home' | 'locations' | 'wiki' | 'services' | 'business';

export enum BranchId {
  MINQUAN = 'minquan',
  SIWEI = 'siwei',
  YANCHENG = 'yancheng',
  MINLUN = 'minlun'
}

export interface Branch {
  id: BranchId;
  name: string;
  address: string;
  mrt: string;
  image: string;
}

export interface LocationSpace {
  id: string;
  branchId: BranchId;
  name: string; // e.g., "20A", "2101"
  description: string;
  capacity?: string; // e.g., "10-12人"
  imageUrl: string; // Main display image (Cover)
  images: string[]; // All uploaded images (Gallery, max 4)
  videoUrl?: string; // Tour video
  features?: string[]; // e.g., ["Projector", "Whiteboard"]
}

export interface OfficeType {
  id: string;
  title: string; // e.g. "Soho", "2-6人辦公室"
  description: string;
  imageUrl: string; // Cover image
  images: string[]; // Gallery
  videoUrl?: string;
  features?: string[];
}

export type WikiCategory = 'floorplan' | 'equipment' | 'transport' | 'wifi' | 'access' | 'other';

export interface Equipment {
  id: string;
  title: string;
  category: WikiCategory;
  iconName: string; // Used for Lucide icon matching
  description: string;
  // New fields for Content Management
  contentType: 'guide' | 'video' | 'image';
  instructions?: string[]; // Optional, used if contentType is 'guide'
  mediaUrl?: string; // Used if contentType is 'video' or 'image'
  uploadDate?: string;
}

export interface FoodSpot {
  id: string;
  name: string;
  type: string;
  distance: string;
  priceLevel: number; // 1-3
}

export interface Announcement {
  id: string;
  title: string;
  date: string; // Activity Date
  type: 'alert' | 'info' | 'event';
  details?: string; // New: Full content description
  link?: string; // New: Registration or external link
}

export interface BusinessPartner {
  id: string;
  name: string;
  category: string;
  description: string;
  website?: string;
  logoColor: string; // Fallback for mock UI purpose
  logoUrl?: string; // New: Uploaded image
}

export interface MemberProfile {
  id: string;
  name: string; // Company/Client Name
  password: string; // Login Password
  pettyCashBalance: number; // 零用金餘額
  meetingPointsTotal: number; // 會議室點數(每月)
  meetingPointsUsed: number; // 已使用時數/點數
  contractDate: string; // 合約到期日
}

export interface AppDataBackup {
  version: string;
  timestamp: string;
  wikiItems: Equipment[];
  announcements: Announcement[];
  locationSpaces: LocationSpace[];
  businessPartners: BusinessPartner[];
  officeTypes: OfficeType[];
  members: MemberProfile[];
}

export type ValueServiceCategory = '加值商務' | '數位升級' | '心靈成長' | '其他';

export interface ValueService {
  id: string;
  title: string;
  category: ValueServiceCategory;
  iconName: string;
  color: string;
  bg: string;
  desc: string;
  link?: string;
  order?: number;
}
