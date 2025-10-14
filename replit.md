# ConnexaBot - WhatsApp Clone with AI Features

## Overview

ConnexaBot is a cross-platform WhatsApp replica built with React Native and Expo, featuring advanced AI-powered messaging capabilities. The application provides a complete WhatsApp-like experience with real-time messaging, status updates, calls, and intelligent automation features powered by AI.

The app connects to a hosted backend WhatsApp service and provides native experiences across iOS, Android, and Web platforms with careful attention to platform-specific UI/UX patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation v7 with native stack and bottom tabs
- **State Management**: React Context API for global state (Auth, Theme, Wallpaper, AI)
- **UI Components**: Custom components with platform-specific adaptations
- **Styling**: StyleSheet API with dynamic theming support

**Key Design Patterns**:
- Context providers wrap the entire app for cross-cutting concerns (authentication, theming, AI settings)
- Screen-level components handle business logic and API calls
- Reusable UI components for consistency (MessageBubble, ChatInput, etc.)
- Platform-specific rendering using Platform.select() and conditional logic

### Authentication & Session Management

**Authentication Flow**:
1. Welcome splash screen for first-time users
2. Terms and privacy acceptance
3. Phone number input with WhatsApp connection via QR code or pairing code
4. Persistent session storage using SecureStore (native) or AsyncStorage (web)
5. Automatic session verification on app launch

**Key Decisions**:
- Multi-method authentication (QR code for desktop-like linking, pairing code for mobile)
- Graceful fallback to AsyncStorage on web platform
- Auto-reconnection logic with timeout handling
- Session state persists across app restarts

### Theme System

**Implementation**: Context-based theming with light/dark/system modes
- Color schemes defined centrally with comprehensive color tokens
- Dynamic theme switching without app restart
- System preference detection and automatic switching
- Per-screen background customization (especially chat wallpapers)

**WhatsApp-Specific Features**:
- Official WhatsApp pattern backgrounds for both light and dark modes
- Custom wallpaper support per chat
- Preset wallpaper collection with theme awareness

### Real-time Messaging Architecture

**Message Flow**:
1. Messages fetched via polling mechanism (configurable interval)
2. FlatList-based message rendering with performance optimizations
3. Message types: text, image, video, audio, document
4. Rich message actions: delete, forward, star, react, edit

**Performance Optimizations**:
- Ref-based scroll management to prevent unnecessary re-renders
- Virtualized lists for efficient message rendering
- Lazy loading with pagination support
- Debounced API calls for search and filtering

### AI Integration System

**AI Context Provider** manages:
- Smart reply suggestions (3 AI-generated quick responses)
- Auto-reply functionality with personality customization
- Image analysis using GPT-5 Vision API
- Voice transcription via Whisper AI
- Sentiment analysis and conversation summarization
- Per-chat AI settings with granular control

**AI Personalities**: Friendly, Professional, Casual, Empathetic, Technical
**Context Window**: Configurable (default: 10 messages)
**Language Support**: Auto-detect or manual selection

### Media Handling

**Supported Media Types**:
- Images: ImagePicker with editing capabilities
- Videos: Native video playback with thumbnails
- Audio: Voice recording with Expo AV
- Documents: DocumentPicker integration

**Media Flow**:
1. Platform-specific permission requests
2. Asset selection/capture via Expo APIs
3. Upload to backend with progress tracking
4. Optimized rendering in chat view

### Navigation Structure

**Stack Hierarchy**:
- Root Navigator (handles authentication state)
  - Welcome/Terms screens (first-time users)
  - Link Device screen (authentication)
  - App Navigator (authenticated users)
    - Main Tab Navigator (Chats, Updates, Communities, Calls)
    - Modal screens (Settings, Chat View, Contact Profile, etc.)

**Platform Adaptations**:
- iOS: Native-style headers with blur effects
- Android: Material Design edge-to-edge with transparent navigation bar
- Web: Responsive layout with adjusted spacing

## External Dependencies

### Core Infrastructure

**Backend API**: 
- Hosted WhatsApp service at `https://widespread-chicky-connexa-hub-afd02d40.koyeb.app`
- RESTful endpoints for chat operations, contacts, status updates, calls
- WebSocket-like polling for real-time updates

### Third-Party Services

**AI Services** (consumed via backend):
- OpenAI GPT-5 for smart replies and text generation
- GPT-5 Vision for image analysis
- Whisper AI for voice transcription
- Sentiment analysis service

### Key NPM Packages

**Navigation & Routing**:
- `@react-navigation/native` v7.1.8
- `@react-navigation/native-stack` v7.3.16
- `@react-navigation/bottom-tabs` v7.4.0

**Media & Camera**:
- `expo-image-picker` v17.0.8
- `expo-camera` v17.0.8
- `expo-av` v16.0.7 (audio/video)
- `expo-document-picker` v14.0.7

**Storage & Security**:
- `@react-native-async-storage/async-storage` v2.2.0
- `expo-secure-store` v15.0.7
- Platform-specific storage abstraction in `src/utils/storage.js`

**UI & Gestures**:
- `react-native-gesture-handler` v2.28.0
- `expo-haptics` v15.0.7
- `react-native-reanimated` (with babel plugin)
- `react-native-qrcode-svg` for QR code generation

**Utilities**:
- `axios` v1.12.2 for HTTP requests
- `expo-clipboard` v8.0.7
- `expo-linking` v8.0.8
- `dotenv` v17.2.3 for environment configuration

### Platform-Specific Integrations

**Android**:
- Edge-to-edge navigation with transparent bars
- Material Design principles
- Adaptive icons with monochrome support

**iOS**:
- ActionSheetIOS for native action sheets
- Safe area handling with react-native-safe-area-context

**Web**:
- Custom server configuration for dev tools
- AsyncStorage fallback for persistence
- Responsive layout adjustments