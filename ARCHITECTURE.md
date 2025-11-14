# Baradvisor - System Architecture Documentation

## 1. Main Components/Modules

### **Frontend (Single Page Application)**
- **Technology**: React + TypeScript + Vite
- **UI Framework**: shadcn-ui + Tailwind CSS
- **Mapping Library**: Leaflet
- **Purpose**: Complete client-side application for discovering and exploring bars

### **External API (Backend Service)**
- **Service**: Yelp Fusion API v3
- **Purpose**: Provides real-time bar data including:
  - Business information (name, location, categories)
  - Ratings and review counts
  - Business hours and open/closed status
  - Photos and pricing information
  - Distance calculations

### **Development Proxy**
- **Tool**: Vite Dev Server Proxy
- **Purpose**: Routes API requests through `/api/yelp` to avoid CORS issues in development
- **Configuration**: `vite.config.ts`

### **Client-Side Storage**
- **Technology**: Browser LocalStorage
- **Purpose**: Persists user favorites across sessions
- **Data Stored**: Array of bar IDs marked as favorites

### **Mock Data Layer**
- **Location**: `src/data/bars.ts`
- **Purpose**: Fallback data when API is unavailable or for development without API key

## 2. Component Communication

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Frontend (SPA)                      │ │
│  │                                                          │ │
│  │  Pages Layer:                                           │ │
│  │    └─ Index.tsx (Main page component)                  │ │
│  │         ├─ State Management (useState, useEffect)      │ │
│  │         └─ View Orchestration                          │ │
│  │                                                          │ │
│  │  Custom Hooks Layer:                                    │ │
│  │    └─ useBars() hook                                   │ │
│  │         ├─ Fetches data from API                       │ │
│  │         ├─ Handles loading states                      │ │
│  │         ├─ Error handling with fallback               │ │
│  │         └─ Returns data to components                  │ │
│  │                                                          │ │
│  │  Service Layer:                                         │ │
│  │    └─ yelp.ts service                                  │ │
│  │         ├─ API communication (fetch)                   │ │
│  │         ├─ Data transformation                         │ │
│  │         └─ Bearer token authentication                 │ │
│  │                                                          │ │
│  │  Presentation Layer:                                    │ │
│  │    ├─ MapView (Leaflet map with custom markers)       │ │
│  │    ├─ BarCard (List view items)                       │ │
│  │    ├─ BarDetail (Modal with full details)             │ │
│  │    ├─ FilterBar (Category filtering)                  │ │
│  │    └─ FilterDialog (Sort & filter options)            │ │
│  │                                                          │ │
│  │  Data Layer:                                            │ │
│  │    └─ bars.ts (TypeScript interfaces & mock data)     │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│                    LocalStorage API                          │
│                (Favorites persistence)                       │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │  Development  │
                    │  Vite Proxy   │
                    │  /api/yelp/*  │
                    └───────┬───────┘
                            ↓
        ┌───────────────────────────────────┐
        │     Yelp Fusion API (REST)        │
        │   https://api.yelp.com/v3/        │
        │                                    │
        │  Endpoints Used:                  │
        │  • GET /businesses/search         │
        │  • GET /businesses/{id}           │
        │                                    │
        │  Authentication:                  │
        │  • Bearer Token in headers        │
        │                                    │
        │  Data Returned:                   │
        │  • Business details (JSON)        │
        │  • Ratings, reviews, hours        │
        │  • Photos, categories, location   │
        └───────────────────────────────────┘
```

### **Communication Flow:**

1. **Frontend → Yelp API**:
   - Protocol: HTTP/HTTPS REST API
   - Method: GET requests with query parameters
   - Authentication: Bearer token (`Authorization: Bearer {VITE_YELP_API_KEY}`)
   - Data Format: JSON

2. **Frontend → LocalStorage**:
   - Protocol: Browser LocalStorage API
   - Operations: `getItem()`, `setItem()`
   - Data Format: JSON stringified arrays

3. **Development Proxy**:
   - Vite dev server proxies `/api/yelp/*` to `https://api.yelp.com/*`
   - Solves CORS issues during development
   - Production uses direct API calls

## 3. Internal Structure / Layers

### **Layered Architecture (4-Tier)**

#### **1. Presentation Layer** (`src/pages/`, `src/components/`)
**Responsibility**: User interface and user interaction
- **Pages**: Route-level components (Index.tsx)
- **Components**: Reusable UI components
  - `BarCard.tsx` - List item view
  - `BarDetail.tsx` - Modal detail view
  - `MapView.tsx` - Map visualization
  - `FilterBar.tsx` - Category filters
  - `FilterDialog.tsx` - Advanced filtering/sorting
- **Input**: User actions (clicks, filters, favorites)
- **Output**: Rendered UI, calls to business logic layer

#### **2. Business Logic Layer** (`src/hooks/`)
**Responsibility**: Application logic, state management, orchestration
- **Custom Hooks**:
  - `useBars()` - Data fetching, caching, error handling
    - Manages loading states
    - Implements fallback to mock data
    - Handles refetch logic
- **State Management**: React hooks (useState, useEffect)
- **Input**: Component requests for data
- **Output**: Processed data, loading states, error messages

#### **3. Service Layer** (`src/services/`)
**Responsibility**: External API communication and data transformation
- **yelp.ts**:
  - `fetchBarsFromYelp()` - Search for bars in Bergen
  - `fetchBarDetails()` - Get specific bar details
  - `convertToBar()` - Transform Yelp API format to internal format
  - `determineBarType()` - Category mapping logic
  - `getImageUrl()` - Image fallback handling
- **Input**: API parameters (location, radius, filters)
- **Output**: Transformed Bar objects

#### **4. Data Layer** (`src/data/`)
**Responsibility**: Data models and mock data
- **bars.ts**:
  - TypeScript interfaces (`Bar`, `BarType`, `BusinessHours`)
  - Mock data for development/fallback
  - Data contracts used across all layers
- **Input**: None (static definitions)
- **Output**: Type definitions and fallback data

### **Supporting Layers:**

#### **Utility Layer** (`src/lib/`)
- **utils.ts**:
  - `getPriceRangeInNOK()` - Price formatting
  - `formatDistance()` - Distance formatting
  - `formatBusinessHours()` - Time formatting
  - `cn()` - CSS class name merging

#### **Configuration Layer** (`src/config/`)
- **app.ts**:
  - Application-wide configuration
  - Feature flags (API enabled/disabled)
  - Environment variable management

## 4. Chosen Architecture Style

### **Primary Architecture: Layered (4-Tier) Client-Server Architecture**

#### **Why This Architecture?**

1. **Layered Architecture**:
   - Clear separation of concerns
   - Each layer has a specific responsibility
   - Easy to maintain and test
   - Follows React best practices

2. **Client-Server Model**:
   - Frontend (Client): React SPA
   - Backend (Server): Yelp API (external service)
   - Clear client-server boundary
   - RESTful communication

3. **Modular Monolith Characteristics**:
   - Single deployable unit (SPA)
   - Organized into modules by feature/responsibility
   - Not microservices (no separate deployments)
   - Suitable for small-to-medium projects

### **Architecture Classification:**
- **Primary**: **Layered (N-Tier) Architecture** with **Client-Server** model
- **Secondary**: **Modular Monolith** (single deployment, clear module boundaries)
- **Pattern**: **Service-Oriented** (consumes external REST API)

### **NOT Used:**
- ❌ Microservices (single application, not distributed)
- ❌ Event-Driven (no event bus or pub/sub)
- ❌ Pure MVC (React component-based, not traditional MVC)

## 5. Design Patterns

### **1. Repository Pattern**
**Location**: `src/services/yelp.ts`, `src/hooks/use-bars.ts`

**Purpose**: Abstracts data access from business logic

**Implementation**:
```typescript
// Service acts as repository
export async function fetchBarsFromYelp(): Promise<Bar[]> {
  // Data access logic hidden from consumers
}

// Hook consumes repository
export function useBars() {
  const fetchBars = async () => {
    const data = await fetchBarsFromYelp(); // Repository call
    setBars(data);
  };
}
```

**Benefits**:
- Business logic doesn't know about Yelp API details
- Easy to swap data sources (API → Database)
- Centralized data access logic

### **2. Adapter Pattern**
**Location**: `src/services/yelp.ts` → `convertToBar()`

**Purpose**: Converts external API format to internal domain model

**Implementation**:
```typescript
// Yelp API format
interface YelpBusiness { /* Yelp-specific structure */ }

