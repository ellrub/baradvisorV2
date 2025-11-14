import { useState, useEffect } from 'react';
import { Bar, bars as mockBars } from '@/data/bars';
import { fetchBarsFromYelp } from '@/services/yelp';
import { config } from '@/config/app';

interface UseBarsResult {
  bars: Bar[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  usingMockData: boolean;
  userLocation: { latitude: number; longitude: number } | null;
}

interface UseBarsOptions {
  coordinates: { latitude: number; longitude: number } | null;
  radius?: number;
}

/**
 * Custom hook to fetch and manage bars data from Yelp API
 * Falls back to mock data if API is disabled or fails
 * Uses provided coordinates to find nearby bars
 */
export function useBars({ coordinates, radius = 10000 }: UseBarsOptions): UseBarsResult {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState<boolean>(config.useApi);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(!config.useApi);

  useEffect(() => {
    const fetchBars = async () => {
      // If API is disabled, use mock data immediately
      if (!config.useApi) {
        setBars(mockBars);
        setUsingMockData(true);
        setLoading(false);
        return;
      }

      // Wait for coordinates before fetching bars
      if (!coordinates) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`🔍 Fetching bars with radius: ${radius}m (${(radius / 1000).toFixed(1)}km)`);
        const data = await fetchBarsFromYelp(coordinates, radius);
        console.log(`✅ Found ${data.length} bars within ${(radius / 1000).toFixed(1)}km`);
        setBars(data);
        setUsingMockData(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bars';
        setError(errorMessage);
        console.error('Error fetching bars:', err);
        
        // Fallback to mock data on error
        console.log('Falling back to mock data...');
        setBars(mockBars);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when we have coordinates
    if (coordinates) {
      fetchBars();
    }
  }, [coordinates, radius]); // Now radius changes will trigger re-fetch

  const refetch = async () => {
    if (!coordinates) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBarsFromYelp(coordinates, radius);
      setBars(data);
      setUsingMockData(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bars';
      setError(errorMessage);
      setBars(mockBars);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    bars,
    loading,
    error,
    refetch,
    usingMockData,
    userLocation: coordinates,
  };
}
