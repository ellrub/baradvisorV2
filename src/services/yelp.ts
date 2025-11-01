import { Bar, BarType } from '../data/bars';

const YELP_API_KEY = import.meta.env.VITE_YELP_API_KEY;
// Use proxy in development to avoid CORS issues
const YELP_API_URL = import.meta.env.DEV 
  ? '/api/yelp/v3/businesses/search' 
  : 'https://api.yelp.com/v3/businesses/search';
const YELP_BUSINESS_URL = import.meta.env.DEV
  ? '/api/yelp/v3/businesses'
  : 'https://api.yelp.com/v3/businesses';

// Bergen, Norway coordinates
const BERGEN_COORDINATES = {
  latitude: 60.3913,
  longitude: 5.3221,
};

// Map Yelp categories to our BarType
const categoryToBarType: Record<string, BarType> = {
  'cocktailbars': 'Cocktail',
  'bars': 'Pub',
  'pubs': 'Pub',
  'sportsbars': 'Sports',
  'winebars': 'Wine',
  'beer_and_wine': 'Wine',
  'breweries': 'Craft-beer',
  'brewpubs': 'Craft-beer',
  'nightlife': 'Nightclub',
  'lounges': 'Cocktail',
};

interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  rating: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  transactions: string[];
  price?: string; // "$", "$$", "$$$", "$$$$"
  location: {
    address1: string;
    address2: string | null;
    address3: string | null;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance: number; // in meters
  business_hours?: Array<{
    open: Array<{
      is_overnight: boolean;
      start: string;
      end: string;
      day: number;
    }>;
    hours_type: string;
    is_open_now: boolean;
  }>;
}

interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
}

export interface YelpReview {
  id: string;
  rating: number;
  user: {
    name: string;
    image_url: string;
  };
  text: string;
  time_created: string;
  url: string;
}

interface YelpReviewsResponse {
  reviews: YelpReview[];
  total: number;
}

/**
 * Determines the bar type based on Yelp categories
 */
function determineBarType(categories: YelpBusiness['categories']): BarType {
  for (const category of categories) {
    const alias = category.alias.toLowerCase();
    
    // Check for specific matches
    if (alias.includes('cocktail')) return 'Cocktail';
    if (alias.includes('wine')) return 'Wine';
    if (alias.includes('sports')) return 'Sports';
    if (alias.includes('nightclub') || alias === 'nightlife') return 'Nightclub';
    if (alias.includes('brew') || alias.includes('beer')) return 'Craft-beer';
    if (alias.includes('pub')) return 'Pub';
  }
  
  // Default to Pub if no specific match
  return 'Pub';
}

/**
 * Converts price string to numeric level
 */
function convertPriceLevel(price?: string): number {
  if (!price) return 2;
  return price.length; // "$" = 1, "$$" = 2, "$$$" = 3, "$$$$" = 4
}

/**
 * Gets a valid image URL or returns a category-appropriate fallback
 */
function getImageUrl(business: YelpBusiness): string {
  // Check if image_url exists and is not empty
  if (business.image_url && business.image_url.trim() !== '') {
    return business.image_url;
  }
  
  // Return category-specific fallback images
  const categoryAlias = business.categories[0]?.alias.toLowerCase() || '';
  
  if (categoryAlias.includes('cocktail')) {
    return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop';
  }
  if (categoryAlias.includes('wine')) {
    return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop';
  }
  if (categoryAlias.includes('brew') || categoryAlias.includes('beer')) {
    return 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop';
  }
  if (categoryAlias.includes('pub')) {
    return 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=800&h=600&fit=crop';
  }
  if (categoryAlias.includes('nightclub') || categoryAlias.includes('nightlife')) {
    return 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop';
  }
  
  // Default bar image
  return 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=600&fit=crop';
}

/**
 * Converts a Yelp business to our Bar interface
 */
function convertToBar(business: YelpBusiness): Bar {
  const businessHours = business.business_hours?.[0];
  
  return {
    id: business.id,
    name: business.name,
    type: determineBarType(business.categories),
    coordinates: [business.coordinates.longitude, business.coordinates.latitude],
    address: business.location.display_address.join(', '),
    rating: business.rating, // Yelp uses 0-5 scale, same as us!
    image: getImageUrl(business),
    description: `${business.categories[0]?.title || 'Bar'} • ${business.review_count} reviews`,
    priceLevel: convertPriceLevel(business.price),
    phone: business.phone,
    displayPhone: business.display_phone,
    distance: business.distance,
    categories: business.categories.map(cat => cat.title),
    isOpenNow: businessHours?.is_open_now,
    businessHours: businessHours ? {
      is_open_now: businessHours.is_open_now,
      hours: businessHours.open || []
    } : undefined,
  };
}

