import React from 'react';
import { Crosshair, Plus, Layers } from 'lucide-react';

interface FloatingActionsProps {
  onRecenter: () => void;
  isLocating: boolean;
  onOpenReportModal: () => void;
  tileStyle: 'osm' | 'dark' | 'voyager' | 'satellite';
  onCycleTileStyle: () => void;
  bottomOffset?: number;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onRecenter,
  isLocating,
  onOpenReportModal,
  tileStyle,
  onCycleTileStyle,
  bottomOffset = 110,
}) => {
  return (
    <div
      className="floating-actions-container"
      style={{ bottom: `${bottomOffset}px` }}
    >
      {/* Map Tile Style Switcher */}
      <button
        className="floating-btn"
        onClick={onCycleTileStyle}
        title={`Ganti Gaya Peta (Saat ini: ${tileStyle})`}
      >
        <Layers size={20} color="#94a3b8" />
      </button>

      {/* Recenter Location Button */}
      <button
        className={`floating-btn location-btn ${isLocating ? 'locating' : ''}`}
        onClick={onRecenter}
        title="Pusatkan ke Lokasi Saya (GPS)"
      >
        <Crosshair size={22} color={isLocating ? '#3b82f6' : '#f8fafc'} />
      </button>

      {/* Main Report Incident (+) Button */}
      <button
        className="floating-btn report-btn"
        onClick={onOpenReportModal}
        title="Laporkan Gangguan Jalan Baru"
      >
        <Plus size={30} strokeWidth={2.8} />
      </button>
    </div>
  );
};
