import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  MapPin,
  AlertCircle,
  Send,
  Loader2,
} from 'lucide-react';
import { CATEGORIES } from '../../types/incident';
import type { IncidentCategory, UserProfile } from '../../types/incident';
import { uploadIncidentPhoto } from '../../lib/supabase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number;
  userLon: number;
  currentUser: UserProfile | null;
  onRequireAuth: (pendingReportDraft: any) => void;
  onSubmitReport: (reportData: {
    title: string;
    description: string;
    category: IncidentCategory;
    latitude: number;
    longitude: number;
    address: string;
    photo_url?: string;
  }) => Promise<void>;
  pendingDraft?: any | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLon,
  currentUser,
  onRequireAuth,
  onSubmitReport,
  pendingDraft,
}) => {
  const [category, setCategory] = useState<IncidentCategory>(
    pendingDraft?.category || 'pothole'
  );
  const [title, setTitle] = useState<string>(pendingDraft?.title || '');
  const [description, setDescription] = useState<string>(
    pendingDraft?.description || ''
  );
  const [address, setAddress] = useState<string>(
    pendingDraft?.address || 'Kawasan Sekitar Lokasi GPS Anda'
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    pendingDraft?.photo_url || null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Mohon masukkan judul singkat laporan.');
      return;
    }

    const draftData = {
      title,
      description,
      category,
      latitude: userLat,
      longitude: userLon,
      address,
      photo_url: photoPreview,
    };

    // If user is NOT logged in, gate via Google Sign-In
    if (!currentUser) {
      onRequireAuth(draftData);
      return;
    }

    try {
      setIsSubmitting(true);
      let uploadedPhotoUrl = photoPreview || '';

      if (photoFile) {
        uploadedPhotoUrl = await uploadIncidentPhoto(photoFile);
      }

      await onSubmitReport({
        title,
        description,
        category,
        latitude: userLat,
        longitude: userLon,
        address,
        photo_url: uploadedPhotoUrl || undefined,
      });

      onClose();
    } catch (err: any) {
      console.error('Error submitting report:', err);
      alert('Terjadi kendala saat mengirim laporan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <AlertCircle size={20} color="#10b981" />
            <h3 className="modal-title">Laporkan Gangguan Jalan</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Category Selector */}
          <div className="form-group">
            <label className="form-label">
              <span>Pilih Kategori Gangguan</span>
            </label>
            <div className="category-picker-grid">
              {(Object.keys(CATEGORIES) as IncidentCategory[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    className={`category-card-option ${isSelected ? 'active' : ''}`}
                    onClick={() => setCategory(catKey)}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: cat.bgColor,
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 13 }}>●</span>
                    </div>
                    <span className="category-card-name">
                      {cat.label.split(' / ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Capture / Upload */}
          <div className="form-group">
            <label className="form-label">
              <span>Bukti Foto Lapangan (Opsional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />

            <div
              className="photo-uploader-box"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt="Pratinjau Foto"
                    className="photo-preview-image"
                  />
                  <div className="photo-change-badge">
                    <Camera size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Ganti Foto
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                    }}
                  >
                    <Camera size={22} />
                  </div>
                  <div style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>
                    Ambil Foto Kamera / Unggah Berkas
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Mendukung JPG, PNG, WebP hingga 5MB
                  </div>
                </>
              )}
            </div>
          </div>

          {/* GPS Coordinates & Address */}
          <div className="form-group">
            <label className="form-label">
              <span>Koordinat & Lokasi GPS</span>
            </label>
            <div className="location-status-badge">
              <div className="location-coord-text">
                <MapPin size={15} color="#3b82f6" />
                <span>
                  {userLat.toFixed(5)}, {userLon.toFixed(5)}
                </span>
              </div>
              <span style={{ color: '#10b981', fontSize: 11, fontWeight: 700 }}>
                ● GPS Akurat
              </span>
            </div>
            <input
              type="text"
              className="form-input-text"
              placeholder="Nama Jalan / Patokan Lokasi (cth: Depan Ruko No. 12)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Title & Description */}
          <div className="form-group">
            <label className="form-label">
              <span>Judul Laporan Singkat</span>
            </label>
            <input
              type="text"
              className="form-input-text"
              placeholder="Contoh: Lubang Aspal Dalam Dekat Lampu Merah"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Keterangan Tambahan</span>
            </label>
            <textarea
              className="form-input-text form-textarea"
              placeholder="Jelaskan kondisi jalan, lajur yang terimbas, atau bahaya..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer Action */}
          <div className="modal-footer" style={{ margin: '0 -20px -20px -20px' }}>
            <button
              type="submit"
              className="btn-primary-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mengirim Laporan...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Kirim Laporan Komunitas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
