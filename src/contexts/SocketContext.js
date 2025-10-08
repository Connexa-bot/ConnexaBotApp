import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  initSocket,
  closeSocket,
  addMessageListener,
  removeMessageListener,
  addConnectionStatusListener,
  removeConnectionStatusListener,
} from '../services/socket';
import { getAutoReply } from '../services/autoReply';
import { sendMessage } from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children, phone }) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleAutoReply = useCallback(
    async (messageData) => {
      if (messageData.msg.key.fromMe) {
        return; // Don't reply to our own messages
      }

      const replyText = getAutoReply(messageData.content);
      if (replyText) {
        try {
          await sendMessage(phone, messageData.from, replyText);
        } catch (error) {
          console.error('Failed to send auto-reply:', error);
        }
      }
    },
    [phone]
  );

  useEffect(() => {
    if (phone) {
      initSocket(phone);

      const handleNewMessage = (parsedData) => {
        if (parsedData.event === 'new_message') {
          setMessages((prevMessages) => [...prevMessages, parsedData]);
          handleAutoReply(parsedData.data);
        }
      };

      const handleConnectionStatus = (status) => {
          setIsConnected(status);
      }

      addMessageListener(handleNewMessage);
      addConnectionStatusListener(handleConnectionStatus);

      return () => {
        removeMessageListener(handleNewMessage);
        removeConnectionStatusListener(handleConnectionStatus);
        closeSocket();
      };
    }
  }, [phone, handleAutoReply]);

  return (
    <SocketContext.Provider value={{ messages, phone, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);