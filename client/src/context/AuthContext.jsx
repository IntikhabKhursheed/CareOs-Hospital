import { createContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import { connectSocket, disconnectSocket } from '../services/socket';
import { navigateTo } from '../utils/navigation';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('careos_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      localStorage.removeItem('careos_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  // SAVE USER
  useEffect(() => {
    if (user) {
      localStorage.setItem('careos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('careos_user');
    }
  }, [user]);

// SOCKET CONNECTION
useEffect(() => {
  if (!user) {
    disconnectSocket();
    setSocket(null);
    return;
  }

  const sharedSocket = connectSocket();

  // In production, connectSocket() returns null because Socket.io is disabled.
  if (!sharedSocket) {
    setSocket(null);
    return;
  }

  const onConnect = () => {
    sharedSocket.emit('join_room', 'global');
  };

  sharedSocket.off('connect', onConnect).on('connect', onConnect);

  if (sharedSocket.connected) {
    onConnect();
  }

  setSocket(sharedSocket);

  return () => {
    sharedSocket.off('connect', onConnect);
  };
}, [user]);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        setUser(response.data.user);

        localStorage.setItem(
          'careos_token',
          response.data.accessToken
        );

        navigateTo('/dashboard', { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();

    setUser(null);

    localStorage.removeItem('careos_token');

    navigateTo('/login', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        socket
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};