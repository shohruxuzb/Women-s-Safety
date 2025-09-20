import * as SMS from 'expo-sms';
import { Linking } from 'react-native';
import { createGoogleMapsLink } from './location';

/**
 * SMS utilities for SafeHer app
 * Handles sending emergency messages and location sharing
 * Provides SMS functionality for emergency contacts
 */

/**
 * Check if SMS is available on the device
 * Returns true if SMS is available, false otherwise
 */
export const isSMSAvailable = async () => {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    return isAvailable;
  } catch (error) {
    console.error('Error checking SMS availability:', error);
    return false;
  }
};

/**
 * Send emergency SMS to trusted contacts
 * Returns true if SMS was sent successfully, false otherwise
 */
export const sendEmergencySMS = async (contacts, location = null, customMessage = null) => {
  try {
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      console.warn('SMS is not available on this device');
      return false;
    }

    if (!contacts || contacts.length === 0) {
      console.warn('No contacts provided for emergency SMS');
      return false;
    }

    // Prepare emergency message
    const emergencyMessage = customMessage || createEmergencyMessage(location);
    
    // Get phone numbers from contacts
    const phoneNumbers = contacts
      .filter(contact => contact.phone && contact.isEmergency)
      .map(contact => contact.phone);

    if (phoneNumbers.length === 0) {
      console.warn('No emergency contacts with phone numbers found');
      return false;
    }

    // Send SMS
    const result = await SMS.sendSMSAsync(phoneNumbers, emergencyMessage);
    
    if (result.result === 'sent') {
      console.log('Emergency SMS sent successfully');
      return true;
    } else {
      console.warn('SMS sending failed:', result.result);
      return false;
    }
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    return false;
  }
};

/**
 * Send location sharing SMS
 * Returns true if SMS was sent successfully, false otherwise
 */
export const sendLocationSMS = async (contacts, location, message = null) => {
  try {
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      console.warn('SMS is not available on this device');
      return false;
    }

    if (!location) {
      console.warn('No location provided for sharing');
      return false;
    }

    if (!contacts || contacts.length === 0) {
      console.warn('No contacts provided for location sharing');
      return false;
    }

    // Prepare location message
    const locationMessage = message || createLocationMessage(location);
    
    // Get phone numbers from contacts
    const phoneNumbers = contacts
      .filter(contact => contact.phone)
      .map(contact => contact.phone);

    if (phoneNumbers.length === 0) {
      console.warn('No contacts with phone numbers found');
      return false;
    }

    // Send SMS
    const result = await SMS.sendSMSAsync(phoneNumbers, locationMessage);
    
    if (result.result === 'sent') {
      console.log('Location SMS sent successfully');
      return true;
    } else {
      console.warn('SMS sending failed:', result.result);
      return false;
    }
  } catch (error) {
    console.error('Error sending location SMS:', error);
    return false;
  }
};

/**
 * Send custom SMS message
 * Returns true if SMS was sent successfully, false otherwise
 */
export const sendCustomSMS = async (phoneNumbers, message) => {
  try {
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      console.warn('SMS is not available on this device');
      return false;
    }

    if (!phoneNumbers || phoneNumbers.length === 0) {
      console.warn('No phone numbers provided');
      return false;
    }

    if (!message || message.trim().length === 0) {
      console.warn('No message provided');
      return false;
    }

    // Send SMS
    const result = await SMS.sendSMSAsync(phoneNumbers, message.trim());
    
    if (result.result === 'sent') {
      console.log('Custom SMS sent successfully');
      return true;
    } else {
      console.warn('SMS sending failed:', result.result);
      return false;
    }
  } catch (error) {
    console.error('Error sending custom SMS:', error);
    return false;
  }
};

/**
 * Create emergency message with location
 * Returns formatted emergency SMS message
 */
export const createEmergencySMS = (location) => {
  const timestamp = new Date().toLocaleString();
  let message = `🚨 EMERGENCY ALERT 🚨\n\n`;
  message += `I need help immediately!\n`;
  message += `Time: ${timestamp}\n\n`;
  
  if (location) {
    message += `📍 My Location:\n`;
    message += `Latitude: ${location.latitude.toFixed(6)}\n`;
    message += `Longitude: ${location.longitude.toFixed(6)}\n`;
    message += `Accuracy: ${location.accuracy ? Math.round(location.accuracy) + 'm' : 'Unknown'}\n\n`;
    
    // Add Google Maps link
    const mapsLink = createGoogleMapsLink(location.latitude, location.longitude);
    message += `🗺️ View on Google Maps:\n${mapsLink}\n\n`;
  } else {
    message += `📍 Location: Unable to get current location\n\n`;
  }
  
  message += `Please call me or come to my location immediately!\n\n`;
  message += `Sent via SafeHer Safety App`;
  
  return message;
};

/**
 * Create emergency message with location (internal function)
 */
const createEmergencyMessage = (location) => {
  return createEmergencySMS(location);
};

/**
 * Create location sharing message
 */
const createLocationMessage = (location) => {
  const timestamp = new Date().toLocaleString();
  let message = `📍 Location Update\n\n`;
  message += `Time: ${timestamp}\n`;
  message += `Latitude: ${location.latitude.toFixed(6)}\n`;
  message += `Longitude: ${location.longitude.toFixed(6)}\n`;
  message += `Accuracy: ${location.accuracy ? Math.round(location.accuracy) + 'm' : 'Unknown'}\n\n`;
  
  // Add Google Maps link
  const mapsLink = createGoogleMapsLink(location.latitude, location.longitude);
  message += `🗺️ View on Google Maps:\n${mapsLink}\n\n`;
  
  message += `Sent via SafeHer Safety App`;
  
  return message;
};

