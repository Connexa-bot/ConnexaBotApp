import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function MessageBubble({ message, onLongPress, onReact, isGroupChat = false, isChannel = false }) {
  const { colors, isDark } = useTheme();
  const isFromMe = message.fromMe;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const renderMedia = () => {
    if (message.type === 'image' && message.imageUrl) {
      return (
        <Image 
          source={{ uri: message.imageUrl }} 
          style={styles.media}
          resizeMode="cover"
        />
      );
    }
    if (message.type === 'video' && message.videoUrl) {
      return (
        <View style={styles.mediaContainer}>
          <Ionicons name="play-circle" size={48} color="#fff" />
        </View>
      );
    }
    if (message.type === 'audio') {
      return (
        <View style={styles.audioContainer}>
          <Ionicons name="mic" size={20} color={isFromMe ? '#fff' : colors.primary} />
          <Text style={[styles.audioDuration, { color: isFromMe ? '#fff' : colors.text }]}>
            {message.duration || '0:00'}
          </Text>
        </View>
      );
    }
    if (message.type === 'document') {
      return (
        <View style={styles.documentContainer}>
          <Ionicons name="document" size={24} color={isFromMe ? '#fff' : colors.primary} />
          <Text style={[styles.documentText, { color: isFromMe ? '#fff' : colors.text }]}>
            {message.fileName || 'Document'}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderQuotedMessage = () => {
    if (!message.quotedMsg) return null;
    
    return (
      <View style={[styles.quotedContainer, { 
        backgroundColor: isFromMe 
          ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
          : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
        borderLeftColor: isFromMe ? '#25D366' : colors.primary 
      }]}>
        <Text style={[styles.quotedSender, { color: isFromMe ? '#25D366' : colors.primary }]}>
          {message.quotedMsg.sender || 'Unknown'}
        </Text>
        <Text style={[styles.quotedText, { color: isFromMe ? colors.messageBubbleSentText : colors.messageBubbleReceivedText }]} numberOfLines={2}>
          {message.quotedMsg.text || 'Media'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isFromMe ? styles.sentContainer : styles.receivedContainer]}>
      {/* WhatsApp-style message tail */}
      {!isFromMe && (
        <View style={[styles.tailLeft, { 
          borderRightColor: colors.messageBubbleReceived,
        }]} />
      )}
      
      <TouchableOpacity
        style={[
          styles.bubble,
          isFromMe 
            ? { backgroundColor: colors.messageBubbleSent } 
            : { backgroundColor: colors.messageBubbleReceived },
          message.type === 'image' || message.type === 'video' ? styles.mediaBubble : null
        ]}
        onLongPress={() => onLongPress?.(message)}
        activeOpacity={0.95}
      >
        {/* Group/Channel sender name */}
        {!isFromMe && (isGroupChat || isChannel) && message.senderName && (
          <Text style={[styles.senderName, { color: getSenderColor(message.senderId || message.senderName) }]}>
            {message.senderName}
          </Text>
        )}
        
        {/* Channel badge for forwarded channel messages */}
        {isChannel && message.channelBadge && (
          <View style={styles.channelBadge}>
            <Ionicons name="megaphone" size={14} color={colors.primary} />
            <Text style={[styles.channelBadgeText, { color: colors.primary }]}>
              {message.channelName || 'Channel'}
            </Text>
          </View>
        )}
        
        {/* Quoted/Reply message */}
        {renderQuotedMessage()}
        
        {renderMedia()}
        
        {message.text && (
          <Text style={[styles.messageText, { color: isFromMe ? colors.messageBubbleSentText : colors.messageBubbleReceivedText }]}>
            {message.text}
          </Text>
        )}

        {message.aiGenerated && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#FFD700" />
            <Text style={styles.aiText}>AI</Text>
          </View>
        )}

        {message.isEphemeral && (
          <View style={styles.disappearingBadge}>
            <Ionicons name="timer-outline" size={12} color={isFromMe ? '#fff' : colors.primary} />
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={[styles.time, { color: '#8696A0' }]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {isFromMe && (
            <Ionicons 
              name={
                message.status === 'read' ? 'checkmark-done' :
                message.status === 'delivered' ? 'checkmark-done' :
                'checkmark'
              } 
              size={16} 
              color={message.status === 'read' ? '#53BDEB' : '#8696A0'}
              style={styles.statusIcon}
            />
          )}
        </View>

        {message.reactions && message.reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            {message.reactions.map((reaction, index) => (
              <Text key={index} style={styles.reaction}>{reaction}</Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
      
      {/* WhatsApp-style message tail for sent messages */}
      {isFromMe && (
        <View style={[styles.tailRight, { 
          borderLeftColor: colors.messageBubbleSent,
        }]} />
      )}
    </View>
  );
}

// Generate consistent color for group/channel senders
const getSenderColor = (senderId) => {
  const colors = ['#00A884', '#667781', '#027EB5', '#D3396D', '#CB5C0D', '#7C4DFF', '#00897B', '#D84315'];
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
  receivedContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 7.5,
    paddingHorizontal: 7,
    paddingVertical: 6,
    elevation: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    position: 'relative',
  },
  tailLeft: {
    position: 'absolute',
    left: -8,
    bottom: 3,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 10,
  },
  tailRight: {
    position: 'absolute',
    right: -8,
    bottom: 3,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderLeftWidth: 10,
  },
  mediaBubble: {
    padding: 3,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14.2,
    lineHeight: 19,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  time: {
    fontSize: 11,
    marginRight: 3,
  },
  statusIcon: {
    marginLeft: 2,
  },
  reactButton: {
    marginLeft: 8,
    padding: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -12,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reaction: {
    fontSize: 14,
    marginHorizontal: 2,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  aiText: {
    fontSize: 10,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
  disappearingBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 4,
  },
  media: {
    width: 250,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  mediaContainer: {
    width: 250,
    height: 200,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  audioDuration: {
    marginLeft: 12,
    fontSize: 14,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  documentText: {
    marginLeft: 12,
    fontSize: 14,
  },
  quotedContainer: {
    borderLeftWidth: 3,
    borderRadius: 5,
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  quotedSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  quotedText: {
    fontSize: 13,
    opacity: 0.8,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
