import { Heart, MapPin, Star } from 'lucide-react';
import { Bar } from '@/data/bars';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        <Badge className="absolute top-2 left-2 backdrop-blur-sm">
          {bar.type.replace('-', ' ')}
        </Badge>
      </div>
      
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{bar.name}</h3>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{bar.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          {bar.address}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{bar.description}</p>
        
        <div className="flex items-center gap-1 text-primary">
          {'$'.repeat(bar.priceLevel)}
          <span className="text-muted-foreground">{'$'.repeat(3 - bar.priceLevel)}</span>
        </div>
      </div>
    </Card>
  );
};

export default BarCard;
