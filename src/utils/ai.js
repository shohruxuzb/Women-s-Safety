import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

/**
 * AI utilities for SafeHer app
 * Handles speech recognition, text-to-speech, and AI-based risk assessment
 * Provides intelligent safety features and voice commands
 * 
 * FUTURE ML INTEGRATION:
 * - Replace simple risk scoring with trained ML models
 * - Integrate with TensorFlow Lite or ONNX Runtime
 * - Use real-time crime data APIs
 * - Implement computer vision for surroundings analysis
 * - Add natural language processing for voice commands
 * - Connect to cloud-based AI services (AWS, Google Cloud, Azure)
 */

/**
 * Voice Recognition and SOS Detection
 */

// Voice recognition state
let voiceRecognitionActive = false;
let voiceRecognitionCallback = null;

/**
 * Initialize voice recognition
 * Sets up event listeners for voice recognition
 */
export const initializeVoiceRecognition = () => {
  try {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    
    console.log('Voice recognition initialized');
    return true;
  } catch (error) {
    console.error('Error initializing voice recognition:', error);
    return false;
  }
};

/**
 * Start continuous voice recognition
 * Returns true if started successfully, false otherwise
 */
export const startVoiceRecognition = async (callback) => {
  try {
    if (voiceRecognitionActive) {
      console.log('Voice recognition already active');
      return true;
    }

    // Check if voice recognition is available
    const available = await Voice.isAvailable();
    if (!available) {
      console.warn('Voice recognition not available on this device');
      return false;
    }

    // Set callback for SOS detection
    voiceRecognitionCallback = callback;

    // Start listening
    await Voice.start('en-US');
    voiceRecognitionActive = true;
    
    console.log('Voice recognition started');
    return true;
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    return false;
  }
};

/**
 * Stop voice recognition
 */
export const stopVoiceRecognition = async () => {
  try {
    if (!voiceRecognitionActive) {
      return true;
    }

    await Voice.stop();
    voiceRecognitionActive = false;
    voiceRecognitionCallback = null;
    
    console.log('Voice recognition stopped');
    return true;
  } catch (error) {
    console.error('Error stopping voice recognition:', error);
    return false;
  }
};

/**
 * Check if voice recognition is active
 */
export const isVoiceRecognitionActive = () => {
  return voiceRecognitionActive;
};

// Voice recognition event handlers
const onSpeechStart = (e) => {
  console.log('Speech started:', e);
};

const onSpeechRecognized = (e) => {
  console.log('Speech recognized:', e);
};

const onSpeechEnd = (e) => {
  console.log('Speech ended:', e);
};

const onSpeechError = (e) => {
  console.error('Speech error:', e);
  // Restart recognition if there was an error
  if (voiceRecognitionActive) {
    setTimeout(() => {
      startVoiceRecognition(voiceRecognitionCallback);
    }, 1000);
  }
};

const onSpeechResults = (e) => {
  console.log('Speech results:', e);
  if (e.value && e.value.length > 0) {
    const spokenText = e.value[0].toLowerCase();
    detectSOSCommand(spokenText);
  }
};

const onSpeechPartialResults = (e) => {
  console.log('Partial speech results:', e);
  if (e.value && e.value.length > 0) {
    const spokenText = e.value[0].toLowerCase();
    detectSOSCommand(spokenText);
  }
};

/**
 * Detect SOS commands in speech
 * Triggers emergency response if SOS keywords are detected
 */
const detectSOSCommand = (spokenText) => {
  const sosKeywords = [
    'help', 'emergency', 'sos', 'danger', 'dangerous',
    'unsafe', 'scared', 'afraid', 'threat', 'attack',
    'assault', 'harassment', 'stalking', 'follow',
    'call police', 'call 911', 'need help', 'help me'
  ];

  const detectedKeyword = sosKeywords.find(keyword => 
    spokenText.includes(keyword)
  );

  if (detectedKeyword && voiceRecognitionCallback) {
    console.log(`SOS command detected: "${detectedKeyword}" in "${spokenText}"`);
    
    // Trigger emergency callback
    voiceRecognitionCallback({
      type: 'voice_sos',
      keyword: detectedKeyword,
      fullText: spokenText,
      timestamp: new Date().toISOString()
    });

    // Provide audio feedback
    speakEmergencyAlert('Emergency voice command detected. Activating SOS.');
  }
};

/**
 * Speech Recognition and Text-to-Speech
 */

/**
 * Speak text using device's text-to-speech
 * Returns promise that resolves when speech is complete
 */
