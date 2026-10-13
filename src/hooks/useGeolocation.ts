import { useState, useEffect, useCallback } from 'react';

export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  isLocated: boolean;
  isLocating: boolean;
  error?: string | null;
}

// Default center: DKI Jakarta (Kawasan Bundaran HI / Thamrin)
const DEFAULT_LATITUDE = -6.2088;
const DEFAULT_LONGITUDE = 106.8456;

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    isLocated: false,
    isLocating: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolokasi tidak didukung oleh browser Anda.',
        isLocating: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          isLocated: true,
          isLocating: false,
          error: null,
        });
      },
      (err) => {
        console.warn('Geolocation warning:', err.message);
        setLocation((prev) => ({
          ...prev,
          isLocating: false,
          error: 'Izin GPS belum diberikan atau lokasi tidak akurat.',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...location,
    refreshLocation: requestLocation,
  };
}
