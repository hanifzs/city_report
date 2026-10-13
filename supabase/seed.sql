-- ==============================================================================
-- CityReport Sample Seed Data
-- ==============================================================================

INSERT INTO public.incidents (
    title, 
    description, 
    category, 
    latitude, 
    longitude, 
    address, 
    photo_url, 
    reporter_name, 
    status, 
    votes_still_happening, 
    votes_resolved,
    created_at,
    expires_at
) VALUES 
(
    'Lubang Besar di Jalur Kiri Depan Halte',
    'Lubang sedalam kurang lebih 15cm tertutup genangan air kecil saat malam hari, sangat membahayakan pengendara motor.',
    'pothole',
    -6.2088,
    106.8456,
    'Jl. Rasuna Said, Karet Kuningan, Jakarta Selatan',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    'Rian Ardiansyah',
    'active',
    18,
    2,
    now() - INTERVAL '3 hours',
    now() + INTERVAL '45 hours'
),
(
    'Genangan Banjir 30cm Pasca Hujan Deras',
    'Air menggenang setinggi betis orang dewasa di kolong jembatan layang. Mobil sedan dan motor disarankan cari jalan alternatif.',
    'flood',
    -6.2250,
    106.8090,
    'Jl. Gatot Subroto Kav. 52, Mampang Prapatan',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    'Siti Nurbaya',
    'active',
    34,
    4,
    now() - INTERVAL '1 hours',
    now() + INTERVAL '47 hours'
),
(
    'Lampu Penerangan Jalan Umum (PJU) Mati Total',
    'Sekitar 4 tiang lampu jalan berturut-turut padam, area sangat gelap dan rawan tindak kejahatan serta kecelakaan.',
    'streetlight',
    -6.1944,
    106.8229,
    'Jl. KH Mas Mansyur, Tanah Abang, Jakarta Pusat',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    'Bambang Prakoso',
    'active',
    12,
    0,
    now() - INTERVAL '7 hours',
    now() + INTERVAL '41 hours'
),
(
    'Pohon Trembesi Tumbang Menutup Separuh Jalan',
    'Dahan pohon patah akibat angin kencang tadi sore, kendaraan roda empat harus bergantian melintas.',
    'tree_fall',
    -6.2382,
    106.8521,
    'Jl. Tebet Raya No. 44, Tebet, Jakarta Selatan',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    'Dimas Pratama',
    'active',
    21,
    8,
    now() - INTERVAL '5 hours',
    now() + INTERVAL '43 hours'
),
(
    'Truk Pecah Ban Menyebabkan Antrean 2 KM',
    'Truk muatan pasir mogok di lajur tengah arah Semanggi. Petugas lantas sedang dalam proses evakuasi.',
    'traffic',
    -6.2155,
    106.8166,
    'Flyover Sudirman - Benhil, Jakarta Pusat',
    'https://images.unsplash.com/photo-1508873696983-2df5703bc228?auto=format&fit=crop&w=800&q=80',
    'Andi Saputra',
    'active',
    45,
    15,
    now() - INTERVAL '2 hours',
    now() + INTERVAL '46 hours'
);
