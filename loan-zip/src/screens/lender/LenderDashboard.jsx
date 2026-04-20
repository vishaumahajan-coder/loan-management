import React, { useEffect, useState } from 'react';
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
  Star,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { StatusBadge } from '../../components/UI';
import { THEME } from '../../theme';

import api from '../../services/api';
import UpgradePlanModal from '../../components/modals/UpgradePlanModal';

export default function LenderDashboard() {
  const { user, refreshUser } = useAuth();
  const { membershipConfig } = useConfig();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalPortfolio: 0, activeLoans: 0, defaultedLoans: 0, recentActivity: [] });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/lender');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } 
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/loans/applications');
      setApplications(response.data.filter(a => a.status === 'pending'));
    } catch (error) {
      console.error('Failed to fetch applications', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/loans/applications/${id}/status`, { status });
      alert(`Application ${status}!`);
      fetchApplications();
    } catch (error) {
       alert(error.response?.data?.message || 'Update failed');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchApplications()]);
      setLoading(false);
    }
    init();
  }, []);

  const isFree = !user?.isPaid;
  
  // Get prices dynamically from config context
  const monthlyPrice = membershipConfig.monthly?.price || 200;
  const annualPrice = membershipConfig.annual?.price || 1000;

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
                    {isFree ? 'Free Plan — Upgrade to unlock all features' : `Premium Plan (${user?.plan_type?.toUpperCase()}) — Full access enabled`}
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
          { label: 'Total Portfolio', value: THEME.formatCurrency(stats.totalPortfolio), icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },

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
                         <p className="text-base font-black text-slate-950 tracking-tight leading-none mb-1">{THEME.formatCurrency(loan.amount)}</p>

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

          {/* Pending Loan Requests */}
          {applications.length > 0 && (
            <div className="mt-8 space-y-3">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                     <Plus size={14} /> Pending Loan Requests
                  </h3>
               </div>
               <div className="space-y-2.5">
                  {applications.map((app) => (
                     <div key={app.id} className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Search size={18} />
                           </div>
                           <div>
                              <h4 className="text-[13px] font-black text-slate-950 uppercase leading-none mb-1.5">{app.borrowerName}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase opacity-70">NRC: {app.borrowerNRC} • Requested {THEME.formatCurrency(app.amount)}</p>

                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                              onClick={() => handleStatusUpdate(app.id, 'approved')}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
                           >
                              Approve
                           </button>
                           <button 
                              onClick={() => handleStatusUpdate(app.id, 'rejected')}
                              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 active:scale-95 transition-all"
                           >
                              Reject
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Membership Plan Card (right column) - MATCHING IMAGE 2 */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           <div className={`rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl flex-1 flex flex-col justify-center min-h-[400px] border border-white/10 ${isFree ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}>
              {/* Decorative circle */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col h-full items-center text-center">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${isFree ? 'bg-slate-900 border border-white/5 text-blue-400' : 'bg-white/20 border border-white/20 text-white'}`}>
                    {isFree ? <Zap size={32} /> : <Star size={32} />}
                 </div>
                 
                 <h4 className="text-lg font-black uppercase tracking-tighter mb-2">
                   {isFree ? 'Explore Premium' : 'Premium Plan'}
                 </h4>
                 
                 <p className="text-[11px] text-blue-100/50 font-bold uppercase tracking-[2px] mb-8 leading-relaxed max-w-[200px]">
                   {isFree ? 'Upgrade to unlock network search, risk data & full history.' : 'FULL ACCESS TO ALL FEATURES IS ACTIVE.'}
                 </p>

                 {isFree ? (
                   <div className="w-full space-y-2 mb-10">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                         <span className="text-[10px] font-black text-blue-200">MONTHLY</span>
                         <span className="text-sm font-black text-white tracking-tight">{THEME.formatCurrency(monthlyPrice)}</span>

                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                         <span className="text-[10px] font-black text-blue-200">ANNUAL</span>
                         <span className="text-sm font-black text-white tracking-tight text-emerald-400">{THEME.formatCurrency(annualPrice)}</span>

                      </div>
                   </div>
                 ) : (
                   <div className="w-full h-24 flex items-center justify-center">
                      <div className="w-12 h-1 bg-white/20 rounded-full blur-[1px]"></div>
                   </div>
                 )}

                 <button 
                   onClick={() => isFree ? setIsUpgradeModalOpen(true) : alert('You already have Premium access!')}
                   className={`w-full py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[3px] shadow-2xl transition-all active:scale-95 ${
                     isFree ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                   }`}
                 >
                   {isFree ? 'Upgrade Now' : '✓ Premium Active'}
                 </button>
              </div>
           </div>
            
           <button 
              onClick={() => navigate('/lender/search')}
              className="w-full p-6 bg-white border border-gray-100 rounded-[28px] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-[#020617] hover:text-white transition-all shadow-sm flex items-center justify-center gap-4 group"
           >
              <Search size={18} className="group-hover:scale-110 transition-transform" />
              Search Network
           </button>
        </div>
      </div>

      <UpgradePlanModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        onSuccess={() => {
          alert('Request Sent Successfully!');
          refreshUser();
        }}
      />
    </div>
  );
}

