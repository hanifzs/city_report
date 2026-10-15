import React from 'react';
import { X, ShieldCheck, LogOut, CheckCircle } from 'lucide-react';
import type { UserProfile } from '../../types/incident';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSignInWithGoogle: () => void;
  onDemoSignIn: () => void;
  onSignOut: () => void;
  reasonText?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInWithGoogle,
  onDemoSignIn,
  onSignOut,
  reasonText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-dialog"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={20} color="#38bdf8" />
            <h3 className="modal-title">
              {currentUser ? 'Profil Akun Komunitas' : 'Verifikasi Akun Pelapor'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px 20px' }}>
          {currentUser ? (
            /* Logged in state */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <img
                src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={currentUser.full_name}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '3px solid #38bdf8',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
                }}
              />
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                  {currentUser.full_name}
                </h4>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>
                  {currentUser.email || 'Terhubung via Google Auth'}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 99,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 8,
                  }}
                >
                  <CheckCircle size={12} />
                  <span>Pelapor Terverifikasi</span>
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.03)',
                  fontSize: 12,
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                💡 Anda memiliki hak untuk mengirimkan laporan gangguan dan memvalidasi kondisi jalan di sekitar Anda.
              </div>

              <button
                onClick={onSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <LogOut size={16} /> Keluar dari Akun
              </button>
            </div>
          ) : (
            /* Not logged in: Google Auth Gate */
            <div className="google-auth-box">
              <div className="google-shield-icon">
                <ShieldCheck size={36} />
              </div>

              <div>
                <h4 className="auth-headline">
                  {reasonText ? 'Masuk untuk Melanjutkan' : 'Alur Tanpa Hambatan'}
                </h4>
                <p className="auth-subtext" style={{ marginTop: 6 }}>
                  {reasonText ||
                    'Melihat peta & laporan gangguan 100% bebas tanpa login. Kami hanya membutuhkan akun Google Anda saat mengirim laporan agar komunitas terbebas dari spam.'}
                </p>
              </div>

              {/* Real Google OAuth Button */}
              <button
                className="google-login-button"
                onClick={onSignInWithGoogle}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Lanjutkan dengan Akun Google</span>
              </button>

              {/* Instant 1-Click Demo Login */}
              <button
                className="demo-login-button"
                onClick={onDemoSignIn}
                title="Gunakan akun demo instan tanpa konfigurasi OAuth Supabase"
              >
                ⚡ Masuk Instan Mode Demo (Untuk Uji Coba Cepat)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
