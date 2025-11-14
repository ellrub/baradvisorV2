import { useState, useEffect } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
}

// Bergen, Norway coordinates (fallback)
const BERGEN_COORDINATES: Coordinates = {
  latitude: 60.3913,
  longitude: 5.3221,
};

/**
 * Custom hook to get user's geolocation
 * Falls back to Bergen coordinates if geolocation fails or is denied
 */
export function useGeolocation(): GeolocationState {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setCoordinates(BERGEN_COORDINATES);
      setLoading(false);
      return;
    }

    // Request user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
        setError(null);
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Using Bergen city center.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Using Bergen city center.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using Bergen city center.';
            break;
        }
        
        console.warn('Geolocation error:', errorMessage);
        setError(errorMessage);
        setCoordinates(BERGEN_COORDINATES);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { coordinates, loading, error };
}
