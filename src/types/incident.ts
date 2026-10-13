export type IncidentCategory =
  | 'pothole'
  | 'flood'
  | 'accident'
  | 'traffic'
  | 'streetlight'
  | 'tree_fall'
  | 'other';

export type IncidentStatus = 'active' | 'resolved' | 'expired';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  address: string;
  photo_url?: string;
  reporter_id?: string;
  reporter_name: string;
  reporter_avatar?: string;
  status: IncidentStatus;
  votes_still_happening: number;
  votes_resolved: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  distance_km?: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  is_guest?: boolean;
}

export interface CategoryInfo {
  id: IncidentCategory;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  iconName: string;
}

export const CATEGORIES: Record<IncidentCategory, CategoryInfo> = {
  pothole: {
    id: 'pothole',
    label: 'Jalan Rusak / Berlubang',
    description: 'Aspal terkelupas, lubang dalam, retakan membahayakan',
    color: '#f97316', // Orange
    bgColor: 'rgba(249, 115, 22, 0.15)',
    iconName: 'AlertCircle',
  },
  flood: {
    id: 'flood',
    label: 'Banjir & Genangan',
    description: 'Genangan air tinggi, saluran air meluap',
    color: '#0ea5e9', // Sky Blue
    bgColor: 'rgba(14, 165, 233, 0.15)',
    iconName: 'Droplets',
  },
  accident: {
    id: 'accident',
    label: 'Kecelakaan Lalu Lintas',
    description: 'Tabrakan kendaraan, korban butuh bantuan',
    color: '#ef4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.15)',
    iconName: 'ShieldAlert',
  },
  traffic: {
    id: 'traffic',
    label: 'Kemacetan Parah',
    description: 'Macet total tak bergerak, kendaraan mogok',
    color: '#eab308', // Amber
    bgColor: 'rgba(234, 179, 8, 0.15)',
    iconName: 'Car',
  },
  streetlight: {
    id: 'streetlight',
    label: 'Lampu Jalan Padam',
    description: 'PJU mati, tiang roboh, area gelap rawan',
    color: '#a855f7', // Purple
    bgColor: 'rgba(168, 85, 247, 0.15)',
    iconName: 'LightbulbOff',
  },
  tree_fall: {
    id: 'tree_fall',
    label: 'Pohon Tumbang',
    description: 'Pohon patah, dahan menutupi jalan atau kabel',
    color: '#10b981', // Emerald
    bgColor: 'rgba(16, 185, 129, 0.15)',
    iconName: 'Trees',
  },
  other: {
    id: 'other',
    label: 'Gangguan Lainnya',
    description: 'Material bangunan tercecer, hewan liar, dll.',
    color: '#64748b', // Slate
    bgColor: 'rgba(100, 116, 139, 0.15)',
    iconName: 'HelpCircle',
  },
};
