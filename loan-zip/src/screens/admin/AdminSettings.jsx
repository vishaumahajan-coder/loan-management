import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    borrower_self_registration: true,
  });
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (err) {
      showToast('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key, currentValue) => {
    const newValue = !currentValue;
    setSettings(prev => ({ ...prev, [key]: newValue }));

    try {
      await api.post('/settings/update', { key, value: newValue });
      showToast('Settings updated successfully ✅');
    } catch (err) {
      showToast('Failed to update setting ❌');
      setSettings(prev => ({ ...prev, [key]: currentValue }));
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage global platform configurations and toggles.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Registration Controls</h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Borrower Self-Registration</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              ON → Borrowers can register themselves. OFF → Only lenders can add borrowers.
            </p>
          </div>
          <button
            onClick={() => handleToggle('borrower_self_registration', settings.borrower_self_registration)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.borrower_self_registration ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                settings.borrower_self_registration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-80 z-[60] bg-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">ℹ</div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
