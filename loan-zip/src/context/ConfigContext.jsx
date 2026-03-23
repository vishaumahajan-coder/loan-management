import React, { createContext, useContext, useState } from 'react';

const ConfigContext = createContext(null);

export const DEFAULT_CONFIG = {
  free: { price: 0, duration: 'unlimited', trial: false },
  monthly: { price: 10, duration: 30, trial: true },
  yearly: { price: 100, duration: 365, trial: false }
};

export function ConfigProvider({ children }) {
  const [membershipConfig, setMembershipConfig] = useState(DEFAULT_CONFIG);

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
    <ConfigContext.Provider value={{ membershipConfig, updateConfig }}>
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
