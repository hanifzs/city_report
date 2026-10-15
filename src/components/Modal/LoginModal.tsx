import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import type { UserProfile } from '../../types/incident';
import {
  signInWithEmail,
  signUpWithEmail,
  resetPasswordForEmail,
  signInAsGuest,
  isSupabaseConfigured,
} from '../../lib/supabase';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
  onDemoSignIn?: () => void;
  reasonText?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  onLoginSuccess,
  onDemoSignIn,
  reasonText,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetFormState = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetFormState();
    setMode('login');
    onClose();
  };

  // 1. Handle Guest / Demo Testing Login
  const handleGuestSignIn = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (onDemoSignIn) {
      onDemoSignIn();
    } else {
      const guest = signInAsGuest();
      if (onLoginSuccess) {
        onLoginSuccess(guest);
      }
    }
    handleClose();
  };

  // 2. Handle Google OAuth Login
  const handleGoogleLogin = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!isSupabaseConfigured()) {
      setErrorMessage(
        'Google Auth belum aktif karena kredensial Supabase belum terkonfigurasi di Vercel / .env. Anda dapat menggunakan tombol "Masuk Mode Pengujian / Guest" di bawah untuk mencoba fitur langsung.'
      );
      return;
    }
    onSignInWithGoogle();
  };

  // 3. Handle Email + Password Sign In (supabase.auth.signInWithPassword)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Mohon isi alamat email dan password Anda.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await signInWithEmail(email.trim(), password);
      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal login. Periksa kembali email dan password Anda.');
      } else if (res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user);
        handleClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kendala saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Sign Up (supabase.auth.signUp)
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Mohon lengkapi seluruh isian form pendaftaran.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal harus terdiri dari 6 karakter.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await signUpWithEmail(email.trim(), password, fullName.trim());
      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal mendaftar.');
      } else {
        setSuccessMessage(res.message || 'Pendaftaran berhasil!');
        if (res.user && onLoginSuccess) {
          onLoginSuccess(res.user);
        } else {
          // Switch to login tab and keep email
          setTimeout(() => {
            setMode('login');
          }, 2000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kendala saat mendaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Forgot Password (supabase.auth.resetPasswordForEmail)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Mohon masukkan alamat email akun Anda.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPasswordForEmail(email.trim());
      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal mengirim email reset.');
      } else {
        setSuccessMessage(res.message || 'Tautan pemulihan password telah dikirim ke email Anda.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content-dialog"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={20} color="#38bdf8" />
            <h3 className="modal-title">
              {currentUser
                ? currentUser.is_guest
                  ? 'Profil Mode Pengujian (Guest)'
                  : 'Profil Akun Komunitas'
                : mode === 'signup'
                ? 'Daftar Akun Baru'
                : mode === 'forgot'
                ? 'Pemulihan Password'
                : 'Masuk ke Akun'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={handleClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 22px' }}>
          {currentUser ? (
            /* ================= LOGGED IN PROFILE VIEW ================= */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: '10px 0',
              }}
            >
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: currentUser.is_guest ? '3px solid #f59e0b' : '3px solid #38bdf8',
                    boxShadow: currentUser.is_guest
                      ? '0 0 20px rgba(245, 158, 11, 0.35)'
                      : '0 0 20px rgba(56, 189, 248, 0.35)',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: currentUser.is_guest
                      ? 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)'
                      : 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
                    color: '#ffffff',
                    fontSize: 26,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
                  }}
                >
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: 17, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {currentUser.full_name}
                </h4>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {currentUser.email || 'Terhubung via Akun Terverifikasi'}
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 99,
                    background: currentUser.is_guest
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(16, 185, 129, 0.15)',
                    color: currentUser.is_guest ? '#fbbf24' : '#34d399',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 8,
                    border: currentUser.is_guest
                      ? '1px solid rgba(245, 158, 11, 0.35)'
                      : '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {currentUser.is_guest ? <Zap size={12} /> : <CheckCircle size={12} />}
                  <span>
                    {currentUser.is_guest
                      ? 'Akun Pengujian / Tamu (Guest)'
                      : 'Pelapor Komunitas Terverifikasi'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: 12,
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                {currentUser.is_guest
                  ? '⚡ Anda berada dalam Mode Pengujian. Anda dapat membuat laporan gangguan jalan, mengunggah foto, dan memvalidasi laporan warga tanpa hambatan.'
                  : '💡 Anda memiliki akses penuh untuk mengirimkan laporan gangguan jalan, mengunggah foto lapangan, serta memvalidasi laporan warga di peta.'}
              </div>

              {/* Log Out Button */}
              <button
                onClick={onSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '13px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.16)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: 4,
                }}
              >
                <LogOut size={16} /> Keluar dari Akun
              </button>
            </div>
          ) : (
            /* ================= NOT LOGGED IN (TRANSJAKARTA STYLE AUTH) ================= */
            <div className="auth-flow-box">
              {/* Brand Top Header */}
              <div className="auth-brand-header">
                <div className="auth-brand-badge">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 44 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 5C14.82 5 9 10.82 9 18C9 27.2 22 39 22 39C22 39 35 27.2 35 18C35 10.82 29.18 5 22 5Z"
                      stroke="url(#login_grad)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="22" cy="18" r="4.5" fill="#38BDF8" />
                    <defs>
                      <linearGradient id="login_grad" x1="9" y1="5" x2="35" y2="39" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38BDF8" />
                        <stop offset="1" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="auth-brand-title">CITY REPORT</h3>
                <p className="auth-brand-subtitle">Smart Community Road & Incident Monitor</p>
              </div>

              {reasonText && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(37, 99, 235, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    fontSize: 12,
                    color: '#bae6fd',
                    lineHeight: 1.4,
                  }}
                >
                  ℹ️ {reasonText}
                </div>
              )}

              {/* Notice when Supabase credentials are not configured */}
              {!isSupabaseConfigured() && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    fontSize: 11.5,
                    color: '#fde68a',
                    lineHeight: 1.45,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    <strong>Mode Pengujian Aktif:</strong> Kredensial Supabase / Google Auth belum aktif. Anda dapat langsung menggunakan tombol <strong>"Mode Pengujian / Guest"</strong> di bawah untuk mencoba seluruh fitur aplikasi secara lancar.
                  </span>
                </div>
              )}

              {/* Alert Feedback Messages */}
              {errorMessage && (
                <div className="auth-error-alert animate-fade-in">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="auth-success-alert animate-fade-in">
                  <CheckCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* MODE 1: LOGIN (Email & Password) */}
              {mode === 'login' && (
                <>
                  <form onSubmit={handleEmailLogin} className="auth-form">
                    {/* Email Input */}
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="auth-text-field"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-text-field"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: 12,
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4,
                        }}
                        title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Forgot Password */}
                    <div className="auth-options-row">
                      <button
                        type="button"
                        className="auth-forgot-link"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Primary Blue Login Button */}
                    <button
                      type="submit"
                      className="btn-auth-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Memproses Login...</span>
                        </>
                      ) : (
                        <span>Login</span>
                      )}
                    </button>
                  </form>

                  {/* Divider Line */}
                  <div className="auth-divider-box">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or</span>
                    <div className="auth-divider-line" />
                  </div>

                  {/* SSO: Lanjutkan dengan Akun Google */}
                  <button
                    type="button"
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
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

                  {/* Mode Pengujian / Guest Button */}
                  <button
                    type="button"
                    className="demo-login-button"
                    onClick={handleGuestSignIn}
                    disabled={isLoading}
                    title="Masuk mode pengujian tanpa login untuk mencoba fitur langsung"
                  >
                    <Zap size={16} color="#38bdf8" />
                    <span>Masuk Mode Pengujian / Guest (Coba Langsung)</span>
                  </button>

                  {/* Switch to Sign Up */}
                  <div className="auth-switch-footer">
                    <span>Don't have an account yet? </span>
                    <button
                      type="button"
                      className="auth-switch-link"
                      onClick={() => {
                        setMode('signup');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                    >
                      Sign Up Here
                    </button>
                  </div>
                </>
              )}

              {/* MODE 2: SIGN UP */}
              {mode === 'signup' && (
                <>
                  <form onSubmit={handleEmailSignUp} className="auth-form">
                    {/* Full Name Input */}
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        className="auth-text-field"
                        placeholder="Nama Lengkap"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="auth-text-field"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-text-field"
                        placeholder="Password (min. 6 karakter)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    {/* Sign Up Button */}
                    <button
                      type="submit"
                      className="btn-auth-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Mendaftarkan Akun...</span>
                        </>
                      ) : (
                        <span>Daftar Akun Baru</span>
                      )}
                    </button>
                  </form>

                  {/* Divider Line */}
                  <div className="auth-divider-box">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or</span>
                    <div className="auth-divider-line" />
                  </div>

                  {/* SSO: Lanjutkan dengan Akun Google */}
                  <button
                    type="button"
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
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

                  {/* Mode Pengujian / Guest Button */}
                  <button
                    type="button"
                    className="demo-login-button"
                    onClick={handleGuestSignIn}
                    disabled={isLoading}
                    title="Masuk mode pengujian tanpa login untuk mencoba fitur langsung"
                  >
                    <Zap size={16} color="#38bdf8" />
                    <span>Masuk Mode Pengujian / Guest (Coba Langsung)</span>
                  </button>

                  {/* Switch to Login */}
                  <div className="auth-switch-footer">
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      className="auth-switch-link"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                    >
                      Log In Here
                    </button>
                  </div>
                </>
              )}

              {/* MODE 3: FORGOT PASSWORD */}
              {mode === 'forgot' && (
                <>
                  <form onSubmit={handleForgotPassword} className="auth-form">
                    <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                      Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                    </p>

                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="auth-text-field"
                        placeholder="Alamat Email Anda"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-auth-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Mengirim Tautan...</span>
                        </>
                      ) : (
                        <span>Kirim Tautan Reset Password</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        color: '#94a3b8',
                        fontSize: 12,
                        padding: 8,
                        marginTop: 4,
                      }}
                    >
                      <ArrowLeft size={14} /> Kembali ke Halaman Login
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
