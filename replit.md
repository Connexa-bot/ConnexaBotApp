# ConnexaBot - WhatsApp Automation App

## Overview

ConnexaBot is a React Native/Expo mobile application that provides a WhatsApp-like messaging interface with advanced AI automation capabilities. The app connects to a backend server to enable WhatsApp messaging with intelligent features like auto-replies, smart suggestions, image analysis, voice transcription, and sentiment analysis powered by OpenAI's GPT-5.

The application is designed as a WhatsApp client with enhanced AI capabilities, allowing users to manage chats, send messages, handle media, and leverage AI to automate and enhance their messaging experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo (v54.0.13)
- **Navigation**: React Navigation v7 with native stack and material top tabs
- **State Management**: React Context API for global state
- **UI Components**: Custom components with react-native-paper for Material Design elements
- **Styling**: StyleSheet API with dynamic theming support

**Key Design Patterns**:
- Context providers wrap the entire app for theme, auth, wallpaper, and AI settings
- Provider hierarchy: AuthProvider → ThemeProvider → WallpaperProvider → AIProvider → App
- Screen-based navigation with stack and tab navigators
- Functional components with React Hooks throughout

**Core Contexts**:
1. **AuthContext**: Manages user authentication, phone number storage, QR code/link code for WhatsApp connection
2. **ThemeContext**: Handles light/dark/system theme preferences with persistent storage
3. **WallpaperContext**: Manages chat wallpapers (global and per-chat customization)
4. **AIContext**: Controls AI automation settings (auto-reply, smart replies, personality, language)

### Backend Integration

**API Communication**: Axios-based HTTP client
- Base URL configured in `src/config.js`: `https://connexa-bot-server.onrender.com`
- Request/response interceptors for logging and error handling
- 30-second timeout for all requests

**Authentication Flow**:
1. User enters phone number
2. Backend generates QR code and link code for WhatsApp Web pairing
3. App displays QR code or pairing code for linking
4. Connection status polling until authenticated
5. Phone number stored securely for session persistence

**Message Handling**:
- Real-time message fetching via polling mechanism
- Support for text, images, videos, audio, and documents
- Message actions: delete, forward, star, react, edit
- Media download and upload capabilities

### Data Storage Solutions

**Secure Storage** (`src/utils/storage.js`):
- **Mobile (iOS/Android)**: expo-secure-store for encrypted storage
- **Web**: AsyncStorage fallback
- Stores: user phone number, theme preference, welcome screen flag

**AsyncStorage**:
- AI settings (personality, language, context window)
- Per-chat AI configurations
- Chat wallpaper preferences
- Default wallpaper selection

**No Database**: All data is stored on the backend server; frontend only caches user preferences locally

### AI Automation System

**Capabilities**:
1. **Auto-Reply**: Automatically respond to messages with context-aware AI
2. **Smart Replies**: Generate 3 quick reply suggestions
3. **Image Analysis**: GPT-5 Vision for image description and content extraction
4. **Voice Transcription**: Whisper AI for audio-to-text conversion
5. **Sentiment Analysis**: Emotion and tone detection
6. **Conversation Summarization**: Chat history summarization
7. **Personality Selection**: Customizable AI tone (friendly, professional, casual, empathetic, technical)

**Configuration Options**:
- Enable/disable per feature (global and per-chat)
- Adjustable context window (default: 10 messages)
- Language preference with auto-detection
- Confidence threshold for auto-sending

**AI API Endpoints** (Backend):
- `/api/ai/generate-response` - Generate AI response
- `/api/ai/auto-reply` - Context-aware auto-reply
- `/api/ai/smart-replies` - Quick reply suggestions
- `/api/ai/analyze-image` - Image content analysis
- `/api/ai/transcribe-audio` - Voice to text
- `/api/ai/analyze-sentiment` - Sentiment detection
- `/api/ai/summarize` - Conversation summary
- `/api/ai/chat-history/:phone/:chatId` - Persistent AI memory

### Navigation Structure

**Root Navigation** (`src/navigation/index.js`):
- Conditional rendering based on auth state and onboarding status
- Welcome splash → Terms & Privacy → Link Device → Main App
- Persistent welcome screen flag to show only on first launch

**App Navigation** (`src/navigation/AppNavigator.js`):
- Stack navigator for modal screens (ChatView, Settings)
- Main tabs embedded as first screen

**Tab Navigation** (`src/navigation/MainTabNavigator.js`):
- Material top tabs: Chats, Updates, Calls
- Custom tab bar styling with theme support

