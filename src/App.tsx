import { useState, useEffect, useCallback } from 'react';
import { MapView } from './components/Map/MapView';
import { FloatingSearchBar } from './components/Header/FloatingSearchBar';
import { FloatingActions } from './components/FAB/FloatingActions';
import { BottomSheet } from './components/BottomSheet/BottomSheet';
import { ReportModal } from './components/Modal/ReportModal';
import { AuthModal } from './components/Modal/AuthModal';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import { useGeolocation } from './hooks/useGeolocation';
import { useIncidents } from './hooks/useIncidents';
import {
  supabase,
  isSupabaseConfigured,
  getCurrentUser,
  signInWithGoogle,
  signOutUser,
} from './lib/supabase';
import type { UserProfile, IncidentCategory } from './types/incident';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import './styles/floating.css';
import './styles/bottomsheet.css';
import './styles/modal.css';

export function App() {
  // Geolocation
  const {
    latitude: userLat,
    longitude: userLon,
    isLocating,
    refreshLocation,
  } = useGeolocation();

  // Incidents data & filters
  const {
    incidents,
    allIncidents,
    selectedIncident,
    setSelectedIncident,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addIncident,
    voteIncident,
    userVotes,
  } = useIncidents(userLat, userLon);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<string>('');

  // Modals & Report Draft
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [pendingDraft, setPendingDraft] = useState<any | null>(null);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Floating Toast State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info';
  } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch current user on mount & listen for Supabase auth state changes
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });

    if (isSupabaseConfigured()) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'Pengguna',
            avatar_url: session.user.user_metadata?.avatar_url,
            is_guest: false,
          };
          setCurrentUser(profile);

          if (pendingDraft) {
            setIsReportModalOpen(true);
          }
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [pendingDraft]);

  // Google OAuth Login Handler
  const handleSignInGoogle = async () => {
    const res = await signInWithGoogle();
    if (res.error) {
      showToast(res.error.message, 'info');
    }
  };

  // Email / Password Login Success Handler
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Selamat datang, ${user.full_name}!`);

    if (pendingDraft) {
      setIsReportModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setIsAuthModalOpen(false);
    showToast('Berhasil keluar dari akun.', 'info');
  };

  // Report Gate Trigger
  const handleRequireAuth = (draftData: any) => {
    setPendingDraft(draftData);
    setIsReportModalOpen(false);
    setAuthReason(
      'Untuk memastikan keabsahan laporan jalan & mencegah spam, silakan login ke akun Anda sebelum mengirim.'
    );
    setIsAuthModalOpen(true);
  };

  // Submit Report
  const handleSubmitReport = async (reportData: {
    title: string;
    description: string;
    category: IncidentCategory;
    latitude: number;
    longitude: number;
    address: string;
    photo_url?: string;
  }) => {
    await addIncident({
      ...reportData,
      reporter_id: currentUser?.id,
      reporter_name: currentUser?.full_name || 'Warga Komunitas',
      reporter_avatar: currentUser?.avatar_url,
      status: 'active',
    });

    setPendingDraft(null);
    showToast('Laporan Anda berhasil dikirim dan disiarkan ke warga sekitar! 🎉');
  };

  // Handle Community Vote
  const handleVote = async (
    incidentId: string,
    type: 'still_happening' | 'resolved'
  ) => {
    const res = await voteIncident(incidentId, type);
    showToast(res.message, res.success ? 'success' : 'info');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#0B132B' }}>
      {/* 1. Full-screen Interactive Map */}
      <MapView
        userLat={userLat}
        userLon={userLon}
        incidents={incidents}
        selectedIncident={selectedIncident}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
      />

      {/* 2. Top Floating Search Bar & Filters */}
      <FloatingSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setAuthReason('');
          setIsAuthModalOpen(true);
        }}
        totalIncidentsCount={allIncidents.length}
      />

      {/* 3. Floating Action Buttons */}
      <FloatingActions
        onRecenter={refreshLocation}
        isLocating={isLocating}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        bottomOffset={selectedIncident ? 96 : 96}
      />

      {/* 4. Draggable Bottom Sheet */}
      <BottomSheet
        incidents={incidents}
        selectedIncident={selectedIncident}
        onSelectIncident={setSelectedIncident}
        onVote={handleVote}
        userVotes={userVotes}
        userLat={userLat}
        userLon={userLon}
      />

      {/* 5. Report Incident Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userLat={userLat}
        userLon={userLon}
        currentUser={currentUser}
        onRequireAuth={handleRequireAuth}
        onSubmitReport={handleSubmitReport}
        pendingDraft={pendingDraft}
      />

      {/* 6. Authentication Modal (Email/Password & Google SSO) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSignInWithGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        onLoginSuccess={handleLoginSuccess}
        reasonText={authReason}
      />

      {/* 7. Floating Toast Message */}
      {toastMessage && (
        <div className="toast-floating-container">
          <div className="toast-message-pill">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={17} color="#34d399" />
            ) : (
              <AlertCircle size={17} color="#38bdf8" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 8. App Opening Splash Screen */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          duration={2200}
        />
      )}
    </div>
  );
}
export default App;
