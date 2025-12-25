/* ============================================
   WEBGIS ASSIGNMENT 2 - INTERACTIVE MAP APPLICATION
   Main JavaScript file for map functionality
   ============================================ */

/* ============================================
   GLOBAL VARIABLES
   Store references to map components
   ============================================ */

// Global variables to store map and layer references
let map; // Main map object
let markerLayer; // Vector layer for displaying search result markers

// API Configuration is loaded from config.js
// GEOCODING_API_URL and WEATHER_API_URL are defined there
// This keeps API keys separate from the main code

/* ============================================
   MAP INITIALIZATION
   Creates and configures the OpenLayers map
   ============================================ */

// Wait for the DOM to be fully loaded before initializing the map
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize the map
    initializeMap();
    
    // Set up event listeners for search functionality
    setupSearchListeners();
    
    // Set up event listeners for weather functionality
    setupWeatherListeners();
    
});

/**
 * Initialize the OpenLayers map with base layer and view
 * This function sets up the map with OpenStreetMap tiles
 */
function initializeMap() {
    
    // Create a Vector Source to hold marker features
    // Vector Source manages a collection of vector features (points, lines, polygons)
    const markerSource = new ol.source.Vector();
    
    // Create a Vector Layer to display markers
    // Vector Layer renders vector features with custom styling
    markerLayer = new ol.layer.Vector({
        source: markerSource,
        // Style defines how markers will look on the map
        style: new ol.style.Style({
            // Image style for point features (markers)
            image: new ol.style.Circle({
                radius: 8, // Size of the marker circle
                fill: new ol.style.Fill({
                    color: '#ff4444' // Red fill color
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffffff', // White border
                    width: 2
                })
            })
        })
    });
    
    // Create a map instance
    // The Map is the core component of OpenLayers that brings everything together
    const map = new ol.Map({
        
        // Target specifies which HTML element will contain the map
        // It should match the id of our map container div in index.html
        target: 'map',
        
        // Layers define what we see on the map
        // Layers array can contain multiple layers stacked on top of each other
        layers: [
            // Create a Tile Layer with OpenStreetMap as the source
            // Tile Layer displays map tiles in a grid pattern
            new ol.layer.Tile({
                // OSM (OpenStreetMap) is a free, open-source map tile provider
                // It provides street-level map data from around the world
                source: new ol.source.OSM()
            }),
            
            // Add the marker layer on top of the base map
            // This layer will display search result markers
            markerLayer
        ],
        
        // View defines the map's viewport (center position, zoom level, projection)
        view: new ol.View({
            // Center defines the initial map center position [longitude, latitude]
            // Using Web Mercator projection (EPSG:3857) coordinates
            // These coordinates point to Tehran, Iran
            center: ol.proj.fromLonLat([51.4093, 35.7447]),
            
            // Zoom level determines how close/far the view is
            // Lower numbers = zoomed out (world view)
            // Higher numbers = zoomed in (street level)
            // Range typically: 0 (world) to 19 (building level)
            zoom: 12,
            
            // Set minimum and maximum zoom levels for better UX
            minZoom: 3,  // Prevent zooming out too far
            maxZoom: 19  // Prevent zooming in beyond tile detail
        })
    });
    
    // Store map reference globally so other functions can access it
    // This allows us to use the map in search and weather functions later
    window.map = map;
    
    console.log('Map initialized successfully');
}

/* ============================================
   MARKER MANAGEMENT FUNCTIONS
   Add and remove markers on the map
   ============================================ */

/**
 * Add a marker to the map at the specified coordinates
 * @param {Array} coordinates - [longitude, latitude] in EPSG:4326
 * @param {string} label - Optional label for the marker
 */
function addMarker(coordinates, label = '') {
    // Get the vector source from the marker layer
    const source = markerLayer.getSource();
    
    // Clear any existing markers
    // This ensures only one search result marker is shown at a time
    source.clear();
    
    // Convert coordinates from longitude/latitude (EPSG:4326) to Web Mercator (EPSG:3857)
    // OpenLayers map uses Web Mercator projection by default
    const transformedCoords = ol.proj.fromLonLat(coordinates);
    
    // Create a Point geometry at the transformed coordinates
    const point = new ol.geom.Point(transformedCoords);
    
    // Create a Feature with the point geometry
    // Feature represents a geographic element with geometry and properties
    const marker = new ol.Feature({
        geometry: point,
        name: label // Store the label as a property
    });
    
    // Add the marker feature to the vector source
    // This will display the marker on the map
    source.addFeature(marker);
    
    console.log(`Marker added at: ${coordinates[0]}, ${coordinates[1]}`);
}

