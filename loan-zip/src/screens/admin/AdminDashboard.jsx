import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Gift, 
  History,
  Activity,
  ArrowUpRight,
  BarChart3,
  Globe,
  Lock
} from 'lucide-react';
import { DEMO_CREDENTIALS } from '../../theme';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [collateralEnabled, setCollateralEnabled] = useState(true);
  const [stats, setStats] = useState({ totalCapital: 0, totalLenders: 0, freeLenders: 0, premiumLenders: 0, recentLogs: [] });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/admin');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Total Capital', value: `K${stats.totalCapital.toLocaleString()}`, icon: Globe, color: 'text-blue-400' },
    { label: 'Total Lenders', value: stats.totalLenders, icon: UserCheck, color: 'text-emerald-400' },
    { label: 'Free Plan Users', value: stats.freeLenders, icon: Lock, color: 'text-yellow-400' },
    { label: 'Premium Users', value: stats.premiumLenders, icon: BarChart3, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Strategic Header */}
      <div className="relative h-[110px] w-full rounded-3xl overflow-hidden shadow-lg group border border-white/5 bg-[#020617]">
         <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-blue-900 to-[#020617] opacity-90"></div>
         
         <div className="absolute inset-0 px-8 py-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1.5">
               <div className="px-2 py-0.5 bg-blue-500/10 backdrop-blur-md rounded-full border border-blue-500/20">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">System Status: Active</p>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none uppercase italic">Admin <span className="text-blue-500">Dashboard</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Everything is running smoothly today.</p>
         </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center">
             <div className={`w-10 h-10 rounded-xl bg-slate-50 ${m.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner`}>
                <m.icon size={18} />
             </div>
             <p className="text-lg font-black text-slate-950 tracking-tighter leading-none mb-1">{m.value}</p>
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-80">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions Matrix */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
               { label: 'Manage Lenders', path: '/admin/lenders', icon: UserCheck, desc: 'View and verify lender accounts' },
               { label: 'Borrower Directory', path: '/admin/borrowers', icon: Users, desc: 'Detailed view of all borrowers' },
               { label: 'Loan Management', path: '/admin/loans', icon: CreditCard, desc: 'Monitor and track active loans' },
               { label: 'Defaulted Loans', path: '/admin/defaults', icon: Zap, desc: 'Manage overdue and bad loans' },
               { label: 'Referral Program', path: '/admin/referrals', icon: Gift, desc: 'Manage commissions and rules' },
               { label: 'Audit Logs', path: '/admin/audit', icon: History, desc: 'View all system activities' },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => navigate(item.path)}
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-500 hover:shadow-lg transition-all text-left group flex items-center gap-4"
              >
                 <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center shadow-inner">
                    <item.icon size={18} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-[11px] font-black text-slate-950 tracking-tight uppercase mb-0.5 group-hover:text-blue-600">{item.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium opacity-80 leading-tight">{item.desc}</p>
                 </div>
                 <ArrowUpRight size={14} className="text-slate-200 group-hover:text-blue-600" />
              </button>
            ))}
          </div>

          {/* End of Quick Actions Matrix */}
        </div>

        {/* Intelligence Sidecard */}
        <div className="lg:col-span-4 flex flex-col gap-4">
           {/* System Controls Section */}
           <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Controls</h3>
                 <ShieldCheck size={16} className="text-blue-500" />
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Collateral Uploads</p>
                       <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Enable platform wide</p>
                    </div>
                    <div 
                      onClick={async () => {
                        const newVal = !collateralEnabled;
                        setCollateralEnabled(newVal);
                        try {
                           await api.post('/settings/update', { key: 'collateral_upload_enabled', value: newVal });
                        } catch (e) {
                           setCollateralEnabled(!newVal);
                        }
                      }}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${collateralEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${collateralEnabled ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl opacity-50">
                    <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Default Threshold</p>
                       <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">3 Missed Payments</p>
                    </div>
                    <Lock size={12} className="text-slate-400" />
                 </div>
              </div>
           </div>

           <div className="bg-[#020617] rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl flex flex-col group h-full">
              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">System Activity</h3>
                    <Lock size={12} className="text-blue-900" />
                 </div>
                 <div className="space-y-4 flex-1">
                    {stats.recentLogs.map((log, i) => (
                      <div key={i} className="flex gap-4 group/log cursor-pointer">
                         <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover/log:bg-blue-600 transition-all shadow-sm">
                            <History size={12} className="text-blue-300 group-hover/log:text-white" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-1">{log.action}</p>
                            <p className="text-[9px] text-blue-400/50 font-bold uppercase tracking-widest">{log.performedBy}</p>
                         </div>
                      </div>
                    ))}
                 </div>
                 <button 
                   onClick={() => navigate('/admin/audit')}
                   className="w-full mt-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all font-black"
                 >
                    View All Activity
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
