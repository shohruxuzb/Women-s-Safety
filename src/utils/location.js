import * as Location from 'expo-location';
import { storeLocationUpdate } from './storage';

/**
 * Location utilities for SafeHer app
 * Handles GPS location services and location-based features
 * Provides location tracking, geofencing, and safety zone management
 */

// Location configuration
const LOCATION_CONFIG = {
  accuracy: Location.Accuracy.High,
  timeout: 10000, // 10 seconds
  maximumAge: 300000, // 5 minutes
};

/**
 * Request location permissions
 * Returns true if permissions granted, false otherwise
 */
export const requestLocationPermissions = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return false;
    }
    
    // Also request background permissions for continuous tracking
    const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
    console.log('Background location permission:', backgroundStatus.status);
    
    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

/**
 * Get current location
 * Returns location object or null if failed
 */
export const getCurrentLocation = async () => {
  try {
    // Check permissions first
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: LOCATION_CONFIG.accuracy,
      timeout: LOCATION_CONFIG.timeout,
      maximumAge: LOCATION_CONFIG.maximumAge,
    });

    const locationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      heading: location.coords.heading,
      speed: location.coords.speed,
      timestamp: location.timestamp,
    };

    // Store location update for history
    await storeLocationUpdate(locationData);

    return locationData;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Start location tracking
 * Returns subscription object for stopping tracking
 */
export const startLocationTracking = async (callback, options = {}) => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    const trackingOptions = {
      accuracy: options.accuracy || LOCATION_CONFIG.accuracy,
      timeInterval: options.timeInterval || 5000, // 5 seconds
      distanceInterval: options.distanceInterval || 10, // 10 meters
      ...options,
    };

    const subscription = await Location.watchPositionAsync(
      trackingOptions,
      async (location) => {
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
          timestamp: location.timestamp,
        };

        // Store location update
        await storeLocationUpdate(locationData);

        // Call callback with location data
        if (callback) {
          callback(locationData);
        }
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return null;
  }
};

/**
 * Stop location tracking
 */
export const stopLocationTracking = (subscription) => {
  if (subscription) {
    subscription.remove();
  }
};

/**
 * Calculate distance between two coordinates
 * Returns distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

/**
 * Check if location is within a safety zone
 * Returns true if location is safe, false otherwise
 */
export const isLocationSafe = async (latitude, longitude) => {
  try {
    // TODO: Implement safety zone checking
    // This would check against:
    // 1. Known safe areas (hospitals, police stations, etc.)
    // 2. User-defined safe zones
    // 3. Community-reported safe areas
    // 4. Crime data integration
    
    // For now, return a simple time-based check
    const hour = new Date().getHours();
    const isNightTime = hour >= 22 || hour <= 5;
    
    return !isNightTime; // Safe during day, unsafe at night
  } catch (error) {
    console.error('Error checking location safety:', error);
    return false;
  }
};

/**
 * Get nearby emergency services
 * Returns array of emergency service locations
 */
export const getNearbyEmergencyServices = async (latitude, longitude, radius = 5000) => {
  try {
    // TODO: Implement emergency services lookup
    // This would integrate with:
    // 1. Google Places API for hospitals, police stations
    // 2. Local emergency service databases
    // 3. User-reported emergency locations
    
    // Placeholder data
    return [
      {
        id: '1',
        name: 'City Hospital',
        type: 'hospital',
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        distance: 500,
        phone: '+1-555-0123',
      },
      {
        id: '2',
        name: 'Central Police Station',
        type: 'police',
        latitude: latitude - 0.01,
        longitude: longitude + 0.01,
        distance: 800,
        phone: '+1-555-0124',
      },
    ];
  } catch (error) {
    console.error('Error getting nearby emergency services:', error);
    return [];
  }
};

/**
 * Create a geofence around a location
 * Returns geofence configuration
 */
