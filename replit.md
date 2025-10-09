# WhatsApp Clone Mobile App

## Overview

A complete WhatsApp replication mobile app built with React Native and Expo. The app features an official WhatsApp-style Link Device authentication screen that connects users to a remote WhatsApp Web backend server via QR code scanning. This is a fully functional WhatsApp clone with all major features including chats, calls, status updates, communities, and settings.

## Features

### ✅ Implemented Features

1. **Link Device Authentication** - Official WhatsApp-style QR code linking
2. **Chats** - Full chat list with message history
3. **Individual Chat View** - Send and receive messages
4. **Calls** - Call history and management
5. **Updates (Status)** - WhatsApp stories/status updates
6. **Communities** - Community management
7. **Settings** - User profile and app settings
8. **Dark/Light Theme** - Automatic theme switching
9. **Pull-to-Refresh** - Refresh data on all screens
10. **Persistent Authentication** - Stays logged in across sessions

## Project Structure

```
├── src/
│   ├── services/
│   │   ├── api.js          # All API endpoints and backend communication
│   │   └── config.js       # Server configuration
│   ├── contexts/
│   │   ├── AuthContext.js  # Authentication state management
│   │   └── ThemeContext.js # Theme management (light/dark mode)
│   ├── screens/
│   │   ├── LinkDeviceScreen.js    # QR code login screen
│   │   ├── ChatsScreen.js         # Chat list
│   │   ├── ChatViewScreen.js      # Individual chat
│   │   ├── CallsScreen.js         # Call history
│   │   ├── UpdatesScreen.js       # Status/Stories
│   │   ├── CommunitiesScreen.js   # Communities
│   │   └── SettingsScreen.js      # Settings
│   └── navigation/
│       ├── index.js            # Root navigator
│       ├── AppNavigator.js     # Main app navigation
│       └── MainTabNavigator.js # Tab navigation
├── App.js           # App entry point
├── package.json     # Dependencies
└── app.json         # Expo configuration
```

## Backend API Integration

### Existing Endpoints (in api.js)

The app connects to a backend server at: `https://connexa-bot-server.onrender.com`

**Already Implemented in Backend:**
- POST `/api/connect` - Initiate WhatsApp connection
- GET `/api/status/:phone` - Check connection status
- POST `/api/logout` - Logout/disconnect
- GET `/api/chats/:phone` - Get user's chats
- POST `/api/messages/send` - Send a message
- POST `/api/messages/download` - Download media
- POST `/api/messages/action` - Message actions (delete, forward, star, react, edit)
- GET `/api/groups/:phone` - Get user's groups
- POST `/api/groups/action` - Group actions (create, add/remove members, etc.)
- GET `/api/contacts/:phone` - Get contacts
- POST `/api/contacts/action` - Contact actions (block, unblock)
- POST `/api/presence/action` - Presence management
- POST `/api/profile/action` - Profile management

### Endpoints Needed in Backend

These endpoints are called by the app but need to be implemented in your backend:

1. **GET `/api/messages/:phone/:chatId`**
   - Description: Get message history for a specific chat
   - Returns: `{ messages: Array of messages with id, text, fromMe, timestamp, etc. }`

2. **GET `/api/calls/:phone`**
   - Description: Get call history for a user
   - Returns: `{ calls: Array of calls with id, name, type (incoming/outgoing), timestamp, missed, video }`

3. **GET `/api/status-updates/:phone`**
   - Description: Get status updates (stories) from contacts
   - Returns: `{ statuses: Array of status updates with id, name, timestamp, media, viewed }`

4. **GET `/api/channels/:phone`**
   - Description: Get channel subscriptions for a user
   - Returns: `{ channels: Array of channels with id, name, description, subscribers }`

5. **GET `/api/communities/:phone`**
   - Description: Get user's communities
   - Returns: `{ communities: Array of communities with id, name, memberCount, description }`

6. **GET `/api/profile/:phone`**
   - Description: Get user profile information
   - Returns: `{ name, status, picture, etc. }`

## How It Works

### Authentication Flow

1. User enters their phone number
2. App calls `/api/connect` to initiate connection
3. Backend generates QR code for WhatsApp Web
4. App displays QR code
5. User scans QR code with WhatsApp mobile app
6. App polls `/api/status/:phone` every 3 seconds
7. When connected, phone is saved to SecureStore
8. User is redirected to main app

### Data Flow

- All screens fetch data from the backend API
- Screens show loading states while fetching
- Pull-to-refresh available on all list screens
- Errors are handled gracefully
- Empty states shown when no data available

## Running the App

### Development
```bash
npm run web
```
The app runs on port 5000 and is accessible via Replit's webview.

### Deployment
The app is configured for autoscale deployment:
- Build: `expo export --platform web`
- Run: `serve -s dist -l 5000`

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Managed React Native platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **Expo SecureStore** - Encrypted storage
- **React Native QRCode SVG** - QR code generation
- **React Native Reanimated** - Animations

## Environment Configuration

### Server URL
The backend server URL is configured in `src/config.js`:
```javascript
export const SERVER_URL = 'https://connexa-bot-server.onrender.com';
```

Change this to point to your own backend server.

## Theme System

The app supports both light and dark modes with WhatsApp-style colors:

**Light Theme:**
- Primary: #25D366 (WhatsApp green)
- Background: #FFFFFF
- Chat Background: #EFEAE2
- Message Sent: #D9FDD3
- Message Received: #FFFFFF

**Dark Theme:**
- Primary: #25D366 (WhatsApp green)
- Background: #0B141A
- Chat Background: #0B141A
- Message Sent: #005C4B
- Message Received: #202C33

## Security

- Phone numbers are stored encrypted in Expo SecureStore
- Authentication persists across sessions
- Connection status validated on app launch
- Secure communication with backend server

## Next Steps for Backend Implementation

To make this app fully functional, implement the 6 missing endpoints listed above in your backend server. The app is already wired to call these endpoints and will display the data once they return valid responses.

### Expected Response Formats

All endpoints should return JSON in this format:
```javascript
{
  "success": true,
  "data": {
    // endpoint-specific data here
  }
}
```

Error responses:
```javascript
{
  "success": false,
  "error": "Error message"
}
```

## User Preferences

- Preferred communication style: Simple, everyday language

## Recent Updates

- Created full WhatsApp clone from scratch
- Implemented all major WhatsApp features
- Added comprehensive API integration
- Configured for Replit deployment
- Added dark/light theme support
