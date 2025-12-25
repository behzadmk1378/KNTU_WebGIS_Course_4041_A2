/* ============================================
   API CONFIGURATION FILE - EXAMPLE
   Copy this file to config.js and add your actual API keys
   
   Instructions:
   1. Copy this file: copy config.example.js config.js
   2. Edit config.js and add your API keys
   3. DO NOT commit config.js to Git!
   ============================================ */

// Geocoding API Configuration
// Currently using Nominatim - no API key required
// If you switch to Google Maps, Mapbox, etc., add your key here
const GEOCODING_API_KEY = ''; // Leave empty for Nominatim
const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/search';

// Weather API Configuration  
// Currently using Open-Meteo - no API key required
// If you switch to OpenWeatherMap, WeatherAPI.com, etc., add your key here
const WEATHER_API_KEY = ''; // Leave empty for Open-Meteo
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Note: These variables are globally available in script.js
