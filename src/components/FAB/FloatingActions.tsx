import React from 'react';
import { Crosshair, Plus } from 'lucide-react';

interface FloatingActionsProps {
  onRecenter: () => void;
  isLocating: boolean;
  onOpenReportModal: () => void;
  tileStyle?: string;
  onCycleTileStyle?: () => void;
  bottomOffset?: number;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onRecenter,
  isLocating,
  onOpenReportModal,
  bottomOffset = 110,
}) => {
  return (
    <div
      className="floating-actions-container"
      style={{ bottom: `${bottomOffset}px` }}
    >
      {/* Recenter Location Button */}
      <button
        className={`floating-btn location-btn ${isLocating ? 'locating' : ''}`}
        onClick={onRecenter}
        title="Pusatkan ke Lokasi Saya (GPS)"
      >
        <Crosshair size={22} color={isLocating ? '#38bdf8' : '#f8fafc'} />
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
