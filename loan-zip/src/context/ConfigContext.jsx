import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConfigContext = createContext(null);

export const DEFAULT_CONFIG = {
  free: { id: 1, price: 0, duration_days: 0 },
  monthly: { id: 2, price: 200, duration_days: 30 },
  annual: { id: 3, price: 1000, duration_days: 365 }
};

export function ConfigProvider({ children }) {
  const [membershipConfig, setMembershipConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/membership/plans');
      if (response.data && response.data.length > 0) {
        const config = {};
        response.data.forEach(plan => {
          config[plan.name.toLowerCase()] = plan;
        });
        setMembershipConfig(config);
      }
    } catch (error) {
      console.error('Failed to fetch membership plans', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Sync prices every 2 minutes
    const interval = setInterval(() => {
      fetchConfig();
    }, 120000);

    return () => clearInterval(interval);
  }, []);


  const updateConfig = (plan, key, value) => {
    setMembershipConfig(prev => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [key]: value
      }
    }));
  };

  return (
    <ConfigContext.Provider value={{ membershipConfig, loading, refreshConfig: fetchConfig, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

