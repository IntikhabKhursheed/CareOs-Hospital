import { createContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import { connectSocket, disconnectSocket } from '../services/socket';
import { navigateTo } from '../utils/navigation';

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

  // useEffect(() => {
  //   if (!user) {
  //     disconnectSocket();
  //     setSocket(null);
  //     return;
  //   }

  //   const sharedSocket = connectSocket();
  //   const onConnect = () => {
  //     sharedSocket.emit('join_room', 'global');
  //   };
  //   const onNewAppointment = (data) => {
  //     window.dispatchEvent(new CustomEvent('new_appointment', { detail: data }));
  //   };
  //   const onPatientCalled = (data) => {
  //     window.dispatchEvent(new CustomEvent('patient_called', { detail: data }));
  //   };
  //   const onBedStatusUpdate = (data) => {
  //     window.dispatchEvent(new CustomEvent('bed_status_update', { detail: data }));
  //   };

  //   sharedSocket.off('connect', onConnect).on('connect', onConnect);
  //   sharedSocket.off('new_appointment', onNewAppointment).on('new_appointment', onNewAppointment);
  //   sharedSocket.off('patient_called', onPatientCalled).on('patient_called', onPatientCalled);
  //   sharedSocket.off('bed_status_update', onBedStatusUpdate).on('bed_status_update', onBedStatusUpdate);
  //   if (sharedSocket.connected) {
  //     onConnect();
  //   }

  //   setSocket(sharedSocket);
  //   return () => {
  //     sharedSocket.off('connect', onConnect);
  //     sharedSocket.off('new_appointment', onNewAppointment);
  //     sharedSocket.off('patient_called', onPatientCalled);
  //     sharedSocket.off('bed_status_update', onBedStatusUpdate);
  //   };
  // }, [user]);

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
        navigateTo(rolePath[response.data.user.role] || '/dashboard', { replace: true });
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
    <AuthContext.Provider value={{ user, loading, error, login, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
