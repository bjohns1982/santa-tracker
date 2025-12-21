import { io, Socket } from 'socket.io-client';

// Get the base API URL for Socket.io connection
// Socket.io uses the same HTTP/HTTPS URL and handles protocol upgrade automatically
const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  // Remove /api suffix if present - Socket.io connects to the base server URL
  const baseUrl = apiUrl.replace(/\/api$/, '');
  
  return baseUrl;
};

export const createSocket = (): Socket => {
  const socketUrl = getSocketUrl();
  return io(socketUrl, {
    transports: ['websocket', 'polling'],
  });
};

