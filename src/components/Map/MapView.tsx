import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORIES } from '../../types/incident';
import type { Incident } from '../../types/incident';

interface MapViewProps {
  userLat: number;
  userLon: number;
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  tileStyle?: string;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
}

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// SVG icons for marker pins
function getCategorySvgPath(category: string): string {
  switch (category) {
    case 'pothole':
      return `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`;
    case 'flood':
      return `<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 7 7 7s-1.57 1.06-2.29 2.06S3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.28-2.29.8-3.3"/>`;
    case 'accident':
      return `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`;
    case 'traffic':
      return `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>`;
    case 'streetlight':
      return `<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>`;
    case 'tree_fall':
      return `<path d="M12 10v12"/><path d="M12 10l-4-5h3L8 2h8l-3 3h3l-4 5z"/>`;
    default:
      return `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`;
  }
}

export const MapView: React.FC<MapViewProps> = ({
  userLat,
  userLon,
  incidents,
  selectedIncident,
  onSelectIncident,
  isPickingLocation,
  pickedLocation,
  onPickLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const incidentMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const pickMarkerRef = useRef<L.Marker | null>(null);

  // 1. Initialize Map with bright standard OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLon],
      zoom: 14,
      zoomControl: false,
    });

    const tileLayer = L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Invalidate map size to adapt to full-screen container
    map.invalidateSize();
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Handle map click for location picking
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onPickLocation) {
        onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. User GPS Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const userIcon = L.divIcon({
      className: 'user-radar-container',
      html: `
        <div class="user-radar-marker">
          <div class="user-radar-wave"></div>
          <div class="user-dot"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLon]);
    } else {
      userMarkerRef.current = L.marker([userLat, userLon], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current);
    }
  }, [userLat, userLon]);

  // 4. Incident Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const existingMarkers = incidentMarkersRef.current;

    // Set of current incident IDs
    const currentIds = new Set(incidents.map((i) => i.id));

    // Remove markers that are no longer present
    existingMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        existingMarkers.delete(id);
      }
    });

    // Add or update markers
    incidents.forEach((incident) => {
      const cat = CATEGORIES[incident.category] || CATEGORIES.other;
      const isSelected = selectedIncident?.id === incident.id;
      const isResolved = incident.status === 'resolved';

      const pinBgColor = isResolved ? '#64748b' : cat.color;
      const pinScale = isSelected ? 'scale(1.2)' : 'scale(1)';

      const markerHtml = `
        <div class="custom-pin-marker" style="transform: ${pinScale};">
          ${!isResolved ? `<div class="pin-pulse" style="background: ${pinBgColor};"></div>` : ''}
          <div class="pin-bubble" style="background: ${pinBgColor}; ${isSelected ? 'border-color: #38bdf8; box-shadow: 0 0 20px #38bdf8;' : ''}">
            <span class="pin-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                ${getCategorySvgPath(incident.category)}
              </svg>
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'incident-div-icon',
        html: markerHtml,
        iconSize: [42, 42],
        iconAnchor: [21, 38],
      });

      if (existingMarkers.has(incident.id)) {
        const marker = existingMarkers.get(incident.id)!;
        marker.setLatLng([incident.latitude, incident.longitude]);
        marker.setIcon(customIcon);
        marker.setZIndexOffset(isSelected ? 900 : 100);
      } else {
        const marker = L.marker([incident.latitude, incident.longitude], {
          icon: customIcon,
          zIndexOffset: isSelected ? 900 : 100,
        }).addTo(map);

        marker.on('click', () => {
          onSelectIncident(incident);
        });

        existingMarkers.set(incident.id, marker);
      }
    });
  }, [incidents, selectedIncident, onSelectIncident]);

  // 5. Center map on selected incident smoothly
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedIncident) return;
    mapInstanceRef.current.flyTo(
      [selectedIncident.latitude, selectedIncident.longitude],
      16,
      { duration: 0.8 }
    );
  }, [selectedIncident]);

  // 6. Location picking marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (isPickingLocation && pickedLocation) {
      const pickIcon = L.divIcon({
        className: 'pick-loc-pin',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-30px);">
            <div style="background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.4);border:1px solid #fff;margin-bottom:4px;">
              📍 Titik Laporan
            </div>
            <div style="width:24px;height:24px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 0 16px rgba(239,68,68,0.8);"></div>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 30],
      });

      if (pickMarkerRef.current) {
        pickMarkerRef.current.setLatLng([pickedLocation.lat, pickedLocation.lng]);
      } else {
        pickMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
          icon: pickIcon,
          zIndexOffset: 1200,
        }).addTo(mapInstanceRef.current);
      }
    } else {
      if (pickMarkerRef.current) {
        pickMarkerRef.current.remove();
        pickMarkerRef.current = null;
      }
    }
  }, [isPickingLocation, pickedLocation]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
};