export const speakText = async (text, options = {}) => {
  try {
    const speechOptions = {
      language: options.language || 'en',
      pitch: options.pitch || 1.0,
      rate: options.rate || 0.8,
      volume: options.volume || 1.0,
      ...options,
    };

    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        ...speechOptions,
        onDone: () => resolve(true),
        onStopped: () => resolve(false),
        onError: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error('Error speaking text:', error);
    return false;
  }
};

/**
 * Stop current speech
 */
export const stopSpeech = () => {
  try {
    Speech.stop();
    return true;
  } catch (error) {
    console.error('Error stopping speech:', error);
    return false;
  }
};

/**
 * Check if speech is currently playing
 */
export const isSpeaking = () => {
  try {
    return Speech.isSpeakingAsync();
  } catch (error) {
    console.error('Error checking speech status:', error);
    return false;
  }
};

/**
 * Speak emergency alert
 */
export const speakEmergencyAlert = async (message = 'Emergency alert activated') => {
  try {
    const emergencyMessage = `🚨 ${message}. Please help me immediately!`;
    return await speakText(emergencyMessage, {
      rate: 0.7, // Slower for clarity
      pitch: 1.2, // Higher pitch for urgency
    });
  } catch (error) {
    console.error('Error speaking emergency alert:', error);
    return false;
  }
};

/**
 * Speak safety status
 */
export const speakSafetyStatus = async (status) => {
  try {
    let message = '';
    switch (status.toLowerCase()) {
      case 'safe':
        message = 'You are in a safe area. Stay alert and aware of your surroundings.';
        break;
      case 'moderate':
        message = 'Moderate risk detected. Please stay alert and consider your safety.';
        break;
      case 'unsafe':
        message = 'High risk area detected. Please leave immediately or call for help.';
        break;
      default:
        message = 'Safety status unknown. Please stay alert.';
    }
    
    return await speakText(message, {
      rate: 0.8,
      pitch: 1.0,
    });
  } catch (error) {
    console.error('Error speaking safety status:', error);
    return false;
  }
};

/**
 * AI-Based Risk Assessment
 */

/**
 * Calculate real-time risk score based on location and context
 * Returns risk level: 'Safe', 'Moderate', 'Unsafe', or 'Unknown'
 * 
 * FUTURE ML INTEGRATION:
 * - Replace this function with trained ML model
 * - Use TensorFlow Lite for on-device inference
 * - Integrate with real-time crime data APIs
 * - Add computer vision for surroundings analysis
 * - Implement ensemble models for better accuracy
 */
export const calculateRiskScore = async (latitude, longitude, additionalFactors = {}) => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    let riskScore = 0;
    const maxScore = 100;

    // Time-based risk factors (40% weight)
    const timeRisk = calculateTimeRisk(hour, dayOfWeek);
    riskScore += timeRisk * 0.4;

    // Location-based risk factors (30% weight)
    const locationRisk = await calculateLocationRisk(latitude, longitude);
    riskScore += locationRisk * 0.3;

    // Environmental risk factors (20% weight)
    const environmentalRisk = calculateEnvironmentalRisk(additionalFactors);
    riskScore += environmentalRisk * 0.2;

    // Behavioral risk factors (10% weight)
    const behavioralRisk = calculateBehavioralRisk(additionalFactors);
    riskScore += behavioralRisk * 0.1;

    // Apply additional factors
    if (additionalFactors.isAlone) riskScore += 10;
    if (additionalFactors.isDarkArea) riskScore += 15;
    if (additionalFactors.hasRecentIncidents) riskScore += 20;
    if (additionalFactors.isWeekend) riskScore += 5;

    // Normalize score
    const normalizedScore = Math.min(Math.max(riskScore, 0), 100);

    // Determine risk level
    if (normalizedScore >= 70) {
      return {
        level: 'Unsafe',
        score: normalizedScore,
        factors: {
          time: timeRisk,
          location: locationRisk,
          environmental: environmentalRisk,
          behavioral: behavioralRisk
        },
        recommendations: generateRiskRecommendations(normalizedScore, 'Unsafe')
      };
    } else if (normalizedScore >= 40) {
      return {
        level: 'Moderate',
        score: normalizedScore,
        factors: {
          time: timeRisk,
          location: locationRisk,
          environmental: environmentalRisk,
          behavioral: behavioralRisk
        },
        recommendations: generateRiskRecommendations(normalizedScore, 'Moderate')
      };
    } else {
      return {
        level: 'Safe',
        score: normalizedScore,
        factors: {
          time: timeRisk,
          location: locationRisk,
          environmental: environmentalRisk,
          behavioral: behavioralRisk
        },
        recommendations: generateRiskRecommendations(normalizedScore, 'Safe')
      };
    }
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return {
      level: 'Unknown',
      score: 0,
      factors: {},
      recommendations: ['Unable to assess risk level']
    };
  }
};

