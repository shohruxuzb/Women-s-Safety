import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

/**
 * RiskBadge - Displays current safety risk level with visual indicators
 * Shows "Safe", "Moderate", or "Unsafe" status with appropriate colors and animations
 * Provides visual feedback for safety assessment with AI-powered risk scoring
 */
const RiskBadge = ({ 
  riskLevel = 'Safe', 
  score = 0,
  showAnimation = true,
  size = 'medium' // small, medium, large
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showAnimation) {
      // Pulse animation for unsafe status
      if (riskLevel === 'Unsafe') {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();

        return () => pulseAnimation.stop();
      }
      
      // Scale animation for moderate status
      if (riskLevel === 'Moderate') {
        const scaleAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ])
        );
        scaleAnimation.start();

        return () => scaleAnimation.stop();
      }
    }
  }, [riskLevel, showAnimation]);

  const getRiskConfig = () => {
    switch (riskLevel.toLowerCase()) {
      case 'safe':
        return {
          backgroundColor: '#4CAF50',
          borderColor: '#45a049',
          textColor: '#fff',
          icon: '✅',
          description: 'You are in a safe area',
          shadowColor: '#4CAF50',
        };
      case 'moderate':
        return {
          backgroundColor: '#FF9800',
          borderColor: '#f57c00',
          textColor: '#fff',
          icon: '⚠️',
          description: 'Stay alert and aware',
          shadowColor: '#FF9800',
        };
      case 'unsafe':
        return {
          backgroundColor: '#f44336',
          borderColor: '#d32f2f',
          textColor: '#fff',
          icon: '🚨',
          description: 'High risk area - be cautious',
          shadowColor: '#f44336',
        };
      default:
        return {
          backgroundColor: '#9E9E9E',
          borderColor: '#757575',
          textColor: '#fff',
          icon: '❓',
          description: 'Risk level unknown',
          shadowColor: '#9E9E9E',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 80,
          fontSize: 14,
          iconSize: 20,
          descriptionSize: 10,
          padding: 8,
        };
      case 'large':
        return {
          containerSize: 140,
          fontSize: 20,
          iconSize: 32,
          descriptionSize: 14,
          padding: 16,
        };
      default: // medium
        return {
          containerSize: 110,
          fontSize: 16,
          iconSize: 24,
          descriptionSize: 12,
          padding: 12,
        };
    }
  };

  const riskConfig = getRiskConfig();
  const sizeConfig = getSizeConfig();

  const containerStyle = {
    width: sizeConfig.containerSize,
    height: sizeConfig.containerSize,
    borderRadius: sizeConfig.containerSize / 2,
    backgroundColor: riskConfig.backgroundColor,
    borderWidth: 3,
    borderColor: riskConfig.borderColor,
    padding: sizeConfig.padding,
    shadowColor: riskConfig.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          transform: [
            { scale: riskLevel === 'Unsafe' ? pulseAnim : scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        {/* Risk Icon */}
        <Text style={[styles.icon, { fontSize: sizeConfig.iconSize }]}>
          {riskConfig.icon}
        </Text>
        
        {/* Risk Level Text */}
        <Text style={[
          styles.riskText,
          {
            color: riskConfig.textColor,
            fontSize: sizeConfig.fontSize,
          }
        ]}>
          {riskLevel.toUpperCase()}
        </Text>
        
        {/* Risk Score (only for medium and large sizes) */}
        {(size === 'medium' || size === 'large') && score > 0 && (
          <Text style={[
            styles.scoreText,
            {
              color: riskConfig.textColor,
              fontSize: sizeConfig.descriptionSize - 2,
            }
          ]}>
            Score: {Math.round(score)}/100
          </Text>
        )}
        
        {/* Description (only for medium and large sizes) */}
        {(size === 'medium' || size === 'large') && (
          <Text style={[
            styles.description,
            {
              color: riskConfig.textColor,
              fontSize: sizeConfig.descriptionSize,
            }
          ]}>
            {riskConfig.description}
          </Text>
        )}
      </View>
      
      {/* Additional Info for Unsafe */}
      {riskLevel === 'Unsafe' && (
        <View style={styles.unsafeIndicator}>
          <Text style={styles.unsafeText}>!</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  riskText: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreText: {
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unsafeIndicator: {
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
    borderColor: '#f44336',
  },
  unsafeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
  },
});

export default RiskBadge;
