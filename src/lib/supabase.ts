import { createClient } from '@supabase/supabase-js';
import type { UserProfile } from '../types/incident';

// 1. Baca variabel lingkungan dengan fallback string aman
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Validasi format URL untuk mencegah crash createClient
const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Memeriksa apakah kredensial Supabase telah dikonfigurasi dengan benar
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    isValidUrl(supabaseUrl) &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const SUPABASE_CONFIG_ERROR_MESSAGE =
  'Layanan database & autentikasi belum terhubung. Pastikan variabel lingkungan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY telah diisi di pengaturan Vercel (Project Settings > Environment Variables) atau berkas .env Anda.';

// 2. Inisialisasi Supabase Client dengan konfigurasi aman agar aplikasi tidak crash jika env kosong
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://dummy-app.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'dummy-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

if (!isSupabaseConfigured()) {
  console.info(
    'ℹ️ [CityReport] Supabase: VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diisi. Mode aman aktif.'
  );
}

/**
 * Sign in using Google OAuth via Supabase
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.error('Supabase Google OAuth error:', err);
    return { error: err };
  }
}

export const GUEST_STORAGE_KEY = 'cityreport_guest_user';

/**
 * Sign in as a Guest / Test User
 * Memungkinkan pengujian instan tanpa konfigurasi backend atau Google OAuth
 */
export function signInAsGuest(customName?: string): UserProfile {
  const guestUser: UserProfile = {
    id: 'guest-' + Math.floor(1000 + Math.random() * 9000),
    email: 'tamu.komunitas@cityreport.id',
    full_name: customName || 'Pengguna Pengujian (Guest)',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GuestUser',
    is_guest: true,
  };
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
  } catch (e) {
    console.warn('Gagal menyimpan sesi tamu ke localStorage:', e);
  }
  return guestUser;
}

/**
 * Sign in with Email and Password via Supabase
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: Error | null; user?: UserProfile }> {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(
        'Layanan database belum terhubung. Silakan gunakan tombol "Masuk Mode Pengujian / Guest" di bawah untuk mencoba aplikasi secara langsung.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email atau password tidak sesuai. Silakan periksa kembali.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Email Anda belum dikonfirmasi. Silakan buka tautan verifikasi di email Anda.');
      }
      throw error;
    }

    if (data.user) {
      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        full_name:
          data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[0] ||
          'Pengguna',
        avatar_url: data.user.user_metadata?.avatar_url,
        is_guest: false,
      };
      return { error: null, user };
    }
    return { error: new Error('User data tidak ditemukan.') };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Sign up with Email, Password, and Full Name via Supabase
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ error: Error | null; user?: UserProfile; message?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(
        'Layanan database belum terhubung. Silakan gunakan tombol "Masuk Mode Pengujian / Guest" di bawah untuk mencoba aplikasi secara langsung.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('Alamat email ini sudah terdaftar. Silakan login atau gunakan reset password.');
      }
      if (error.message.includes('Password should be at least')) {
        throw new Error('Password minimal harus terdiri dari 6 karakter.');
      }
      throw error;
    }

    if (data.user) {
      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        full_name:
          data.user.user_metadata?.full_name ||
          fullName ||
          data.user.email?.split('@')[0] ||
          'Pengguna',
        avatar_url: data.user.user_metadata?.avatar_url,
        is_guest: false,
      };

      const needsConfirmation = !data.session;
      return {
        error: null,
        user: needsConfirmation ? undefined : user,
        message: needsConfirmation
          ? 'Pendaftaran berhasil! Tautan konfirmasi telah dikirim ke email Anda. Silakan verifikasi sebelum login.'
          : 'Pendaftaran berhasil! Akun Anda aktif dan siap digunakan.',
      };
    }
    return { error: new Error('Pendaftaran gagal diproses.') };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Send password reset email via Supabase
 */
export async function resetPasswordForEmail(
  email: string
): Promise<{ error: Error | null; message?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      error: new Error(SUPABASE_CONFIG_ERROR_MESSAGE),
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return {
      error: null,
      message: 'Instruksi reset password telah dikirim ke email Anda. Silakan periksa inbox/spam.',
    };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Get current authenticated user from Supabase session or Guest session
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured()) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email,
          full_name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'Pengguna',
          avatar_url: session.user.user_metadata?.avatar_url,
          is_guest: false,
        };
      }
    } catch (e) {
      console.warn('Error fetching Supabase session:', e);
    }
  }

  // Cek sesi Tamu / Guest dari localStorage
  try {
    const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
    if (savedGuest) {
      return JSON.parse(savedGuest) as UserProfile;
    }
  } catch {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  }

  return null;
}

/**
 * Sign out user via Supabase and clear guest session
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out from Supabase:', e);
    }
  }
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {}
}

/**
 * Upload photo to Supabase Storage bucket 'incident-photos'
 * Falls back to base64 Data URL if storage bucket is not configured
 */
export async function uploadIncidentPhoto(file: File): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('incident-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.warn('Supabase storage upload error, using local fallback:', uploadError);
      } else {
        const { data } = supabase.storage.from('incident-photos').getPublicUrl(filePath);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage exception, using fallback:', err);
    }
  }

  // Fallback: Read as base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