/* ============================================
   GEOCODING SEARCH FUNCTIONALITY
   Search for locations and display on map
   ============================================ */

/**
 * Set up event listeners for search functionality
 */
function setupSearchListeners() {
    // Get references to search UI elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    // Add click event listener to search button
    searchButton.addEventListener('click', performSearch);
    
    // Add Enter key listener to search input for better UX
    // Users can press Enter instead of clicking the button
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    console.log('Search listeners initialized');
}

/**
 * Perform geocoding search using the Fetch API
 * This is an async function because we need to wait for API responses
 */
async function performSearch() {
    // Get the search input element
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    // Get the search query from input and remove extra spaces
    const query = searchInput.value.trim();
    
    // Validate that user entered something
    if (!query) {
        alert('Please enter a location to search');
        return;
    }
    
    // Disable button and show loading state
    searchButton.disabled = true;
    searchButton.textContent = '🔍 Searching...';
    
    try {
        // Make API request using Fetch API with Neshan
        // await pauses execution until the fetch completes
        console.log(`Searching for: ${query}`);
        
        // Build the API URL with query parameters
        // Neshan API uses 'term' parameter for search query
        const url = `${GEOCODING_API_URL}?term=${encodeURIComponent(query)}`;
        
        // Fetch data from Neshan API
        // Neshan requires API key in the headers
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Api-Key': GEOCODING_API_KEY, // Neshan requires API key in header
                'Content-Type': 'application/json'
            }
        });
        
        // Check if the HTTP request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        // await pauses until JSON parsing is complete
        const data = await response.json();
        
        // Check if we got any results
        // Neshan returns an items array with search results
        if (!data.items || data.items.length === 0) {
            alert('Location not found. Please try a different search term.');
            return;
        }
        
        // Extract coordinates from the first result
        // Neshan API returns location in different format
        const result = data.items[0];
        const lon = result.location.x; // Neshan uses x for longitude
        const lat = result.location.y; // Neshan uses y for latitude
        const displayName = result.title; // Use title as display name
        const address = result.address || ''; // Additional address information
        
        // Combine title and address for better display
        const fullName = address ? `${displayName}, ${address}` : displayName;
        
        console.log(`Found: ${fullName} at [${lon}, ${lat}]`);
        
        // Add marker to the map
        addMarker([lon, lat], fullName);
        
        // Animate the map to zoom to the found location
        animateToLocation([lon, lat]);
        
        // Show success feedback
        searchInput.value = fullName;
        
    } catch (error) {
        // Handle any errors that occurred during fetch or processing
        console.error('Error during geocoding search:', error);
        alert('An error occurred while searching. Please check your API key and try again.');
        
    } finally {
        // Re-enable button and restore original text
        // finally block always executes, whether success or error
        searchButton.disabled = false;
        searchButton.textContent = '🔍 Search';
    }
}

/**
 * Animate the map view to center on a location with smooth transition
 * @param {Array} coordinates - [longitude, latitude] to zoom to
 */
function animateToLocation(coordinates) {
    // Get the map view
    const view = map.getView();
    
    // Convert coordinates to the map's projection (Web Mercator)
    const transformedCoords = ol.proj.fromLonLat(coordinates);
    
    // Animate the view to the new location
    // Using OpenLayers animation features for smooth transition
    view.animate({
        center: transformedCoords, // Target center position
        zoom: 14, // Target zoom level (street level)
        duration: 1000 // Animation duration in milliseconds
    });
    
    console.log('Animated to location');
}

/* ============================================
   WEATHER FUNCTIONALITY
   Fetch and display weather data on map click
   ============================================ */

/**
 * Set up event listeners for weather functionality
 */
