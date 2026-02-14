// Global variables - accessible from anywhere in the code
let map; // The main OpenLayers map object
let markerLayer; // Vector layer to display search result markers
let autocompleteTimeout; // Timer for delaying autocomplete requests

// API Configuration - URLs and keys for external services
const GEOCODING_API_KEY = ''; // Empty because Nominatim doesn't need a key
const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/search'; // Free geocoding service
const WEATHER_API_KEY = ''; // Empty because Open-Meteo doesn't need a key
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'; // Free weather service

// Wait for page to load before running any code
document.addEventListener('DOMContentLoaded', function() {
    initializeMap(); // Set up the map
    setupSearchListeners(); // Set up search bar
    setupWeatherListeners(); // Set up weather click events
});

// Initialize the map with OpenLayers
function initializeMap() {
    // Create a vector source to hold markers
    const markerSource = new ol.source.Vector();
    
    // Create a vector layer with custom styling for markers
    markerLayer = new ol.layer.Vector({
        source: markerSource,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8, // Size of the marker
                fill: new ol.style.Fill({ color: '#ff4444' }), // Red fill
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 }) // White border
            })
        })
    });
    
    // Create the main map object
    map = new ol.Map({
        target: 'map', // ID of the HTML element to render the map in
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }), // OpenStreetMap base layer
            markerLayer // Our custom marker layer on top
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([51.4093, 35.7447]), // Tehran coordinates (lon, lat)
            zoom: 12 // Initial zoom level
        })
    });
}

// Add a marker to the map at specified coordinates
function addMarker(coordinates, label) {
    const source = markerLayer.getSource();
    source.clear(); // Remove any existing markers
    
    // Create a point geometry from longitude and latitude
    const point = new ol.geom.Point(ol.proj.fromLonLat(coordinates));
    
    // Create a feature (map object) with the point
    const marker = new ol.Feature({ geometry: point, name: label });
    
    // Add the marker to the map
    source.addFeature(marker);
}

// Setup search button and autocomplete functionality
function setupSearchListeners() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('search-results');
    
    // When user clicks the search button
    searchButton.addEventListener('click', performSearch);
    
    // When user presses Enter key in the search box
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            resultsContainer.classList.add('hidden'); // Hide suggestions
            performSearch(); // Do the search
        }
    });
    
    // Autocomplete as user types
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim(); // Get what user typed
        
        clearTimeout(autocompleteTimeout); // Cancel any pending requests
        
        // Only search if user typed at least 3 characters
        if (query.length < 3) {
            resultsContainer.classList.add('hidden');
            return;
        }
        
        // Wait 300ms after user stops typing before searching
        // This prevents too many API requests while user is still typing
        autocompleteTimeout = setTimeout(() => {
            fetchAutocomplete(query);
        }, 300);
    });
    
    // Hide results when clicking outside the search area
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });
}

// Fetch autocomplete suggestions from the geocoding API
async function fetchAutocomplete(query) {
    try {
        // Check if the API needs an authentication key
        const requiresApiKey = GEOCODING_API_URL.includes('neshan');
        let url, options = { method: 'GET' };
        
        // Build the API request based on which service we're using
        if (requiresApiKey) {
            // Services like Neshan that need an API key
            url = `${GEOCODING_API_URL}?term=${encodeURIComponent(query)}`;
            options.headers = { 'Api-Key': GEOCODING_API_KEY };
        } else {
            // Free services like Nominatim
            url = `${GEOCODING_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5`;
        }
        
        // Make the API request
        const response = await fetch(url, options);
        if (!response.ok) return; // If request failed, just exit quietly
        
        // Parse the JSON response
        const data = await response.json();
        const results = requiresApiKey ? data.items : data;
        
        // Display results if we found any
        if (results && results.length > 0) {
            displaySearchResults(results, requiresApiKey, true);
        }
        
    } catch (error) {
        // Silently fail for autocomplete - don't bother the user
    }
}

// Perform search when user clicks search button or presses Enter
async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const query = searchInput.value.trim(); // Get the search text
    
    // Make sure user entered something
    if (!query) {
        alert('Please enter a location');
        return;
    }
    
    // Show loading state
    searchButton.disabled = true;
    searchButton.textContent = '🔍 Searching...';
    
    try {
        // Check if the API needs an authentication key
        const requiresApiKey = GEOCODING_API_URL.includes('neshan');
        let url, options = { method: 'GET' };
        
        // Build the API request
        if (requiresApiKey) {
            url = `${GEOCODING_API_URL}?term=${encodeURIComponent(query)}`;
            options.headers = { 'Api-Key': GEOCODING_API_KEY };
        } else {
            url = `${GEOCODING_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5`;
        }
        
        // Make the API request
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Search failed');
        
        // Parse the response
        const data = await response.json();
        const results = requiresApiKey ? data.items : data;
        
        // Check if we got any results
        if (!results || results.length === 0) {
            alert('Location not found');
            return;
        }
        
        // Show the results to the user
        displaySearchResults(results, requiresApiKey);
        
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        // Reset button state whether we succeeded or failed
        searchButton.disabled = false;
        searchButton.textContent = '🔍 Search';
    }
}

