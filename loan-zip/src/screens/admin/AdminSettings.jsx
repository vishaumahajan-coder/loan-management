import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Shield, Zap, Bell, FileText, Lock, Gift } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    borrower_self_registration: true,
    default_threshold: 3,
    default_period_days: 30,
    collateral_upload_enabled: true,
    free_trial_enabled: false,
    free_trial_days: 365,
    online_payment_gateway_enabled: false,
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    bank_ifsc_code: '',
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
      // Merge defaults with DB values (DB values are strings, so we normalize)
      setSettings(prev => ({
        ...prev,
        ...data,
        borrower_self_registration: data.borrower_self_registration === true || data.borrower_self_registration === 'true',
        collateral_upload_enabled: data.collateral_upload_enabled === true || data.collateral_upload_enabled === 'true',
        free_trial_enabled: data.free_trial_enabled === true || data.free_trial_enabled === 'true',
        free_access_enabled: data.free_access_enabled === true || data.free_access_enabled === 'true',
        online_payment_gateway_enabled: data.online_payment_gateway_enabled === true || data.online_payment_gateway_enabled === 'true',
        bank_name: data.bank_name || '',
        bank_account_number: data.bank_account_number || '',
        bank_account_name: data.bank_account_name || '',
        bank_ifsc_code: data.bank_ifsc_code || '',
        default_threshold: Number(data.default_threshold || 3),
        default_period_days: Number(data.default_period_days || 30),
        free_trial_days: Number(data.free_trial_days || 365)
      }));
    } catch (err) {
      showToast('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value) => {
    // Optimistic update
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      await api.post('/settings/update', { key, value });
      showToast('Settings saved ✅');
    } catch (err) {
      showToast('Failed to update setting ❌');
      fetchSettings(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="text-blue-600" size={32} />
          Platform Settings
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Manage global platform configurations, risk thresholds, and feature toggles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              Registration Controls
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Borrower Self-Registration</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Allow individuals to sign up as borrowers directly from the portal.
                </p>
              </div>
              <button
                onClick={() => handleUpdate('borrower_self_registration', !settings.borrower_self_registration)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                  settings.borrower_self_registration ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${settings.borrower_self_registration ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} className="text-blue-500" />
              Feature Toggles
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Collateral Evidence</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Toggle the ability for lenders to upload and manage collateral documents.
                </p>
              </div>
              <button
                onClick={() => handleUpdate('collateral_upload_enabled', !settings.collateral_upload_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                  settings.collateral_upload_enabled ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${settings.collateral_upload_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Risk Thresholds Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden md:col-span-2">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} className="text-blue-500" />
              Risk & Default Thresholds
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Default Trigger (Missed Payments)</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Number of missed instalments required to automatically flag a loan as "Default".
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={settings.default_threshold}
                  onChange={(e) => handleUpdate('default_threshold', e.target.value)}
                  className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Missed Payments</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Default Re-evaluation Cycle</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  How often the system scans and updates default statuses (Days).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.default_period_days}
                  onChange={(e) => handleUpdate('default_period_days', e.target.value)}
                  className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days cycle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateway Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden md:col-span-2">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              Payment Gateway Settings
            </h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Enable Online Payment Gateway</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Toggle between Manual Bank Transfers (OFF) and Automatic Payment Gateway like Stripe/Razorpay (ON).
                </p>
              </div>
              <button
                onClick={() => handleUpdate('online_payment_gateway_enabled', !settings.online_payment_gateway_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                  settings.online_payment_gateway_enabled ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${settings.online_payment_gateway_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {!settings.online_payment_gateway_enabled && (
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Manual Transfer (Bank Details)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Stanbic Bank"
                      value={settings.bank_name}
                      onChange={(e) => handleUpdate('bank_name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Lendanet Solutions"
                      value={settings.bank_account_name}
                      onChange={(e) => handleUpdate('bank_account_name', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="Enter 10-15 digit account number"
                      value={settings.bank_account_number}
                      onChange={(e) => handleUpdate('bank_account_number', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight ml-1">IFSC / Branch Code</label>
                    <input
                      type="text"
                      placeholder="Enter Bank Code"
                      value={settings.bank_ifsc_code}
                      onChange={(e) => handleUpdate('bank_ifsc_code', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Promotional & Free Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Gift size={14} className="text-blue-500" />
              Promotional Offers
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Free Trial Period</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Enable a promotional free trial for all new lenders (e.g. 12 months free membership).
                </p>
              </div>
              <button
                onClick={() => handleUpdate('free_trial_enabled', !settings.free_trial_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                  settings.free_trial_enabled ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${settings.free_trial_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {settings.free_trial_enabled && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="730"
                  value={settings.free_trial_days}
                  onChange={(e) => handleUpdate('free_trial_days', e.target.value)}
                  className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Free Trial</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} className="text-blue-500" />
              Access Controls
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Free Plan Access</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Turn free plan on/off. When off, all new lenders must select a paid plan.
                </p>
              </div>
              <button
                onClick={() => handleUpdate('free_access_enabled', !settings.free_access_enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                  settings.free_access_enabled ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${settings.free_access_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
          <Lock size={20} />
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Platform Security Notice</h4>
          <p className="text-xs text-amber-700/80 mt-1 leading-relaxed font-medium">
            These settings affect all lenders and borrowers globally. Changes are logged in the <strong>Audit Logs</strong> and take effect immediately. Ensure you communicate threshold changes to your active lenders.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-bottom duration-300">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] flex-shrink-0 animate-pulse">✓</div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
