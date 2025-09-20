import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

/**
 * ContactCard - Display individual trusted contact information
 * Shows contact details with edit, delete, and emergency toggle options
 * Provides quick access to contact actions
 */
const ContactCard = ({ 
  contact, 
  onEdit, 
  onDelete, 
  onToggleEmergency,
  onCall,
  onMessage 
}) => {
  const handleCall = () => {
    if (onCall) {
      onCall(contact);
    } else {
      Alert.alert('Call Contact', `Call ${contact.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // TODO: Implement actual calling functionality
          Alert.alert('Calling', `Calling ${contact.name}...`);
        }}
      ]);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(contact);
    } else {
      Alert.alert('Message Contact', `Send message to ${contact.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => {
          // TODO: Implement actual messaging functionality
          Alert.alert('Messaging', `Sending message to ${contact.name}...`);
        }}
      ]);
    }
  };

  const formatPhoneNumber = (phone) => {
    // Simple phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getContactInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAddedDate = () => {
    try {
      const date = new Date(contact.addedDate);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Contact Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={[
            styles.avatar,
            { backgroundColor: contact.isEmergency ? '#ff4444' : '#e91e63' }
          ]}>
            <Text style={styles.avatarText}>
              {getContactInitials(contact.name)}
            </Text>
          </View>
          {contact.isEmergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>🚨</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactPhone}>{formatPhoneNumber(contact.phone)}</Text>
          <Text style={styles.addedDate}>Added: {getAddedDate()}</Text>
        </View>
        
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot,
            { backgroundColor: contact.isEmergency ? '#ff4444' : '#4CAF50' }
          ]} />
          <Text style={styles.statusText}>
            {contact.isEmergency ? 'Emergency' : 'Regular'}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onToggleEmergency && onToggleEmergency()}
        >
          <Text style={styles.actionIcon}>
            {contact.isEmergency ? '🔒' : '🚨'}
          </Text>
          <Text style={styles.actionText}>
            {contact.isEmergency ? 'Remove Emergency' : 'Set Emergency'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Management Actions */}
      <View style={styles.managementActions}>
        <TouchableOpacity 
          style={[styles.managementButton, styles.editButton]} 
          onPress={() => onEdit && onEdit()}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.managementButton, styles.deleteButton]} 
          onPress={() => onDelete && onDelete()}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contact Info */}
      {contact.isEmergency && (
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyInfoText}>
            ⚠️ This contact will receive emergency alerts and location updates
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e91e63',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  emergencyBadgeText: {
    fontSize: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  addedDate: {
    fontSize: 12,
    color: '#999',
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  managementActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  managementButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffe6e6',
  },
  editButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
  },
  emergencyInfo: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  emergencyInfoText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});

export default ContactCard;
