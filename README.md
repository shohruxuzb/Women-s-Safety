# SafeHer - Women Safety App

A comprehensive women safety app built with Expo React Native, designed to work offline-first with local data storage and easy extension capabilities.

## 🚀 Features

### Core Safety Features
- **Emergency SOS Button** - Press and hold for 2 seconds to activate emergency mode
- **Trusted Contacts Management** - Add, edit, and manage emergency contacts
- **Real-time Location Sharing** - Share your location with trusted contacts
- **AI-powered Risk Assessment** - Intelligent safety evaluation based on location, time, and context
- **Safety Status Badge** - Visual indicator of current safety level (Safe/Moderate/Unsafe)

### Navigation & UI
- **Bottom Tab Navigation** - Easy access to all features
- **Clean, Intuitive Interface** - User-friendly design with clear visual feedback
- **Offline-First Architecture** - Works without internet connection using AsyncStorage

### Advanced Features
- **Voice Commands** - Text-to-speech for emergency alerts and safety status
- **SMS Integration** - Send emergency messages and location updates
- **Location Tracking** - GPS-based location services with history
- **Settings Management** - Customizable safety preferences

## 📱 Screens

1. **Home Screen** - Main dashboard with SOS button and safety status
2. **Contacts Screen** - Manage trusted contacts for emergencies
3. **Map Screen** - View location and safety information (placeholder for map integration)
4. **Settings Screen** - Configure app preferences and safety features

## 🧩 Components

- **SOSButton** - Emergency button with press-and-hold functionality
- **ContactCard** - Display and manage individual contacts
- **RiskBadge** - Visual safety status indicator

## 🛠️ Utils

- **storage.js** - AsyncStorage helpers for offline data management
- **location.js** - GPS location services and safety zone management
- **sms.js** - SMS functionality for emergency communications
- **ai.js** - AI features including speech and risk assessment

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safeher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📦 Dependencies

### Core Dependencies
- `expo` - Expo SDK
- `react` - React framework
- `react-native` - React Native framework
- `@react-navigation/native` - Navigation library
- `@react-navigation/bottom-tabs` - Bottom tab navigation

### Storage & Data
- `@react-native-async-storage/async-storage` - Local data storage

### Location & Communication
- `expo-location` - GPS location services
- `expo-sms` - SMS functionality
- `expo-speech` - Text-to-speech

### UI Components
- `react-native-vector-icons` - Icon library
- `react-native-screens` - Screen optimization
- `react-native-safe-area-context` - Safe area handling

## 🏗️ Project Structure

```
safeher/
├── App.js                 # Main app component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── babel.config.js       # Babel configuration
├── README.md            # This file
└── src/
    ├── screens/         # App screens
    │   ├── HomeScreen.js
    │   ├── ContactsScreen.js
    │   ├── MapScreen.js
    │   └── SettingsScreen.js
    ├── components/      # Reusable components
    │   ├── SOSButton.js
    │   ├── ContactCard.js
    │   └── RiskBadge.js
    └── utils/          # Utility functions
        ├── storage.js
        ├── location.js
        ├── sms.js
        └── ai.js
```

## 🔧 Configuration

### Permissions
The app requires the following permissions:
- **Location** - For GPS tracking and safety features
- **SMS** - For sending emergency messages
- **Contacts** - For managing trusted contacts

### Settings
Configure app behavior in the Settings screen:
- Emergency alerts
- Location sharing
- Auto location updates
- Sound and vibration alerts
- AI risk assessment
- Community reports

## 🚀 Future Enhancements

### Planned Features
- **Real-time Map Integration** - Google Maps or MapBox integration
- **Crime Data Overlay** - Real-time crime data integration
- **Safe Route Suggestions** - AI-powered route optimization
- **Community Safety Reports** - User-generated safety information
- **Emergency Service Integration** - Direct integration with local emergency services
- **Smart Watch Support** - Wearable device integration
- **Voice Commands** - Advanced voice recognition
- **Machine Learning** - Personalized risk assessment

### Technical Improvements
- **Offline Map Support** - Download maps for offline use
- **Push Notifications** - Real-time safety alerts
- **Cloud Sync** - Backup and sync across devices
- **Analytics** - Usage analytics and safety insights
- **Multi-language Support** - Internationalization

## 🛡️ Safety Features

### Emergency Protocols
1. **SOS Activation** - Press and hold SOS button for 2 seconds
2. **Contact Notification** - Automatic SMS to all emergency contacts
3. **Location Sharing** - Real-time location updates
4. **Voice Alerts** - Audio confirmation of emergency activation

### Privacy & Security
- **Local Data Storage** - All data stored locally on device
- **Encrypted Communications** - Secure SMS and location sharing
- **User Control** - Full control over data sharing and permissions
- **No Tracking** - No user tracking or data collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@safeher.app or create an issue in the repository.

## ⚠️ Disclaimer

This app is designed to assist with personal safety but should not be relied upon as the sole means of protection. Always trust your instincts and call emergency services (911/112) in case of immediate danger.

---

**Stay Safe, Stay Strong** 💪
