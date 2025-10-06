import { SERVER_URL } from '../config';

let socket = null;

export const initSocket = (phone) => {
  // Avoid creating multiple connections
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  // Ensure the URL for WebSocket starts with ws:// or wss://
  const wsUrl = SERVER_URL.replace(/^http/, 'ws');
  socket = new WebSocket(`${wsUrl}?phone=${phone}`);

  socket.onopen = () => {
    console.log('WebSocket connection opened');
  };

  socket.onclose = (e) => {
    console.log('WebSocket connection closed', e.message);
    socket = null; // Clear the socket on close
  };

  socket.onerror = (e) => {
    console.error('WebSocket error', e.message);
  };
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.close();
  }
};