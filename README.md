# WebGIS Assignment 2 - Interactive Map with Weather

An interactive web mapping application built with OpenLayers that provides geocoding search functionality and real-time weather information.

## 🌟 Features

- **Interactive Map**: Powered by OpenLayers with OpenStreetMap base tiles
- **Location Search**: Search for any location worldwide using geocoding
- **Weather Information**: Click anywhere on the map to get current weather data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Animated map transitions and user-friendly interactions

## 📋 Table of Contents

- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [OpenLayers Features](#openlayers-features)
- [API Research & Comparison](#api-research--comparison)
  - [Geocoding APIs](#geocoding-apis)
  - [Weather APIs](#weather-apis)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Configuration](#api-configuration)

## 🚀 Demo

### How to Use:
1. **Search for a Location**: Enter a city, address, or landmark in the search bar
2. **Click the Map**: Click anywhere on the map to get weather information for that location
3. **View Weather Data**: See temperature, wind speed, conditions, and more
4. **Close Panel**: Click the X button to close the weather panel

## 🛠️ Technologies Used

- **OpenLayers 10.3.1**: High-performance mapping library
- **HTML5**: Modern semantic markup
- **CSS3**: Custom styling with gradients and animations
- **Vanilla JavaScript**: No frameworks required
- **Fetch API**: Modern asynchronous HTTP requests
- **Neshan Maps API**: Iranian-focused geocoding service with Persian support
- **Open-Meteo API**: Free weather data service

## 🗺️ OpenLayers Features

This project demonstrates the following OpenLayers capabilities:

### 1. **Map Initialization**
- `ol.Map`: Core map component
- `ol.View`: Controls map viewport (center, zoom, projection)
- Projection transformation: Converting between EPSG:4326 (WGS84) and EPSG:3857 (Web Mercator)

### 2. **Layers**

#### Tile Layer (Base Map)
- `ol.layer.Tile`: Displays tiled map images
- `ol.source.OSM`: OpenStreetMap tile source
- Provides street-level map data

#### Vector Layer (Markers)
- `ol.layer.Vector`: Renders vector features
- `ol.source.Vector`: Manages vector feature collection
- `ol.Feature`: Represents geographic elements
- `ol.geom.Point`: Point geometry for markers

### 3. **Styling**
- `ol.style.Style`: Feature styling
- `ol.style.Circle`: Circular point markers
- `ol.style.Fill`: Fill colors for markers
- `ol.style.Stroke`: Border styling

### 4. **Interactions**
- Map click events (`singleclick`)
- Coordinate transformation (`ol.proj.fromLonLat`, `ol.proj.toLonLat`)
- Dynamic feature management (add/remove markers)

### 5. **View Controls**
- `view.animate()`: Smooth map transitions
- Configurable zoom levels (min: 3, max: 19)
- Center positioning

### 6. **Coordinate Systems**
- **EPSG:4326**: Longitude/Latitude (used by APIs)
- **EPSG:3857**: Web Mercator (used by OpenLayers)
- Automatic coordinate transformations

## 📊 API Research & Comparison

### Geocoding APIs

I researched and compared the following geocoding APIs:

| API Provider | Free Tier | Rate Limit (Free) | Paid Pricing | API Key Required | Website |
|--------------|-----------|-------------------|--------------|------------------|---------|
| **Nominatim** (OpenStreetMap) | ✅ Unlimited | 1 request/second | Free only | ❌ No | [nominatim.org](https://nominatim.org/) |
| **Google Maps Geocoding** | $200 credit/month | 40,000 requests/month | $5 per 1,000 requests after | ✅ Yes | [developers.google.com/maps](https://developers.google.com/maps/documentation/geocoding) |
| **Mapbox Geocoding** | ✅ 100,000 requests/month | 100,000/month | $0.50 per 1,000 requests after | ✅ Yes | [mapbox.com/geocoding](https://www.mapbox.com/geocoding) |
| **LocationIQ** | ✅ 5,000 requests/day | 5,000/day (150k/month) | $49/month for 100k requests | ✅ Yes | [locationiq.com](https://locationiq.com/) |

#### Price Comparison & Ratios

Calculating for 100,000 requests per month:

- **Nominatim**: FREE (community service)
- **Google Maps**: ~$250 (after $200 credit: $5 × 50 = $250)
- **Mapbox**: FREE (within free tier)
- **LocationIQ**: FREE (within free tier)

**Price Ratios (for 500,000 requests/month):**
- Google Maps: $2,500 (baseline)
- Mapbox: $2,000 (0.8× Google Maps cost)
- LocationIQ: $294 (0.12× Google Maps cost - 8.3× cheaper!)
- Nominatim: FREE (∞× cheaper, but limited by rate)

#### My Choice: **Nominatim**

**Reasoning:**
1. **Cost**: Completely free with no registration
2. **No API Key**: Simplifies setup and deployment
3. **Sufficient Rate Limit**: 1 req/sec is adequate for educational projects
4. **Privacy**: Open-source, no user tracking
5. **Reliability**: Backed by OpenStreetMap community
6. **Limitations**: For production apps with high traffic, I would switch to LocationIQ or Mapbox

### Weather APIs

I researched and compared the following weather APIs:

| API Provider | Free Tier | Rate Limit (Free) | Paid Pricing | API Key Required | Website |
|--------------|-----------|-------------------|--------------|------------------|---------|
| **Open-Meteo** | ✅ Unlimited | 10,000 requests/day | Free only | ❌ No | [open-meteo.com](https://open-meteo.com/) |
| **OpenWeatherMap** | ✅ 1,000 requests/day | 60 calls/minute | $40/month for 100k calls | ✅ Yes | [openweathermap.org](https://openweathermap.org/api) |
| **WeatherAPI.com** | ✅ 1,000,000 calls/month | 1 million/month | $9.99/month for 2M calls | ✅ Yes | [weatherapi.com](https://www.weatherapi.com/) |
| **Visual Crossing** | ✅ 1,000 records/day | 1,000/day (30k/month) | $0.0001 per record | ✅ Yes | [visualcrossing.com](https://www.visualcrossing.com/weather-api) |

#### Price Comparison & Ratios

Calculating for 100,000 requests per month (~3,300/day):

- **Open-Meteo**: FREE
- **OpenWeatherMap**: ~$120 ($40/month for 100k calls)
- **WeatherAPI.com**: FREE (within free tier)
- **Visual Crossing**: $10 (0.0001 × 100,000)

**Price Ratios (for 3,000,000 requests/month):**
- OpenWeatherMap: $1,200 (baseline: $40 × 30 = $1,200)
- WeatherAPI.com: $29.97 (0.025× OpenWeatherMap - 40× cheaper!)
- Visual Crossing: $300 (0.25× OpenWeatherMap - 4× cheaper)
- Open-Meteo: FREE (∞× cheaper!)

#### My Choice: **Open-Meteo**

**Reasoning:**
1. **Cost**: Completely free with no API key required
2. **Generous Limits**: 10,000 requests/day is excellent for any project
3. **No Registration**: Simplifies setup - no account needed
4. **Data Quality**: High-quality weather data from multiple sources
5. **Features**: Provides current weather, forecasts, and historical data
6. **Open Source**: Transparent and community-driven
7. **Perfect for Learning**: No barriers to getting started

**Alternative**: For production applications requiring more advanced features (alerts, air quality, etc.), I would consider **WeatherAPI.com** for its excellent free tier and low paid pricing.

## 💾 Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- No build tools required!

### Steps

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd KNTU_WebGIS_Course_4041_A2
   ```

2. **Configure API Keys**
   ```bash
   # Copy the example configuration file
   copy config.example.js config.js
   
   # Edit config.js and add your Neshan API key
   # Get your free API key from: https://platform.neshan.org/
   ```
   
   **Required:** Add your Neshan API key to `config.js`:
   ```javascript
   const GEOCODING_API_KEY = 'your_neshan_api_key_here';
   ```
   
   **Important:** `config.js` is excluded from Git via `.gitignore` to protect your API keys.

3. **Open the project**
   - Simply open `index.html` in your web browser
   - Or use a local server for better performance:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Or Python 2
     python -m SimpleHTTPServer 8000
     
     # Or Node.js (npx http-server)
     npx http-server
     ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:8000`

### API Keys Setup

**Geocoding API - Neshan Maps** 🇮🇷
- Get your free API key from [Neshan Platform](https://platform.neshan.org/)
- Free tier: 50,000 requests per month
- Excellent for Iranian locations and Persian addresses
- Add your key to `config.js`

**Weather API - Open-Meteo** ✅
- No API key required
- Completely free with generous limits

If you want to use alternative APIs (Google Maps, OpenWeatherMap, etc.), simply edit `config.js` and add your keys there.

## 📖 Usage

### Search for a Location

1. Type a location name in the search bar (e.g., "Tehran", "Paris", "Tokyo")
2. Click the Search button or press Enter
3. The map will animate to the location and place a marker
4. The search input will update with the full address

### Get Weather Information

1. Click anywhere on the map
2. A weather panel will appear in the bottom-right corner
3. View current weather conditions:
   - 📍 Location coordinates
   - 🌡️ Temperature
   - ☁️ Weather conditions
   - 💨 Wind speed
   - 🧭 Wind direction
   - 🕐 Last update time

### Close Weather Panel

- Click the X button in the top-right of the weather panel

## 📁 Project Structure

```
KNTU_WebGIS_Course_4041_A2/
│
├── index.html          # Main HTML file with structure
├── style.css           # All styling and responsive design
├── script.js           # JavaScript with all functionality
├── config.js           # API keys configuration (NOT in Git)
├── config.example.js   # Example config file (safe to commit)
├── .gitignore          # Excludes sensitive files from Git
├── README.md           # This file - project documentation
└── INSTRUCTIONS.md     # Assignment instructions
```

## 🔧 API Configuration

### Current Configuration

The application uses Neshan Maps for geocoding and Open-Meteo for weather:

```javascript
// Neshan Geocoding API (Requires API Key)
const GEOCODING_API_KEY = 'your_api_key_here';
const GEOCODING_API_URL = 'https://api.neshan.org/v1/search';

// Weather API (Open-Meteo - No key required)
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
```

### Why Neshan Maps?

**Advantages:**
- 🇮🇷 **Best for Iran**: Superior coverage of Iranian locations
- 🔤 **Persian Support**: Native Farsi language support
- 🎯 **Accurate**: Better results for Iranian addresses
- 💰 **Generous Free Tier**: 50,000 requests/month
- 🚀 **Fast**: Low latency for Iranian users

**API Usage:**
```javascript
// Neshan requires API key in headers
fetch(url, {
  headers: {
    'Api-Key': 'your_api_key_here'
  }
});
```

### Switching to Different APIs

#### Using Google Maps Geocoding

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `script.js`:
   ```javascript
   const GEOCODING_API_KEY = 'YOUR_GOOGLE_API_KEY';
   const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
   ```
3. Modify the fetch URL in `performSearch()` function

#### Using OpenWeatherMap

1. Get API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Update `script.js`:
   ```javascript
   const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_KEY';
   const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
   ```
3. Modify the fetch URL in `fetchWeatherData()` function

## 🎯 Learning Outcomes

Through this project, I learned:

1. **OpenLayers Fundamentals**
   - Map initialization and configuration
   - Layer management (tile and vector layers)
   - Feature styling and rendering
   - Coordinate transformations between projections

2. **Asynchronous JavaScript**
   - Using the Fetch API for HTTP requests
   - Async/await syntax for cleaner code
   - Error handling with try-catch
   - Promise-based programming

3. **API Integration**
   - Researching and comparing different API providers
   - Understanding rate limits and pricing models
   - Making authenticated vs. public API calls
   - Parsing and displaying API responses

4. **Web Development Best Practices**
   - Responsive design principles
   - Clean, commented code
   - Separation of concerns (HTML/CSS/JS)
   - User experience considerations

## 👨‍💻 Author

Created as part of KNTU WebGIS Course Assignment 2.

## 📄 License

This project is created for educational purposes as part of a university assignment.

## 🙏 Acknowledgments

- [OpenLayers](https://openlayers.org/) - Amazing open-source mapping library
- [OpenStreetMap](https://www.openstreetmap.org/) - Community-driven map data
- [Nominatim](https://nominatim.org/) - Free geocoding service
- [Open-Meteo](https://open-meteo.com/) - Free weather API
- KNTU WebGIS Course instructors and teaching assistants
