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
    color: '#FB923C', // Vivid Orange
    bgColor: 'rgba(251, 146, 60, 0.2)',
    iconName: 'AlertCircle',
  },
  flood: {
    id: 'flood',
    label: 'Banjir & Genangan',
    description: 'Genangan air tinggi, saluran air meluap',
    color: '#38BDF8', // Electric Sky Blue
    bgColor: 'rgba(56, 189, 248, 0.2)',
    iconName: 'Droplets',
  },
  accident: {
    id: 'accident',
    label: 'Kecelakaan Lalu Lintas',
    description: 'Tabrakan kendaraan, korban butuh bantuan',
    color: '#F87171', // Vivid Coral Red
    bgColor: 'rgba(248, 113, 113, 0.2)',
    iconName: 'ShieldAlert',
  },
  traffic: {
    id: 'traffic',
    label: 'Kemacetan Parah',
    description: 'Macet total tak bergerak, kendaraan mogok',
    color: '#FBBF24', // Amber Gold
    bgColor: 'rgba(251, 191, 36, 0.2)',
    iconName: 'Car',
  },
  streetlight: {
    id: 'streetlight',
    label: 'Lampu Jalan Padam',
    description: 'PJU mati, tiang roboh, area gelap rawan',
    color: '#C084FC', // Luminous Purple
    bgColor: 'rgba(192, 132, 252, 0.2)',
    iconName: 'LightbulbOff',
  },
  tree_fall: {
    id: 'tree_fall',
    label: 'Pohon Tumbang',
    description: 'Pohon patah, dahan menutupi jalan atau kabel',
    color: '#34D399', // Bright Emerald
    bgColor: 'rgba(52, 211, 153, 0.2)',
    iconName: 'Trees',
  },
  other: {
    id: 'other',
    label: 'Gangguan Lainnya',
    description: 'Material bangunan tercecer, hewan liar, dll.',
    color: '#94A3B8', // Slate Light
    bgColor: 'rgba(148, 163, 184, 0.2)',
    iconName: 'HelpCircle',
  },
};
