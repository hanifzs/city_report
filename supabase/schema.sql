-- ==============================================================================
-- CityReport — Smart Community Road & Incident Map
-- Supabase Schema & Security Setup (PostgreSQL)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Custom Enums & Types
DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM (
        'pothole',       -- Jalan Berlubang / Rusak
        'flood',         -- Banjir / Genangan Air
        'accident',      -- Kecelakaan Lalu Lintas
        'traffic',       -- Kemacetan Parah
        'streetlight',   -- Lampu Jalan Mati / Rusak
        'tree_fall',     -- Pohon Tumbang / Hambatan Jalan
        'other'          -- Lainnya
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'active',        -- Masih Terjadi
        'resolved',      -- Sudah Selesai / Ditangani
        'expired'        -- Kedaluwarsa Otomatis
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category incident_category NOT NULL DEFAULT 'pothole',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    photo_url TEXT,
    
    -- Reporter Info (Supabase Auth User)
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(150) DEFAULT 'Warga Komunitas',
    reporter_avatar TEXT,

    -- Status & Community Validation
    status incident_status NOT NULL DEFAULT 'active',
    votes_still_happening INTEGER NOT NULL DEFAULT 1,
    votes_resolved INTEGER NOT NULL DEFAULT 0,
    
    -- Expiry Mechanism (default 48 hours, extended when community validates)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '48 hours') NOT NULL
);

-- Indexes for fast geospatial & category querying
CREATE INDEX IF NOT EXISTS idx_incidents_coords ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);

-- 4. Incident Community Votes / Confirmations
CREATE TABLE IF NOT EXISTS public.incident_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('still_happening', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_incident_vote UNIQUE (incident_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_incident ON public.incident_votes(incident_id);

-- 5. Row Level Security (RLS) Policies
-- Aturan Frictionless:
-- - SIAPAPUN (Anonim / Belum Login) BISA MELIHAT SEMUA LAPORAN
-- - HANYA PENGGUNA TEROTENTIKASI (Google Sign-In) YANG BISA MEMBUAT LAPORAN & MEMBERI VOTE

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_votes ENABLE ROW LEVEL SECURITY;

-- 5.1 Incidents Policies
-- Public view (Anon & Authenticated)
CREATE POLICY "Incidents are viewable by everyone" 
ON public.incidents FOR SELECT 
USING (true);

-- Authenticated users can insert incidents
CREATE POLICY "Authenticated users can create incidents" 
ON public.incidents FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = reporter_id);

-- Reporter or system can update their own report
CREATE POLICY "Reporters can update their incidents" 
ON public.incidents FOR UPDATE 
TO authenticated 
USING (auth.uid() = reporter_id);

-- 5.2 Incident Votes Policies
-- Votes are viewable by everyone
CREATE POLICY "Votes are viewable by everyone" 
ON public.incident_votes FOR SELECT 
USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can cast vote" 
ON public.incident_votes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update or switch their vote
CREATE POLICY "Users can update their vote" 
ON public.incident_votes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. Trigger to Update Counts & Expiry on Vote
CREATE OR REPLACE FUNCTION public.handle_incident_vote()
RETURNS TRIGGER AS $$
DECLARE
    cnt_still INT;
    cnt_res INT;
BEGIN
    SELECT COUNT(*) INTO cnt_still FROM public.incident_votes 
    WHERE incident_id = NEW.incident_id AND vote_type = 'still_happening';

    SELECT COUNT(*) INTO cnt_res FROM public.incident_votes 
    WHERE incident_id = NEW.incident_id AND vote_type = 'resolved';

    -- If community confirms resolved > 3 and more than still_happening, mark as resolved
    UPDATE public.incidents
    SET 
        votes_still_happening = cnt_still,
        votes_resolved = cnt_res,
        updated_at = timezone('utc'::text, now()),
        -- Extend expiration by 24h if community confirms still happening
        expires_at = CASE 
            WHEN NEW.vote_type = 'still_happening' THEN GREATEST(expires_at, timezone('utc'::text, now()) + INTERVAL '24 hours')
            ELSE expires_at
        END,
        status = CASE 
            WHEN cnt_res >= 3 AND cnt_res > cnt_still THEN 'resolved'::incident_status
            ELSE 'active'::incident_status
        END
    WHERE id = NEW.incident_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_added ON public.incident_votes;
CREATE TRIGGER on_vote_added
AFTER INSERT OR UPDATE ON public.incident_votes
FOR EACH ROW EXECUTE FUNCTION public.handle_incident_vote();

-- 7. Supabase Storage Setup for Incident Photos
-- Run these in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-photos', 'incident-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view photos
CREATE POLICY "Public Access Incident Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'incident-photos');

-- Authenticated users can upload photos
CREATE POLICY "Authenticated Users Can Upload Incident Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'incident-photos');
