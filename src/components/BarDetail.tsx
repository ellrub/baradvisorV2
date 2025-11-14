import { useState } from 'react';
import { X, MapPin, Star, Heart, MessageSquare, AlertCircle, Phone, Clock, Navigation } from 'lucide-react';
import { Bar } from '@/data/bars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPriceRangeInNOK, formatDistance, formatBusinessHours } from '@/lib/utils';

interface BarDetailProps {
  bar: Bar;
  isFavorite: boolean;
  onToggleFavorite: (barId: string) => void;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
  onShowRoute?: (bar: Bar) => void;
}

const BarDetail = ({ bar, isFavorite, onToggleFavorite, onClose, userLocation, onShowRoute }: BarDetailProps) => {
  const [showReviewsInfo, setShowReviewsInfo] = useState(false);
  
  const handleGetDirections = () => {
    // If we have the onShowRoute callback, use map routing
    if (onShowRoute && userLocation) {
      onShowRoute(bar);
      return;
    }
    
    // Fallback to Google Maps if no route handler or user location
    const [lng, lat] = bar.coordinates;
    if (userLocation) {
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const destination = `${lat},${lng}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        '_blank'
      );
    }
  };
  
  return (
    <div className="h-full w-full bg-background md:bg-transparent md:backdrop-blur-none">
      <div className="h-full overflow-y-auto overscroll-contain">
        <div className="relative">
          <img
            src={bar.image}
            alt={bar.name}
            className="w-full h-48 sm:h-64 md:h-80 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <Badge className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-background/80 backdrop-blur-sm text-xs sm:text-sm">
            {bar.type.replace('-', ' ')}
          </Badge>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-safe">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{bar.name}</h2>
                  {bar.isOpenNow !== undefined && (
                    <Badge variant={bar.isOpenNow ? "default" : "secondary"} className="w-fit text-xs flex-shrink-0">
                      {bar.isOpenNow ? 'Open Now' : 'Closed'}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="icon"
                className="flex-shrink-0"
                onClick={() => onToggleFavorite(bar.id)}
              >
                <Heart
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`}
                />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 bg-primary/10 px-2.5 sm:px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                  <span className="font-semibold text-sm sm:text-base">{bar.rating}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-primary text-sm sm:text-base">{getPriceRangeInNOK(bar.priceLevel)}</span>
                  <span className="text-xs text-muted-foreground">per drink</span>
                </div>
              </div>
              <Button size="sm" onClick={handleGetDirections} className="w-full sm:w-auto text-sm">
                Get Directions
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start text-muted-foreground text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span className="break-words">{bar.address}</span>
              </div>

              {bar.distance !== undefined && (
                <div className="flex items-center text-muted-foreground text-sm sm:text-base">
                  <Navigation className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  <span>{formatDistance(bar.distance)}</span>
                </div>
              )}

              {bar.businessHours && (
                <div className="flex items-start text-muted-foreground text-sm sm:text-base">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{formatBusinessHours(bar.businessHours.hours)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold">About</h3>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{bar.description}</p>
            
            {bar.categories && bar.categories.length > 1 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                {bar.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {bar.displayPhone && (
              <div className="flex items-center gap-2 pt-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${bar.phone}`}
                  className="text-primary hover:underline text-sm sm:text-base"
                >
                  {bar.displayPhone}
                </a>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full text-sm sm:text-base"
              onClick={() => setShowReviewsInfo(!showReviewsInfo)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {showReviewsInfo ? 'Hide Reviews Info' : 'Reviews'}
            </Button>

            {showReviewsInfo && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Reviews are not available in-app due to Yelp API free tier limitations. 
                  The reviews endpoint requires a paid plan or special approval.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarDetail;
