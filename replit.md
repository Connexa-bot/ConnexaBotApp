# ConnexaBot - Advanced WhatsApp Automation App

## Overview
ConnexaBot is a React Native/Expo mobile application that provides an advanced WhatsApp-like experience with powerful AI automation capabilities. It connects to a WhatsApp backend server and offers features beyond the standard WhatsApp app.

## Key Features

### 🤖 AI Automation
- **Auto-Reply**: Automatically respond to messages with context-aware AI-generated replies
- **Smart Reply Suggestions**: Get 3 intelligent quick reply options for any incoming message
- **Image Analysis**: AI-powered image description and analysis using GPT-5 Vision
- **Voice Transcription**: Convert voice messages to text using Whisper AI
- **Sentiment Analysis**: Detect emotions and tone in messages
- **Conversation Summarization**: Summarize long chat histories
- **Customizable AI Personality**: Choose from friendly, professional, casual, empathetic, or technical expert modes

### 💬 Messaging
- Send and receive text messages
- Media sharing (images, videos, documents, audio)
- Voice recording and playback
- Message reactions with emojis
- Message forwarding and starring
- Message editing and deletion
- Real-time message polling
- Typing indicators and presence

### 🎨 Customization
- **Light/Dark Theme**: Full theme support with WhatsApp-inspired colors
- **Chat Wallpapers**: Per-chat and global wallpaper customization
- **Custom Wallpapers**: Upload your own images as chat backgrounds
- **8 Built-in Wallpapers**: Default light, dark, green, ocean blue, sunset orange, forest green, royal purple, midnight black

### 📸 Status/Stories
- Post text, image, video, and audio status updates
- View status updates from contacts
- Privacy controls for status visibility
- Channels support

### 📞 Other Features
- Call history viewing (note: making calls not supported by WhatsApp library)
- Contact management
- Group management
- Profile customization
- Settings and preferences

## Technical Stack

### Frontend
- **React Native** with Expo SDK 54
- **React Navigation** for routing
- **Expo packages**: Camera, Image Picker, Document Picker, Audio (expo-av), File System
- **AsyncStorage** for local data persistence
- **Axios** for API communication

### Backend API
- **Node.js** with Baileys WhatsApp library
- **OpenAI GPT-5** for AI automation
- **Whisper AI** for audio transcription
- Backend URL: https://connexa-bot-server.onrender.com

### Context Architecture
- **AuthContext**: User authentication and session management
- **ThemeContext**: Light/dark theme switching
- **WallpaperContext**: Chat wallpaper management
- **AIContext**: AI automation settings and controls

## Project Structure

```
├── App.js                          # App entry point with providers
├── src/
│   ├── components/
│   │   ├── ChatHeader.js          # Chat screen header with actions
│   │   ├── ChatInput.js           # Message input with media options
│   │   ├── MessageBubble.js       # WhatsApp-style message bubbles
│   │   └── SmartReplyBar.js       # AI smart reply suggestions
│   ├── contexts/
│   │   ├── AuthContext.js         # Authentication state
│   │   ├── ThemeContext.js        # Theme management
│   │   ├── WallpaperContext.js    # Wallpaper settings
│   │   └── AIContext.js           # AI automation settings
│   ├── navigation/
│   │   ├── index.js               # Root navigator
│   │   └── MainTabNavigator.js    # Bottom tab navigation
│   ├── screens/
│   │   ├── ChatsScreen.js         # Chats list
│   │   ├── ChatViewScreen.js      # Individual chat with AI
│   │   ├── CallsScreen.js         # Call history
│   │   ├── UpdatesScreen.js       # Status/Stories
│   │   ├── CommunitiesScreen.js   # Communities
│   │   ├── SettingsScreen.js      # Settings & AI controls
│   │   └── LinkDeviceScreen.js    # QR code authentication
│   ├── services/
│   │   └── api.js                 # Backend API integration
│   └── config.js                  # Backend server URL
└── package.json
```

## API Endpoints

### Connection & Session
- `POST /api/connect` - Connect to WhatsApp with QR code
- `GET /api/status/:phone` - Check connection status
- `POST /api/logout` - Logout and disconnect

### Messaging
- `GET /api/chats/:phone` - Get all chats
- `GET /api/messages/:phone/:chatId` - Get message history
- `POST /api/messages/send` - Send text message
- `POST /api/messages/send-media` - Send media (image/video/audio/document)
- `POST /api/messages/action` - Message actions (delete/forward/star/react/edit)

