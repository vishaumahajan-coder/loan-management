import React, { createContext, useContext, useState } from 'react';
import { DEMO_CREDENTIALS } from '../theme';

import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lendanet_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token, user: loggedUser } = response.data;
      
      localStorage.setItem('lendanet_token', token);
      localStorage.setItem('lendanet_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      return { success: true, role: loggedUser.role };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('lendanet_token');
    localStorage.removeItem('lendanet_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
