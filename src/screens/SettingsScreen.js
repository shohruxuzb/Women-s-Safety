import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { getStoredSettings, storeSettings } from '../utils/storage';
import { 
  initializeVoiceRecognition, 
  startVoiceRecognition, 
  stopVoiceRecognition,
  isVoiceRecognitionActive 
} from '../utils/ai';

/**
 * SettingsScreen - Configure app settings and preferences
 * Users can toggle various safety features and customize the app
 */
const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    emergencyAlerts: true,
    locationSharing: true,
    autoLocationUpdate: false,
    soundAlerts: true,
    vibrationAlerts: true,
    nightMode: false,
    aiRiskAssessment: true,
    communityReports: true,
    emergencyContacts: true,
    voiceSOS: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    initializeVoiceRecognition();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await getStoredSettings();
      if (storedSettings) {
        setSettings({ ...settings, ...storedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    setIsLoading(true);
    try {
      await storeSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = async (settingKey) => {
    const newSettings = {
      ...settings,
      [settingKey]: !settings[settingKey],
    };
    
    // Handle voice SOS toggle specially
    if (settingKey === 'voiceSOS') {
      try {
        if (newSettings.voiceSOS) {
          // Starting voice recognition
          const success = await startVoiceRecognition(() => {
            console.log('Voice SOS callback triggered');
          });
          
          if (!success) {
            Alert.alert(
              'Voice Recognition Error',
              'Unable to start voice recognition. Please check your device permissions.',
              [{ text: 'OK' }]
            );
            return; // Don't save the setting if voice recognition failed
          }
        } else {
          // Stopping voice recognition
          await stopVoiceRecognition();
        }
      } catch (error) {
        console.error('Error toggling voice SOS:', error);
        Alert.alert(
          'Voice SOS Error',
          'An error occurred while setting up voice recognition.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              emergencyAlerts: true,
              locationSharing: true,
              autoLocationUpdate: false,
              soundAlerts: true,
              vibrationAlerts: true,
              nightMode: false,
              aiRiskAssessment: true,
              communityReports: true,
    emergencyContacts: true,
    voiceSOS: false,
  };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    Alert.alert('Export Data', 'Data export feature coming soon');
  };

  const handleImportData = () => {
    // TODO: Implement data import functionality
    Alert.alert('Import Data', 'Data import feature coming soon');
  };

  const SettingItem = ({ title, description, value, onToggle, icon }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#e91e63' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Safety Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          
          <SettingItem
            title="Emergency Alerts"
            description="Send alerts to trusted contacts in emergencies"
            value={settings.emergencyAlerts}
            onToggle={() => toggleSetting('emergencyAlerts')}
            icon="🚨"
          />
          
          <SettingItem
            title="Location Sharing"
            description="Share your location with trusted contacts"
            value={settings.locationSharing}
            onToggle={() => toggleSetting('locationSharing')}
            icon="📍"
          />
          
          <SettingItem
            title="Auto Location Update"
            description="Automatically update location every 5 minutes"
            value={settings.autoLocationUpdate}
            onToggle={() => toggleSetting('autoLocationUpdate')}
            icon="🔄"
          />
          
          <SettingItem
            title="AI Risk Assessment"
            description="Use AI to assess safety risks based on location and time"
            value={settings.aiRiskAssessment}
            onToggle={() => toggleSetting('aiRiskAssessment')}
            icon="🤖"
          />
          
          <SettingItem
            title="Voice SOS"
            description="Listen for emergency voice commands like 'Help' or 'Emergency'"
            value={settings.voiceSOS}
            onToggle={() => toggleSetting('voiceSOS')}
            icon="🎤"
          />
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            title="Sound Alerts"
            description="Play sounds for safety alerts"
            value={settings.soundAlerts}
            onToggle={() => toggleSetting('soundAlerts')}
            icon="🔊"
          />
          
          <SettingItem
            title="Vibration Alerts"
            description="Vibrate for safety alerts"
            value={settings.vibrationAlerts}
            onToggle={() => toggleSetting('vibrationAlerts')}
            icon="📳"
          />
        </View>

        {/* Community Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          
          <SettingItem
            title="Community Reports"
            description="Share and receive safety reports from other users"
            value={settings.communityReports}
            onToggle={() => toggleSetting('communityReports')}
            icon="👥"
          />
          
          <SettingItem
            title="Emergency Contacts"
            description="Allow emergency contacts to track your location"
            value={settings.emergencyContacts}
            onToggle={() => toggleSetting('emergencyContacts')}
            icon="📞"
          />
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <SettingItem
            title="Night Mode"
            description="Use dark theme for better visibility at night"
            value={settings.nightMode}
            onToggle={() => toggleSetting('nightMode')}
            icon="🌙"
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <Text style={styles.actionIcon}>📤</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Export Data</Text>
              <Text style={styles.actionDescription}>Export your safety data</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleImportData}>
            <Text style={styles.actionIcon}>📥</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Import Data</Text>
              <Text style={styles.actionDescription}>Import safety data from backup</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01.01</Text>
          </View>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>📋</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Privacy Policy</Text>
              <Text style={styles.actionDescription}>View our privacy policy</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>📄</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Terms of Service</Text>
              <Text style={styles.actionDescription}>View terms and conditions</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Reset Settings */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
            <Text style={styles.resetButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>

        {/* TODO: Future Features */}
        <View style={styles.todoContainer}>
          <Text style={styles.todoTitle}>Planned Features:</Text>
          <Text style={styles.todoText}>• Advanced AI risk assessment</Text>
          <Text style={styles.todoText}>• Integration with smart watches</Text>
          <Text style={styles.todoText}>• Voice commands for emergencies</Text>
          <Text style={styles.todoText}>• Real-time crime data integration</Text>
          <Text style={styles.todoText}>• Emergency service integration</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  todoContainer: {
    backgroundColor: '#fff3cd',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  todoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  todoText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
});

export default SettingsScreen;
