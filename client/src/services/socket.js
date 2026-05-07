import { io } from 'socket.io-client';

let socketInstance = null;

const getSocketUrl = () => import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const connectSocket = () => {
  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      withCredentials: true,
      autoConnect: false,
      reconnection: true
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
