import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Vibration,
  Alert,
} from 'react-native';

/**
 * SOSButton - Emergency SOS button component
 * Provides visual feedback and handles emergency activation
 * Features press and hold functionality with haptic feedback
 */
const SOSButton = ({ onPress, disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdInterval = useRef(null);

  // Start pulse animation when component mounts
  React.useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handlePressIn = () => {
    if (disabled) return;
    
    setIsPressed(true);
    setHoldTime(0);
    
    // Scale down animation
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Start hold timer
    holdInterval.current = setInterval(() => {
      setHoldTime(prev => {
        const newTime = prev + 100;
        if (newTime >= 2000) { // 2 seconds hold
          handleEmergencyActivation();
          return 0;
        }
        return newTime;
      });
    }, 100);

    // Haptic feedback
    Vibration.vibrate(50);
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    setIsPressed(false);
    
    // Scale back animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Clear hold timer
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }

    // If not held long enough, trigger normal press
    if (holdTime < 2000 && holdTime > 0) {
      handleNormalPress();
    }
    
    setHoldTime(0);
  };

  const handleNormalPress = () => {
    // Quick press - show confirmation
    Alert.alert(
      'SOS Button',
      'Hold for 2 seconds to activate emergency mode',
      [{ text: 'OK' }]
    );
  };

  const handleEmergencyActivation = () => {
    // Long press - activate emergency
    Vibration.vibrate([0, 500, 200, 500]); // Emergency vibration pattern
    
    Alert.alert(
      '🚨 EMERGENCY ACTIVATED 🚨',
      'Emergency alert will be sent to your trusted contacts',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'destructive',
          onPress: () => {
            if (onPress) {
              onPress();
            }
          }
        },
      ]
    );
  };

  const getButtonStyle = () => {
    if (disabled) {
      return [styles.button, styles.buttonDisabled];
    }
    if (isPressed) {
      return [styles.button, styles.buttonPressed];
    }
    return [styles.button, styles.buttonNormal];
  };

  const getProgressPercentage = () => {
    return Math.min((holdTime / 2000) * 100, 100);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={getButtonStyle()}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {/* Progress Ring */}
        {isPressed && (
          <Animated.View
            style={[
              styles.progressRing,
              {
                width: `${getProgressPercentage()}%`,
              },
            ]}
          />
        )}
        
        {/* Button Content */}
        <View style={styles.buttonContent}>
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.emergencyText}>EMERGENCY</Text>
        </View>
        
        {/* Hold Indicator */}
        {isPressed && (
          <Text style={styles.holdIndicator}>
            Hold... {Math.ceil((2000 - holdTime) / 1000)}s
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Instructions */}
      <Text style={styles.instructions}>
        {disabled ? 'SOS disabled' : 'Press and hold for 2 seconds'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonNormal: {
    backgroundColor: '#ff4444',
    borderWidth: 6,
    borderColor: '#fff',
  },
  buttonPressed: {
    backgroundColor: '#cc0000',
    borderWidth: 6,
    borderColor: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    borderWidth: 6,
    borderColor: '#999',
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 100,
    zIndex: 1,
  },
  buttonContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  sosText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  holdIndicator: {
    position: 'absolute',
    bottom: -30,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4444',
    zIndex: 3,
  },
  instructions: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SOSButton;
