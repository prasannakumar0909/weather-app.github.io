import { useCallback, useState } from 'react';
import { geoClient } from '@/api/client';
import type { SavedCity } from '@/types/weather';

interface ReverseGeoResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface UseGeolocationReturn {
  loading: boolean;
  error: string | null;
  request: () => Promise<SavedCity | null>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (): Promise<SavedCity | null> => {
    setError(null);
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return null;
    }
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 1000 * 60 * 10,
        });
      });

      const { latitude: lat, longitude: lon } = position.coords;

      // Reverse-geocode for a friendly display name
      let displayName = `Near (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      let country = '';
      try {
        const { data } = await geoClient.get<ReverseGeoResult[]>('/reverse', {
          params: { lat, lon, limit: 1 },
        });
        if (data?.[0]) {
          displayName = data[0].state
            ? `${data[0].name}, ${data[0].state}`
            : data[0].name;
          country = data[0].country;
        }
      } catch {
        // If reverse geocode fails, we still have coords.
      }

      return {
        id: `geo-${lat.toFixed(3)}-${lon.toFixed(3)}`,
        lat,
        lon,
        country,
        displayName,
        addedAt: Date.now(),
      };
    } catch (e) {
      const err = e as GeolocationPositionError | Error;
      if ('code' in err) {
        if (err.code === 1) setError('Permission denied. Try searching by zip instead.');
        else if (err.code === 2) setError('Position unavailable.');
        else if (err.code === 3) setError('Location request timed out.');
        else setError('Could not get your location.');
      } else {
        setError(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
};
