// Enhanced geocoding helper to convert location names to approximate coordinates
// In a production app, you would use a real geocoding service like Google Maps Geocoding API

// Expanded coordinate database for popular destinations with more accurate coordinates
const LOCATION_COORDINATES = {
  // Major world cities
  "Paris, France": { lat: 48.8566, lng: 2.3522 },
  "London, United Kingdom": { lat: 51.5074, lng: -0.1278 },
  "New York, United States": { lat: 40.7128, lng: -74.0060 },
  "Tokyo, Japan": { lat: 35.6762, lng: 139.6503 },
  "Sydney, Australia": { lat: -33.8688, lng: 151.2093 },
  "Rome, Italy": { lat: 41.9028, lng: 12.4964 },
  "Barcelona, Spain": { lat: 41.3851, lng: 2.1734 },
  "Berlin, Germany": { lat: 52.5200, lng: 13.4050 },
  "Madrid, Spain": { lat: 40.4168, lng: -3.7038 },
  "Amsterdam, Netherlands": { lat: 52.3676, lng: 4.9041 },
  "Vienna, Austria": { lat: 48.2082, lng: 16.3738 },
  "Prague, Czech Republic": { lat: 50.0755, lng: 14.4378 },
  "Dublin, Ireland": { lat: 53.3498, lng: -6.2603 },
  "Stockholm, Sweden": { lat: 59.3293, lng: 18.0686 },
  "Oslo, Norway": { lat: 59.9139, lng: 10.7522 },
  "Copenhagen, Denmark": { lat: 55.6761, lng: 12.5683 },
  "Helsinki, Finland": { lat: 60.1699, lng: 24.9384 },
  "Athens, Greece": { lat: 37.9838, lng: 23.7275 },
  "Istanbul, Turkey": { lat: 41.0082, lng: 28.9784 },
  "Moscow, Russia": { lat: 55.7558, lng: 37.6173 },
  "Beijing, China": { lat: 39.9042, lng: 116.4074 },
  "Shanghai, China": { lat: 31.2304, lng: 121.4737 },
  "Hong Kong, China": { lat: 22.3193, lng: 114.1694 },
  "Singapore, Singapore": { lat: 1.3521, lng: 103.8198 },
  "Bangkok, Thailand": { lat: 13.7563, lng: 100.5018 },
  "Seoul, South Korea": { lat: 37.5665, lng: 126.9780 },
  "Dubai, United Arab Emirates": { lat: 25.2048, lng: 55.2708 },
  "Cairo, Egypt": { lat: 30.0444, lng: 31.2357 },
  "Cape Town, South Africa": { lat: -33.9249, lng: 18.4241 },
  "Rio de Janeiro, Brazil": { lat: -22.9068, lng: -43.1729 },
  "Buenos Aires, Argentina": { lat: -34.6037, lng: -58.3816 },
  "Mexico City, Mexico": { lat: 19.4326, lng: -99.1332 },
  "Toronto, Canada": { lat: 43.6532, lng: -79.3832 },
  "Vancouver, Canada": { lat: 49.2827, lng: -123.1207 },
  "San Francisco, United States": { lat: 37.7749, lng: -122.4194 },
  "Los Angeles, United States": { lat: 34.0522, lng: -118.2437 },
  "Chicago, United States": { lat: 41.8781, lng: -87.6298 },
  "Miami, United States": { lat: 25.7617, lng: -80.1918 },
  "Las Vegas, United States": { lat: 36.1699, lng: -115.1398 },
  "Orlando, United States": { lat: 28.5383, lng: -81.3792 },
  
  // Popular tourist destinations
  "Bali, Indonesia": { lat: -8.3405, lng: 115.0920 },
  "Maldives, Maldives": { lat: 3.2028, lng: 73.2207 },
  "Santorini, Greece": { lat: 36.3932, lng: 25.4615 },
  "Bora Bora, French Polynesia": { lat: -16.5000, lng: -151.7500 },
  "Maui, Hawaii, United States": { lat: 20.7984, lng: -156.3319 },
  "Tuscany, Italy": { lat: 43.7710, lng: 11.2486 },
  "Swiss Alps, Switzerland": { lat: 46.5500, lng: 8.0000 },
  "Banff, Canada": { lat: 51.4968, lng: -115.9281 },
  "Great Barrier Reef, Australia": { lat: -18.2500, lng: 147.9667 },
  
  // Countries (capital cities)
  "France": { lat: 48.8566, lng: 2.3522 },
  "United Kingdom": { lat: 51.5074, lng: -0.1278 },
  "United States": { lat: 37.0902, lng: -95.7129 },
  "Japan": { lat: 35.6762, lng: 139.6503 },
  "Australia": { lat: -33.8688, lng: 151.2093 },
  "Italy": { lat: 41.9028, lng: 12.4964 },
  "Spain": { lat: 40.4168, lng: -3.7038 },
  "Germany": { lat: 52.5200, lng: 13.4050 },
  "Canada": { lat: 45.4215, lng: -75.6972 },
  "Brazil": { lat: -15.7942, lng: -47.8822 },
  "India": { lat: 28.6139, lng: 77.2090 },
  "China": { lat: 39.9042, lng: 116.4074 },
  "Russia": { lat: 55.7558, lng: 37.6173 },
  "Egypt": { lat: 30.0444, lng: 31.2357 },
  "Thailand": { lat: 13.7563, lng: 100.5018 },
  "Greece": { lat: 37.9838, lng: 23.7275 },
  "Turkey": { lat: 41.0082, lng: 28.9784 },
  "Mexico": { lat: 19.4326, lng: -99.1332 },
  "South Africa": { lat: -33.9249, lng: 18.4241 },
  "Argentina": { lat: -34.6037, lng: -58.3816 },
  "Indonesia": { lat: -6.2088, lng: 106.8456 },
  "Malaysia": { lat: 3.1390, lng: 101.6869 },
  "Vietnam": { lat: 21.0285, lng: 105.8542 },
  "Philippines": { lat: 14.5995, lng: 120.9842 },
  "South Korea": { lat: 37.5665, lng: 126.9780 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "New Zealand": { lat: -41.2865, lng: 174.7762 },
  "Ireland": { lat: 53.3498, lng: -6.2603 },
  "Netherlands": { lat: 52.3676, lng: 4.9041 },
  "Sweden": { lat: 59.3293, lng: 18.0686 },
  "Norway": { lat: 59.9139, lng: 10.7522 },
  "Denmark": { lat: 55.6761, lng: 12.5683 },
  "Finland": { lat: 60.1699, lng: 24.9384 },
  "Portugal": { lat: 38.7223, lng: -9.1393 },
  "Switzerland": { lat: 46.9480, lng: 7.4474 },
  "Austria": { lat: 48.2082, lng: 16.3738 },
  "Czech Republic": { lat: 50.0755, lng: 14.4378 },
  "Poland": { lat: 52.2297, lng: 21.0122 },
  "Hungary": { lat: 47.4979, lng: 19.0402 },
  "Croatia": { lat: 45.8150, lng: 15.9819 },
  "Morocco": { lat: 33.5731, lng: -7.5898 },
  "Kenya": { lat: -1.2921, lng: 36.8219 },
  "Peru": { lat: -12.0464, lng: -77.0428 },
  "Chile": { lat: -33.4489, lng: -70.6693 },
  "Colombia": { lat: 4.7110, lng: -74.0721 },
  "Costa Rica": { lat: 9.9281, lng: -84.0907 },
  "Jamaica": { lat: 18.1096, lng: -77.2975 },
  "Dominican Republic": { lat: 18.4861, lng: -69.9312 },
  "Puerto Rico": { lat: 18.2208, lng: -66.5901 },
  "Hawaii, United States": { lat: 21.3069, lng: -157.8583 },
  "Alaska, United States": { lat: 61.2181, lng: -149.9003 },
  "Florida, United States": { lat: 27.6648, lng: -81.5158 },
  "California, United States": { lat: 36.7783, lng: -119.4179 },
  "Texas, United States": { lat: 31.9686, lng: -99.9018 },
  "New York State, United States": { lat: 43.2994, lng: -74.2179 },
  "Nevada, United States": { lat: 38.8026, lng: -116.4194 },
  
  // Short forms for common locations
  "Paris": { lat: 48.8566, lng: 2.3522 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "New York": { lat: 40.7128, lng: -74.0060 },
  "Tokyo": { lat: 35.6762, lng: 139.6503 },
  "Sydney": { lat: -33.8688, lng: 151.2093 },
  "Rome": { lat: 41.9028, lng: 12.4964 },
  "Barcelona": { lat: 41.3851, lng: 2.1734 },
  "Berlin": { lat: 52.5200, lng: 13.4050 },
  "Madrid": { lat: 40.4168, lng: -3.7038 },
  "Amsterdam": { lat: 52.3676, lng: 4.9041 },
  "Vienna": { lat: 48.2082, lng: 16.3738 },
  "Prague": { lat: 50.0755, lng: 14.4378 },
  "Dublin": { lat: 53.3498, lng: -6.2603 },
  "Stockholm": { lat: 59.3293, lng: 18.0686 },
  "Oslo": { lat: 59.9139, lng: 10.7522 },
  "Copenhagen": { lat: 55.6761, lng: 12.5683 },
  "Helsinki": { lat: 60.1699, lng: 24.9384 },
  "Athens": { lat: 37.9838, lng: 23.7275 },
  "Istanbul": { lat: 41.0082, lng: 28.9784 },
  "Moscow": { lat: 55.7558, lng: 37.6173 },
  "Beijing": { lat: 39.9042, lng: 116.4074 },
  "Shanghai": { lat: 31.2304, lng: 121.4737 },
  "Hong Kong": { lat: 22.3193, lng: 114.1694 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "Bangkok": { lat: 13.7563, lng: 100.5018 },
  "Seoul": { lat: 37.5665, lng: 126.9780 },
  "Dubai": { lat: 25.2048, lng: 55.2708 },
  "Cairo": { lat: 30.0444, lng: 31.2357 },
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
  "Buenos Aires": { lat: -34.6037, lng: -58.3816 },
  "Mexico City": { lat: 19.4326, lng: -99.1332 },
  "Toronto": { lat: 43.6532, lng: -79.3832 },
  "Vancouver": { lat: 49.2827, lng: -123.1207 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "Chicago": { lat: 41.8781, lng: -87.6298 },
  "Miami": { lat: 25.7617, lng: -80.1918 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398 },
  "Orlando": { lat: 28.5383, lng: -81.3792 },
  "Bali": { lat: -8.3405, lng: 115.0920 },
  "Maldives": { lat: 3.2028, lng: 73.2207 },
  "Santorini": { lat: 36.3932, lng: 25.4615 },
  "Bora Bora": { lat: -16.5000, lng: -151.7500 },
  "Maui": { lat: 20.7984, lng: -156.3319 },
  "Tuscany": { lat: 43.7710, lng: 11.2486 },
  "Swiss Alps": { lat: 46.5500, lng: 8.0000 },
  "Banff": { lat: 51.4968, lng: -115.9281 },
  "Great Barrier Reef": { lat: -18.2500, lng: 147.9667 },
  
  // Additional popular destinations
  "Petra, Jordan": { lat: 30.3285, lng: 35.4444 },
  "Machu Picchu, Peru": { lat: -13.1631, lng: -72.5450 },
  "Angkor Wat, Cambodia": { lat: 13.4125, lng: 103.8670 },
  "Christ the Redeemer, Brazil": { lat: -22.9519, lng: -43.2105 },
  "Taj Mahal, India": { lat: 27.1750, lng: 78.0419 },
  "Pyramids of Giza, Egypt": { lat: 29.9792, lng: 31.1344 },
  "Niagara Falls, Canada/USA": { lat: 43.0895, lng: -79.0849 },
  "Yellowstone National Park, USA": { lat: 44.4280, lng: -110.5885 },
  "Grand Canyon, USA": { lat: 36.1069, lng: -112.1129 },
  "Mount Fuji, Japan": { lat: 35.3606, lng: 138.7274 },
  "Victoria Falls, Zambia/Zimbabwe": { lat: -17.9243, lng: 25.8572 },
  "Serengeti National Park, Tanzania": { lat: -2.1534, lng: 34.6857 },
  "Galapagos Islands, Ecuador": { lat: -0.8930, lng: -91.0419 },
  "Venice, Italy": { lat: 45.4408, lng: 12.3155 },
  "Santorini, Greece": { lat: 36.3932, lng: 25.4615 },
};

// Function to get coordinates for a location
export const getLocationCoordinates = (locationName) => {
  // Handle edge cases
  if (!locationName || typeof locationName !== 'string') {
    return null;
  }
  
  // First try exact match
  if (LOCATION_COORDINATES[locationName]) {
    return LOCATION_COORDINATES[locationName];
  }
  
  // Try partial matches with more flexible matching
  const normalizedLocation = locationName.toLowerCase().trim();
  
  // First try exact substring match
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (key.toLowerCase() === normalizedLocation) {
      return coords;
    }
  }
  
  // Then try partial matches
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (key.toLowerCase().includes(normalizedLocation) || normalizedLocation.includes(key.toLowerCase())) {
      return coords;
    }
  }
  
  // Try matching just the first part (city name) for composite names
  const firstPart = normalizedLocation.split(',')[0].trim();
  if (firstPart !== normalizedLocation) {
    for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
      const keyFirstPart = key.toLowerCase().split(',')[0].trim();
      if (keyFirstPart === firstPart) {
        return coords;
      }
    }
  }
  
  // Return null if not found
  return null;
};

// Function to generate a random color
export const getRandomColor = () => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};