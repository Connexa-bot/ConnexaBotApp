# ConnexaBot API Usage Guide

## Backend Configuration

**Base URL:** `http://widespread-chicky-connexa-hub-afd02d40.koyeb.app`

The API is already configured in `src/services/api.js` and will automatically use the backend URL.

## Response Formats

Based on the comprehensive API test results, the backend returns data in the following formats:

### 1. Chats API
```javascript
// Endpoint: GET /api/chats/{phone}
// Response format:
{
  "success": true,
  "chats": [
    {
      "id": "2347089378090@s.whatsapp.net",
      "name": "Contact Name",
      "unreadCount": 0,
      "lastMessage": {
        "text": "Message text",
        "timestamp": 1760578233869
      },
      "isGroup": false,
      "isChannel": false,
      "isArchived": false,
      "isPinned": false,
      "isMuted": false,
      "profilePicUrl": "https://..."
    }
  ]
}
```

### 2. Status/Updates API
```javascript
// Endpoint: GET /api/status-updates/{phone}
// Response format:
{
  "success": true,
  "statusUpdates": [
    {
      "jid": "user@s.whatsapp.net",
      "name": "User Name",
      "profilePicUrl": "https://...",
      "key": "status_key",
      "viewed": false,
      "timestamp": 1760578233869
    }
  ]
}
```

### 3. Messages API
```javascript
// Endpoint: GET /api/messages/{phone}/{chatId}?limit=50
// Response format:
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id",
        "text": "Message text",
        "fromMe": false,
        "timestamp": 1760578233,
        "status": "read",
        "key": "message_key"
      }
    ]
  }
}
```

## How Screens Use the API

### ChatsScreen.js
```javascript
// Already implemented - handles multiple response formats
const response = await callAPI(API.Chat.getAll(user.phone));

// Extract chats array
let chatsList = [];
if (response?.success === true && Array.isArray(response.chats)) {
  chatsList = response.chats;
} else if (Array.isArray(response)) {
  chatsList = response;
} else if (response?.chats && Array.isArray(response.chats)) {
  chatsList = response.chats;
}
```

### UpdatesScreen.js
```javascript
// Already implemented - handles status updates
const response = await callAPI(API.Status.getAll(user.phone));

let statusList = [];
if (response?.success === true && Array.isArray(response.statusUpdates)) {
  statusList = response.statusUpdates;
}
```

### ChatViewScreen.js
```javascript
// Already implemented - handles messages
const response = await callAPI(API.Message.get(user.phone, chat.id, 50));

if (response.data?.messages) {
  const newMessages = response.data.messages;
  setMessages(newMessages);
}
```

### StatusPostScreen.js
```javascript
// Posting image status
await callAPI(API.Status.postImage(
  user.phone,
  mediaUri,
  caption
));

// Posting text status
await callAPI(API.Status.postText(
  user.phone,
  statusText,
  [],
  backgroundColor
));
```

## API Endpoints Available

### Health & Connection
- `API.Health.serverHealth()` - Server health check
- `API.Health.apiHealth()` - API health check
- `API.Health.openaiStatus()` - OpenAI connection status
- `API.Health.connect(phone)` - Connect WhatsApp
- `API.Health.status(phone)` - Connection status

### Chat Management
- `API.Chat.getAll(phone)` - Get all chats
- `API.Chat.getById(phone, chatId)` - Get specific chat
- `API.Chat.archive(phone, chatId, archive)` - Archive/Unarchive
- `API.Chat.pin(phone, chatId, pin)` - Pin/Unpin
- `API.Chat.delete(phone, chatId)` - Delete chat
- `API.Chat.markRead(phone, chatId)` - Mark as read
- `API.Chat.mute(phone, chatId, duration)` - Mute/Unmute

