import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search, Sparkles, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StartPageProps {
  onLocationSelected: (coordinates: { latitude: number; longitude: number }, locationName?: string) => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  addresstype?: string;
}

const StartPage = ({ onLocationSelected }: StartPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);

  const handleUseMyLocation = () => {
    setIsLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSelected({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }, 'Your Location');
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please search for a city instead.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try searching for a city.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or search for a city.';
            break;
        }
        
        setError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSearchCity = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      // Using OpenStreetMap's Nominatim API (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search for location');
      }

      const data = await response.json();

      if (data.length === 0) {
        setError('No locations found. Try a different search term.');
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      setError('Failed to search for location. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: NominatimResult) => {
    onLocationSelected(
      {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      },
      result.display_name
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchCity();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Baradvisor
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Discover the best bars around you
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Real-time ratings</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span>10km radius</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <span>Get directions</span>
            </div>
          </div>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Use My Location Card */}
          <Card className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer group">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Navigation className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Use My Location</h2>
                <p className="text-muted-foreground">
                  Allow location access to find bars near you instantly
                </p>
              </div>

              <Button
                onClick={handleUseMyLocation}
                disabled={isLoadingLocation}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white font-semibold py-6 text-lg shadow-lg shadow-primary/20"
              >
                {isLoadingLocation ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-2" />
                    Share My Location
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Search City Card */}
          <Card className="p-8 border-2 border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg hover:shadow-accent/10 cursor-pointer group">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-accent" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Search a City</h2>
                <p className="text-muted-foreground">
                  Enter any city name to explore bars in that area
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g., Oslo, Bergen, Trondheim..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 py-6 text-lg border-2 focus:border-accent"
                  />
                  <Button
                    onClick={handleSearchCity}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity px-6 py-6"
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="p-6 border-2 border-accent/20 shadow-lg shadow-accent/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Select a Location
            </h3>
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left p-4 rounded-lg border-2 border-muted hover:border-accent/40 hover:bg-accent/5 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-base group-hover:text-accent transition-colors">
                        {result.name || result.display_name.split(',')[0]}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.display_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Popular Cities Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Popular cities:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Bergen', 'Oslo', 'Trondheim', 'Stavanger', 'Kristiansand'].map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(city);
                  setTimeout(() => handleSearchCity(), 100);
                }}
                className="hover:border-primary/40 hover:bg-primary/5"
              >
                {city}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default StartPage;
