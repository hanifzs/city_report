import { createClient } from '@supabase/supabase-js';
import type { UserProfile } from '../types/incident';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if user has provided real Supabase keys
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Create real client or dummy client to prevent crash
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://dummy-app.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'dummy-anon-key'
);

// Local simulated user storage key for seamless offline/preview mode
const DEMO_USER_KEY = 'cityreport_demo_user';

/**
 * Sign in using Google OAuth via Supabase, or provide an instant demo login fallback
 */
export async function signInWithGoogle(): Promise<{ error: Error | null; user?: UserProfile }> {
  if (isSupabaseConfigured()) {
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
      console.warn('Supabase Google OAuth failed, switching to fallback demo mode:', err);
      // Fallback
      return mockSignInWithGoogle();
    }
  } else {
    // Frictionless fallback for local dev / testing
    return mockSignInWithGoogle();
  }
}

/**
 * Mock Google Sign-In for immediate testing
 */
export function mockSignInWithGoogle(): { error: null; user: UserProfile } {
  const mockUser: UserProfile = {
    id: 'user-demo-' + Math.floor(Math.random() * 10000),
    email: 'bambang.warga@gmail.com',
    full_name: 'Bambang Pamungkas (Google)',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_guest: false,
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
  return { error: null, user: mockUser };
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Pengguna',
          avatar_url: session.user.user_metadata?.avatar_url,
          is_guest: false,
        };
      }
    } catch (e) {
      console.warn('Error fetching Supabase session:', e);
    }
  }

  // Check demo user in localStorage
  const saved = localStorage.getItem(DEMO_USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(DEMO_USER_KEY);
    }
  }
  return null;
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.removeItem(DEMO_USER_KEY);
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
