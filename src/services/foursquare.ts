import { Bar, BarType } from '../data/bars';

const FOURSQUARE_API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;
// Updated to new Foursquare API (2025)
// Use proxy in development to avoid CORS issues
const FOURSQUARE_API_URL = import.meta.env.DEV 
  ? '/api/foursquare/places/search' 
  : 'https://places-api.foursquare.com/places/search';
const FOURSQUARE_PLACES_URL = import.meta.env.DEV
  ? '/api/foursquare/places'
  : 'https://places-api.foursquare.com/places';
const FOURSQUARE_API_VERSION = '2025-06-17';

// Bergen, Norway coordinates
const BERGEN_COORDINATES = {
  latitude: 60.3913,
  longitude: 5.3221,
};

// Map Foursquare categories to our BarType
const categoryToBarType: Record<string, BarType> = {
  'cocktail': 'Cocktail',
  'bar': 'Pub',
  'pub': 'Pub',
  'sports_bar': 'Sports',
  'wine_bar': 'Wine',
  'beer_garden': 'Craft-beer',
  'brewery': 'Craft-beer',
  'nightclub': 'Nightclub',
  'lounge': 'Cocktail',
};

interface FoursquarePhoto {
  prefix: string;
  suffix: string;
  width: number;
  height: number;
}

interface FoursquarePlace {
  fsq_place_id: string; // Changed from fsq_id
  name: string;
  latitude: number; // New format - direct coordinates
  longitude: number; // New format - direct coordinates
  categories: Array<{
    fsq_category_id: string; // Changed from id (now string BSON)
    name: string;
    short_name: string;
    plural_name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  location: {
    address?: string;
    locality?: string;
    postcode?: string;
    formatted_address: string;
  };
  distance?: number;
  rating?: number;
  price?: number;
  photos?: FoursquarePhoto[];
  description?: string;
}

interface FoursquareResponse {
  results: FoursquarePlace[];
}

/**
 * Determines the bar type based on Foursquare categories
 */
function determineBarType(categories: FoursquarePlace['categories']): BarType {
  for (const category of categories) {
    const categoryName = category.short_name.toLowerCase();
    
    // Check for specific matches
    if (categoryName.includes('cocktail')) return 'Cocktail';
    if (categoryName.includes('wine')) return 'Wine';
    if (categoryName.includes('sports')) return 'Sports';
    if (categoryName.includes('nightclub') || categoryName.includes('night club')) return 'Nightclub';
    if (categoryName.includes('brewery') || categoryName.includes('craft') || categoryName.includes('beer')) return 'Craft-beer';
  }
  
  // Default to Pub if no specific match
  return 'Pub';
}

/**
 * Constructs a photo URL from Foursquare photo data
 */
function getPhotoUrl(photos?: FoursquarePhoto[]): string {
  if (photos && photos.length > 0) {
    const photo = photos[0];
    return `${photo.prefix}original${photo.suffix}`;
  }
  // Fallback placeholder
  return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop';
}

/**
 * Converts a Foursquare place to our Bar interface
 */
function convertToBar(place: FoursquarePlace): Bar {
  return {
    id: place.fsq_place_id, // Updated field name
    name: place.name,
    type: determineBarType(place.categories),
    coordinates: [place.longitude, place.latitude], // Updated to use direct coordinates
    address: place.location.address || place.location.formatted_address,
    // Default values for premium fields (rating, photos, description, price)
    rating: 4.0, // Default rating since it's a premium field
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop', // Fallback image
    description: `${place.categories[0]?.name || 'Bar'} in ${place.location.locality || 'Bergen'}`,
    priceLevel: 2, // Default to moderate pricing
  };
}

/**
 * Fetches bars from Foursquare API in Bergen area
 */
export async function fetchBarsFromFoursquare(
  radius: number = 5000, // 5km radius
  limit: number = 50
): Promise<Bar[]> {
  if (!FOURSQUARE_API_KEY || FOURSQUARE_API_KEY === 'your_api_key_here') {
    throw new Error(
      'Foursquare API key is not configured. Please add VITE_FOURSQUARE_API_KEY to your .env file.'
    );
  }

  try {
    const params = new URLSearchParams({
      ll: `${BERGEN_COORDINATES.latitude},${BERGEN_COORDINATES.longitude}`,
      radius: radius.toString(),
      categories: '13003,13004,13032,13033,13034,13035,13064,13065', // Bar-related categories
      // Only request free tier fields to avoid premium charges
      fields: 'fsq_place_id,name,categories,latitude,longitude,location,distance',
      limit: limit.toString(),
    });

    console.log('🔍 Fetching from:', `${FOURSQUARE_API_URL}?${params}`);
    console.log('🔑 Using auth header:', `Bearer ${FOURSQUARE_API_KEY.trim().slice(0, 10)}...`);
    
    const response = await fetch(`${FOURSQUARE_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${FOURSQUARE_API_KEY.trim()}`, // New format: Bearer token
        'X-Places-Api-Version': FOURSQUARE_API_VERSION, // Required version header
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Foursquare API error: ${response.status} - ${errorText}`);
    }

    const data: FoursquareResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn('No bars found in the specified area');
      return [];
    }

    return data.results.map(convertToBar);
  } catch (error) {
    console.error('Error fetching bars from Foursquare:', error);
    throw error;
  }
}

/**
 * Fetches detailed information about a specific bar
 */
export async function fetchBarDetails(barId: string): Promise<Bar | null> {
  if (!FOURSQUARE_API_KEY || FOURSQUARE_API_KEY === 'your_api_key_here') {
    throw new Error('Foursquare API key is not configured');
  }

  try {
    const response = await fetch(
      `${FOURSQUARE_PLACES_URL}/${barId}?fields=fsq_place_id,name,categories,latitude,longitude,location`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${FOURSQUARE_API_KEY.trim()}`, // New format: Bearer token
          'X-Places-Api-Version': FOURSQUARE_API_VERSION, // Required version header
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch bar details: ${response.status}`);
    }

    const place: FoursquarePlace = await response.json();
    return convertToBar(place);
  } catch (error) {
    console.error('Error fetching bar details:', error);
    return null;
  }
}
