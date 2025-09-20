import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import SOSButton from '../components/SOSButton';
import RiskBadge from '../components/RiskBadge';
import { getCurrentLocation, requestLocationPermissions } from '../utils/location';
import { getStoredContacts } from '../utils/storage';
import { createEmergencySMS, formatPhoneNumber } from '../utils/sms';
import { 
  calculateRiskScore, 
  initializeVoiceRecognition, 
  startVoiceRecognition, 
  stopVoiceRecognition,
  isVoiceRecognitionActive 
} from '../utils/ai';

/**
 * HomeScreen - Main screen with SOS button and safety status
 * This is the primary screen users will see when opening the app
 * Contains the emergency SOS button and current safety status
 */
const HomeScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [riskData, setRiskData] = useState({
    level: 'Safe',
    score: 0,
    factors: {},
    recommendations: []
  });
  const [trustedContacts, setTrustedContacts] = useState([]);
  const [voiceSOSActive, setVoiceSOSActive] = useState(false);

  useEffect(() => {
    // Load user's trusted contacts and current location on screen mount
    loadInitialData();
    
    // Initialize voice recognition
    initializeVoiceRecognition();
    
    // Cleanup on unmount
    return () => {
      if (voiceSOSActive) {
        stopVoiceRecognition();
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      // Get stored trusted contacts
      const contacts = await getStoredContacts();
      setTrustedContacts(contacts);

      // Get current location for safety assessment
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // Calculate AI-based risk assessment
      if (location) {
        await assessRiskLevel(location);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load safety data');
    }
  };

  const assessRiskLevel = async (location) => {
    try {
      // Calculate comprehensive risk score using AI
      const riskResult = await calculateRiskScore(
        location.latitude,
        location.longitude,
        {
          isAlone: true, // Assume user is alone for now
          isDarkArea: isDarkArea(),
          isWeekend: isWeekend(),
          weather: null, // TODO: Integrate weather data
          isStationary: false,
          speed: location.speed || 0
        }
      );
      
      setRiskData(riskResult);
      
      // Provide audio feedback for high risk
      if (riskResult.level === 'Unsafe') {
        // TODO: Add haptic feedback and audio alerts
        console.log('High risk detected:', riskResult.recommendations);
      }
    } catch (error) {
      console.error('Error assessing risk level:', error);
      setRiskData({
        level: 'Unknown',
        score: 0,
        factors: {},
        recommendations: ['Unable to assess risk level']
      });
    }
  };

  const isDarkArea = () => {
    const hour = new Date().getHours();
    return hour >= 18 || hour <= 6;
  };

  const isWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  const handleVoiceSOS = async (voiceData) => {
    try {
      console.log('Voice SOS triggered:', voiceData);
      
      Alert.alert(
        '🎤 Voice SOS Detected',
        `Emergency voice command detected: "${voiceData.keyword}"\n\nActivating emergency response...`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Activate SOS', 
            style: 'destructive',
            onPress: () => {
              // Trigger the same SOS function as button press
              handleSOSPress();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error handling voice SOS:', error);
    }
  };

  const toggleVoiceSOS = async () => {
    try {
      if (voiceSOSActive) {
        await stopVoiceRecognition();
        setVoiceSOSActive(false);
        Alert.alert('Voice SOS Disabled', 'Voice emergency detection has been turned off.');
      } else {
        const success = await startVoiceRecognition(handleVoiceSOS);
        if (success) {
          setVoiceSOSActive(true);
          Alert.alert('Voice SOS Enabled', 'Voice emergency detection is now active. Say "Help" or "Emergency" to trigger SOS.');
        } else {
          Alert.alert('Voice SOS Error', 'Unable to start voice recognition. Please check your device settings.');
        }
      }
    } catch (error) {
      console.error('Error toggling voice SOS:', error);
      Alert.alert('Voice SOS Error', 'An error occurred while setting up voice recognition.');
    }
  };

  const handleSOSPress = async () => {
    try {
      // Check if user has trusted contacts
      if (trustedContacts.length === 0) {
        Alert.alert(
          'No Trusted Contacts',
          'Please add trusted contacts in the Contacts tab before using SOS.',
          [
            { text: 'OK' },
            { text: 'Add Contacts', onPress: () => {
              // Navigate to contacts screen - this would be handled by navigation
              console.log('Navigate to contacts screen');
            }}
          ]
        );
        return;
      }

      // Request location permission
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'SafeHer needs location access to send your coordinates with the emergency alert. Please enable location permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. The emergency alert will be sent without location data.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Send Without Location', onPress: () => sendSOSAlert(null) }
          ]
        );
        return;
      }

      // Send SOS alert with location
      await sendSOSAlert(location);

    } catch (error) {
      console.error('Error in SOS press:', error);
      Alert.alert(
        'SOS Error',
        'An error occurred while processing your emergency alert. Please try again or call emergency services directly.',
        [
          { text: 'OK' },
          { text: 'Call 911', onPress: () => Linking.openURL('tel:911') }
        ]
      );
    }
  };

  const sendSOSAlert = async (location) => {
    try {
      // Create emergency SMS with location
      const emergencyMessage = createEmergencySMS(location);
      
      // Get emergency contacts
      const emergencyContacts = trustedContacts.filter(contact => 
        contact.isEmergency && contact.phone
      );

      if (emergencyContacts.length === 0) {
        Alert.alert(
          'No Emergency Contacts',
          'You have no contacts marked as emergency contacts. Please mark at least one contact as an emergency contact.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Format phone numbers for SMS
      const phoneNumbers = emergencyContacts.map(contact => 
        formatPhoneNumber(contact.phone)
      );

      // Open SMS app with prefilled message
      const smsUrl = `sms:${phoneNumbers.join(',')}?body=${encodeURIComponent(emergencyMessage)}`;
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        
        // Show success message
        Alert.alert(
          '🚨 SOS Alert Sent! 🚨',
          `Emergency alert opened in SMS app with your location. The message will be sent to ${emergencyContacts.length} emergency contact(s).`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Cannot open SMS app');
      }

    } catch (error) {
      console.error('Error sending SOS alert:', error);
      Alert.alert(
        'SMS Error',
        'Unable to open SMS app. Please manually send your location to your emergency contacts.',
        [
          { text: 'OK' },
          { text: 'Copy Message', onPress: () => {
            // TODO: Implement clipboard functionality
            console.log('Copy message to clipboard');
          }}
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Safety Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>AI Safety Assessment</Text>
          <RiskBadge riskLevel={riskData.level} score={riskData.score} />
          {currentLocation && (
            <Text style={styles.locationText}>
              Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </Text>
          )}
          {riskData.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>AI Recommendations:</Text>
              {riskData.recommendations.slice(0, 2).map((rec, index) => (
                <Text key={index} style={styles.recommendationText}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* SOS Button Section */}
        <View style={styles.sosSection}>
          <SOSButton 
            onPress={handleSOSPress}
            disabled={trustedContacts.length === 0}
          />
          <Text style={styles.sosDescription}>
            {trustedContacts.length === 0 
              ? 'Add trusted contacts to enable SOS'
              : 'Press and hold in case of emergency'
            }
          </Text>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Share Location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Call Emergency</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, voiceSOSActive && styles.activeButton]} 
            onPress={toggleVoiceSOS}
          >
            <Text style={[styles.actionButtonText, voiceSOSActive && styles.activeButtonText]}>
              {voiceSOSActive ? '🎤 Voice SOS Active' : '🎤 Enable Voice SOS'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trusted Contacts Count */}
        <View style={styles.contactsInfo}>
          <Text style={styles.contactsText}>
            Trusted Contacts: {trustedContacts.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  recommendationsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e91e63',
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sosDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  quickActions: {
    width: '100%',
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#e91e63',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#e91e63',
  },
  activeButtonText: {
    color: '#fff',
  },
  contactsInfo: {
    marginTop: 'auto',
    padding: 15,
    backgroundColor: '#e91e63',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  contactsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
