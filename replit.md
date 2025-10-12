# ConnexaBot WhatsApp Clone

## Overview
A React Native Expo application that provides a WhatsApp-like interface for managing WhatsApp connections through the Connexa-Bot API.

## Project Status
- **Last Updated**: October 12, 2025
- **Current State**: Setup and theming improvements completed, debugging blank screen issue

## Recent Changes (October 12, 2025)
1. Updated theme colors to match official WhatsApp design exactly
2. Added dynamic StatusBar that responds to theme changes
3. Enhanced tab navigation with proper theme support
4. Fixed ThemeContext to not block rendering during load
5. Configured Expo Web workflow on port 5000
6. Verified all screens use theme context properly

## Project Architecture

### Technology Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation (Native Stack + Material Top Tabs)
- **State Management**: React Context API
- **Styling**: React Native StyleSheet with theme support
- **Storage**: AsyncStorage (web) / SecureStore (native)
- **API**: REST API integration with Connexa-Bot backend

### Key Features
- WhatsApp-style UI with light/dark/system theme support
- Tab-based navigation (Chats, Updates, Calls)
- QR code/link code device linking
- Real-time chat functionality
- AI-powered features (smart reply, translation, summarization)

### API Integration
- **Base URL**: https://1b6bc53f-e595-4c09-bbdf-56c62421c642-00-18ocnnrogz8bw.kirk.replit.dev
- **Endpoints**: Defined in `src/services/api.js`
- **Authentication**: Phone-based with QR/link code

## Directory Structure
```
/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ChatHeader.js
│   │   ├── ChatInput.js
│   │   ├── MessageBubble.js
│   │   └── SmartReplyBar.js
│   ├── contexts/          # React Context providers
│   │   ├── AIContext.js
│   │   ├── AuthContext.js
│   │   ├── ThemeContext.js
│   │   └── WallpaperContext.js
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── MainTabNavigator.js
│   │   └── index.js
│   ├── screens/           # App screens
│   │   ├── CallsScreen.js
│   │   ├── ChatsScreen.js
│   │   ├── ChatViewScreen.js
│   │   ├── LinkDeviceScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── TermsPrivacyScreen.js
│   │   ├── UpdatesScreen.js
│   │   └── WelcomeSplashScreen.js
│   ├── services/          # API and external services
│   │   └── api.js
│   ├── utils/             # Utility functions
│   │   └── storage.js
│   └── config.js          # App configuration
├── assets/                # Images and static assets
├── App.js                 # Root component
├── app.json               # Expo configuration
└── package.json           # Dependencies
```

## Theme System

### Color Schemes
**Light Mode**:
- Primary: #008069 (WhatsApp Green)
- Background: #FFFFFF
- Header: #008069
- Tab Icons Selected: #FFFFFF
- Tab Icons Default: rgba(255, 255, 255, 0.6)

**Dark Mode**:
- Primary: #00a884 (Lighter Green)
- Background: #0B141A (Deep Black)
- Header: #1F2C34 (Dark Gray)
- Tab Icons Selected: #00a884
- Tab Icons Default: rgba(255, 255, 255, 0.6)

### Theme Context
- Located in `src/contexts/ThemeContext.js`
- Supports: light, dark, system (follows device preference)
- Persisted in storage
- Used across all screens and components

## Known Issues
1. **Blank Screen on Web**: Currently investigating white screen issue on web platform
   - App bundles successfully
   - No JavaScript errors in console
   - Likely related to AuthContext API calls or navigation flow
   - Need to debug initialization sequence

## Development Workflow

### Running the App
```bash
npm run web          # Start Expo Web on port 5000
npm run android      # Run on Android
npm run ios          # Run on iOS
```

### Current Workflow Configuration
- **Name**: Expo Web
- **Command**: `npm run web`
- **Port**: 5000
- **Type**: webview

## User Preferences
- Theme preference stored in AsyncStorage
- User authentication via phone number
- Supports QR code and link code device pairing

## API Endpoints
All endpoints are properly configured in `src/services/api.js`:
- Health checks
- Connection management (connect, status, logout)
- Data retrieval (chats, messages, calls, etc.)
- Actions (send message, create group, etc.)
- AI features (smart reply, translate, summarize)

## Next Steps
1. Debug and fix blank screen issue on web
2. Test API connectivity with backend
3. Verify dark mode works across all screens
4. Test device linking flow
5. Configure deployment settings
