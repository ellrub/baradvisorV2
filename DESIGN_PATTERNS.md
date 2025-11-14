# Design Patterns in Baradvisor

This document provides detailed explanations and code examples of all design patterns used in the Baradvisor project.

---

## 1. Repository Pattern

**Purpose**: Separates business logic from data access logic, providing a clean abstraction layer between the data layer and business logic layer.

### **Where It's Used:**
- `src/hooks/use-bars.ts` (Business Logic Layer)
- `src/services/yelp.ts` (Data Access Layer)

### **How It Works:**

```typescript
// ============================================
// DATA ACCESS LAYER (Repository)
// File: src/services/yelp.ts
// ============================================

/**
 * Repository interface - abstracts data source details
 * Components don't need to know about Yelp API specifics
 */
export async function fetchBarsFromYelp(
  radius: number = 5000,
  limit: number = 50
): Promise<Bar[]> {
  // Handle API authentication
  if (!YELP_API_KEY || YELP_API_KEY === 'your_api_key_here') {
    throw new Error('Yelp API key is not configured.');
  }

  try {
    // Build query parameters
    const params = new URLSearchParams({
      latitude: BERGEN_COORDINATES.latitude.toString(),
      longitude: BERGEN_COORDINATES.longitude.toString(),
      radius: Math.min(radius, 40000).toString(),
      categories: 'bars,cocktailbars,pubs,sportsbars,winebars,breweries',
      limit: Math.min(limit, 50).toString(),
      sort_by: 'distance',
    });

    // Make HTTP request
    const response = await fetch(`${YELP_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${YELP_API_KEY.trim()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status}`);
    }

    const data: YelpSearchResponse = await response.json();
    
    // Transform external data format to internal format
    return data.businesses.map(convertToBar);
  } catch (error) {
    console.error('Error fetching bars from Yelp:', error);
    throw error;
  }
}

// ============================================
// BUSINESS LOGIC LAYER (Repository Consumer)
// File: src/hooks/use-bars.ts
// ============================================

/**
 * Business logic doesn't know about Yelp API details
 * It just calls the repository and handles the result
 */
export function useBars(): UseBarsResult {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState<boolean>(config.useApi);
  const [error, setError] = useState<string | null>(null);

  const fetchBars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simple repository call - no API details needed!
      const data = await fetchBarsFromYelp();
      
      setBars(data);
      setUsingMockData(false);
    } catch (err) {
      setError(err.message);
      // Fallback to mock data
      setBars(mockBars);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  return { bars, loading, error, refetch: fetchBars, usingMockData };
}

// ============================================
// PRESENTATION LAYER (Repository Consumer via Hook)
// File: src/pages/Index.tsx
// ============================================

const Index = () => {
  // Component doesn't know about API or data fetching
  // It just uses the hook interface
  const { bars, loading, error, refetch } = useBars();
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {bars.map(bar => <BarCard key={bar.id} bar={bar} />)}
    </div>
  );
};
```

### **Benefits:**
✅ **Separation of Concerns**: Data access logic isolated from business logic  
✅ **Testability**: Can mock `fetchBarsFromYelp()` for testing  
✅ **Flexibility**: Easy to swap Yelp API for another data source  
✅ **Maintainability**: API changes only affect service layer  
✅ **Reusability**: Multiple components can use same repository

### **Repository Pattern Layers:**

```
┌─────────────────────────────────────────┐
│     Presentation Layer (React)          │
│     - Components don't know about API   │
│     - Just consume data via hooks       │
└─────────────┬───────────────────────────┘
              │ uses
┌─────────────▼───────────────────────────┐
│     Business Logic Layer (Hooks)        │
│     - useBars() hook                    │
│     - State management                  │
│     - Error handling                    │
└─────────────┬───────────────────────────┘
              │ calls
┌─────────────▼───────────────────────────┐
│     Repository Layer (Services)         │
│     - fetchBarsFromYelp()              │
│     - API communication                 │
│     - Data transformation               │
└─────────────┬───────────────────────────┘
              │ queries
┌─────────────▼───────────────────────────┐
│     External Data Source                │
│     - Yelp Fusion API                   │
│     - Returns JSON data                 │
└─────────────────────────────────────────┘
```

---

## 2. Observer Pattern

**Purpose**: Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

### **Where It's Used:**
- React's `useState` and `useEffect` hooks (built-in)
- LocalStorage synchronization
- UI auto-updates on state changes

### **How It Works:**

```typescript
// ============================================
// OBSERVER PATTERN EXAMPLE 1: Favorites
// File: src/pages/Index.tsx
// ============================================

const Index = () => {
  // Subject: The favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Observer 1: Load favorites from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bar-favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []); // Runs once on mount
  
  // Observer 2: Save to LocalStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem(
      'bar-favorites', 
      JSON.stringify(Array.from(favorites))
    );
  }, [favorites]); // Observes 'favorites' for changes
  
  // Observer 3: All components re-render when favorites change
  return (
    <div>
      {/* BarCard observes isFavorite prop */}
      {bars.map((bar) => (
        <BarCard
          key={bar.id}
          bar={bar}
          isFavorite={favorites.has(bar.id)} // Re-renders when favorites change
          onToggleFavorite={toggleFavorite}
        />
      ))}
      
      {/* Button text observes favorites.size */}
      <Button>
        Favorites ({favorites.size}) {/* Auto-updates on change */}
      </Button>
    </div>
  );
};

// ============================================
// OBSERVER PATTERN EXAMPLE 2: Filter State
// File: src/pages/Index.tsx
// ============================================

const Index = () => {
  // Subjects: Filter states
  const [selectedType, setSelectedType] = useState<BarType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [minRating, setMinRating] = useState<number>(0);
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  
  // Observer: Filtered bars automatically recalculated when any state changes
  const filteredBars = bars
    .filter((bar) => {
      if (selectedType && bar.type !== selectedType) return false;
      if (minRating > 0 && bar.rating < minRating) return false;
      if (openOnly && !bar.isOpenNow) return false;
      return true;
    })
    .sort((a, b) => {
      // Sorting logic based on sortBy state
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'distance': return (a.distance || 0) - (b.distance || 0);
        default: return 0;
      }
    });
  
  // All these components observe filteredBars
  return (
    <div>
      {/* Map observes filteredBars */}
      <MapView bars={filteredBars} />
      
      {/* Cards observe filteredBars */}
      {filteredBars.map(bar => <BarCard bar={bar} />)}
      
      {/* Count observes filteredBars.length */}
      <p>Found {filteredBars.length} bars</p>
    </div>
  );
};

// ============================================
// OBSERVER PATTERN EXAMPLE 3: Loading State
// File: src/hooks/use-bars.ts
// ============================================

export function useBars() {
  const [loading, setLoading] = useState<boolean>(true);
  const [bars, setBars] = useState<Bar[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Notify observers: loading started
      
      const data = await fetchBarsFromYelp();
      
      setBars(data); // Notify observers: data available
      setLoading(false); // Notify observers: loading complete
    };
    
    fetchData();
  }, []);
  
  return { bars, loading };
}

// Components observe loading state:
const Index = () => {
  const { bars, loading } = useBars();
  
  // UI automatically updates when loading changes
  if (loading) return <Spinner />;
  return <BarList bars={bars} />;
};
```

### **Benefits:**
✅ **Automatic Updates**: UI automatically syncs with state  
✅ **Loose Coupling**: Observers don't need to know about subjects  
✅ **Multiple Observers**: Many components can observe same state  
✅ **Built into React**: `useEffect` provides observer functionality  
✅ **Declarative**: Describe what to observe, React handles updates

### **Observer Pattern Flow:**

```
State Change:
setFavorites(new Set([...favorites, 'bar-123']))
              ↓
┌─────────────────────────────────────────┐
│   React's Observer Mechanism            │
│   (useEffect dependency tracking)       │
└─────────────┬───────────────────────────┘
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Observer 1          Observer 2
(Save to         (Re-render UI)
LocalStorage)
    ↓                   ↓
localStorage      All <BarCard>
.setItem()        components
                  re-render with
                  updated isFavorite
```

---

## 3. Singleton Pattern

**Purpose**: Ensures a class has only one instance and provides a global point of access to it.

### **Where It's Used:**
- API configuration constants
- Application config
- Environment variables

### **How It Works:**

```typescript
// ============================================
// SINGLETON EXAMPLE 1: API Configuration
// File: src/services/yelp.ts
// ============================================

/**
 * Singleton constants - only one instance exists
 * All API calls use these same values
 */
const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;

const YELP_API_URL = import.meta.env.DEV 
  ? '/api/yelp/v3/businesses/search' 
  : 'https://api.yelp.com/v3/businesses/search';

const YELP_BUSINESS_URL = import.meta.env.DEV
  ? '/api/yelp/v3/businesses'
  : 'https://api.yelp.com/v3/businesses';

// Single source of coordinates
const BERGEN_COORDINATES = {
  latitude: 60.3913,
  longitude: 5.3221,
};

// All functions use the same singleton instances
export async function fetchBarsFromYelp() {
  // Uses singleton YELP_API_KEY and YELP_API_URL
  const response = await fetch(YELP_API_URL, {
    headers: { 'Authorization': `Bearer ${YELP_API_KEY}` }
  });
}

export async function fetchBarDetails(barId: string) {
  // Uses same singleton YELP_API_KEY and YELP_BUSINESS_URL
  const response = await fetch(`${YELP_BUSINESS_URL}/${barId}`, {
    headers: { 'Authorization': `Bearer ${YELP_API_KEY}` }
  });
}

// ============================================
// SINGLETON EXAMPLE 2: App Configuration
// File: src/config/app.ts
// ============================================

/**
 * Singleton configuration object
 * Single source of truth for app settings
 */
export const config = {
  useApi: import.meta.env.VITE_YELP_API_KEY && 
          import.meta.env.VITE_YELP_API_KEY !== 'your_api_key_here',
  apiTimeout: 10000,
  defaultRadius: 5000,
  maxBars: 50,
  mapZoom: 15,
  mapCenter: [60.3913, 5.3241] as [number, number],
};

// All components import the same config
import { config } from '@/config/app';

// Usage in multiple places - all share same instance
if (config.useApi) {
  fetchBarsFromYelp(config.defaultRadius, config.maxBars);
}

// ============================================
// SINGLETON EXAMPLE 3: Category Mapping
// File: src/services/yelp.ts
// ============================================

/**
 * Singleton mapping object
 * Only one instance, shared across all conversions
 */
const categoryToBarType: Record<string, BarType> = {
  'cocktailbars': 'Cocktail',
  'bars': 'Pub',
  'pubs': 'Pub',
  'sportsbars': 'Sports',
  'winebars': 'Wine',
  'breweries': 'Craft-beer',
  'nightlife': 'Nightclub',
};

// All calls to determineBarType() use same mapping instance
function determineBarType(categories: Category[]): BarType {
  for (const category of categories) {
    const alias = category.alias.toLowerCase();
    // Uses singleton categoryToBarType
    if (categoryToBarType[alias]) {
      return categoryToBarType[alias];
    }
  }
  return 'Pub';
}
```

### **Benefits:**
✅ **Single Source of Truth**: One place to update configuration  
✅ **Memory Efficient**: Only one instance in memory  
✅ **Global Access**: Available throughout the application  
✅ **Consistency**: All parts of app use same values  
✅ **Type Safety**: TypeScript ensures correct usage

### **Singleton vs Multiple Instances:**

```
❌ WITHOUT SINGLETON (Problems):
──────────────────────────────
File A:
const API_KEY = "key123";
const API_URL = "https://api.yelp.com";

File B:
const API_KEY = "key456"; // ❌ Different key!
const API_URL = "https://api.yelp.com";

File C:
const API_KEY = "key123";
const API_URL = "https://api.yep.com"; // ❌ Typo!

Problem: Inconsistent configuration, hard to maintain

✅ WITH SINGLETON (Solution):
──────────────────────────────
// config.ts (single file)
export const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
export const YELP_API_URL = "https://api.yelp.com";

// All files import same instance
import { YELP_API_KEY, YELP_API_URL } from './config';

✅ Single source of truth
✅ Change once, affects everywhere
✅ No duplicate code
✅ No inconsistencies
```

---

## 4. MVC Pattern (Modified for React)

**Purpose**: Organizes code into three interconnected components: Model (data), View (UI), Controller (logic).

**Note**: React doesn't use traditional MVC, but follows a **Component-Based MVC** pattern where:
- **Model** = Data structures and state
- **View** = JSX/TSX rendering
- **Controller** = Event handlers and business logic

### **Where It's Used:**
Throughout all React components, but especially clear in:
- `src/pages/Index.tsx` (Main controller)
- `src/components/BarCard.tsx` (Component-level MVC)
- `src/components/BarDetail.tsx` (Modal MVC)

### **How It Works:**

```typescript
// ============================================
// MVC EXAMPLE 1: BarCard Component
// File: src/components/BarCard.tsx
// ============================================

/**
 * COMPONENT-BASED MVC PATTERN
 */

// ──────────────────────────────────────────
// MODEL (Data Structure & Props Interface)
// ──────────────────────────────────────────
interface BarCardProps {
  bar: Bar;                           // Data model
  isFavorite: boolean;               // State data
  onToggleFavorite: (id: string) => void;  // Controller callback
  onClick: () => void;               // Controller callback
}

const BarCard = ({ 
  bar,              // MODEL: Bar data
  isFavorite,       // MODEL: Favorite state
  onToggleFavorite, // CONTROLLER: Handler
  onClick           // CONTROLLER: Handler
}: BarCardProps) => {
  
  // ──────────────────────────────────────────
  // CONTROLLER (Event Handlers & Logic)
  // ──────────────────────────────────────────
  
  /**
   * Controller method: Handles favorite toggle
   * Prevents event propagation to card click
   */
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Controller logic
    onToggleFavorite(bar.id); // Delegate to parent controller
  };
  
  /**
   * Controller method: Handles card click
   */
  const handleCardClick = () => {
    onClick(); // Delegate to parent controller
  };
  
  // ──────────────────────────────────────────
  // VIEW (JSX Rendering)
  // ──────────────────────────────────────────
  return (
    <Card
      className="cursor-pointer hover:scale-[1.02]"
      onClick={handleCardClick} // Connect VIEW to CONTROLLER
    >
      <div className="relative">
        {/* VIEW: Display model data */}
        <img src={bar.image} alt={bar.name} />
        
        {/* VIEW: Favorite button */}
        <Button onClick={handleFavoriteClick}>
          <Heart 
            className={isFavorite ? 'fill-primary' : ''}
          />
        </Button>
        
        {/* VIEW: Badge shows model data */}
        <Badge>{bar.type}</Badge>
      </div>
      
      <div className="p-4">
        {/* VIEW: Display model properties */}
        <h3>{bar.name}</h3>
        <div>
          <Star />
          <span>{bar.rating}</span> {/* MODEL data */}
        </div>
        <p>{bar.address}</p> {/* MODEL data */}
        <p>{getPriceRangeInNOK(bar.priceLevel)}</p> {/* MODEL transformed */}
      </div>
    </Card>
  );
};

// ============================================
// MVC EXAMPLE 2: Index Page (Main Controller)
// File: src/pages/Index.tsx
// ============================================

/**
 * PAGE-LEVEL MVC PATTERN
 */
const Index = () => {
  
  // ──────────────────────────────────────────
  // MODEL (Application State & Data)
  // ──────────────────────────────────────────
  const { bars, loading, error } = useBars(); // MODEL: Fetched data
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // MODEL
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null); // MODEL
  const [view, setView] = useState<'map' | 'list'>('list'); // MODEL
  const [selectedType, setSelectedType] = useState<BarType | null>(null); // MODEL
  const [sortBy, setSortBy] = useState<SortOption>('default'); // MODEL
  
  // ──────────────────────────────────────────
  // CONTROLLER (Business Logic & Handlers)
  // ──────────────────────────────────────────
  
  /**
   * Controller: Load favorites from LocalStorage
   */
  useEffect(() => {
    const stored = localStorage.getItem('bar-favorites');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);
  
  /**
   * Controller: Save favorites to LocalStorage
   */
  useEffect(() => {
    localStorage.setItem('bar-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);
  
  /**
   * Controller: Toggle favorite status
   */
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
  
  /**
   * Controller: Filter and sort bars
   */
  const filteredBars = bars
    .filter((bar) => {
      if (selectedType && bar.type !== selectedType) return false;
      if (showFavoritesOnly && !favorites.has(bar.id)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'distance': return (a.distance || 0) - (b.distance || 0);
        default: return 0;
      }
    });
  
  // ──────────────────────────────────────────
  // VIEW (UI Rendering)
  // ──────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* VIEW: Header */}
      <header>
        <h1>Baradvisor</h1>
        <Button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          Favorites ({favorites.size})
        </Button>
      </header>
      
      {/* VIEW: Filter controls */}
      <FilterBar 
        selectedType={selectedType} 
        onTypeSelect={setSelectedType} // Connect to CONTROLLER
      />
      
      {/* VIEW: View toggle */}
      <Tabs value={view} onValueChange={setView}>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="map">Map</TabsTrigger>
      </Tabs>
      
      {/* VIEW: Loading state */}
      {loading && <Spinner />}
      
      {/* VIEW: Error state */}
      {error && <Alert>{error}</Alert>}
      
      {/* VIEW: Content based on view mode */}
      {!loading && !error && (
        <>
          {view === 'map' ? (
            <MapView
              bars={filteredBars} // MODEL data
              onBarSelect={setSelectedBar} // CONTROLLER
              favorites={favorites} // MODEL data
            />
          ) : (
            <div>
              {filteredBars.map((bar) => (
                <BarCard
                  key={bar.id}
                  bar={bar} // MODEL data
                  isFavorite={favorites.has(bar.id)} // MODEL data
                  onToggleFavorite={toggleFavorite} // CONTROLLER
                  onClick={() => setSelectedBar(bar)} // CONTROLLER
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* VIEW: Bar detail modal */}
      {selectedBar && (
        <BarDetail
          bar={selectedBar} // MODEL
          isFavorite={favorites.has(selectedBar.id)} // MODEL
          onToggleFavorite={toggleFavorite} // CONTROLLER
          onClose={() => setSelectedBar(null)} // CONTROLLER
        />
      )}
    </div>
  );
};
```

### **Benefits:**
✅ **Separation of Concerns**: Data, logic, and UI are distinct  
✅ **Reusability**: Models and controllers can be reused  
✅ **Testability**: Each part can be tested independently  
✅ **Maintainability**: Changes to UI don't affect business logic  
✅ **Readability**: Clear structure makes code easy to understand

### **Traditional MVC vs React MVC:**

```
TRADITIONAL MVC (Backend):
──────────────────────────
┌─────────┐      ┌────────────┐      ┌──────┐
│  Model  │◄─────│ Controller │◄─────│ View │
│  (DB)   │      │  (Logic)   │      │ (UI) │
└─────────┘      └────────────┘      └──────┘
     ▲                  │                 │
     │                  │                 │
     └──────────────────┴─────────────────┘
       Separate files, separate concerns


REACT MVC (Frontend):
─────────────────────
┌──────────────────────────────────────┐
│         React Component              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  MODEL (State & Props)         │ │
│  │  - useState, props, data       │ │
│  └────────────────────────────────┘ │
│              ▼                       │
│  ┌────────────────────────────────┐ │
│  │  CONTROLLER (Handlers & Logic) │ │
│  │  - Event handlers              │ │
│  │  - useEffect, business logic   │ │
│  └────────────────────────────────┘ │
│              ▼                       │
│  ┌────────────────────────────────┐ │
│  │  VIEW (JSX Rendering)          │ │
│  │  - return ( <div>...</div> )   │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
  All in one component, logically separated
```

---

## Summary Table

| Pattern | Purpose | Location | Key Benefit |
|---------|---------|----------|-------------|
| **Repository** | Separate data access from business logic | `use-bars.ts`, `yelp.ts` | Easy to swap data sources |
| **Observer** | Auto-update UI on state changes | All components (useEffect) | Automatic synchronization |
| **Singleton** | Single shared configuration | `yelp.ts`, `config/app.ts` | Consistency across app |
| **MVC** | Organize code into Model-View-Controller | All React components | Clear separation of concerns |
| **Adapter** | Transform external data to internal format | `convertToBar()` in `yelp.ts` | API independence |
| **Strategy** | Multiple sorting algorithms | Sorting logic in `Index.tsx` | Flexible behavior |
| **Facade** | Simplify complex subsystems | `useBars()` hook | Easier component code |
| **Factory** | Create objects based on conditions | `getImageUrl()` in `yelp.ts` | Centralized creation logic |

---

## Design Pattern Benefits Summary

### **Code Quality Improvements:**
✅ **Maintainability**: Patterns make code easier to update and fix  
✅ **Testability**: Each pattern can be tested independently  
✅ **Reusability**: Patterns promote code reuse  
✅ **Scalability**: Easy to add new features without breaking existing code  
✅ **Readability**: Patterns provide familiar structure for developers  

### **Development Benefits:**
✅ **Faster Development**: Patterns provide proven solutions  
✅ **Fewer Bugs**: Patterns reduce common mistakes  
✅ **Better Collaboration**: Team members understand standard patterns  
✅ **Easier Onboarding**: New developers recognize familiar patterns  

---

## Conclusion

Baradvisor demonstrates professional use of design patterns in a modern React application. The **Repository Pattern** keeps data access clean, the **Observer Pattern** (built into React) ensures responsive UI, the **Singleton Pattern** maintains consistent configuration, and the **MVC Pattern** (adapted for React) organizes code logically. These patterns work together to create maintainable, testable, and scalable code suitable for a student project while demonstrating industry best practices.