### Messaging
- `API.Message.get(phone, chatId, limit)` - Get messages
- `API.Message.send(phone, to, text)` - Send text message
- `API.Message.sendImage(phone, to, imageUrl, caption)` - Send image
- `API.Message.sendVideo(phone, to, videoUrl, caption)` - Send video
- `API.Message.sendAudio(phone, to, audioUrl, ptt)` - Send audio
- `API.Message.delete(phone, chatId, messageKey)` - Delete message
- `API.Message.react(phone, chatId, messageKey, emoji)` - React to message
- `API.Message.star(phone, chatId, messageKey, star)` - Star message

### Status/Stories
- `API.Status.getAll(phone)` - Get all status updates
- `API.Status.postText(phone, text, statusJidList, backgroundColor, font)` - Post text status
- `API.Status.postImage(phone, imageUrl, caption, statusJidList)` - Post image status
- `API.Status.postVideo(phone, videoUrl, caption, statusJidList)` - Post video status
- `API.Status.delete(phone, statusKey)` - Delete status
- `API.Status.view(phone, statusJid, messageKeys)` - View status

### Contacts
- `API.Contact.getAll(phone)` - Get all contacts
- `API.Contact.get(phone, contactId)` - Get specific contact
- `API.Contact.getPicture(phone, contactId)` - Get profile picture
- `API.Contact.block(phone, contactId)` - Block contact
- `API.Contact.unblock(phone, contactId)` - Unblock contact

### Groups
- `API.Group.getAll(phone)` - Get all groups
- `API.Group.getMetadata(phone, groupId)` - Get group metadata
- `API.Group.create(phone, name, participants)` - Create group
- `API.Group.addParticipants(phone, groupId, participants)` - Add participants
- `API.Group.removeParticipants(phone, groupId, participants)` - Remove participants

### AI Features (Requires OpenAI)
- `API.AI.smartReply(phone, chatId, lastMessage, senderName)` - Generate smart reply
- `API.AI.sentiment(phone, text)` - Analyze sentiment
- `API.AI.translate(phone, text, targetLang)` - Translate text
- `API.AI.generate(phone, chatId, userMessage, includeHistory)` - Generate AI response

## Usage Examples

### Sending a Message
```javascript
const handleSend = async (text) => {
  try {
    await callAPI(API.Message.send(user.phone, chat.id, text));
    loadMessages(); // Refresh messages
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
```

### Loading Chats
```javascript
const loadChats = async () => {
  try {
    const response = await callAPI(API.Chat.getAll(user.phone));
    if (response?.success === true && Array.isArray(response.chats)) {
      setChats(response.chats);
    }
  } catch (error) {
    console.error('Error loading chats:', error);
  }
};
```

### Posting Status
```javascript
const postStatus = async () => {
  try {
    if (mediaUri) {
      await callAPI(API.Status.postImage(user.phone, mediaUri, caption));
    } else {
      await callAPI(API.Status.postText(user.phone, statusText, [], backgroundColor));
    }
    navigation.goBack();
  } catch (error) {
    console.error('Error posting status:', error);
  }
};
```

## Error Handling

All API calls should be wrapped in try-catch blocks:

```javascript
try {
  const response = await callAPI(API.Chat.getAll(user.phone));
  // Handle response
} catch (error) {
  console.error('API Error:', error.message);
  // Show user-friendly error message
  Alert.alert('Error', 'Failed to load chats');
}
```

## Testing

The API has been comprehensively tested with all endpoints. The test log file shows:
- ✅ All health endpoints working
- ✅ Chat retrieval and management working
- ✅ Message sending and receiving working
- ✅ Status posting and viewing working
- ✅ Contact management working
- ✅ AI features working (with OpenAI configured)

## Notes

1. **Phone Number Format**: Use international format (e.g., "2349041648144")
2. **Chat/Contact IDs**: Include @s.whatsapp.net suffix (e.g., "2349041648144@s.whatsapp.net")
3. **Timestamps**: Backend returns Unix timestamps in milliseconds
4. **Image/Video URLs**: Can be local file:// URIs or remote HTTPS URLs
5. **Response Handling**: Always check for `success: true` and extract data arrays appropriately