/**
 * Calculate time-based risk score
 * Night time and weekends have higher risk
 */
const calculateTimeRisk = (hour, dayOfWeek) => {
  let risk = 0;

  // Night time risk (10 PM - 5 AM)
  if (hour >= 22 || hour <= 5) {
    risk += 80; // High risk
  } else if (hour >= 18 || hour <= 7) {
    risk += 40; // Moderate risk (evening/early morning)
  } else {
    risk += 10; // Low risk (daytime)
  }

  // Weekend risk
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    risk += 20;
  }

  return Math.min(risk, 100);
};

/**
 * Calculate location-based risk score
 * TODO: Integrate with real crime data APIs
 */
const calculateLocationRisk = async (latitude, longitude) => {
  try {
    // FUTURE ML INTEGRATION:
    // - Use trained model with crime data
    // - Integrate with Google Places API for area type
    // - Use population density data
    // - Analyze lighting conditions
    // - Check proximity to safe places

    // For now, use simple simulation
    const randomFactor = Math.random() * 30; // 0-30 random variation
    const baseRisk = 30; // Base location risk
    
    return Math.min(baseRisk + randomFactor, 100);
  } catch (error) {
    console.error('Error calculating location risk:', error);
    return 50; // Default moderate risk
  }
};

/**
 * Calculate environmental risk factors
 */
const calculateEnvironmentalRisk = (factors) => {
  let risk = 0;

  // Weather conditions
  if (factors.weather) {
    if (factors.weather.visibility < 1000) risk += 30; // Low visibility
    if (factors.weather.precipitation > 0) risk += 20; // Rain/snow
    if (factors.weather.temperature < 0) risk += 10; // Very cold
  }

  // Lighting conditions
  if (factors.isDarkArea) risk += 40;
  if (factors.isPoorLighting) risk += 25;

  return Math.min(risk, 100);
};

/**
 * Calculate behavioral risk factors
 */
const calculateBehavioralRisk = (factors) => {
  let risk = 0;

  // Movement patterns
  if (factors.isStationary && factors.stationaryTime > 300000) { // 5 minutes
    risk += 30;
  }
  if (factors.speed > 50) { // Moving fast
    risk += 20;
  }

  // Social factors
  if (factors.isAlone) risk += 25;
  if (factors.isDistracted) risk += 15;

  return Math.min(risk, 100);
};

/**
 * Generate risk-based recommendations
 */
const generateRiskRecommendations = (score, level) => {
  const recommendations = [];

  if (level === 'Unsafe') {
    recommendations.push('🚨 HIGH RISK: Leave the area immediately');
    recommendations.push('📞 Call emergency services if needed');
    recommendations.push('🏃 Move to a well-lit, populated area');
    recommendations.push('👥 Stay with trusted people if possible');
  } else if (level === 'Moderate') {
    recommendations.push('⚠️ MODERATE RISK: Stay alert and aware');
    recommendations.push('📍 Share your location with trusted contacts');
    recommendations.push('🔦 Stay in well-lit areas');
    recommendations.push('📱 Keep your phone accessible');
  } else {
    recommendations.push('✅ SAFE: Continue with normal precautions');
    recommendations.push('👀 Stay aware of your surroundings');
    recommendations.push('📱 Keep emergency contacts ready');
  }

  return recommendations;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateRiskScore instead
 */
export const assessRiskLevel = async (factors) => {
  try {
    const result = await calculateRiskScore(
      factors.location?.latitude || 0,
      factors.location?.longitude || 0,
      factors
    );
    return result.level;
  } catch (error) {
    console.error('Error in legacy assessRiskLevel:', error);
    return 'Unknown';
  }
};

/**
 * Analyze user's movement patterns for safety
 * Returns safety recommendations
 */
export const analyzeMovementPatterns = async (locationHistory) => {
  try {
    if (!locationHistory || locationHistory.length < 3) {
      return {
        pattern: 'insufficient_data',
        recommendations: ['Need more location data for analysis'],
      };
    }

    const patterns = {
      speed: [],
      direction: [],
      stops: [],
    };

    // Analyze speed patterns
    for (let i = 1; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];
      
      if (prev.speed && curr.speed) {
        patterns.speed.push(curr.speed);
      }
    }

    // Analyze direction changes
    for (let i = 2; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];
      
      if (prev.heading && curr.heading) {
        const directionChange = Math.abs(curr.heading - prev.heading);
        patterns.direction.push(directionChange);
      }
    }

    // Analyze stops
    const stops = locationHistory.filter((location, index) => {
      if (index === 0) return false;
      const prev = locationHistory[index - 1];
      const distance = calculateDistance(
        prev.latitude,
        prev.longitude,
        location.latitude,
        location.longitude
      );
      return distance < 10; // Less than 10 meters = stopped
    });

    patterns.stops = stops;

    // Generate recommendations
    const recommendations = [];

    // Speed analysis
    const avgSpeed = patterns.speed.reduce((a, b) => a + b, 0) / patterns.speed.length;
    if (avgSpeed > 60) { // km/h
      recommendations.push('Consider slowing down for safety');
    }

    // Direction analysis
    const avgDirectionChange = patterns.direction.reduce((a, b) => a + b, 0) / patterns.direction.length;
    if (avgDirectionChange > 90) { // degrees
      recommendations.push('Frequent direction changes detected - stay alert');
    }

    // Stop analysis
    if (patterns.stops.length > 3) {
      recommendations.push('Multiple stops detected - ensure you\'re in safe locations');
    }

    return {
      pattern: 'analyzed',
      recommendations: recommendations.length > 0 ? recommendations : ['Movement patterns appear normal'],
      data: {
        averageSpeed: avgSpeed,
        averageDirectionChange: avgDirectionChange,
        stopCount: patterns.stops.length,
      },
    };
  } catch (error) {
    console.error('Error analyzing movement patterns:', error);
    return {
      pattern: 'error',
      recommendations: ['Unable to analyze movement patterns'],
    };
  }
};

