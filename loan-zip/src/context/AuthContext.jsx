import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const updateUser = (updatedUser) => {
    localStorage.setItem('lendanet_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const updatedUser = response.data;
      updateUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    // Automatic sync every 60 seconds
    const interval = setInterval(() => {
      refreshUser();
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}



export const useAuth = () => useContext(AuthContext);
