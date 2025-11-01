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
}

/**
 * Custom hook to fetch and manage bars data from Foursquare API
 * Falls back to mock data if API is disabled or fails
 */
export function useBars(): UseBarsResult {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState<boolean>(config.useApi);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(!config.useApi);

  const fetchBars = async () => {
    // If API is disabled, use mock data immediately
    if (!config.useApi) {
      setBars(mockBars);
      setUsingMockData(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchBarsFromYelp();
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

  useEffect(() => {
    fetchBars();
  }, []);

  return {
    bars,
    loading,
    error,
    refetch: fetchBars,
    usingMockData,
  };
}