// Internal domain model
interface Bar { /* Application-specific structure */ }

// Adapter function
function convertToBar(business: YelpBusiness): Bar {
  // Transform external format to internal format
}
```

**Benefits**:
- Application code independent of external API changes
- Internal model optimized for app needs
- Easy to mock data with same interface

### **3. Strategy Pattern**
**Location**: `src/pages/Index.tsx` → Sort/Filter logic

**Purpose**: Different sorting algorithms based on user selection

**Implementation**:
```typescript
switch (sortBy) {
  case 'rating':
    return b.rating - a.rating;
  case 'distance':
    return a.distance - b.distance;
  case 'reviews':
    return getReviewCount(b) - getReviewCount(a);
  // ... more strategies
}
```

**Benefits**:
- Easy to add new sorting methods
- Clear separation of sorting algorithms
- User-selectable behavior

### **4. Facade Pattern**
**Location**: `src/hooks/use-bars.ts`

**Purpose**: Simplifies complex subsystem (API + state + error handling)

**Implementation**:
```typescript
// Complex subsystem hidden behind simple interface
export function useBars() {
  // Handles: API calls, loading states, errors, fallbacks
  return { bars, loading, error, refetch, usingMockData };
}

// Components use simple interface
const { bars, loading } = useBars(); // Easy!
```

**Benefits**:
- Components don't deal with API complexity
- Centralized error handling
- Consistent data fetching across app

### **5. Observer Pattern** (React-native)
**Location**: Throughout React components

**Purpose**: State changes trigger UI updates

**Implementation**:
```typescript
// State changes are observed
const [favorites, setFavorites] = useState<Set<string>>(new Set());

