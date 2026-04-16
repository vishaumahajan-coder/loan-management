import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  TrendingUp, 
  UserX, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ArrowUpRight,
  ChevronRight,
  Shield,
  Zap,
  BarChart,
  MessageSquare,
  PhoneCall,
  Activity,
  UserCheck,
  Hash,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import api from '../../services/api';
import { StatusBadge, Btn, PageHeader, RiskBadge } from '../../components/UI';
import Modal from '../../components/Modal';
import { THEME } from '../../theme';

export default function AdminDefaults() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);

  const fetchDefaults = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/defaults');
      setLoans(response.data);
    } catch (error) {
      console.error('Failed to fetch defaults', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaults();
  }, []);

  const handleRemoveDefault = async (loanId) => {
    try {
      if (!confirm('Are you sure you want to remove this default?')) return;
      await api.post('/admin/remove-default', { loanId });
      fetchDefaults();
      setViewModal(null);
    } catch (error) {
      console.error('Failed to remove default', error);
      alert('Action failed');
    }
  };

  const totalExposure = loans.reduce((sum, l) => sum + (l.amount || 0), 0);

  const handleReport = () => {
    if (loans.length === 0) return alert("No defaulted records to report!");

    const headers = ["Borrower Name", "Loan ID", "Lender Name", "Unpaid Amount (K)", "Interest Rate (%)", "Overdue Date"];
    const rows = loans.map(l => [
      l.borrowerName,
      l.id,
      l.lenderName,
      l.amount,
      l.interestRate || 0,
      THEME.formatDate(l.dueDate)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Defaulters_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700 mx-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="Defaulted Loans" 
          subtitle="View and manage borrowers who have missed their loan payments" 
        />
        <button 
          onClick={handleReport}
          className="bg-[#020617] text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2.5 shadow-md active:scale-95 border border-[#020617]"
        >
          <BarChart size={14} /> Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-xl transition-all group overflow-hidden relative border-l-4 border-l-rose-500 h-28">
           <div className="relative z-10 w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ShieldAlert size={20} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5 leading-none">Unpaid</p>
              <h3 className="text-xl font-black text-slate-950 leading-none">K{totalExposure.toLocaleString()}</h3>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Database size={80} strokeWidth={2} />
           </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-xl transition-all group overflow-hidden relative h-28">
           <div className="relative z-10 w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <UserX size={20} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5 leading-none">People</p>
              <h3 className="text-xl font-black text-slate-950 leading-none">{loans.length} Borrowers</h3>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <UserX size={80} strokeWidth={2} />
           </div>
        </div>
        <div className="bg-[#020617] rounded-3xl p-5 text-white shadow-xl flex items-center gap-4 hover:scale-[1.02] transition-transform group relative overflow-hidden h-28">
           <div className="absolute inset-0 bg-blue-600 blur-[50px] opacity-10"></div>
           <div className="relative z-10 w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Activity size={20} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-blue-400/60 font-black uppercase tracking-widest mb-0.5 leading-none">Recoveries</p>
              <h3 className="text-xl font-black text-white leading-none">14.2%</h3>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <Globe size={80} strokeWidth={2} />
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search by Name or ID..."
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-blue-600 outline-none transition-all shadow-md placeholder:text-slate-200"
          />
        </div>
        <button className="px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
           <Filter size={16} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
         {loans.filter(l => l.borrowerName.toLowerCase().includes(search.toLowerCase())).map(l => (
           <div 
             key={l.id} 
             className="bg-white rounded-2xl p-3 px-5 border border-gray-50 flex items-center justify-between group hover:border-rose-500 hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-rose-500 relative overflow-hidden"
           >
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all transform group-hover:scale-105 shadow-inner">
                    <UserX size={20} strokeWidth={2} />
                 </div>
                 <div>
                    <h4 className="text-base font-black text-slate-950 uppercase group-hover:text-rose-600 transition-colors tracking-tight leading-none mb-1.5">{l.borrowerName}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 opacity-80 items-center">
                       <span className="flex items-center gap-1.5 text-rose-600"><Hash size={10} /> OVERDUE SINCE {THEME.formatDate(l.dueDate)}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                       <span>LENDER: {l.lenderName}</span>
                    </div>
                 </div>
              </div>
  
              <div className="flex items-center gap-6 relative z-10">
                 <div className="text-right hidden sm:block">
                    <p className="text-xl font-black text-rose-600 tracking-tight leading-none grayscale group-hover:grayscale-0 transition-all mb-1">K{l.amount.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-80">Rate: {l.interestRate || 0}%</p>
                 </div>
                 <div className="flex items-center gap-2.5">
                    <button onClick={()=>setViewModal(l)} className="px-4 py-2 bg-[#020617] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md active:scale-95">Details</button>
                    <button className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-50 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center active:scale-95">
                       <PhoneCall size={14} />
                    </button>
                 </div>
              </div>
              
              <div className="absolute -right-4 -bottom-4 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity">
                 <Lock size={80} strokeWidth={2} />
              </div>
           </div>
         ))}
      </div>

      <Modal isOpen={!!viewModal} onClose={()=>setViewModal(null)} title="Full Details" size="sm">
         {viewModal && (
           <div className="space-y-6 pb-2">
              <div className="bg-[#020617] p-8 rounded-2xl text-center relative overflow-hidden group shadow-lg">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 opacity-70 leading-none">Unpaid Amount</p>
                 <h3 className="text-3xl font-black text-white tracking-tight leading-none group-hover:scale-105 transition-all">K{viewModal.amount.toLocaleString()}</h3>
                 <p className="text-[10px] font-black text-rose-300 mt-4 uppercase tracking-widest opacity-80">{viewModal.borrowerName}</p>
              </div>
  
              <div className="space-y-3">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Case Summary</h4>
                 <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Overdue</span>
                       <span className="text-xs font-black text-slate-900 uppercase">3 Months</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</span>
                       <span className="text-[9px] px-3 py-1.5 bg-rose-500 text-white font-black uppercase tracking-widest rounded-lg">Default User</span>
                    </div>
                 </div>
              </div>
  
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>setViewModal(null)} className="py-3.5 bg-gray-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#020617] hover:text-white transition-all">Close</button>
                  <button 
                    onClick={() => handleRemoveDefault(viewModal.id)}
                    className="py-3.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all hover:bg-emerald-700"
                  >
                    Remove Default
                  </button>
              </div>
           </div>
         )}
      </Modal>
    </div>
  );
}
