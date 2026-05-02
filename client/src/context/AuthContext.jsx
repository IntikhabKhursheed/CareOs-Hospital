import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('careos_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('careos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('careos_user');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSocket((current) => {
        current?.disconnect();
        return null;
      });
      return;
    }
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_room', 'global');
    });

    newSocket.on('new_appointment', (data) => {
      window.dispatchEvent(new CustomEvent('new_appointment', { detail: data }));
    });

    newSocket.on('patient_called', (data) => {
      window.dispatchEvent(new CustomEvent('patient_called', { detail: data }));
    });

    newSocket.on('bed_status_update', (data) => {
      window.dispatchEvent(new CustomEvent('bed_status_update', { detail: data }));
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('careos_token', response.data.accessToken);
        const rolePath = {
          super_admin: '/dashboard',
          admin: '/dashboard',
          doctor: '/dashboard',
          nurse: '/dashboard',
          receptionist: '/dashboard',
          lab_technician: '/dashboard',
          pharmacist: '/dashboard',
          patient: '/dashboard'
        };
        window.location.href = rolePath[response.data.user.role] || '/dashboard';
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
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
