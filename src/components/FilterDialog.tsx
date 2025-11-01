import { useState, useEffect } from 'react';
import { SlidersHorizontal, Star, MessageSquare, Navigation, TrendingUp, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export type SortOption = 'rating' | 'distance' | 'price-low' | 'price-high' | 'reviews' | 'default';

interface FilterDialogProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  openOnly: boolean;
  onOpenOnlyChange: (openOnly: boolean) => void;
}

const FilterDialog = ({
  sortBy,
  onSortChange,
  minRating,
  onMinRatingChange,
  openOnly,
  onOpenOnlyChange,
}: FilterDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    onSortChange('default');
    onMinRatingChange(0);
    onOpenOnlyChange(false);
  };

  const hasActiveFilters = sortBy !== 'default' || minRating > 0 || openOnly;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <SlidersHorizontal className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter & Sort</DialogTitle>
          <DialogDescription>
            Customize how bars are displayed and sorted
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Sort Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sort By</Label>
            <RadioGroup value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="default" />
                <Label htmlFor="default" className="flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Recommended (Open first, then distance)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rating" id="rating" />
                <Label htmlFor="rating" className="flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>Highest Rating</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="distance" id="distance" />
                <Label htmlFor="distance" className="flex items-center gap-2 cursor-pointer">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span>Closest First</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reviews" id="reviews" />
                <Label htmlFor="reviews" className="flex items-center gap-2 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>Most Reviewed</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-low" id="price-low" />
                <Label htmlFor="price-low" className="flex items-center gap-2 cursor-pointer">
                  <span className="text-muted-foreground">$</span>
                  <span>Price: Low to High</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-high" id="price-high" />
                <Label htmlFor="price-high" className="flex items-center gap-2 cursor-pointer">
                  <span className="text-muted-foreground">$$$</span>
                  <span>Price: High to Low</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Minimum Rating Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Minimum Rating</Label>
            <RadioGroup value={minRating.toString()} onValueChange={(value) => onMinRatingChange(Number(value))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="rating-0" />
                <Label htmlFor="rating-0" className="cursor-pointer">All Ratings</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="rating-3" />
                <Label htmlFor="rating-3" className="flex items-center gap-1 cursor-pointer">
                  <span>3.0+</span>
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="rating-4" />
                <Label htmlFor="rating-4" className="flex items-center gap-1 cursor-pointer">
                  <span>4.0+</span>
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4.5" id="rating-45" />
                <Label htmlFor="rating-45" className="flex items-center gap-1 cursor-pointer">
                  <span>4.5+</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Open Now Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Status</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="open-only"
                checked={openOnly}
                onChange={(e) => onOpenOnlyChange(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="open-only" className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Show only bars that are open now</span>
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset All
          </Button>
          <Button onClick={() => setOpen(false)} className="flex-1">
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
