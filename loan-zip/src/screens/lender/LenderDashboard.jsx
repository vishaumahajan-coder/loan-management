import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  ChevronRight, 
  DollarSign, 
  Search, 
  Globe, 
  Lock, 
  Activity as ActivityIcon,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
// import { mockLoans } from '../../data/mockData';
import { StatusBadge } from '../../components/UI';

import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function LenderDashboard() {
  const { user } = useAuth();
  const { membershipConfig } = useConfig();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalPortfolio: 0, activeLoans: 0, defaultedLoans: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/lender');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const isFree = !user?.isPaid;
  const totalAmount = stats.totalPortfolio;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative h-[110px] w-full rounded-2xl overflow-hidden shadow-lg border border-white/5 bg-[#020617]">
         <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0F172A] to-blue-900 opacity-90"></div>
         <div className="absolute inset-0 px-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1.5">
               <div className="px-2 py-0.5 bg-blue-500/10 backdrop-blur-md rounded-full border border-blue-500/20">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">
                    Status: {user?.verificationStatus?.toUpperCase() || 'ACTIVE'}
                  </p>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 relative z-10">
               <div>
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none mb-1 uppercase">
                    Hi, {user?.name?.split(' ')[0] || 'Lender'}!
                  </h1>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {isFree ? 'Free Plan — Upgrade to unlock all features' : 'Premium Plan — Full access enabled'}
                  </p>
               </div>
               <div className="flex gap-2">
                  <button 
                     onClick={() => navigate('/lender/loans')}
                     className="bg-white text-slate-950 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 active:scale-95"
                  >
                     <Plus size={14} /> New Loan
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-1">
        {[
          { label: 'Total Portfolio', value: `K${(stats.totalPortfolio/1000).toFixed(1)}k`, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Loans', value: stats.activeLoans, icon: ActivityIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Defaulted', value: stats.defaultedLoans, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Status', value: 'Healthy', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
             <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                <s.icon size={18} />
             </div>
             <p className="text-lg font-black text-slate-950 tracking-tight leading-none mb-1">{s.value}</p>
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-1">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
          </div>
          <div className="space-y-2.5">
             {stats.recentActivity.map((loan) => (
                <div 
                   key={loan.id} 
                   className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
                   onClick={() => navigate('/lender/loans')}
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#020617] group-hover:text-white transition-all flex items-center justify-center">
                         <DollarSign size={18} />
                      </div>
                      <div>
                         <h4 className="text-[13px] font-black text-slate-950 uppercase group-hover:text-blue-600 transition-colors leading-none mb-1.5">{loan.borrowerName}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase opacity-70">ID: {loan.id}</p>
                      </div>
                   </div>
                   <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                         <p className="text-base font-black text-slate-950 tracking-tight leading-none mb-1">K{loan.amount}</p>
                      </div>
                      <StatusBadge status={loan.status} />
                      <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 transition-all" />
                   </div>
                </div>
             ))}
          </div>
          <button onClick={() => navigate('/lender/loans')} className="w-full py-3 bg-gray-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all">
            View All Loans
          </button>
        </div>

        {/* Membership Plan Card (right column) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           <div className={`rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex-1 ${isFree ? 'bg-[#020617]' : 'bg-gradient-to-br from-blue-700 to-blue-900'}`}>
              <div className="relative z-10 flex flex-col h-full items-center text-center">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isFree ? 'bg-white/5 border border-white/10 text-yellow-400' : 'bg-white/10 border border-white/20 text-emerald-300'}`}>
                    {isFree ? <Lock size={24} /> : <Star size={24} />}
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-tight mb-1">
                   {isFree ? 'Free Plan' : 'Premium Plan'}
                 </h4>
                 {isFree && (
                   <div className="mb-4">
                      <p className="text-[14px] font-black text-white tracking-tight">K{membershipConfig.monthly.price} / Month</p>
                      <p className="text-[8px] text-blue-300 uppercase font-black tracking-widest mt-1">
                         {membershipConfig.monthly.trial && '⭐ FREE TRIAL AVAILABLE'}
                      </p>
                   </div>
                 )}
                 <p className="text-[10px] text-blue-100/50 font-medium mb-4">
                   {isFree ? 'Upgrade to unlock search, risk data & full history.' : 'Full access to all features is active.'}
                 </p>

                 {isFree && (
                   <div className="w-full space-y-1.5 mb-4 text-left">
                     {[
                       { label: 'Network Search', locked: true },
                       { label: 'Risk Level View', locked: true },
                       { label: 'Borrower History', locked: true },
                       { label: 'Create Loans', locked: false },
                       { label: 'Add Borrowers', locked: false },
                     ].map((f, i) => (
                       <div key={i} className="flex items-center justify-between text-[9px] px-2 py-1.5 bg-white/5 rounded-lg">
                         <span className="font-bold uppercase tracking-wider text-white/70">{f.label}</span>
                         <span className={f.locked ? 'text-red-400 font-black' : 'text-emerald-400 font-black'}>
                           {f.locked ? '✕ Locked' : '✓ Free'}
                         </span>
                       </div>
                     ))}
                   </div>
                 )}

                 <button 
                   onClick={() => alert(isFree ? `Upgrade to Premium for K${membershipConfig.monthly.price}. Contact admin@lendanet.zm.` : 'You are already on the Premium plan!')}
                   className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all ${isFree ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                 >
                   {isFree ? 'Upgrade to Premium' : '✓ Premium Active'}
                 </button>
              </div>
           </div>
            
           <button 
              onClick={() => navigate('/lender/search')}
              className="w-full p-5 bg-white border border-gray-100 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-[#020617] hover:text-white transition-all shadow-sm flex items-center justify-center gap-3"
           >
              <Search size={16} />
              Search Borrowers
           </button>
        </div>
      </div>
    </div>
  );
}
