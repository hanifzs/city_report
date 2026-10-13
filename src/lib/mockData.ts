import type { Incident } from '../types/incident';

export const INITIAL_MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    title: 'Lubang Aspal Menganga di Depan Halte',
    description: 'Kedalaman lubang sekitar 15cm dengan diameter 60cm, berbahaya bagi pemotor terutama saat hujan.',
    category: 'pothole',
    latitude: -6.2115,
    longitude: 106.8229,
    address: 'Jl. Jenderal Sudirman No. 28, Setiabudi, Jakarta Selatan',
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reporter_name: 'Rian Ardiansyah',
    reporter_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rian',
    status: 'active',
    votes_still_happening: 24,
    votes_resolved: 2,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 46 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inc-2',
    title: 'Genangan Banjir 35cm di Underpass',
    description: 'Underpass tergenang air setinggi betis akibat pompa air tersumbat sampah. Lalu lintas dialihkan ke jalur atas.',
    category: 'flood',
    latitude: -6.2255,
    longitude: 106.8320,
    address: 'Underpass Mampang Prapatan, Jakarta Selatan',
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    reporter_name: 'Dewi Lestari',
    reporter_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    status: 'active',
    votes_still_happening: 42,
    votes_resolved: 5,
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 47 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inc-3',
    title: '5 Titik Lampu Jalan PJU Mati Total',
    description: 'Penerangan mati sepanjang 300 meter, kondisi jalan sangat gelap dan rawan pembegalan di malam hari.',
    category: 'streetlight',
    latitude: -6.1950,
    longitude: 106.8190,
    address: 'Jl. KH. Mas Mansyur, Tanah Abang, Jakarta Pusat',
    photo_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    reporter_name: 'Bambang Hartono',
    reporter_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bambang',
    status: 'active',
    votes_still_happening: 17,
    votes_resolved: 1,
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 42 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inc-4',
    title: 'Dahan Pohon Beringin Tumbang ke Jalan',
    description: 'Menutup satu lajur lambat sepeda motor. Sedang dipotong warga sekitar dengan gergaji tangan.',
    category: 'tree_fall',
    latitude: -6.2390,
    longitude: 106.8480,
    address: 'Jl. Tebet Barat Dalam Raya, Tebet, Jakarta Selatan',
    photo_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    reporter_name: 'Fikri Haikal',
    reporter_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fikri',
    status: 'active',
    votes_still_happening: 31,
    votes_resolved: 9,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 44 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inc-5',
    title: 'Kecelakaan Beruntun 2 Mobil',
    description: 'Terjadi benturan di lajur kanan, korban luka ringan. Menimbulkan antrean kendaraan padat merayap.',
    category: 'accident',
    latitude: -6.2180,
    longitude: 106.8020,
    address: 'Jl. Gatot Subroto Dekat Gerbang Tol Senayan',
    photo_url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    reporter_name: 'Anisa Maharani',
    reporter_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anisa',
    status: 'active',
    votes_still_happening: 56,
    votes_resolved: 22,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 45 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inc-6',
    title: 'Macet Total Akibat Perbaikan Saluran Air',
    description: 'Proyek galian drainase memakan 2 dari 3 lajur. Kecepatan rata-rata kendaraan di bawah 5 km/jam.',
    category: 'traffic',
    latitude: -6.2020,
    longitude: 106.8330,
    address: 'Jl. H.R. Rasuna Said, Karet Kuningan',
    photo_url: 'https://images.unsplash.com/photo-1508873696983-2df5703bc228?auto=format&fit=crop&w=800&q=80',
    reporter_name: 'Galih Wicaksono',
    reporter_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Galih',
    status: 'active',
    votes_still_happening: 64,
    votes_resolved: 14,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 43 * 3600 * 1000).toISOString(),
  },
];

// Helper to calculate distance in km using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
