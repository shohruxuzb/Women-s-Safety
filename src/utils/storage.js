import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utilities for SafeHer app
 * Handles all local data storage using AsyncStorage
 * Provides offline-first data management
 */

// Storage keys
const STORAGE_KEYS = {
  TRUSTED_CONTACTS: 'safeher_trusted_contacts',
  USER_SETTINGS: 'safeher_user_settings',
  EMERGENCY_HISTORY: 'safeher_emergency_history',
  LOCATION_HISTORY: 'safeher_location_history',
  SAFETY_REPORTS: 'safeher_safety_reports',
  USER_PROFILE: 'safeher_user_profile',
};

/**
 * Generic storage functions
 */
export const storeData = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('Error storing data:', error);
    return false;
  }
};

export const getData = async (key) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Trusted Contacts Management
 */
export const storeContacts = async (contacts) => {
  return await storeData(STORAGE_KEYS.TRUSTED_CONTACTS, contacts);
};

export const getStoredContacts = async () => {
  const contacts = await getData(STORAGE_KEYS.TRUSTED_CONTACTS);
  return contacts || [];
};

/**
 * Get emergency contacts only
 * Returns array of contacts marked as emergency contacts
 */
export const getEmergencyContacts = async () => {
  try {
    const allContacts = await getStoredContacts();
    const emergencyContacts = allContacts.filter(contact => 
      contact.isEmergency && contact.phone
    );
    return emergencyContacts;
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
};

/**
 * Get contacts with phone numbers
 * Returns array of contacts that have phone numbers
 */
export const getContactsWithPhone = async () => {
  try {
    const allContacts = await getStoredContacts();
    const contactsWithPhone = allContacts.filter(contact => 
      contact.phone && contact.phone.trim().length > 0
    );
    return contactsWithPhone;
  } catch (error) {
    console.error('Error getting contacts with phone:', error);
    return [];
  }
};

export const addContact = async (contact) => {
  try {
    const existingContacts = await getStoredContacts();
    const newContact = {
      id: Date.now().toString(),
      ...contact,
      addedDate: new Date().toISOString(),
    };
    const updatedContacts = [...existingContacts, newContact];
    await storeContacts(updatedContacts);
    return newContact;
  } catch (error) {
    console.error('Error adding contact:', error);
    return null;
  }
};

export const updateContact = async (contactId, updates) => {
  try {
    const contacts = await getStoredContacts();
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, ...updates } : contact
    );
    await storeContacts(updatedContacts);
    return true;
  } catch (error) {
    console.error('Error updating contact:', error);
    return false;
  }
};

export const deleteContact = async (contactId) => {
  try {
    const contacts = await getStoredContacts();
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    await storeContacts(updatedContacts);
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    return false;
  }
};

/**
 * User Settings Management
 */
export const storeSettings = async (settings) => {
  return await storeData(STORAGE_KEYS.USER_SETTINGS, settings);
};

export const getStoredSettings = async () => {
  const settings = await getData(STORAGE_KEYS.USER_SETTINGS);
  return settings || {
    emergencyAlerts: true,
    locationSharing: true,
    autoLocationUpdate: false,
    soundAlerts: true,
    vibrationAlerts: true,
    nightMode: false,
    aiRiskAssessment: true,
    communityReports: true,
    emergencyContacts: true,
  };
};

export const updateSetting = async (key, value) => {
  try {
    const settings = await getStoredSettings();
    const updatedSettings = { ...settings, [key]: value };
    await storeSettings(updatedSettings);
    return true;
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
};

/**
 * Emergency History Management
 */
export const storeEmergencyEvent = async (event) => {
  try {
    const history = await getData(STORAGE_KEYS.EMERGENCY_HISTORY) || [];
    const newEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...event,
    };
    const updatedHistory = [newEvent, ...history].slice(0, 100); // Keep only last 100 events
    await storeData(STORAGE_KEYS.EMERGENCY_HISTORY, updatedHistory);
    return newEvent;
  } catch (error) {
    console.error('Error storing emergency event:', error);
    return null;
  }
};

export const getEmergencyHistory = async () => {
  const history = await getData(STORAGE_KEYS.EMERGENCY_HISTORY);
  return history || [];
};

/**
 * Location History Management
 */
export const storeLocationUpdate = async (location) => {
  try {
    const history = await getData(STORAGE_KEYS.LOCATION_HISTORY) || [];
    const newLocation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...location,
    };
    const updatedHistory = [newLocation, ...history].slice(0, 50); // Keep only last 50 locations
    await storeData(STORAGE_KEYS.LOCATION_HISTORY, updatedHistory);
    return newLocation;
  } catch (error) {
    console.error('Error storing location update:', error);
    return null;
  }
};

export const getLocationHistory = async () => {
  const history = await getData(STORAGE_KEYS.LOCATION_HISTORY);
  return history || [];
};

/**
 * Safety Reports Management
 */
export const storeSafetyReport = async (report) => {
  try {
    const reports = await getData(STORAGE_KEYS.SAFETY_REPORTS) || [];
    const newReport = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...report,
    };
    const updatedReports = [newReport, ...reports].slice(0, 200); // Keep only last 200 reports
    await storeData(STORAGE_KEYS.SAFETY_REPORTS, updatedReports);
    return newReport;
  } catch (error) {
    console.error('Error storing safety report:', error);
    return null;
  }
};

export const getSafetyReports = async () => {
  const reports = await getData(STORAGE_KEYS.SAFETY_REPORTS);
  return reports || [];
};

/**
 * User Profile Management
 */
export const storeUserProfile = async (profile) => {
  return await storeData(STORAGE_KEYS.USER_PROFILE, profile);
};

export const getUserProfile = async () => {
  const profile = await getData(STORAGE_KEYS.USER_PROFILE);
  return profile || {
    name: '',
    phone: '',
    emergencyMessage: 'I need help! Please call me or come to my location.',
    autoShareLocation: false,
    shareLocationInterval: 5, // minutes
  };
};

/**
 * Data Export/Import Functions
 */
export const exportAllData = async () => {
  try {
    const data = {
      contacts: await getStoredContacts(),
      settings: await getStoredSettings(),
      emergencyHistory: await getEmergencyHistory(),
      locationHistory: await getLocationHistory(),
      safetyReports: await getSafetyReports(),
      userProfile: await getUserProfile(),
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

export const importData = async (data) => {
  try {
    if (data.contacts) await storeContacts(data.contacts);
    if (data.settings) await storeSettings(data.settings);
    if (data.userProfile) await storeUserProfile(data.userProfile);
    if (data.emergencyHistory) await storeData(STORAGE_KEYS.EMERGENCY_HISTORY, data.emergencyHistory);
    if (data.locationHistory) await storeData(STORAGE_KEYS.LOCATION_HISTORY, data.locationHistory);
    if (data.safetyReports) await storeData(STORAGE_KEYS.SAFETY_REPORTS, data.safetyReports);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

/**
 * Storage Statistics
 */
export const getStorageStats = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const safeherKeys = keys.filter(key => key.startsWith('safeher_'));
    
    let totalSize = 0;
    for (const key of safeherKeys) {
      const value = await AsyncStorage.getItem(key);
      totalSize += value ? value.length : 0;
    }
    
    return {
      totalKeys: safeherKeys.length,
      totalSize: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};