function setupWeatherListeners() {
    // Add click event listener to the map
    // When user clicks anywhere on the map, fetch weather for that location
    map.on('singleclick', function(event) {
        // Get the clicked coordinates
        const clickedCoord = event.coordinate;
        
        // Convert from Web Mercator (EPSG:3857) to longitude/latitude (EPSG:4326)
        const lonLat = ol.proj.toLonLat(clickedCoord);
        
        // Extract longitude and latitude
        const lon = lonLat[0];
        const lat = lonLat[1];
        
        console.log(`Map clicked at: Lon ${lon}, Lat ${lat}`);
        
        // Fetch weather data for the clicked location
        fetchWeatherData(lat, lon);
    });
    
    // Set up close button for weather panel
    const closeButton = document.getElementById('close-weather');
    closeButton.addEventListener('click', hideWeatherPanel);
    
    console.log('Weather listeners initialized');
}

/**
 * Fetch weather data from the weather API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function fetchWeatherData(lat, lon) {
    const weatherPanel = document.getElementById('weather-panel');
    const weatherContent = document.getElementById('weather-content');
    
    // Show the weather panel
    weatherPanel.classList.remove('hidden');
    
    // Show loading state
    weatherContent.innerHTML = '<div class="weather-loading">⏳ Loading weather data...</div>';
    
    try {
        // Build API URL with parameters
        // Open-Meteo provides current weather data for free
        // Parameters:
        // - latitude, longitude: Location coordinates
        // - current_weather=true: Request current weather conditions
        // - temperature_unit=celsius: Use Celsius for temperature
        const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;
        
        console.log('Fetching weather data...');
        
        // Fetch data from weather API
        const response = await fetch(url);
        
        // Check if request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Extract weather information
        const currentWeather = data.current_weather;
        
        // Display weather data
        displayWeatherData({
            temperature: currentWeather.temperature,
            windSpeed: currentWeather.windspeed,
            windDirection: currentWeather.winddirection,
            weatherCode: currentWeather.weathercode,
            time: currentWeather.time,
            latitude: lat.toFixed(4),
            longitude: lon.toFixed(4)
        });
        
        console.log('Weather data loaded successfully');
        
    } catch (error) {
        // Handle errors
        console.error('Error fetching weather data:', error);
        weatherContent.innerHTML = '<div class="weather-error">❌ Failed to load weather data. Please try again.</div>';
    }
}

/**
 * Display weather data in the weather panel
 * @param {Object} weatherData - Weather information to display
 */
function displayWeatherData(weatherData) {
    const weatherContent = document.getElementById('weather-content');
    
    // Convert weather code to human-readable description
    const weatherDescription = getWeatherDescription(weatherData.weatherCode);
    
    // Convert wind direction degrees to compass direction
    const windDirectionText = getWindDirection(weatherData.windDirection);
    
    // Build HTML for weather display
    const html = `
        <div class="weather-item">
            <span class="weather-label">📍 Location:</span>
            <span class="weather-value">${weatherData.latitude}, ${weatherData.longitude}</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">🌡️ Temperature:</span>
            <span class="weather-value">${weatherData.temperature}°C</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">☁️ Conditions:</span>
            <span class="weather-value">${weatherDescription}</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">💨 Wind Speed:</span>
            <span class="weather-value">${weatherData.windSpeed} km/h</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">🧭 Wind Direction:</span>
            <span class="weather-value">${windDirectionText} (${weatherData.windDirection}°)</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">🕐 Updated:</span>
            <span class="weather-value">${formatDateTime(weatherData.time)}</span>
        </div>
    `;
    
    // Insert HTML into weather content container
    weatherContent.innerHTML = html;
}

/**
 * Hide the weather panel
 */
function hideWeatherPanel() {
    const weatherPanel = document.getElementById('weather-panel');
    weatherPanel.classList.add('hidden');
}

/**
 * Convert WMO weather code to human-readable description
 * @param {number} code - WMO weather code
 * @returns {string} Weather description
 */
function getWeatherDescription(code) {
    // WMO Weather interpretation codes
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    
    return weatherCodes[code] || 'Unknown';
}

/**
 * Convert wind direction in degrees to compass direction
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Compass direction (N, NE, E, etc.)
 */
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    // Calculate which direction slice the degrees falls into
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

/**
 * Format ISO datetime string to readable format
 * @param {string} isoString - ISO 8601 datetime string
 * @returns {string} Formatted datetime
 */
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}



