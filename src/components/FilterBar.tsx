import { BarType, barTypes } from '@/data/bars';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterBarProps {
  selectedType: BarType | null;
  onTypeSelect: (type: BarType | null) => void;
}

const FilterBar = ({ selectedType, onTypeSelect }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={selectedType === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeSelect(null)}
        className="whitespace-nowrap"
      >
        All Bars
      </Button>
      {barTypes.map((type) => (
        <Button
          key={type.value}
          variant={selectedType === type.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeSelect(type.value)}
          className="whitespace-nowrap"
        >
          {type.label}
          {selectedType === type.value && (
            <X className="ml-2 h-3 w-3" />
          )}
        </Button>
      ))}
    </div>
  );
};

export default FilterBar;
