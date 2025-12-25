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

// API Configuration
// TODO: Replace with your actual API key from Nominatim or other geocoding service
// For this example, we'll use Nominatim (OpenStreetMap's free geocoding service)
// Nominatim doesn't require an API key but has usage limits
const GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/search';

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
        // Make API request using Fetch API
        // await pauses execution until the fetch completes
        console.log(`Searching for: ${query}`);
        
        // Build the API URL with query parameters
        // format=json: Request JSON response
        // q=query: The search term
        // limit=1: Only return the best match
        const url = `${GEOCODING_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;
        
        // Fetch data from the API
        const response = await fetch(url);
        
        // Check if the HTTP request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        // await pauses until JSON parsing is complete
        const data = await response.json();
        
        // Check if we got any results
        if (data.length === 0) {
            alert('Location not found. Please try a different search term.');
            return;
        }
        
        // Extract coordinates from the first result
        const result = data[0];
        const lon = parseFloat(result.lon);
        const lat = parseFloat(result.lat);
        const displayName = result.display_name;
        
        console.log(`Found: ${displayName} at [${lon}, ${lat}]`);
        
        // Add marker to the map
        addMarker([lon, lat], displayName);
        
        // Animate the map to zoom to the found location
        animateToLocation([lon, lat]);
        
        // Show success feedback
        searchInput.value = displayName;
        
    } catch (error) {
        // Handle any errors that occurred during fetch or processing
        console.error('Error during geocoding search:', error);
        alert('An error occurred while searching. Please try again.');
        
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


