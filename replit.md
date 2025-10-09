# ConnexaBot - AI-Powered WhatsApp Experience

## Project Overview
ConnexaBot is a React Native (Expo) web application that provides an AI-enhanced WhatsApp-like messaging experience. The app features a modern UI with dark mode support, comprehensive authentication flow, and integration with a backend WhatsApp bot server.

## Architecture

### Frontend Stack
- **Framework**: Expo (React Native for Web)
- **Navigation**: React Navigation (Stack & Tab Navigators)
- **UI Components**: React Native Paper, Expo Symbols
- **State Management**: React Context API
- **Styling**: React Native StyleSheet

### Backend Integration
- **Server URL**: https://connexa-bot-server.onrender.com
- **AI Features**: OpenAI GPT integration for smart replies, sentiment analysis, image analysis
- **WhatsApp**: Baileys library for WhatsApp Web API

## Recent Updates (October 2025)

### ✅ Splash Screens Implementation
1. **Welcome Splash Screen** (`src/screens/WelcomeSplashScreen.js`)
   - Connexa-branded splash screen
   - Smooth fade-in animation
   - Auto-transitions after 2.5 seconds
   - Shows app logo, title, and "from Connexa" branding

2. **Terms & Privacy Screen** (`src/screens/TermsPrivacyScreen.js`)
   - Professional onboarding screen
   - Privacy policy and terms summary
   - "Agree and continue" button
   - Scrollable content with key points
   - Links to full policy documents

### ✅ Enhanced Link Device Screen
Completely redesigned `src/screens/LinkDeviceScreen.js` with:

#### Phase 1: Phone Input
- Clean, modern phone number input
- Real-time validation
- Information box about backend notification
- Icon-based visual design

#### Phase 2: QR Code & Link Code Options
- **Tab Navigation**: Switch between QR Code and Link with Code
- **QR Code Tab**:
  - Large, scannable QR code display
  - Step-by-step instructions (1-4)
  - Official WhatsApp-style guidance
  - Real-time connection status
  
- **Link Code Tab**:
  - 8-digit pairing code display
  - Copy to clipboard functionality
  - Step-by-step instructions for phone number linking
  - Visual code display box

#### Features
- Back navigation to restart the flow
- Theme-aware styling (dark/light mode)
- Responsive design
- Loading states and animations
- Real-time connection polling

### ✅ Navigation Flow Enhancement
Updated `src/navigation/index.js` to implement:
1. Welcome Splash (first time only)
2. Terms & Privacy (first time only)
3. Link Device Screen (if not authenticated)
4. Main App (if authenticated)

Uses AsyncStorage to track if user has seen welcome screens.

### ✅ Theme-Aware Backgrounds
All screens now properly support theme changes:
- Dynamic background colors from ThemeContext
- Text color adaptation
- Border and accent color theming
- Consistent visual hierarchy

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatHeader.js
│   ├── ChatInput.js
│   ├── MessageBubble.js
│   └── SmartReplyBar.js
├── contexts/           # React Context providers
│   ├── AIContext.js      # AI features state
│   ├── AuthContext.js    # Authentication state
│   ├── ThemeContext.js   # Theme management
│   └── WallpaperContext.js
├── navigation/         # Navigation configuration
│   ├── index.js         # Root navigator with splash screens
│   ├── AppNavigator.js  # Main app navigation
│   └── MainTabNavigator.js
├── screens/           # Application screens
│   ├── WelcomeSplashScreen.js    # NEW: Connexa splash
│   ├── TermsPrivacyScreen.js     # NEW: Terms & Privacy
│   ├── LinkDeviceScreen.js       # UPDATED: Enhanced linking
│   ├── ChatsScreen.js
│   ├── ChatViewScreen.js
│   ├── CallsScreen.js
│   ├── CommunitiesScreen.js
│   ├── UpdatesScreen.js
│   ├── SettingsScreen.js
│   └── LinkDeviceScreen.js
├── services/          # API and external services
│   ├── api.js           # Backend API client
│   └── ...
├── utils/            # Utility functions
│   └── storage.js       # AsyncStorage wrapper
└── config.js         # Configuration constants
```

## Running the Application

### Development
```bash
npm install --legacy-peer-deps
npm run web
```

The app runs on **port 5000** and is accessible at:
- Local: http://localhost:5000
- Replit: https://[your-repl].replit.dev

### Important Notes
- Uses `--legacy-peer-deps` due to React Native dependency conflicts
- Web-optimized (no native driver for animations)
- Responsive design for web browsers

## Features

### Authentication Flow
1. Welcome splash with Connexa branding
2. Terms & Privacy acceptance
3. Phone number input with validation
4. QR code or link code device linking
5. Real-time connection status monitoring
6. Persistent authentication via AsyncStorage

### Messaging Features
- Chat list with real-time updates
- Individual and group chats
- Message actions (delete, forward, star, react, edit)
- Media support (image, video, audio, documents)
- Status/Story posting
- Voice/video call history (view only)

### AI Features (via Backend)
- Auto-reply with context awareness
- Smart reply suggestions (3 options)
- Image analysis (GPT-5 Vision)
- Audio transcription (Whisper)
- Sentiment analysis
- Conversation summarization
- Multi-language support

### UI/UX
- Dark/Light theme support
- Custom wallpapers
- Smooth animations
- Loading states
- Error handling
- Responsive layout

## Configuration

### Environment
- **Server URL**: Configured in `src/config.js`
- **Theme**: Managed in `src/contexts/ThemeContext.js`
- **Storage**: AsyncStorage for web (`@react-native-async-storage/async-storage`)

### Workflow
- **Name**: Expo Web Server
- **Command**: `npm run web`
- **Port**: 5000
- **Output**: Webview

## API Integration

The app connects to a backend server that provides:
- WhatsApp Web connection management
- Multi-session support
- AI-powered features
- Media handling
- Real-time status updates

See `src/services/api.js` for complete API documentation.

## Known Issues & Limitations

1. **React Native Web**: Some native features unavailable on web
2. **Animations**: Using JS-based animations (no native driver)
3. **Peer Dependencies**: Requires `--legacy-peer-deps` for installation
4. **Voice/Video Calls**: View-only (backend limitation via Baileys)

## Development Notes

### Adding New Screens
1. Create screen component in `src/screens/`
2. Add to appropriate navigator
3. Ensure theme support via `useTheme()` hook
4. Test with both light and dark themes

### Modifying Navigation
- Root flow: `src/navigation/index.js`
- App flow: `src/navigation/AppNavigator.js`
- Tabs: `src/navigation/MainTabNavigator.js`

### API Integration
- All API calls in `src/services/api.js`
- Use axios interceptors for logging
- Handle errors gracefully with user feedback

## Deployment

To deploy this application:
1. Configure deployment settings
2. Build for production: `npm run build` (when configured)
3. Deploy to static hosting or Replit deployment

## User Preferences

### Theme
- Default: Dark mode
- Toggle available in Settings screen
- Persists across sessions

### Authentication
- Remembers logged-in user
- Validates connection on app start
- Clears invalid sessions automatically

## Support & Documentation

For more information:
- Backend API: See `attached_assets/` folder
- AI Features: `AI_AUTOMATION_GUIDE.md`
- Frontend Integration: `FRONTEND_INTEGRATION_README.md`

---

**Last Updated**: October 9, 2025
**Version**: 1.0.0
**Maintained by**: Connexa Team
