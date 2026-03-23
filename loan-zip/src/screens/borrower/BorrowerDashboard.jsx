import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Activity, CheckCircle, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge, StatusBadge, StatCard } from '../../components/UI';
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
  
  // Dynamic Risk Calculation
  const risk = defaults > 0 ? 'RED' : (activeLoans > 0 ? 'AMBER' : 'GREEN');
  const riskStyle    = THEME.risk[risk];

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

      {/* Risk Badge Card */}
      <div
        className="rounded-xl p-4 border"
        style={{ background: riskStyle.bg, borderColor: riskStyle.border }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: riskStyle.text }}>Credit Score</p>
            <h3 className="text-lg font-black" style={{ color: riskStyle.text }}>
              {risk === 'GREEN' ? 'Good standing ✅' : risk === 'AMBER' ? 'Medium Risk ⚠️' : 'High Risk 🔴'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: riskStyle.badge }}>
            {risk === 'GREEN' ? '✅' : risk === 'AMBER' ? '⚠️' : '🔴'}
          </div>
        </div>
      </div>

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
                  <p className="text-[10px] text-gray-400">Due: {new Date(l.due_date).toLocaleDateString()} · K{Number(l.amount).toLocaleString()}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <span className="text-xl flex-shrink-0">ℹ️</span>
        <p className="text-xs text-blue-800 font-medium leading-relaxed">
          Your loan data is visible to participating lenders on the LendaNet network.
          Your risk score updates automatically when lenders record or update your loans.
        </p>
      </div>
    </div>
  );
}
