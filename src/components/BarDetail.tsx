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
}

const BarDetail = ({ bar, isFavorite, onToggleFavorite, onClose }: BarDetailProps) => {
  const [showReviewsInfo, setShowReviewsInfo] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300 md:relative md:bg-transparent md:backdrop-blur-none">
      <div className="h-full overflow-y-auto">
        <div className="relative">
          <img
            src={bar.image}
            alt={bar.name}
            className="w-full h-64 md:h-80 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm">
            {bar.type.replace('-', ' ')}
          </Badge>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">{bar.name}</h2>
                {bar.isOpenNow !== undefined && (
                  <Badge variant={bar.isOpenNow ? "default" : "secondary"} className="mt-1">
                    {bar.isOpenNow ? 'Open Now' : 'Closed'}
                  </Badge>
                )}
              </div>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="icon"
                onClick={() => onToggleFavorite(bar.id)}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
                />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">{bar.rating}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-primary">{getPriceRangeInNOK(bar.priceLevel)}</span>
                  <span className="text-xs text-muted-foreground">per drink</span>
                </div>
              </div>
              <Button size="sm">
                Get Directions
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{bar.address}</span>
              </div>

              {bar.distance !== undefined && (
                <div className="flex items-center text-muted-foreground">
                  <Navigation className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{formatDistance(bar.distance)}</span>
                </div>
              )}

              {bar.businessHours && (
                <div className="flex items-start text-muted-foreground">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{formatBusinessHours(bar.businessHours.hours)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">About</h3>
            <p className="text-muted-foreground leading-relaxed">{bar.description}</p>
            
            {bar.categories && bar.categories.length > 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {bar.categories.map((category, index) => (
                  <Badge key={index} variant="outline">
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
                  className="text-primary hover:underline"
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
              className="w-full"
              onClick={() => setShowReviewsInfo(!showReviewsInfo)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {showReviewsInfo ? 'Hide Reviews Info' : 'Reviews'}
            </Button>

            {showReviewsInfo && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
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
