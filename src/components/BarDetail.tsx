import { X, MapPin, Star, Heart } from 'lucide-react';
import { Bar } from '@/data/bars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BarDetailProps {
  bar: Bar;
  isFavorite: boolean;
  onToggleFavorite: (barId: string) => void;
  onClose: () => void;
}

const BarDetail = ({ bar, isFavorite, onToggleFavorite, onClose }: BarDetailProps) => {
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
              <h2 className="text-3xl font-bold">{bar.name}</h2>
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold">{bar.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-primary text-lg">
                {'$'.repeat(bar.priceLevel)}
                <span className="text-muted-foreground">{'$'.repeat(3 - bar.priceLevel)}</span>
              </div>
            </div>

            <div className="flex items-start text-muted-foreground">
              <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{bar.address}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">About</h3>
            <p className="text-muted-foreground leading-relaxed">{bar.description}</p>
          </div>

          <div className="pt-4">
            <Button className="w-full" size="lg">
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarDetail;
