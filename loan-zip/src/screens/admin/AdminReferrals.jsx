import React, { useState } from 'react';
import { 
  Gift, 
  Search, 
  Filter, 
  TrendingUp, 
  UserPlus, 
  Zap, 
  Globe, 
  Activity, 
  ChevronRight, 
  Plus, 
  ArrowUpRight, 
  Target, 
  Hash, 
  LucideTrendingUp, 
  MessageSquare,
  Network,
  Share2,
  Lock,
  Database
} from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/UI';
import api from '../../services/api';

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReferrals = async () => {
    try {
      const response = await api.get('/admin/referrals');
      setReferrals(response.data);
    } catch (error) {
      console.error('Failed to fetch referrals', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReferrals();
  }, []);

  const filtered = (referrals || []).filter(r => {
    if (!r) return false;
    const q = (search || '').toLowerCase();
    const searchableFields = [
      r.referrerName || r.referrer,
      r.referredName || r.referee,
      r.id,
      r.status
    ].map(f => (f || '').toString().toLowerCase());
    
    return searchableFields.some(f => f.includes(q));
  });

  const handleExport = () => {
    if (filtered.length === 0) return alert("No referral data to export!");

    const headers = ["Referral ID", "Referrer Name", "Referred User (Referee)", "Bonus Amount (K)", "Status"];
    const rows = filtered.map(r => [
      r.id,
      r.referrer,
      r.referee,
      r.bonus,
      r.status.toUpperCase()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Referral_Program_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <PageHeader 
          title="Referral Program" 
          subtitle="View and manage user referrals and rewards" 
        />
        <button 
          onClick={handleExport}
          className="bg-[#020617] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-md active:scale-95 border border-[#020617]"
        >
          <Network size={16} /> Program Details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-2xl transition-all relative overflow-hidden border-l-4 border-l-blue-600">
            <div className="relative z-10 w-14 h-14 rounded-[22px] bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
               <Share2 size={24} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 leading-none">Growth Rate</p>
               <h3 className="text-2xl font-black text-slate-950 leading-none">2.4x More</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
               <Network size={100} strokeWidth={2} />
            </div>
         </div>
         <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="relative z-10 w-14 h-14 rounded-[22px] bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
               <Gift size={24} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 leading-none">Total Bonuses</p>
               <h3 className="text-2xl font-black text-slate-950 leading-none">K{referrals.reduce((s,r)=>s+r.bonus,0).toLocaleString()}</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
               <Target size={100} strokeWidth={2} />
            </div>
         </div>
         <div className="bg-[#020617] rounded-[40px] p-8 text-white shadow-2xl flex items-center gap-6 hover:scale-[1.02] transition-transform group relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600 blur-[60px] opacity-10"></div>
            <div className="relative z-10 w-14 h-14 rounded-[22px] bg-white/5 border border-white/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
               <Activity size={24} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest mb-1 leading-none">Total Referrals</p>
               <h3 className="text-2xl font-black text-white leading-none">{referrals.length} Users</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
               <Database size={100} strokeWidth={2} />
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search by Name or ID..."
            className="w-full pl-14 pr-10 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-blue-600 outline-none transition-all shadow-md placeholder:text-slate-200"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
           <Filter size={18} /> Filter
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Referral History</h3>
        <div className="space-y-3">
          {filtered.map((r) => (
            <div 
              key={r.id} 
              className="bg-white rounded-[40px] p-6 border border-gray-50 hover:border-blue-600 hover:shadow-2xl transition-all group flex items-center justify-between gap-6 relative overflow-hidden"
            >
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 rounded-[22px] bg-slate-50 text-slate-300 group-hover:bg-[#020617] group-hover:text-white transition-all flex items-center justify-center shadow-inner">
                     <UserPlus size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-950 uppercase group-hover:text-blue-600 transition-colors tracking-tighter leading-none mb-2">{r.referrer} index</h4>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-80">PROLIFERATED: {r.referee}</p>
                       <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                       <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest leading-none">Hash Verified {r.id}</p>
                    </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-10 relative z-10">
                  <div className="text-right hidden sm:block">
                     <p className="text-2xl font-black text-emerald-600 tracking-tighter leading-none grayscale group-hover:grayscale-0 transition-all mb-1">K{r.bonus}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-80">Bonus Amount</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <StatusBadge status={r.status} />
                     <ChevronRight size={22} className="text-slate-100 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
               </div>

               <div className="absolute -right-4 -bottom-4 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity">
                  <Lock size={120} strokeWidth={2} />
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Rules Settings */}
      <div className="bg-[#020617] rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-10"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <Zap size={20} className="text-blue-400" />
               <h4 className="text-xl font-black tracking-tight uppercase leading-none">Reward Rules (Settings)</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest px-1">Lender Referral Reward (K)</label>
                  <div className="flex gap-2">
                     <input 
                        type="number" 
                        id="lender_reward_input"
                        placeholder="500" 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold w-full outline-none focus:border-blue-500 transition-all"
                     />
                     <button 
                        onClick={() => {
                           const val = document.getElementById('lender_reward_input').value;
                           if (val) api.post('/admin/settings', { key: 'lender_referral_reward', value: val }).then(() => alert('Lender Reward Updated!'));
                        }}
                        className="px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                     >
                        Update
                     </button>
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest px-1">Borrower Referral Reward (K)</label>
                  <div className="flex gap-2">
                     <input 
                        type="number" 
                        id="borrower_reward_input"
                        placeholder="50" 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold w-full outline-none focus:border-blue-500 transition-all"
                     />
                     <button 
                         onClick={() => {
                           const val = document.getElementById('borrower_reward_input').value;
                           if (val) api.post('/admin/settings', { key: 'borrower_referral_reward', value: val }).then(() => alert('Borrower Reward Updated!'));
                        }}
                        className="px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                     >
                        Update
                     </button>
                  </div>
               </div>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-100/60 font-medium">
               Adjust the reward amounts globally. These changes will apply to all future qualified referrals.
            </p>
         </div>
      </div>
    </div>
  );
}