/**
 * Send periodic location updates
 * Returns subscription object for stopping updates
 */
export const startPeriodicLocationUpdates = async (contacts, intervalMinutes = 5) => {
  try {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    const intervalId = setInterval(async () => {
      try {
        // Get current location
        const { getCurrentLocation } = await import('./location');
        const location = await getCurrentLocation();
        
        if (location) {
          // Send location update
          await sendLocationSMS(contacts, location);
        }
      } catch (error) {
        console.error('Error in periodic location update:', error);
      }
    }, intervalMs);
    
    return {
      stop: () => clearInterval(intervalId),
      intervalId,
    };
  } catch (error) {
    console.error('Error starting periodic location updates:', error);
    return null;
  }
};

/**
 * Send safety check-in message
 * Returns true if SMS was sent successfully, false otherwise
 */
export const sendSafetyCheckIn = async (contacts, location = null, status = 'Safe') => {
  try {
    const timestamp = new Date().toLocaleString();
    let message = `✅ Safety Check-In\n\n`;
    message += `Status: ${status}\n`;
    message += `Time: ${timestamp}\n\n`;
    
    if (location) {
      message += `📍 Location:\n`;
      message += `Latitude: ${location.latitude.toFixed(6)}\n`;
      message += `Longitude: ${location.longitude.toFixed(6)}\n\n`;
      
      const mapsLink = createGoogleMapsLink(location.latitude, location.longitude);
      message += `🗺️ View on Google Maps:\n${mapsLink}\n\n`;
    }
    
    message += `Sent via SafeHer Safety App`;
    
    return await sendCustomSMS(
      contacts.filter(c => c.phone).map(c => c.phone),
      message
    );
  } catch (error) {
    console.error('Error sending safety check-in:', error);
    return false;
  }
};

/**
 * Send incident report to contacts
 * Returns true if SMS was sent successfully, false otherwise
 */
export const sendIncidentReport = async (contacts, incident, location = null) => {
  try {
    const timestamp = new Date().toLocaleString();
    let message = `⚠️ Incident Report\n\n`;
    message += `Type: ${incident.type || 'Safety Incident'}\n`;
    message += `Description: ${incident.description || 'No description provided'}\n`;
    message += `Time: ${timestamp}\n\n`;
    
    if (location) {
      message += `📍 Location:\n`;
      message += `Latitude: ${location.latitude.toFixed(6)}\n`;
      message += `Longitude: ${location.longitude.toFixed(6)}\n\n`;
      
      const mapsLink = createGoogleMapsLink(location.latitude, location.longitude);
      message += `🗺️ View on Google Maps:\n${mapsLink}\n\n`;
    }
    
    message += `Sent via SafeHer Safety App`;
    
    return await sendCustomSMS(
      contacts.filter(c => c.phone).map(c => c.phone),
      message
    );
  } catch (error) {
    console.error('Error sending incident report:', error);
    return false;
  }
};

/**
 * Format phone number for SMS
 * Returns formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming US +1)
  if (cleaned.length === 10) {
    return '+1' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return '+' + cleaned;
  }
  
  return phoneNumber; // Return original if can't format
};

/**
 * Validate phone number format
 * Returns true if phone number is valid, false otherwise
 */
export const isValidPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Open SMS app with prefilled message using Linking API
 * Returns true if SMS app opened successfully, false otherwise
 */
export const openSMSApp = async (phoneNumbers, message) => {
  try {
    if (!phoneNumbers || phoneNumbers.length === 0) {
      console.warn('No phone numbers provided for SMS');
      return false;
    }

    if (!message || message.trim().length === 0) {
      console.warn('No message provided for SMS');
      return false;
    }

    // Format phone numbers for SMS URL
    const formattedNumbers = phoneNumbers.map(num => formatPhoneNumber(num));
    const recipients = formattedNumbers.join(',');
    
    // Create SMS URL
    const smsUrl = `sms:${recipients}?body=${encodeURIComponent(message.trim())}`;
    
    // Check if SMS app can be opened
    const canOpen = await Linking.canOpenURL(smsUrl);
    if (!canOpen) {
      console.warn('Cannot open SMS app');
      return false;
    }

    // Open SMS app
    await Linking.openURL(smsUrl);
    console.log('SMS app opened successfully');
    return true;

  } catch (error) {
    console.error('Error opening SMS app:', error);
    return false;
  }
};

/**
 * Send emergency SMS using Linking API (alternative to expo-sms)
 * Returns true if SMS app opened successfully, false otherwise
 */
export const sendEmergencySMSViaLinking = async (contacts, location = null, customMessage = null) => {
  try {
    if (!contacts || contacts.length === 0) {
      console.warn('No contacts provided for emergency SMS');
      return false;
    }

    // Get emergency contacts with phone numbers
    const emergencyContacts = contacts.filter(contact => 
      contact.phone && contact.isEmergency
    );

    if (emergencyContacts.length === 0) {
      console.warn('No emergency contacts with phone numbers found');
      return false;
    }

    // Create emergency message
    const emergencyMessage = customMessage || createEmergencySMS(location);
    
    // Get phone numbers
    const phoneNumbers = emergencyContacts.map(contact => contact.phone);

    // Open SMS app with prefilled message
    const success = await openSMSApp(phoneNumbers, emergencyMessage);
    
    if (success) {
      console.log(`Emergency SMS opened for ${emergencyContacts.length} contacts`);
      return true;
    } else {
      console.warn('Failed to open SMS app');
      return false;
    }

  } catch (error) {
    console.error('Error sending emergency SMS via Linking:', error);
    return false;
  }
};
