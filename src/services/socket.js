// IMPORTANT: Replace with your server's actual IP address or domain
const WS_URL = 'ws://192.168.1.10:5000'; // Example: 'ws://your-server.com'

let socket = null;

export const initSocket = (phone) => {
  // Avoid creating multiple connections
  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  socket = new WebSocket(`${WS_URL}?phone=${phone}`);

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

  // The 'onmessage' handler will be set up in a context
  // to allow different parts of the app to react to messages.
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.close();
  }
};