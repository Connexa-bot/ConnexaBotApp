import { SERVER_URL } from '../config';

let socket = null;
let reconnectInterval = null;
const RECONNECT_DELAY = 5000; // 5 seconds

let messageListeners = [];
let statusListeners = [];

const connect = (phone) => {
  if (!phone) return;

  const wsUrl = SERVER_URL.replace(/^http/, 'ws');
  socket = new WebSocket(`${wsUrl}?phone=${phone}`);

  socket.onopen = () => {
    console.log('✅ WebSocket connection established');
    statusListeners.forEach(listener => listener(true));
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  };

  socket.onmessage = (event) => {
    const parsedData = JSON.parse(event.data);
    messageListeners.forEach(listener => listener(parsedData));
  };

  socket.onclose = () => {
    console.log('🔌 WebSocket connection closed. Attempting to reconnect...');
    statusListeners.forEach(listener => listener(false));
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => connect(phone), RECONNECT_DELAY);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error.message);
    statusListeners.forEach(listener => listener(false));
    socket.close(); // This will trigger the onclose handler to reconnect
  };
};

export const initSocket = (phone) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }
  connect(phone);
};

export const closeSocket = () => {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
  messageListeners = [];
  statusListeners = [];
};

export const addMessageListener = (listener) => {
  messageListeners.push(listener);
};

export const removeMessageListener = (listener) => {
  messageListeners = messageListeners.filter(l => l !== listener);
};

export const addConnectionStatusListener = (listener) => {
    statusListeners.push(listener);
};

export const removeConnectionStatusListener = (listener) => {
    statusListeners = statusListeners.filter(l => l !== listener);
};