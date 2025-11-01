import { useState, useEffect } from 'react';
import { Map, List, Heart, AlertCircle } from 'lucide-react';
import { Bar, BarType } from '@/data/bars';
import { useBars } from '@/hooks/use-bars';
import MapView from '@/components/MapView';
import BarCard from '@/components/BarCard';
import BarDetail from '@/components/BarDetail';
import FilterBar from '@/components/FilterBar';
import FilterDialog, { SortOption } from '@/components/FilterDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const { bars, loading, error, refetch, usingMockData } = useBars();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [view, setView] = useState<'map' | 'list'>('list');
  const [selectedType, setSelectedType] = useState<BarType | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [minRating, setMinRating] = useState<number>(0);
  const [openOnly, setOpenOnly] = useState<boolean>(false);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('bar-favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('bar-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFavorite = (barId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(barId)) {
        next.delete(barId);
      } else {
        next.add(barId);
      }
      return next;
    });
  };

  const filteredBars = bars
    .filter((bar) => {
      if (selectedType && bar.type !== selectedType) return false;
      if (showFavoritesOnly && !favorites.has(bar.id)) return false;
      if (minRating > 0 && bar.rating < minRating) return false;
      if (openOnly && !bar.isOpenNow) return false;
      return true;
    })
    .sort((a, b) => {
      // Apply custom sorting based on sortBy option
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        
        case 'distance': {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        }
        
        case 'reviews': {
          // Extract review count from description (format: "Type • X reviews")
          const getReviewCount = (bar: Bar) => {
            const match = bar.description.match(/(\d+)\s+reviews?/i);
            return match ? parseInt(match[1]) : 0;
          };
          return getReviewCount(b) - getReviewCount(a);
        }
        
        case 'price-low':
          return a.priceLevel - b.priceLevel;
        
        case 'price-high':
          return b.priceLevel - a.priceLevel;
        
        case 'default':
        default: {
          // Default: Prioritize bars with open/closed status
          const aHasStatus = a.isOpenNow !== undefined;
          const bHasStatus = b.isOpenNow !== undefined;
          
          if (aHasStatus && !bHasStatus) return -1;
          if (!aHasStatus && bHasStatus) return 1;
          
          // Within bars with status, prioritize open bars
          if (aHasStatus && bHasStatus) {
            if (a.isOpenNow && !b.isOpenNow) return -1;
            if (!a.isOpenNow && b.isOpenNow) return 1;
          }
          
          // Then sort by distance (closest first)
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          
          // Finally sort by rating (highest first)
          return b.rating - a.rating;
        }
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Baradvisor
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover the best bars in Bergen 
                {loading && ' • Loading...'}
                {usingMockData && ' • Using demo data'}
              </p>
            </div>
            <div className="flex gap-2">
              <FilterDialog
                sortBy={sortBy}
                onSortChange={setSortBy}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                openOnly={openOnly}
                onOpenOnlyChange={setOpenOnly}
              />
              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites ({favorites.size})
              </Button>
            </div>
          </div>
          
          <FilterBar selectedType={selectedType} onTypeSelect={setSelectedType} />
        </div>
      </header>

      {/* View Toggle */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={view} onValueChange={(v) => setView(v as 'map' | 'list')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading bars</AlertTitle>
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="h-8 w-8 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading bars from Yelp...</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {view === 'map' ? (
              <div className="h-[calc(100vh-240px)] rounded-lg overflow-hidden">
                <MapView
                  bars={filteredBars}
                  selectedBar={selectedBar}
                  onBarSelect={setSelectedBar}
                  favorites={favorites}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBars.map((bar) => (
                  <BarCard
                    key={bar.id}
                    bar={bar}
                    isFavorite={favorites.has(bar.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={() => setSelectedBar(bar)}
                  />
                ))}
              </div>
            )}

            {filteredBars.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No bars found matching your filters.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bar Detail Modal */}
      {selectedBar && (
        <div className="fixed inset-0 z-[9999] md:flex md:items-center md:justify-center md:p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedBar(null)}
          />
          <div className="relative w-full md:max-w-2xl md:rounded-lg md:overflow-hidden animate-in slide-in-from-bottom duration-300 md:animate-in md:zoom-in-95">
            <BarDetail
              bar={selectedBar}
              isFavorite={favorites.has(selectedBar.id)}
              onToggleFavorite={toggleFavorite}
              onClose={() => setSelectedBar(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