/**
 * Fetches bars from Yelp API in Bergen area
 */
export async function fetchBarsFromYelp(
  radius: number = 5000, // 5km radius (max 40000 meters)
  limit: number = 50
): Promise<Bar[]> {
  if (!YELP_API_KEY || YELP_API_KEY === 'your_api_key_here') {
    throw new Error(
      'Yelp API key is not configured. Please add VITE_YELP_API_KEY to your .env file.'
    );
  }

  try {
    const params = new URLSearchParams({
      latitude: BERGEN_COORDINATES.latitude.toString(),
      longitude: BERGEN_COORDINATES.longitude.toString(),
      radius: Math.min(radius, 40000).toString(), // Yelp max is 40km
      categories: 'bars,cocktailbars,pubs,sportsbars,winebars,breweries,brewpubs,lounges',
      limit: Math.min(limit, 50).toString(), // Yelp max is 50 per request
      sort_by: 'distance',
    });

    console.log('🔍 Fetching from Yelp:', `${YELP_API_URL}?${params}`);
    console.log('🔑 Using API key:', `${YELP_API_KEY.slice(0, 10)}...`);
    
    const response = await fetch(`${YELP_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${YELP_API_KEY.trim()}`,
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Yelp API Error Response:', errorText);
      throw new Error(`Yelp API error: ${response.status} - ${errorText}`);
    }

    const data: YelpSearchResponse = await response.json();
    
    if (!data.businesses || data.businesses.length === 0) {
      console.warn('No bars found in the specified area');
      return [];
    }

    console.log(`✅ Found ${data.businesses.length} bars from Yelp`);
    
    // Log which businesses are missing images
    const missingImages = data.businesses.filter(b => !b.image_url || b.image_url.trim() === '');
    if (missingImages.length > 0) {
      console.log(`ℹ️ ${missingImages.length} bars missing images, using fallbacks:`, 
        missingImages.map(b => b.name).join(', ')
      );
    }
    
    return data.businesses.map(convertToBar);
  } catch (error) {
    console.error('Error fetching bars from Yelp:', error);
    throw error;
  }
}

/**
 * Fetches detailed information about a specific bar
 */
export async function fetchBarDetails(barId: string): Promise<Bar | null> {
  if (!YELP_API_KEY || YELP_API_KEY === 'your_api_key_here') {
    throw new Error('Yelp API key is not configured');
  }

  try {
    const response = await fetch(
      `${YELP_BUSINESS_URL}/${barId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${YELP_API_KEY.trim()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch bar details: ${response.status}`);
    }

    const business: YelpBusiness = await response.json();
    return convertToBar(business);
  } catch (error) {
    console.error('Error fetching bar details from Yelp:', error);
    return null;
  }
}

/**
 * Fetches reviews for a specific bar from Yelp
 */
export async function fetchBarReviews(barId: string): Promise<YelpReview[]> {
  if (!YELP_API_KEY || YELP_API_KEY === 'your_api_key_here') {
    throw new Error('Yelp API key is not configured');
  }

  try {
    const reviewsUrl = import.meta.env.DEV
      ? `/api/yelp/v3/businesses/${barId}/reviews`
      : `https://api.yelp.com/v3/businesses/${barId}/reviews`;

    console.log('🔍 Fetching reviews from:', reviewsUrl);
    console.log('🔑 Using API key:', `${YELP_API_KEY.slice(0, 10)}...`);

    const response = await fetch(reviewsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${YELP_API_KEY.trim()}`,
      },
    });

    console.log('📡 Reviews response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Yelp Reviews API Error:', errorText);
      throw new Error(`Failed to fetch reviews: ${response.status} - ${errorText}`);
    }

    const data: YelpReviewsResponse = await response.json();
    console.log('✅ Fetched reviews:', data.reviews?.length || 0);
    return data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews from Yelp:', error);
    return [];
  }
}