export const createGeofence = (latitude, longitude, radius = 100) => {
  return {
    latitude,
    longitude,
    radius,
    id: `geofence_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Check if location is within geofence
 */
export const isWithinGeofence = (location, geofence) => {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    geofence.latitude,
    geofence.longitude
  );
  return distance <= geofence.radius;
};

/**
 * Get formatted address from coordinates
 * Returns formatted address string
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses.length > 0) {
      const address = addresses[0];
      return `${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.postalCode || ''}`.trim();
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Create Google Maps link from coordinates
 * Returns Google Maps URL string
 */
export const createGoogleMapsLink = (latitude, longitude, label = 'My Location') => {
  try {
    // Create Google Maps URL with coordinates
    const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    return mapsUrl;
  } catch (error) {
    console.error('Error creating Google Maps link:', error);
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }
};

/**
 * Create Google Maps link with address
 * Returns Google Maps URL string with address
 */
export const createGoogleMapsLinkWithAddress = async (latitude, longitude, address = null) => {
  try {
    let mapsUrl;
    
    if (address) {
      // Use address for better accuracy
      const encodedAddress = encodeURIComponent(address);
      mapsUrl = `https://maps.google.com/?q=${encodedAddress}`;
    } else {
      // Use coordinates
      mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    }
    
    return mapsUrl;
  } catch (error) {
    console.error('Error creating Google Maps link with address:', error);
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }
};

/**
 * Create Apple Maps link from coordinates (for iOS)
 * Returns Apple Maps URL string
 */
export const createAppleMapsLink = (latitude, longitude, label = 'My Location') => {
  try {
    const mapsUrl = `http://maps.apple.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=15`;
    return mapsUrl;
  } catch (error) {
    console.error('Error creating Apple Maps link:', error);
    return `http://maps.apple.com/?q=${latitude},${longitude}`;
  }
};

/**
 * Create universal maps link (works on both iOS and Android)
 * Returns appropriate maps URL based on platform
 */
export const createUniversalMapsLink = (latitude, longitude, label = 'My Location') => {
  try {
    // Google Maps works on both platforms
    return createGoogleMapsLink(latitude, longitude, label);
  } catch (error) {
    console.error('Error creating universal maps link:', error);
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }
};

/**
 * Get coordinates from address
 * Returns coordinates object or null if failed
 */
