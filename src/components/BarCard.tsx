import { Heart, MapPin, Star, Navigation } from 'lucide-react';
import { Bar } from '@/data/bars';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPriceRangeInNOK, formatDistance } from '@/lib/utils';

interface BarCardProps {
  bar: Bar;
  isFavorite: boolean;
  onToggleFavorite: (barId: string) => void;
  onClick: () => void;
}

const BarCard = ({ bar, isFavorite, onToggleFavorite, onClick }: BarCardProps) => {
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-glow bg-gradient-card border-border"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={bar.image}
          alt={bar.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(bar.id);
          }}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-primary text-primary' : 'text-foreground'
            }`}
          />
        </Button>
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className="backdrop-blur-sm">
            {bar.type.replace('-', ' ')}
          </Badge>
          {bar.isOpenNow !== undefined && (
            <Badge variant={bar.isOpenNow ? "default" : "secondary"} className="backdrop-blur-sm">
              {bar.isOpenNow ? 'Open' : 'Closed'}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">{bar.name}</h3>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full flex-shrink-0">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{bar.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{bar.address.split(',')[0]}</span>
          </div>
          {bar.distance !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              <Navigation className="h-3 w-3" />
              <span>{formatDistance(bar.distance)}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{bar.description}</p>
        
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium text-primary">{getPriceRangeInNOK(bar.priceLevel)}</span>
          <span className="text-muted-foreground">per drink</span>
        </div>
      </div>
    </Card>
  );
};

export default BarCard;