// UI automatically updates when state changes
useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
}, [favorites]); // Observer dependency
```

**Benefits**:
- Automatic UI synchronization
- Declarative state management
- Built into React framework

### **6. Factory Pattern**
**Location**: `src/services/yelp.ts` → `getImageUrl()`

**Purpose**: Creates appropriate fallback images based on category

**Implementation**:
```typescript
function getImageUrl(business: YelpBusiness): string {
  const categoryAlias = business.categories[0]?.alias.toLowerCase();
  
  // Factory decides which image to return
  if (categoryAlias.includes('cocktail')) {
    return 'https://...cocktail-image';
  }
  if (categoryAlias.includes('wine')) {
    return 'https://...wine-image';
  }
  // ... default image
}
```

**Benefits**:
- Centralized image creation logic
- Easy to add new categories
- Consistent fallback behavior

### **7. Singleton Pattern** (Implicit)
**Location**: `src/services/yelp.ts` → API configuration

**Purpose**: Single source of configuration

**Implementation**:
```typescript
// Singleton-like constants
const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
const YELP_API_URL = import.meta.env.DEV 
  ? '/api/yelp/v3/businesses/search' 
  : 'https://api.yelp.com/v3/businesses/search';
```

**Benefits**:
- Single configuration point
- Environment-aware settings
- No duplicate API instances

### **8. Proxy Pattern**
**Location**: `vite.config.ts`

**Purpose**: Development proxy intercepts API calls

**Implementation**:
```typescript
proxy: {
  '/api/yelp': {
    target: 'https://api.yelp.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/yelp/, ''),
  }
}
```

**Benefits**:
- Solves CORS issues
- Seamless development experience
- Production uses direct API

## 6. Data Flow Example

### **User Searches for Bars:**

```
1. User opens app (Index.tsx)
   ↓
2. Index.tsx calls useBars() hook
   ↓
3. useBars() calls fetchBarsFromYelp() from service layer
   ↓
4. fetchBarsFromYelp() makes HTTP GET request to Yelp API
   ↓ (Development: through Vite proxy)
   ↓ (Production: direct to api.yelp.com)
5. Yelp API returns JSON array of businesses
   ↓
6. convertToBar() transforms YelpBusiness[] to Bar[]
   ↓
7. useBars() updates state with bars data
   ↓
8. Index.tsx receives bars, applies filters/sorting
   ↓
9. Renders BarCard components or MapView with markers
   ↓
10. User sees list of bars (with live data!)
```

### **User Favorites a Bar:**

```
1. User clicks heart icon on BarCard
   ↓
2. onClick calls toggleFavorite(barId)
   ↓
3. toggleFavorite updates favorites Set in state
   ↓
4. useEffect observer detects favorites change
   ↓
5. useEffect saves favorites to LocalStorage
   ↓
6. React re-renders components with new favorite status
   ↓
7. Heart icon updates to filled state
```

## 7. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Build Tool** | Vite | Fast dev server, bundling |
| **Language** | TypeScript | Type safety, better DX |
| **UI Framework** | React 18 | Component-based UI |
| **Styling** | Tailwind CSS + shadcn-ui | Utility-first styling |
| **State Management** | React Hooks | Local state, side effects |
| **Data Fetching** | Fetch API | HTTP requests |
| **Mapping** | Leaflet | Interactive maps |
| **External API** | Yelp Fusion API | Bar data source |
| **Persistence** | LocalStorage | Client-side storage |
| **Development** | Vite Dev Server | Hot reload, proxy |

## 8. Key Architectural Decisions

### ✅ **Why Client-Side Only (No Backend)?**
- **Yelp API** provides all needed data
- **No sensitive data** to protect (API key in client is acceptable for free tier)
- **Simpler deployment** (static site hosting)
- **Lower cost** (no server maintenance)
- **Faster iteration** (no backend development needed)

### ✅ **Why TypeScript?**
- **Type safety** catches errors at compile time
- **Better IDE support** (autocomplete, refactoring)
- **Self-documenting** code with interfaces
- **Scales better** for growing codebase

### ✅ **Why React Hooks over Redux?**
- **Simpler** for small-to-medium apps
- **Less boilerplate** code
- **Built-in** to React
- **Local state** sufficient for this app's needs

### ✅ **Why Yelp over Google Places?**
- **Free tier** includes photos, ratings, hours
- **25,000 API calls/month** free
- **No credit card** required for signup
- **Rich data** (reviews, categories, hours)

---

## Summary

**Baradvisor** is a modern single-page application built with **Layered (4-Tier) Client-Server Architecture**. It leverages React for the frontend, consumes the Yelp Fusion REST API for data, and uses multiple design patterns (Repository, Adapter, Strategy, Facade, Observer, Factory) to maintain clean, maintainable code. The architecture is well-suited for a student project, balancing simplicity with professional software engineering practices.
