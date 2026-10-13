import React, { useState, useRef } from 'react';
import {
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  Navigation,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { CATEGORIES } from '../../types/incident';
import type { Incident } from '../../types/incident';

interface BottomSheetProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident | null) => void;
  onVote: (incidentId: string, type: 'still_happening' | 'resolved') => void;
  userVotes: Record<string, 'still_happening' | 'resolved'>;
  userLat: number;
  userLon: number;
}

export type SheetSnapState = 'collapsed' | 'half' | 'expanded';

export const BottomSheet: React.FC<BottomSheetProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onVote,
  userVotes,
}) => {
  const [snapState, setSnapState] = useState<SheetSnapState>('collapsed');
  const touchStartY = useRef<number>(0);

  // Toggle snap states sequentially
  const handleToggleSnap = () => {
    if (selectedIncident) {
      // In detail view, toggling expands or collapses
      setSnapState((prev) => (prev === 'collapsed' ? 'expanded' : 'collapsed'));
    } else {
      if (snapState === 'collapsed') setSnapState('half');
      else if (snapState === 'half') setSnapState('expanded');
      else setSnapState('collapsed');
    }
  };

  // Touch drag gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.touches[0].clientY;
    if (diff > 50) {
      // Swipe up
      if (snapState === 'collapsed') setSnapState('half');
      else if (snapState === 'half') setSnapState('expanded');
    } else if (diff < -50) {
      // Swipe down
      if (snapState === 'expanded') setSnapState('half');
      else if (snapState === 'half') setSnapState('collapsed');
      else if (selectedIncident) onSelectIncident(null);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateStr: string) => {
    const diffHours = Math.round(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 3600)
    );
    if (diffHours <= 0) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  // Format hours remaining before expiry
  const formatHoursRemaining = (dateStr: string) => {
    const diffHours = Math.round(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 3600)
    );
    if (diffHours <= 0) return 'Kedaluwarsa';
    return `${diffHours} jam lagi`;
  };

  // Handle open Google Maps navigation
  const handleOpenMaps = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, '_blank');
  };

  // Handle Share
  const handleShare = (incident: Incident) => {
    if (navigator.share) {
      navigator.share({
        title: `CityReport: ${incident.title}`,
        text: `Pantauan gangguan jalan: ${incident.title} di ${incident.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `🚨 CityReport: ${incident.title}\n📍 Lokasi: ${incident.address}\nStatus: ${incident.votes_still_happening} warga mengonfirmasi masih terjadi.`
      );
      alert('Teks laporan berhasil disalin ke clipboard!');
    }
  };

  const activeSnapClass =
    selectedIncident && snapState === 'collapsed'
      ? 'bottom-sheet-half'
      : `bottom-sheet-${snapState}`;

  return (
    <div
      className={`bottom-sheet-container ${activeSnapClass}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Handle Bar */}
      <div className="sheet-handle-wrapper" onClick={handleToggleSnap}>
        <div className="sheet-handle-bar" />
      </div>

      {/* Peek Bar / Summary when collapsed or header */}
      <div className="sheet-peek-header">
        <div className="peek-title-group">
          <div className="peek-icon-alert">
            <AlertTriangle size={17} />
          </div>
          <div>
            <div className="peek-title">
              {selectedIncident ? 'Detail Gangguan' : `${incidents.length} Gangguan di Sekitar`}
            </div>
            <div className="peek-subtitle">
              {selectedIncident
                ? selectedIncident.address
                : 'Geser ke atas untuk melihat daftar & rute alternatif'}
            </div>
          </div>
        </div>

        <button className="sheet-expand-toggle-btn" onClick={handleToggleSnap}>
          {snapState === 'expanded' ? (
            <>
              <ChevronDown size={14} /> Kecilkan
            </>
          ) : (
            <>
              <ChevronUp size={14} /> {snapState === 'collapsed' ? 'Lihat Semua' : 'Perluas'}
            </>
          )}
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="sheet-content-body">
        {selectedIncident ? (
          /* ================= DETAIL VIEW ================= */
          <div className="detail-view-container animate-fade-in">
            {/* Top Navigation */}
            <div className="detail-nav-bar">
              <button
                className="back-btn"
                onClick={() => onSelectIncident(null)}
              >
                <ArrowLeft size={14} /> Kembali ke Daftar
              </button>
              <div
                className="category-tag"
                style={{
                  color: CATEGORIES[selectedIncident.category].color,
                  backgroundColor: CATEGORIES[selectedIncident.category].bgColor,
                }}
              >
                {CATEGORIES[selectedIncident.category].label}
              </div>
            </div>

            {/* Photo Preview Banner */}
            {selectedIncident.photo_url && (
              <img
                src={selectedIncident.photo_url}
                alt={selectedIncident.title}
                className="detail-image-banner"
              />
            )}

            {/* Title & Location */}
            <div className="detail-title-section">
              <h2 className="detail-title">{selectedIncident.title}</h2>
              <div className="detail-address-box">
                <MapPin size={15} color="#38bdf8" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{selectedIncident.address}</span>
              </div>
            </div>

            {/* Description */}
            {selectedIncident.description && (
              <div className="detail-description-box">
                {selectedIncident.description}
              </div>
            )}

            {/* Expiration Notice & Community Count */}
            <div className="expiration-bar-card">
              <div className="expiration-text">
                <Clock size={14} />
                <span>
                  Kedaluwarsa: {formatHoursRemaining(selectedIncident.expires_at)}
                </span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>
                {formatTimeAgo(selectedIncident.created_at)}
              </div>
            </div>

            {/* Community Validation Box */}
            <div className="validation-action-box">
              <div className="validation-box-title">
                <span>Validasi Komunitas Warga</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  Tanpa login untuk melihat
                </span>
              </div>

              <div className="validation-buttons-row">
                <button
                  className={`btn-confirm-still ${
                    userVotes[selectedIncident.id] === 'still_happening' ? 'voted' : ''
                  }`}
                  onClick={() => onVote(selectedIncident.id, 'still_happening')}
                >
                  <Flame size={16} />
                  <span>Masih Terjadi ({selectedIncident.votes_still_happening})</span>
                </button>

                <button
                  className={`btn-confirm-resolved ${
                    userVotes[selectedIncident.id] === 'resolved' ? 'voted' : ''
                  }`}
                  onClick={() => onVote(selectedIncident.id, 'resolved')}
                >
                  <CheckCircle2 size={16} />
                  <span>Sudah Selesai ({selectedIncident.votes_resolved})</span>
                </button>
              </div>
            </div>

            {/* Reporter Profile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <img
                src={
                  selectedIncident.reporter_avatar ||
                  'https://api.dicebear.com/7.x/bottts/svg?seed=reporter'
                }
                alt="Pelapor"
                style={{ width: 28, height: 28, borderRadius: '50%' }}
              />
              <div style={{ fontSize: 12 }}>
                <div style={{ color: '#f8fafc', fontWeight: 600 }}>
                  Dilaporkan oleh {selectedIncident.reporter_name}
                </div>
                <div style={{ color: '#64748b', fontSize: 10 }}>
                  Kontributor Komunitas Terverifikasi
                </div>
              </div>
            </div>

            {/* Secondary Action Buttons (Maps & Share) */}
            <div className="detail-actions-row">
              <button
                className="btn-open-maps"
                onClick={() =>
                  handleOpenMaps(
                    selectedIncident.latitude,
                    selectedIncident.longitude
                  )
                }
              >
                <Navigation size={15} /> Rute di Google Maps
              </button>
              <button
                className="btn-share"
                onClick={() => handleShare(selectedIncident)}
                title="Bagikan Gangguan"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* ================= LIST VIEW ================= */
          <div className="incidents-list">
            {incidents.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px 10px',
                  color: '#64748b',
                  fontSize: 13,
                }}
              >
                <AlertTriangle size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p>Tidak ada laporan gangguan pada kategori ini.</p>
              </div>
            ) : (
              incidents.map((incident) => {
                const cat = CATEGORIES[incident.category] || CATEGORIES.other;
                return (
                  <div
                    key={incident.id}
                    className="incident-card"
                    onClick={() => {
                      onSelectIncident(incident);
                      if (snapState === 'collapsed') setSnapState('half');
                    }}
                  >
                    {incident.photo_url && (
                      <img
                        src={incident.photo_url}
                        alt={incident.title}
                        className="card-thumb"
                      />
                    )}

                    <div className="card-info">
                      <div>
                        <div className="card-top-row">
                          <span
                            className="category-tag"
                            style={{
                              color: cat.color,
                              backgroundColor: cat.bgColor,
                            }}
                          >
                            {cat.label.split(' / ')[0]}
                          </span>
                          {incident.distance_km !== undefined && (
                            <span className="distance-tag">
                              <Navigation size={11} /> {incident.distance_km} km
                            </span>
                          )}
                        </div>

                        <div className="card-title">{incident.title}</div>
                        <div className="card-address">{incident.address}</div>
                      </div>

                      <div className="card-footer-meta">
                        <div className="card-votes-pill">
                          <span className="vote-still-badge">
                            <Flame size={12} /> {incident.votes_still_happening}
                          </span>
                          <span className="vote-resolved-badge">
                            <CheckCircle2 size={12} /> {incident.votes_resolved}
                          </span>
                        </div>
                        <span className="time-ago">
                          {formatTimeAgo(incident.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
