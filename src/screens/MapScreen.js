import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { 
  getCurrentLocation, 
  requestLocationPermissions,
  findNearestSafePlaces,
  getSafePlaceIcon,
  getSafePlaceColor,
  createGoogleMapsLink
} from '../utils/location';

/**
 * MapScreen - Display user's location and safety information on a map
 * Shows current location, nearby safe places, and provides navigation
 */
const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [safePlaces, setSafePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapType, setMapType] = useState('standard'); // standard, satellite, hybrid
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setIsLoading(true);
    try {
      // Request location permission
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'SafeHer needs location access to show your location and nearby safe places.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        setIsLoading(false);
        return;
      }

      // Get current location
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        
        // Update map region to center on user location
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Find nearby safe places
        const nearbyPlaces = await findNearestSafePlaces(
          location.latitude, 
          location.longitude, 
          5000, // 5km radius
          20 // limit to 20 places
        );
        setSafePlaces(nearbyPlaces);
      } else {
        Alert.alert('Error', 'Unable to get your current location');
      }
    } catch (error) {
      console.error('Error loading map data:', error);
      Alert.alert('Error', 'Failed to load map data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }
    
    const mapsLink = createGoogleMapsLink(currentLocation.latitude, currentLocation.longitude);
    Alert.alert(
      'Share Location',
      `Share your location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          Linking.openURL(mapsLink);
        }}
      ]
    );
  };

  const handleReportIncident = () => {
    Alert.alert(
      'Report Incident',
      'Report a safety incident in this area',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', onPress: () => {
          Alert.alert('Report Submitted', 'Thank you for reporting. This helps keep the community safe.');
        }}
      ]
    );
  };

  const toggleMapType = () => {
    const types = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const handleMarkerPress = (place) => {
    Alert.alert(
      place.name,
      `${place.description}\n\nAddress: ${place.address}\nPhone: ${place.phone}\nHours: ${place.hours}\nDistance: ${Math.round(place.distance)}m`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Get Directions', 
          onPress: () => {
            const directionsUrl = createGoogleMapsLink(place.latitude, place.longitude);
            Linking.openURL(directionsUrl);
          }
        },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${place.phone}`);
          }
        }
      ]
    );
  };

  const handleMyLocationPress = () => {
    if (currentLocation) {
      setRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } else {
      loadMapData();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          onRegionChangeComplete={setRegion}
        >
          {/* Safe Places Markers */}
          {safePlaces.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={`${place.type.charAt(0).toUpperCase() + place.type.slice(1)} • ${Math.round(place.distance)}m away`}
              pinColor={getSafePlaceColor(place.type)}
              onPress={() => handleMarkerPress(place)}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{place.name}</Text>
                  <Text style={styles.calloutType}>
                    {getSafePlaceIcon(place.type)} {place.type.charAt(0).toUpperCase() + place.type.slice(1)}
                  </Text>
                  <Text style={styles.calloutDistance}>
                    {Math.round(place.distance)}m away
                  </Text>
                  <TouchableOpacity 
                    style={styles.directionsButton}
                    onPress={() => {
                      const directionsUrl = createGoogleMapsLink(place.latitude, place.longitude);
                      Linking.openURL(directionsUrl);
                    }}
                  >
                    <Text style={styles.directionsButtonText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleMyLocationPress}>
          <Text style={styles.controlButtonText}>📍 My Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Text style={styles.controlButtonText}>
            🗺️ {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShareLocation}>
          <Text style={styles.actionButtonText}>📤 Share Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleReportIncident}>
          <Text style={styles.actionButtonText}>⚠️ Report Incident</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Information */}
      <View style={styles.safetyInfo}>
        <Text style={styles.safetyTitle}>Nearby Safe Places</Text>
        <View style={styles.safetyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🚓</Text>
            <Text style={styles.statText}>
              {safePlaces.filter(p => p.type === 'police').length} Police
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏥</Text>
            <Text style={styles.statText}>
              {safePlaces.filter(p => p.type === 'hospital').length} Hospitals
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏬</Text>
            <Text style={styles.statText}>
              {safePlaces.filter(p => p.type === 'mall').length} Malls
            </Text>
          </View>
        </View>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map data...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
    borderRadius: 15,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  calloutType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  directionsButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  safetyInfo: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  safetyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MapScreen;
