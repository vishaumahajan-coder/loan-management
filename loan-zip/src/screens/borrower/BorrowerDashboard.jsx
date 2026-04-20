import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Activity, CheckCircle, Gift, AlertTriangle, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, StatCard } from '../../components/UI';

import { THEME } from '../../theme';

import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function BorrowerDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats] = useState({ totalDebt: 0, activeLoans: 0, totalLoans: 0, defaultedLoans: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/borrower');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch borrower stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Find this borrower's data
  const myLoans      = stats.recentActivity;
  const activeLoans  = stats.activeLoans;
  const paidLoans    = stats.totalLoans - stats.activeLoans - stats.defaultedLoans;
  const defaults     = stats.defaultedLoans;
  
  


  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl p-5 text-white relative overflow-hidden shadow-md border border-blue-800 h-[100px] flex items-center">
        <div className="absolute inset-0 bg-blue-900/90" />
        <div className="relative z-10">
          <p className="text-blue-200 text-[10px] font-black tracking-widest uppercase mb-0.5">Welcome back,</p>
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight">{user?.name || 'Borrower'} 👋</h2>
          {user?.nrc && <p className="text-blue-100/60 text-[10px] font-bold mt-0.5">NRC: {user.nrc}</p>}
        </div>
      </div>

      {/* Verification Status */}
      {user?.verificationStatus !== 'verified' && (
        <div className="rounded-xl p-3 border border-amber-200 bg-amber-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-900">Account Unverified</p>
            <p className="text-[10px] text-amber-700/80">Your profile is pending verification by admin. Some features may be limited.</p>
          </div>
        </div>
      )}


      {/* Profile Completion Prompt */}
      {(!stats.profile?.photo_url || !stats.profile?.nrc_url) && (
        <div className="rounded-xl p-4 border border-amber-200 bg-amber-50 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">Complete Your Profile</h4>
            <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
              Please upload the following to verify your identity:
            </p>
            <div className="mt-2 space-y-1.5">
              {!stats.profile?.photo_url && (
                <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <Camera size={14} className="text-amber-600" />
                  <span>Profile Photo</span>
                </div>
              )}
              {!stats.profile?.nrc_url && (
                <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <Upload size={14} className="text-amber-600" />
                  <span>NRC / ID Document</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/borrower/profile')}
              className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all active:scale-95"
            >
              Go to Profile
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Loans"   value={myLoans.length} color="#1e40af" icon={CreditCard} />
        <StatCard label="Active"        value={activeLoans}    color="#1e40af" icon={Activity} />
        <StatCard label="Paid"          value={paidLoans}      color="#22c55e" icon={CheckCircle} />
      </div>
      {defaults > 0 && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-2xl">
          <span className="text-xl">🚨</span>
          <div>
            <p className="text-sm font-bold text-red-800">You have {defaults} defaulted loan{defaults>1?'s':''}.</p>
            <p className="text-xs text-red-600">Please contact your lender to resolve these.</p>
          </div>
        </div>
      )}

      {/* Recent Loans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">My Recent Loans</h3>
          <button onClick={() => navigate('/borrower/loans')} className="text-xs text-blue-600 font-bold hover:underline">
            View All
          </button>
        </div>
        {myLoans.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-sm font-bold text-gray-600">No loans recorded yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {myLoans.slice(0,4).map(l => (
              <div key={l.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-xs font-bold text-gray-800">{l.lenderName}</p>
                  <p className="text-[10px] text-gray-400">Due: {THEME.formatDate(l.due_date)} · {THEME.formatCurrency(l.amount)}</p>

                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
