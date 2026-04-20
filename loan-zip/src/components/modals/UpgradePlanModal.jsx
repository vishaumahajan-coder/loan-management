import React, { useState } from 'react';
import { X, Star, Check, Zap, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { THEME } from '../../theme';


export default function UpgradePlanModal({ isOpen, onClose, onSuccess }) {
  const { membershipConfig } = useConfig();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const plans = [
    { 
       id: 'monthly', 
       name: 'Monthly Premium', 
       price: membershipConfig.monthly?.price || 200, 
       duration: '30 Days',
       icon: Zap,
       color: 'blue'
    },
    { 
       id: 'annual', 
       name: 'Annual Pro', 
       price: membershipConfig.annual?.price || 1000, 
       duration: '365 Days',
       icon: Star,
       color: 'indigo',
       saving: 'Save 20%'
    }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/membership/upgrade', { selected_plan: selectedPlan, notes });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send upgrade request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative p-8 md:p-10">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 transition-all">
            <X size={20} className="text-slate-400" />
          </button>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-2">Upgrade to Premium</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select a plan to unlock all platform features</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
               <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">!</div>
               {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                }`}
              >
                {plan.saving && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">
                    {plan.saving}
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${selectedPlan === plan.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-400'}`}>
                  <plan.icon size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-950 uppercase mb-1">{plan.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-4 tracking-widest">{plan.duration}</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-2xl font-black text-slate-950 tracking-tight">{THEME.formatCurrency(plan.price)}</span>

                   <span className="text-[10px] text-slate-400 font-bold uppercase">/{plan.id === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                <textarea 
                  placeholder="Anything you'd like to share with the admin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold outline-none focus:border-blue-500 focus:bg-white transition-all min-h-[100px] resize-none"
                />
             </div>

             <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                <div className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Network Search</div>
                <div className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Risk Analysis</div>
                <div className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Shared Ledger</div>
                <div className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Export Data</div>
             </div>

             <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-5 bg-[#020617] text-white rounded-[20px] text-[11px] font-black uppercase tracking-[2px] shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
             >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Upgrade Request'}
             </button>
             <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">Admin will review your request within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
