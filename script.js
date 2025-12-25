// Global variables
let map;
let markerLayer;
let autocompleteTimeout;

// API Configuration
const GEOCODING_API_KEY = '';
const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/search';
const WEATHER_API_KEY = '';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupSearchListeners();
    setupWeatherListeners();
});

// Initialize the map
function initializeMap() {
    const markerSource = new ol.source.Vector();
    markerLayer = new ol.layer.Vector({
        source: markerSource,
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: '#ff4444' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
        })
    });
    
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            markerLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([51.4093, 35.7447]),
            zoom: 12
        })
    });
}

// Add marker to map
function addMarker(coordinates, label) {
    const source = markerLayer.getSource();
    source.clear();
    
    const point = new ol.geom.Point(ol.proj.fromLonLat(coordinates));
    const marker = new ol.Feature({ geometry: point, name: label });
    
    source.addFeature(marker);
}

// Setup search button and autocomplete
function setupSearchListeners() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('search-results');
    
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            resultsContainer.classList.add('hidden');
            performSearch();
        }
    });
    
    // Autocomplete as user types
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        clearTimeout(autocompleteTimeout);
        
        if (query.length < 3) {
            resultsContainer.classList.add('hidden');
            return;
        }
        
        // Wait 300ms after user stops typing
        autocompleteTimeout = setTimeout(() => {
            fetchAutocomplete(query);
        }, 300);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });
}

// Fetch autocomplete suggestions
async function fetchAutocomplete(query) {
    try {
        const requiresApiKey = GEOCODING_API_URL.includes('neshan');
        let url, options = { method: 'GET' };
        
        if (requiresApiKey) {
            url = `${GEOCODING_API_URL}?term=${encodeURIComponent(query)}`;
            options.headers = { 'Api-Key': GEOCODING_API_KEY };
        } else {
            url = `${GEOCODING_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5`;
        }
        
        const response = await fetch(url, options);
        if (!response.ok) return;
        
        const data = await response.json();
        const results = requiresApiKey ? data.items : data;
        
        if (results && results.length > 0) {
            displaySearchResults(results, requiresApiKey, true);
        }
        
    } catch (error) {
        // Silently fail for autocomplete
    }
}

// Perform search
async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a location');
        return;
    }
    
    searchButton.disabled = true;
    searchButton.textContent = '🔍 Searching...';
    
    try {
        const requiresApiKey = GEOCODING_API_URL.includes('neshan');
        let url, options = { method: 'GET' };
        
        if (requiresApiKey) {
            url = `${GEOCODING_API_URL}?term=${encodeURIComponent(query)}`;
            options.headers = { 'Api-Key': GEOCODING_API_KEY };
        } else {
            url = `${GEOCODING_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=5`;
        }
        
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        const results = requiresApiKey ? data.items : data;
        
        if (!results || results.length === 0) {
            alert('Location not found');
            return;
        }
        
        displaySearchResults(results, requiresApiKey);
        
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = '🔍 Search';
    }
}

// Display search results
function displaySearchResults(results, requiresApiKey, isAutocomplete = false) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    if (results.length === 1 && !isAutocomplete) {
        selectSearchResult(results[0], requiresApiKey);
        return;
    }
    
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        if (requiresApiKey) {
            item.innerHTML = `<div class="result-title">${result.title}</div>
                             <div class="result-address">${result.address || ''}</div>`;
        } else {
            const parts = result.display_name.split(',');
            item.innerHTML = `<div class="result-title">${parts[0]}</div>
                             <div class="result-address">${parts.slice(1).join(',')}</div>`;
        }
        
        item.onclick = () => selectSearchResult(result, requiresApiKey);
        container.appendChild(item);
    });
    
    container.classList.remove('hidden');
}

// Select a search result
function selectSearchResult(result, requiresApiKey) {
    let lon, lat, name;
    
    if (requiresApiKey) {
        lon = result.location.x;
        lat = result.location.y;
        name = result.title;
    } else {
        lon = parseFloat(result.lon);
        lat = parseFloat(result.lat);
        name = result.display_name;
    }
    
    document.getElementById('search-results').classList.add('hidden');
    document.getElementById('search-input').value = name;
    
    addMarker([lon, lat], name);
    
    map.getView().animate({
        center: ol.proj.fromLonLat([lon, lat]),
        zoom: 14,
        duration: 1000
    });
}

// Setup weather listeners
function setupWeatherListeners() {
    map.on('singleclick', function(event) {
        const coords = ol.proj.toLonLat(event.coordinate);
        fetchWeather(coords[1], coords[0]);
    });
    
    document.getElementById('close-weather').onclick = hideWeather;
}

// Fetch weather data
async function fetchWeather(lat, lon) {
    const panel = document.getElementById('weather-panel');
    const content = document.getElementById('weather-content');
    
    panel.classList.remove('hidden');
    content.innerHTML = '<div class="weather-loading">Loading...</div>';
    
    try {
        const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Weather fetch failed');
        
        const data = await response.json();
        const weather = data.current_weather;
        
        displayWeather({
            temp: weather.temperature,
            wind: weather.windspeed,
            windDir: weather.winddirection,
            code: weather.weathercode,
            lat: lat.toFixed(4),
            lon: lon.toFixed(4)
        });
        
    } catch (error) {
        content.innerHTML = '<div class="weather-error">Failed to load weather</div>';
    }
}

// Display weather data
function displayWeather(w) {
    const content = document.getElementById('weather-content');
    const conditions = getWeatherDesc(w.code);
    const direction = getWindDir(w.windDir);
    
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

// Get weather description
function getWeatherDesc(code) {
    const codes = {
        0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 51: 'Light drizzle', 61: 'Rain', 71: 'Snow',
        80: 'Rain showers', 95: 'Thunderstorm'
    };
    return codes[code] || 'Unknown';
}

// Get wind direction
function getWindDir(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}



