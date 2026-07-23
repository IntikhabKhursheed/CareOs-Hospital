import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { RBACProvider } from './context/RBACContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RBACProvider>
        <App />
      </RBACProvider>
    </AuthProvider>
  </React.StrictMode>
);
