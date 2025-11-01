/**
 * Diagnostic tool to test Foursquare API connection
 * Run this in browser console to test your API key
 */

const API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;

console.log('🔍 Foursquare API Diagnostic Tool');
console.log('==================================');
console.log('API Key loaded:', API_KEY ? '✅ Yes' : '❌ No');
console.log('API Key length:', API_KEY?.length || 0);
console.log('API Key preview:', API_KEY ? `${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}` : 'N/A');
console.log('Has spaces:', API_KEY?.includes(' ') ? '⚠️ Yes (PROBLEM!)' : '✅ No');
console.log('Has newlines:', API_KEY?.includes('\n') ? '⚠️ Yes (PROBLEM!)' : '✅ No');

// Test API call
export async function testFoursquareConnection() {
  console.log('\n🧪 Testing Foursquare API...');
  
  if (!API_KEY) {
    console.error('❌ No API key found!');
    return;
  }

  try {
    const testUrl = 'https://places-api.foursquare.com/places/search?ll=60.3913,5.3221&limit=1';
    
    console.log('📡 Making request to:', testUrl);
    console.log('🔑 Using API key:', `${API_KEY.slice(0, 10)}...`);
    
    const response = await fetch(testUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY.trim()}`, // New 2025 format
        'X-Places-Api-Version': '2025-06-17', // Required version header
      },
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! API is working correctly');
      console.log('📍 Found places:', data.results?.length || 0);
      return data;
    } else {
      console.error('❌ API Error:', data);
      console.error('💡 Common fixes:');
      console.error('   1. Check your API key on https://foursquare.com/developers/apps');
      console.error('   2. Make sure the project is active');
      console.error('   3. Try creating a new API key');
      console.error('   4. Ensure no extra spaces in .env file');
      return data;
    }
  } catch (error) {
    console.error('❌ Connection Error:', error);
    return null;
  }
}

// Auto-run diagnostics
testFoursquareConnection();
