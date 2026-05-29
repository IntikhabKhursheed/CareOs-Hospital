import { io } from 'socket.io-client';

let socketInstance = null;

const shouldEnableSocket = () => {
  return !import.meta.env.PROD;
};

const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

export const connectSocket = () => {
  // Disable Socket.io on Vercel production
  if (!shouldEnableSocket()) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      transports: ['websocket', 'polling'],
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (!socketInstance) return;

  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
};