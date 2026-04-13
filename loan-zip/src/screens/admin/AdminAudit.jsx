import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Globe, 
  ShieldCheck, 
  Activity, 
  ChevronRight,
  Download,
  Calendar,
  Zap,
  ArrowUpRight,
  Lock,
  Hash,
  Fingerprint,
  Database
} from 'lucide-react';
import { PageHeader } from '../../components/UI';
import api from '../../services/api';
import { THEME } from '../../theme';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    (log.userName && log.userName.toLowerCase().includes(search.toLowerCase())) ||
    (log.performedBy && log.performedBy.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700 mx-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="Activity Log" 
          subtitle="A secure record of all activities" 
        />
        <button 
          className="px-6 py-2.5 bg-[#020617] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2.5 shadow-md active:scale-95"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Security Health Heatmap */}
      <div className="grid grid-cols-3 gap-4">
         <div className="bg-[#020617] rounded-3xl p-5 text-white h-32 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600 blur-[50px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-2.5 opacity-60 relative z-10">
               <Fingerprint size={14} className="text-blue-400" />
               <span className="text-[9px] font-black uppercase tracking-widest">Total Logs</span>
            </div>
            <div className="relative z-10">
               <h3 className="text-2xl font-black tracking-tight leading-none">{logs.length}</h3>
            </div>
         </div>
         <div className="bg-white rounded-3xl p-5 border border-gray-100 h-32 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all group overflow-hidden relative border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 relative z-10">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Status</span>
            </div>
            <div className="relative z-10">
               <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-none mb-1">Active</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
               <Database size={80} strokeWidth={2} />
            </div>
         </div>
         <div className="bg-white rounded-3xl p-5 border border-gray-100 h-32 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex items-center gap-3 relative z-10">
               <Zap size={14} className="text-blue-600" />
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Performance</span>
            </div>
            <div className="relative z-10">
               <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-none mb-1">99.9%</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
               <Activity size={80} strokeWidth={2} />
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search Action Type or ID..."
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-blue-600 outline-none transition-all shadow-md placeholder:text-slate-200"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Verification Chain</h3>
        <div className="space-y-3">
          {filtered.map((log) => {
            return (
              <div key={log.id} className="bg-white rounded-2xl p-3 px-5 border border-gray-50 hover:border-blue-600 hover:shadow-lg transition-all group flex items-center justify-between gap-5 relative overflow-hidden">
                 <div className="flex items-center gap-5 relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-[#020617] group-hover:text-white transition-all flex items-center justify-center shadow-inner">
                       <Hash size={18} strokeWidth={2} />
                    </div>
               <div>
                  <h4 className="text-[14px] font-black text-slate-950 uppercase group-hover:text-blue-600 transition-all tracking-tight leading-none mb-1.5">{log.action}</h4>
                  <div className="flex items-center gap-3 text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">
                     <p>By: {log.userName || log.performedBy || 'System'}</p>
                     <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                     <p className="text-blue-600/40">{THEME.formatDateTime(log.created_at)} • Secure</p>
                  </div>
               </div>
            </div>
            <div className="text-right flex items-center gap-8 relative z-10">
               <div className="hidden sm:block text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Record ID</p>
                  <p className="text-[10px] font-black text-slate-900 group-hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 italic">#{log.id}</p>
               </div>
                    <ChevronRight size={16} className="text-slate-100 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                 </div>
                 <div className="absolute -right-4 -bottom-4 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity">
                    <History size={80} strokeWidth={2} />
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