**Key Screens**:
1. **WelcomeSplashScreen**: Animated logo splash (2.5s)
2. **TermsPrivacyScreen**: Privacy policy and terms acceptance
3. **LinkDeviceScreen**: QR code/pairing code display for WhatsApp linking
4. **ChatsScreen**: Chat list with pull-to-refresh
5. **ChatViewScreen**: Message thread with AI features
6. **UpdatesScreen**: WhatsApp status/stories (view and post)
7. **CallsScreen**: Call history (view only)
8. **SettingsScreen**: Theme, wallpaper, AI, and account settings

### Platform-Specific Features

**Android**:
- Edge-to-edge display enabled
- Adaptive icon with foreground/background/monochrome variants
- Navigation bar hidden with inset-swipe behavior
- Predictive back gesture disabled

**Cross-Platform**:
- QR code generation for WhatsApp Web pairing
- Media picker (images, videos, documents)
- Camera integration
- Clipboard access for pairing codes
- Audio recording for voice messages

### Theme System

**Color Schemes**:
- Light theme: WhatsApp light mode palette
- Dark theme: WhatsApp dark mode palette (#0B141A background)
- System theme follows device preference

**Dynamic Theming**:
- All components use theme context colors
- Persistent theme preference storage
- Real-time theme switching without restart

**Wallpaper System**:
- 8 default wallpapers (colors)
- Custom wallpaper upload support
- Global wallpaper setting
- Per-chat wallpaper override
- Wallpaper preview in chat background

## External Dependencies

### Third-Party Services

1. **Backend Server**: `https://connexa-bot-server.onrender.com`
   - WhatsApp Web API integration
   - Message handling and routing
   - Media storage and delivery
   - AI processing endpoint gateway

2. **OpenAI API** (via backend):
   - GPT-5 for text generation and auto-replies
   - GPT-5 Vision for image analysis
   - Whisper AI for audio transcription
   - All AI features proxied through backend

### Key NPM Packages

**React Native/Expo Core**:
- `expo` (v54.0.13) - Development platform
- `react-native` (v0.81.4) - Core framework
- `react` (v19.1.0) - UI library

**Navigation**:
- `@react-navigation/native` (v7.1.8)
- `@react-navigation/native-stack` (v7.3.16)
- `@react-navigation/material-top-tabs` (v7.3.8)
- `react-native-gesture-handler` (v2.28.0)
- `react-native-pager-view` (v6.9.1)

**Storage & State**:
- `@react-native-async-storage/async-storage` (v2.2.0)
- `expo-secure-store` (v15.0.7)

**Media & Permissions**:
- `expo-image-picker` (v17.0.8) - Gallery/camera access
- `expo-camera` (v17.0.8) - Camera integration
- `expo-av` (v16.0.7) - Audio/video playback
- `expo-document-picker` (v14.0.7) - File selection
- `expo-media-library` (v18.2.0) - Media storage
- `expo-file-system` (v19.0.17) - File operations
- `expo-image` (v3.0.9) - Optimized image component

**UI & UX**:
- `react-native-paper` (v5.14.5) - Material Design components
- `react-native-linear-gradient` (v2.8.3) - Gradient backgrounds
- `@expo/vector-icons` (v15.0.2) - Icon library
- `react-native-qrcode-svg` - QR code generation

**Utilities**:
- `axios` (v1.12.2) - HTTP client
- `expo-clipboard` (v8.0.7) - Clipboard access
- `expo-haptics` (v15.0.7) - Haptic feedback
- `expo-navigation-bar` (v5.0.8) - Android navigation bar control

**Build & Config**:
- `babel-preset-expo` - Babel configuration
- `react-native-reanimated` - Animation library
- `react-native-svg-transformer` - SVG support in Metro

### API Endpoints (Backend Contract)

**Connection**: `/api/connect`, `/api/status/:phone`, `/api/logout`

**Messaging**: `/api/chats/:phone`, `/api/messages/:phone/:chatId`, `/api/messages/send`, `/api/messages/download`, `/api/messages/action`

**Contacts & Groups**: `/api/contacts/:phone`, `/api/contacts/action`, `/api/groups/:phone`, `/api/groups/action`

**Status/Stories**: `/api/status-updates/:phone`, `/api/status/post`, `/api/status/contacts/:phone`

**Other**: `/api/calls/:phone`, `/api/channels/:phone`, `/api/communities/:phone`, `/api/profile/:phone`, `/api/profile/action`, `/api/presence/action`

**AI Features**: 9 AI endpoints for auto-reply, smart suggestions, image analysis, transcription, sentiment analysis, and chat history