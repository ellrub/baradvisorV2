/**
 * Configuration for the Baradvisor application
 */

export const config = {
  // Set to true to use Foursquare API, false to use mock data
  useApi: true,
  
  // Foursquare API settings
  foursquare: {
    radius: 5000, // Search radius in meters (5km)
    limit: 50,    // Maximum number of results
  },
  
  // Bergen, Norway coordinates
  bergenCenter: {
    latitude: 60.3913,
    longitude: 5.3221,
  },
} as const;
