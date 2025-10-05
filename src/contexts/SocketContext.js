import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket, initSocket, closeSocket } from '../services/socket';
import { getAutoReply } from '../services/autoReply';
import { sendMessage } from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children, phone, serverUrl }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleAutoReply = useCallback(async (messageData) => {
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
  }, [phone]);

  useEffect(() => {
    if (phone && serverUrl) {
      initSocket(serverUrl, phone);
      const newSocket = getSocket();
      setSocket(newSocket);

      newSocket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.event === 'new_message') {
          setMessages((prevMessages) => [...prevMessages, parsedData]);
          handleAutoReply(parsedData.data);
        }
      };
    }

    return () => {
      closeSocket();
    };
  }, [phone, serverUrl, handleAutoReply]);

  return (
    <SocketContext.Provider value={{ socket, messages, phone }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);