import { io } from 'socket.io-client';

let socketInstance = null;

const shouldEnableSocket = () => {
  // Socket.io only works locally.
  // Disable it on Vercel production because Vercel serverless does not support persistent Socket.io.
  return import.meta.env.DEV;
};

const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

export const connectSocket = () => {
  if (!shouldEnableSocket()) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      transports: ['websocket'],
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const getSocket = () => {
  if (!shouldEnableSocket()) {
    return null;
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) return;

  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
};