### AI Automation
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/ai/auto-reply` - Smart auto-reply
- `POST /api/ai/smart-replies` - Get 3 quick reply suggestions
- `POST /api/ai/analyze-image` - Analyze image with AI
- `POST /api/ai/transcribe-audio` - Transcribe voice to text
- `POST /api/ai/analyze-sentiment` - Detect message sentiment
- `POST /api/ai/summarize` - Summarize conversation
- `GET /api/ai/chat-history/:phone/:chatId` - Get AI chat history
- `DELETE /api/ai/chat-history/:phone/:chatId` - Clear chat history

### Status/Stories
- `GET /api/status-updates/:phone` - Get status updates
- `POST /api/status/post` - Post text/image/video/audio status
- `GET /api/status/contacts/:phone` - Get contacts for privacy

### Other
- `GET /api/calls/:phone` - Call history
- `GET /api/channels/:phone` - Channels
- `GET /api/communities/:phone` - Communities
- `GET /api/profile/:phone` - User profile
- `GET /api/contacts/:phone` - Get contacts
- `GET /api/groups/:phone` - Get groups
- `POST /api/profile/action` - Profile actions
- `POST /api/presence/action` - Typing indicators

## Configuration

### Backend URL
Set in `src/config.js`:
```javascript
export const SERVER_URL = 'https://connexa-bot-server.onrender.com';
```

### AI Settings
Configurable per-chat or globally:
- Auto-reply enable/disable
- Smart replies enable/disable
- Image analysis enable/disable
- Voice transcription enable/disable
- AI personality selection
- Language preference
- Context window size

## How to Use

### 1. Connect WhatsApp
1. Open the app
2. Enter your phone number
3. Scan QR code with WhatsApp on your phone
4. Wait for connection confirmation

### 2. Enable AI Automation
1. Go to Settings
2. Scroll to "AI Automation" section
3. Toggle features on/off:
   - Auto-Reply: Automatically respond to messages
   - Smart Replies: Get quick reply suggestions
   - Image Analysis: Analyze received images
   - Voice Transcription: Convert voice to text
4. Choose AI personality (friendly, professional, casual, etc.)

### 3. Customize Wallpapers
1. Go to Settings
2. Tap "Chat Wallpaper"
3. Select from built-in wallpapers or add custom image
4. Wallpaper applies to all chats (per-chat customization in ChatView)

### 4. Post Status Updates
1. Go to Updates tab
2. Tap "My status"
3. Choose: Text, Image, or Video
4. Add content and post

## Development

### Running the App
```bash
npm run web        # Web version (port 5000)
npm start          # Expo dev server
npm run android    # Android app
npm run ios        # iOS app
```

### Testing on Expo Go
1. Install Expo Go app on your phone
2. Run `npm start`
3. Scan QR code from terminal
4. Test all features including camera, voice recording, etc.

## Known Limitations

### WhatsApp Library Constraints
- **Voice/Video Calls**: The Baileys library does NOT support making or answering calls. Only call history viewing is available.
- This is a limitation of the underlying WhatsApp library, not the app implementation.

### AI Features
- AI features require active backend connection
- OpenAI API key must be configured on backend
- AI responses depend on conversation context

## Architecture Decisions

### Why Context API?
- Lightweight state management for theme, auth, wallpapers, and AI settings
- No external dependencies needed
- Persistent storage with AsyncStorage

### Why Polling for Messages?
- Baileys library doesn't provide reliable websocket for all events
- 3-second polling interval balances real-time feel with performance
- Can be replaced with WebSocket when available

### Why Separate AI Context?
- AI settings are complex and chat-specific
- Separation allows easy enable/disable per chat
- Settings persist across app restarts

## Future Enhancements

### Planned Features
1. WebSocket integration for true real-time messaging
2. End-to-end encryption indicators
3. Message search and filtering
4. Advanced group management
5. Multi-device support
6. Backup and restore
7. Custom notification sounds
8. Scheduled messages
9. AI conversation insights
10. Chat export

### AI Enhancements
1. Language translation
2. Message scheduling based on AI analysis
3. Auto-categorization of contacts
4. Smart notification filtering
5. Context-aware auto-responses
6. Meeting summary generation
7. Task extraction from conversations

## Troubleshooting

### Connection Issues
- Ensure backend server is running
- Check SERVER_URL in config.js
- Verify phone number format
- Refresh QR code if expired

### AI Not Working
- Check backend OpenAI API key
- Verify AI features are enabled in Settings
- Check internet connection
- Review backend logs for errors

### Media Issues
- Grant camera/microphone permissions
- Check file size limits
- Verify storage permissions
- Ensure backend media handling is working

## Credits
- Built with React Native and Expo
- WhatsApp integration via Baileys
- AI powered by OpenAI GPT-5 and Whisper
- Icons by Expo Vector Icons
- UI inspired by WhatsApp official app

## License
Private project - All rights reserved

## Version
1.0.0 - Initial Release with AI Automation

---

Last Updated: October 9, 2025