export const getCoordinatesFromAddress = async (address) => {
  try {
    const locations = await Location.geocodeAsync(address);
    
    if (locations.length > 0) {
      return {
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting coordinates from address:', error);
    return null;
  }
};

/**
 * Location-based risk assessment
 * Returns risk level based on location and time
 */
export const assessLocationRisk = async (latitude, longitude) => {
  try {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    let riskScore = 0;
    
    // Time-based risk
    if (hour >= 22 || hour <= 5) {
      riskScore += 3; // High risk at night
    } else if (hour >= 18 || hour <= 7) {
      riskScore += 1; // Moderate risk in evening/early morning
    }
    
    // Day-based risk
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      riskScore += 1; // Weekend risk
    }
    
    // TODO: Add location-based risk factors
    // - Crime data
    // - Population density
    // - Lighting conditions
    // - Previous incidents
    
    // Determine risk level
    if (riskScore >= 4) {
      return 'Unsafe';
    } else if (riskScore >= 2) {
      return 'Moderate';
    } else {
      return 'Safe';
    }
  } catch (error) {
    console.error('Error assessing location risk:', error);
    return 'Unknown';
  }
};

/**
 * Load safe places from JSON file
 * Returns array of safe places
 */
export const loadSafePlaces = async () => {
  try {
    // In a real app, this would be loaded from a server or local file
    // For now, we'll return the hardcoded data
    const safePlaces = [
      {
        id: "1",
        name: "Central Police Station",
        type: "police",
        latitude: 40.7128,
        longitude: -74.0060,
        address: "123 Main St, New York, NY 10001",
        phone: "+1-555-0123",
        hours: "24/7",
        description: "Main police station with emergency services"
      },
      {
        id: "2",
        name: "City General Hospital",
        type: "hospital",
        latitude: 40.7589,
        longitude: -73.9851,
        address: "456 Health Ave, New York, NY 10002",
        phone: "+1-555-0124",
        hours: "24/7",
        description: "Full-service hospital with emergency room"
      },
      {
        id: "3",
        name: "Downtown Shopping Mall",
        type: "mall",
        latitude: 40.7505,
        longitude: -73.9934,
        address: "789 Commerce Blvd, New York, NY 10003",
        phone: "+1-555-0125",
        hours: "9:00 AM - 10:00 PM",
        description: "Large shopping center with security"
      },
      {
        id: "4",
        name: "Westside Police Precinct",
        type: "police",
        latitude: 40.7614,
        longitude: -73.9776,
        address: "321 Safety St, New York, NY 10004",
        phone: "+1-555-0126",
        hours: "24/7",
        description: "Local police precinct"
      },
      {
        id: "5",
        name: "Metro Medical Center",
        type: "hospital",
        latitude: 40.7282,
        longitude: -73.9942,
        address: "654 Care Lane, New York, NY 10005",
        phone: "+1-555-0127",
        hours: "24/7",
        description: "Medical center with emergency services"
      },
      {
        id: "6",
        name: "Central Plaza Mall",
        type: "mall",
        latitude: 40.7505,
        longitude: -73.9934,
        address: "987 Plaza Way, New York, NY 10006",
        phone: "+1-555-0128",
        hours: "8:00 AM - 11:00 PM",
        description: "Shopping plaza with food court"
      },
      {
        id: "7",
        name: "Emergency Services Hub",
        type: "police",
        latitude: 40.6892,
        longitude: -74.0445,
        address: "147 Emergency Ave, New York, NY 10007",
        phone: "+1-555-0129",
        hours: "24/7",
        description: "Emergency response center"
      },
      {
        id: "8",
        name: "Community Health Clinic",
        type: "hospital",
        latitude: 40.7831,
        longitude: -73.9712,
        address: "258 Wellness Dr, New York, NY 10008",
        phone: "+1-555-0130",
        hours: "7:00 AM - 9:00 PM",
        description: "Community health center"
      },
      {
        id: "9",
        name: "Safe Haven Mall",
        type: "mall",
        latitude: 40.7614,
        longitude: -73.9776,
        address: "369 Security Blvd, New York, NY 10009",
        phone: "+1-555-0131",
        hours: "10:00 AM - 9:00 PM",
        description: "Mall with security and safe zones"
      },
      {
        id: "10",
        name: "Rapid Response Station",
        type: "police",
        latitude: 40.7282,
        longitude: -73.9942,
        address: "741 Quick St, New York, NY 10010",
        phone: "+1-555-0132",
        hours: "24/7",
        description: "Quick response police station"
      }
    ];
    
    return safePlaces;
  } catch (error) {
    console.error('Error loading safe places:', error);
    return [];
  }
};

/**
 * Find nearest safe places to a given location
 * Returns array of safe places sorted by distance
 */
export const findNearestSafePlaces = async (latitude, longitude, maxDistance = 5000, limit = 10) => {
  try {
    const safePlaces = await loadSafePlaces();
    
    // Calculate distance for each safe place
    const placesWithDistance = safePlaces.map(place => ({
      ...place,
      distance: calculateDistance(latitude, longitude, place.latitude, place.longitude)
    }));
    
    // Filter by max distance and sort by distance
    const nearestPlaces = placesWithDistance
      .filter(place => place.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return nearestPlaces;
  } catch (error) {
    console.error('Error finding nearest safe places:', error);
    return [];
  }
};

/**
 * Find nearest safe place of a specific type
 * Returns the closest safe place of the specified type
 */
export const findNearestSafePlaceByType = async (latitude, longitude, type, maxDistance = 5000) => {
  try {
    const safePlaces = await loadSafePlaces();
    
    // Filter by type and calculate distances
    const placesOfType = safePlaces
      .filter(place => place.type === type)
      .map(place => ({
        ...place,
        distance: calculateDistance(latitude, longitude, place.latitude, place.longitude)
      }))
      .filter(place => place.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    return placesOfType.length > 0 ? placesOfType[0] : null;
  } catch (error) {
    console.error('Error finding nearest safe place by type:', error);
    return null;
  }
};

/**
 * Get safe places within a radius
 * Returns array of safe places within the specified radius
 */
export const getSafePlacesInRadius = async (latitude, longitude, radius = 1000) => {
  try {
    const safePlaces = await loadSafePlaces();
    
    const placesInRadius = safePlaces
      .map(place => ({
        ...place,
        distance: calculateDistance(latitude, longitude, place.latitude, place.longitude)
      }))
      .filter(place => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    
    return placesInRadius;
  } catch (error) {
    console.error('Error getting safe places in radius:', error);
    return [];
  }
};

/**
 * Get icon for safe place type
 * Returns emoji icon for the safe place type
 */
export const getSafePlaceIcon = (type) => {
  switch (type) {
    case 'police':
      return '🚓';
    case 'hospital':
      return '🏥';
    case 'mall':
      return '🏬';
    default:
      return '📍';
  }
};

/**
 * Get color for safe place type
 * Returns color for the safe place type
 */
export const getSafePlaceColor = (type) => {
  switch (type) {
    case 'police':
      return '#0066CC'; // Blue
    case 'hospital':
      return '#FF4444'; // Red
    case 'mall':
      return '#00AA44'; // Green
    default:
      return '#666666'; // Gray
  }
};