// Display search results in a dropdown list
function displaySearchResults(results, requiresApiKey, isAutocomplete = false) {
    const container = document.getElementById('search-results');
    container.innerHTML = ''; // Clear previous results
    
    // If only one result and not autocomplete, select it automatically
    if (results.length === 1 && !isAutocomplete) {
        selectSearchResult(results[0], requiresApiKey);
        return;
    }
    
    // Create a list item for each result
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        // Format the result differently based on API type
        if (requiresApiKey) {
            // APIs that use 'title' and 'address' fields
            item.innerHTML = `<div class="result-title">${result.title}</div>
                             <div class="result-address">${result.address || ''}</div>`;
        } else {
            // Nominatim uses 'display_name' - split it into title and address
            const parts = result.display_name.split(',');
            item.innerHTML = `<div class="result-title">${parts[0]}</div>
                             <div class="result-address">${parts.slice(1).join(',')}</div>`;
        }
        
        // When user clicks this result, select it
        item.onclick = () => selectSearchResult(result, requiresApiKey);
        container.appendChild(item);
    });
    
    // Show the results dropdown
    container.classList.remove('hidden');
}

// Select a search result and show it on the map
function selectSearchResult(result, requiresApiKey) {
    let lon, lat, name;
    
    // Extract coordinates and name based on API type
    if (requiresApiKey) {
        // APIs that use location.x and location.y
        lon = result.location.x;
        lat = result.location.y;
        name = result.title;
    } else {
        // Nominatim uses 'lon' and 'lat' directly
        lon = parseFloat(result.lon);
        lat = parseFloat(result.lat);
        name = result.display_name;
    }
    
    // Hide the results dropdown
    document.getElementById('search-results').classList.add('hidden');
    
    // Update the search box with the selected location
    document.getElementById('search-input').value = name;
    
    // Add a marker at this location
    addMarker([lon, lat], name);
    
    // Smoothly animate the map to this location
    map.getView().animate({
        center: ol.proj.fromLonLat([lon, lat]), // Where to zoom to
        zoom: 14, // Zoom level (street level)
        duration: 1000 // Animation takes 1 second
    });
}

// Setup weather listeners - fetch weather when user clicks the map
function setupWeatherListeners() {
    // When user clicks the map
    map.on('singleclick', function(event) {
        // Get the coordinates where user clicked
        const coords = ol.proj.toLonLat(event.coordinate);
        
        // Fetch weather for that location (coords[1] is lat, coords[0] is lon)
        fetchWeather(coords[1], coords[0]);
    });
    
    // Close button in weather panel
    document.getElementById('close-weather').onclick = hideWeather;
}

// Fetch weather data from the weather API
async function fetchWeather(lat, lon) {
    const panel = document.getElementById('weather-panel');
    const content = document.getElementById('weather-content');
    
    // Show the weather panel with a loading message
    panel.classList.remove('hidden');
    content.innerHTML = '<div class="weather-loading">Loading...</div>';
    
    try {
        // Build the API request URL
        const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        // Fetch weather data
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Weather fetch failed');
        
        // Parse the response
        const data = await response.json();
        const weather = data.current_weather;
        
        // Display the weather data
        displayWeather({
            temp: weather.temperature,
            wind: weather.windspeed,
            windDir: weather.winddirection,
            code: weather.weathercode,
            lat: lat.toFixed(4), // Round to 4 decimal places
            lon: lon.toFixed(4)
        });
        
    } catch (error) {
        // If something went wrong, show an error message
        content.innerHTML = '<div class="weather-error">Failed to load weather</div>';
    }
}

// Display weather data in the weather panel
function displayWeather(w) {
    const content = document.getElementById('weather-content');
    
    // Convert weather code to readable text
    const conditions = getWeatherDesc(w.code);
    
    // Convert wind direction from degrees to compass direction
    const direction = getWindDir(w.windDir);
    
    // Build HTML to display weather information
    content.innerHTML = `
        <div class="weather-item">
            <span class="weather-label">📍 Location:</span>
            <span class="weather-value">${w.lat}, ${w.lon}</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">🌡️ Temperature:</span>
            <span class="weather-value">${w.temp}°C</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">☁️ Conditions:</span>
            <span class="weather-value">${conditions}</span>
        </div>
        <div class="weather-item">
            <span class="weather-label">💨 Wind:</span>
            <span class="weather-value">${w.wind} km/h ${direction}</span>
        </div>
    `;
}

// Hide weather panel
function hideWeather() {
    document.getElementById('weather-panel').classList.add('hidden');
}

// Get weather description from WMO weather code
function getWeatherDesc(code) {
    // WMO (World Meteorological Organization) standard weather codes
    const codes = {
        0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 51: 'Light drizzle', 61: 'Rain', 71: 'Snow',
        80: 'Rain showers', 95: 'Thunderstorm'
    };
    return codes[code] || 'Unknown'; // Return 'Unknown' if code not in list
}

// Get wind direction from degrees (0-360) to compass direction (N, NE, E, etc.)
function getWindDir(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    // Divide circle into 8 sections (360 / 8 = 45 degrees each)
    return dirs[Math.round(deg / 45) % 8];
}



