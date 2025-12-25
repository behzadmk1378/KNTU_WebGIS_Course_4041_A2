/* ============================================
   API CONFIGURATION FILE - EXAMPLE
   Copy this file to config.js and add your actual API keys
   
   Instructions:
   1. Copy this file: copy config.example.js config.js
   2. Edit config.js and add your API keys
   3. DO NOT commit config.js to Git!
   ============================================ */

// Neshan Geocoding API Configuration
// Get your free API key from: https://platform.neshan.org/
// Free tier: 50,000 requests per month
const GEOCODING_API_KEY = 'your_neshan_api_key_here';
const GEOCODING_API_URL = 'https://api.neshan.org/v1/search';

// Weather API Configuration  
// Currently using Open-Meteo - no API key required
// If you switch to OpenWeatherMap, WeatherAPI.com, etc., add your key here
const WEATHER_API_KEY = ''; // Leave empty for Open-Meteo
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Note: These variables are globally available in script.js