/**
 * Generate safety recommendations based on context
 */
export const generateSafetyRecommendations = async (context) => {
  try {
    const recommendations = [];

    // Time-based recommendations
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) {
      recommendations.push('It\'s late at night - stay in well-lit areas');
      recommendations.push('Consider calling a trusted contact to check in');
    }

    // Location-based recommendations
    if (context.location) {
      if (context.location.accuracy > 100) {
        recommendations.push('Location accuracy is low - stay alert');
      }
    }

    // Weather-based recommendations
    if (context.weather) {
      if (context.weather.visibility < 1000) {
        recommendations.push('Low visibility - be extra cautious');
      }
      if (context.weather.precipitation > 0) {
        recommendations.push('Wet conditions - watch your step');
      }
    }

    // General recommendations
    recommendations.push('Keep your phone charged and accessible');
    recommendations.push('Stay aware of your surroundings');
    recommendations.push('Trust your instincts - if something feels wrong, leave');

    return recommendations;
  } catch (error) {
    console.error('Error generating safety recommendations:', error);
    return ['Stay safe and alert'];
  }
};

/**
 * Voice Command Processing
 */

/**
 * Process voice command for emergency actions
 * Returns action to take based on voice input
 */
export const processVoiceCommand = async (command) => {
  try {
    const normalizedCommand = command.toLowerCase().trim();

    // Emergency commands
    if (normalizedCommand.includes('help') || normalizedCommand.includes('emergency')) {
      return {
        action: 'emergency',
        confidence: 0.9,
        message: 'Emergency command detected',
      };
    }

    // Location sharing commands
    if (normalizedCommand.includes('location') || normalizedCommand.includes('where')) {
      return {
        action: 'share_location',
        confidence: 0.8,
        message: 'Location sharing command detected',
      };
    }

    // Safety check-in commands
    if (normalizedCommand.includes('safe') || normalizedCommand.includes('okay')) {
      return {
        action: 'safety_checkin',
        confidence: 0.7,
        message: 'Safety check-in command detected',
      };
    }

    // Call contacts commands
    if (normalizedCommand.includes('call') || normalizedCommand.includes('phone')) {
      return {
        action: 'call_contact',
        confidence: 0.8,
        message: 'Call contact command detected',
      };
    }

    return {
      action: 'unknown',
      confidence: 0.0,
      message: 'Command not recognized',
    };
  } catch (error) {
    console.error('Error processing voice command:', error);
    return {
      action: 'error',
      confidence: 0.0,
      message: 'Error processing command',
    };
  }
};

/**
 * Helper function to calculate distance between two points
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
 * TODO: Future AI Features
 * 
 * 1. Machine Learning Risk Assessment
 *    - Train models on historical safety data
 *    - Personalize risk assessment based on user patterns
 *    - Real-time risk prediction
 * 
 * 2. Natural Language Processing
 *    - Voice command recognition
 *    - Sentiment analysis of user messages
 *    - Automatic emergency detection from voice tone
 * 
 * 3. Computer Vision
 *    - Analyze surroundings for safety hazards
 *    - Recognize emergency situations
 *    - Identify safe vs unsafe locations
 * 
 * 4. Predictive Analytics
 *    - Predict optimal safe routes
 *    - Forecast risk levels for planned routes
 *    - Suggest best times for travel
 * 
 * 5. Behavioral Analysis
 *    - Detect unusual movement patterns
 *    - Identify potential danger situations
 *    - Provide personalized safety tips
 */
