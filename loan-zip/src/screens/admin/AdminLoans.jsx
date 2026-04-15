import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Plus, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  BarChart,
  Target,
  Globe,
  Lock,
  Hash,
  Activity,
  ChevronRight,
  TrendingDown,
  PieChart
} from 'lucide-react';
import api from '../../services/api';
import { AlertTriangle } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/UI';
import Modal from '../../components/Modal';
import { THEME } from '../../theme';

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
     borrowerId: '',
     lenderId: '',
     amount: '',
     interestRate: '',
     instalments: 3,
     loanType: 'Non-collateral'
  });
  const [borrowerOptions, setBorrowerOptions] = useState([]);
  const [lenderOptions, setLenderOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/loans');
      setLoans(response.data);
    } catch (error) {
      console.error('Failed to fetch loans', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [bResp, lResp] = await Promise.all([
        api.get('/admin/borrowers'),
        api.get('/admin/lenders')
      ]);
      setBorrowerOptions(bResp.data);
      setLenderOptions(lResp.data);
    } catch (error) {
      console.error('Failed to fetch lenders/borrowers', error);
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchOptions();
  }, []);

  const handleAdd = async () => {
     if (!newLoan.borrowerId || !newLoan.lenderId || !newLoan.amount) {
        alert("Please fill in all required fields (Borrower, Lender, Amount).");
        return;
     }

     try {
        setIsSubmitting(true);
        const payload = {
           borrowerId: newLoan.borrowerId,
           lenderId: newLoan.lenderId,
           amount: Number(newLoan.amount),
           interestRate: Number(newLoan.interestRate) || 0,
           installmentsCount: Number(newLoan.instalments),
           type: newLoan.loanType === 'Non-collateral' ? 'Non' : (newLoan.loanType === 'Guaranteed' ? 'Guarantor' : 'Collateral'),
           issueDate: new Date().toISOString().split('T')[0],
           dueDate: new Date(Date.now() + Number(newLoan.instalments) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        await api.post('/admin/loans', payload);
        
        alert("Loan Successfully Created! 🚀");
        setIsModalOpen(false);
        setNewLoan({ borrowerId: '', lenderId: '', amount: '', interestRate: '', instalments: 3, loanType: 'Non-collateral' });
        fetchLoans();
     } catch (error) {
        console.error('Failed to create loan', error);
        alert(error.response?.data?.message || 'Failed to create loan');
     } finally {
        setIsSubmitting(false);
     }
  };

  const filtered = loans.filter(l => 
    l.borrowerName.toLowerCase().includes(search.toLowerCase()) || 
    l.id.toLowerCase().includes(search.toLowerCase()) ||
    l.lenderName.toLowerCase().includes(search.toLowerCase())
  );

   const totalValue = loans.reduce((s, l) => s + (Number(l.amount) || 0), 0);

   const handleMarkDefault = async (loanId) => {
      if (!window.confirm("ARE YOU SURE? Marking a loan as default will flag the borrower as RISKY across the entire system.")) return;
      
      try {
         await api.put(`/loans/${loanId}/default`);
         alert('Loan marked as default! 🚨 Account flagged.');
         fetchLoans();
         setViewModal(null);
      } catch (error) {
         console.error('Failed to mark default', error);
         alert(error.response?.data?.message || 'Failed to mark default');
      }
   };

   return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700 mx-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="Loan Portfolio" 
          subtitle="View and manage all active loans across the system" 
        />
        <div className="flex gap-3">
           <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg shadow-blue-500/30 active:scale-95">
              <Plus size={16} strokeWidth={3} /> Give Loan
           </button>
           <button onClick={() => alert('Data perfectly exported as CSV!')} className="bg-[#020617] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-md active:scale-95 hidden sm:flex">
             <BarChart size={16} /> Export Data
           </button>
        </div>
      </div>

      {/* Numerical Heatmap Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden relative">
           <div className="relative z-10 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <Globe size={20} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 leading-none">Total Portfolio</p>
              <h3 className="text-xl font-black text-slate-950 tracking-tighter leading-none">K{totalValue.toLocaleString()}</h3>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Globe size={80} strokeWidth={2} />
           </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden relative border-l-4 border-l-emerald-500">
           <div className="relative z-10 w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner text-2xl">
              <Activity size={20} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 leading-none">Total Active</p>
              <h3 className="text-xl font-black text-slate-950 tracking-tighter leading-none">{loans.length} Loans</h3>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Activity size={80} strokeWidth={2} />
           </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden relative">
           <div className="relative z-10 w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck size={20} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 leading-none">Risk Rate</p>
              <h3 className="text-xl font-black text-slate-950 tracking-tighter leading-none">0.05%</h3>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <ShieldCheck size={80} strokeWidth={2} />
           </div>
        </div>
        <div className="bg-[#020617] rounded-3xl p-5 text-white shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform group relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-600 blur-[60px] opacity-10"></div>
           <div className="relative z-10">
              <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-3 opacity-70">Neural Health</p>
              <h3 className="text-xl font-black tracking-tighter leading-none mb-2">OPTIMAL</h3>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="bg-blue-500 h-full w-[94%]"></div>
              </div>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <Target size={80} strokeWidth={2} />
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
        <button onClick={() => alert('Advanced filtering options arriving soon.')} className="px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2">
           <Filter size={16} /> Filter
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Active Asset Registry</h3>
        <div className="space-y-2">
          {filtered.map(l => (
            <div 
              key={l.id} 
              onClick={() => setViewModal(l)}
              className="bg-white rounded-2xl p-4 px-6 border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-600 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-[#020617] group-hover:text-white transition-colors flex items-center justify-center shadow-inner">
                    <FileText size={20} strokeWidth={2} />
                 </div>
                 <div className="flex flex-col">
                    <h4 className="text-base font-black text-slate-950 uppercase group-hover:text-blue-600 transition-colors tracking-tighter leading-none mb-1.5">{l.borrowerName}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                       <span className="flex items-center gap-1"><Hash size={10} className="text-blue-300" /> {l.id}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                       <span className="text-blue-600">Lender: {l.lenderName}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                       <span className="text-emerald-500 italic">Rate: {l.interestRate || 0}%</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right hidden sm:block">
                    <p className="text-lg font-black text-slate-950 tracking-tight leading-none grayscale group-hover:grayscale-0 transition-all mb-1">K{Number(l.amount).toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none opacity-80">Loan Amount</p>
                 </div>
                 <div className="flex items-center gap-5">
                    <StatusBadge status={l.status} />
                    <ChevronRight size={16} className="text-slate-100 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Loan Details" size="md">
        {viewModal && (
          <div className="space-y-5 pb-2">
            <div className="bg-[#020617] p-6 rounded-2xl text-white flex flex-col items-center relative overflow-hidden group shadow-lg">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3b82f6_0%,transparent_50%)] opacity-20"></div>
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 mb-4 shadow-xl">
                  <Zap size={24} className="group-hover:scale-110 transition-transform" />
               </div>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 opacity-70 leading-none">Total Loan Value</p>
               <h3 className="text-2xl font-black tracking-tight leading-none group-hover:scale-105 transition-all duration-500">K{viewModal.amount.toLocaleString()}</h3>
               
               <div className="flex gap-3 mt-3 text-[9px] font-black uppercase tracking-widest">
                  <span className="text-blue-300/60">PRIN: K{(viewModal.principal || viewModal.amount).toLocaleString()}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-400">INT: {viewModal.interestRate || 0}%</span>
               </div>

               <div className="flex gap-4 mt-6">
                  <StatusBadge status={viewModal.status} />
                  <div className="px-5 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest">Secure Record</div>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-3">Payment Schedule</h4>
                <div className="grid grid-cols-1 gap-2">
                  {viewModal.instalmentSchedule?.map((ins) => {
                    const isOverdue = ins.status === 'pending' && new Date(ins.dueDate || ins.due_date) < new Date();
                    return (
                      <div key={ins.id} className={`p-3 border rounded-2xl flex items-center justify-between hover:shadow-2xl transition-all group/item shadow-sm ${isOverdue ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'}`}>
                         <div className="flex items-center gap-6">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner transition-all ${isOverdue ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-slate-50 text-slate-900 group-hover/item:bg-[#020617] group-hover/item:text-white'}`}>
                              {ins.id}
                            </div>
                            <div>
                              <p className={`text-sm font-black tracking-tight leading-none transition-colors uppercase ${isOverdue ? 'text-red-900 font-black italic' : 'text-slate-950 group-hover/item:text-blue-600'}`}>K{ins.amount}</p>
                              <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>Due Date: {THEME.formatDate(ins.dueDate || ins.due_date)}</p>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={isOverdue ? 'overdue' : ins.status} />
                            {isOverdue && <span className="text-[7px] font-black text-red-500 uppercase tracking-tighter animate-pulse mr-2">Overdue Action Needed</span>}
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="flex gap-3 pt-2">
               {viewModal.status !== 'paid' && viewModal.status !== 'default' && (
                  <button 
                     onClick={() => handleMarkDefault(viewModal.id)}
                     className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                  >
                     Mark As Default
                  </button>
               )}
               <button onClick={() => setViewModal(null)} className="flex-1 py-3 bg-[#020617] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all" >Close Profile</button>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Loan (Admin)">
         <div className="space-y-6">
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Lender</label>
                     <select
                        value={newLoan.lenderId}
                        onChange={e => setNewLoan({ ...newLoan, lenderId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                     >
                        <option value="">Select Lender...</option>
                        {lenderOptions.map(l => (
                           <option key={l.id} value={l.id}>{l.name} ({l.businessName || 'Individual'})</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Borrower</label>
                     <select
                        value={newLoan.borrowerId}
                        onChange={e => setNewLoan({ ...newLoan, borrowerId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                     >
                        <option value="">Select Borrower...</option>
                        {borrowerOptions.map(b => (
                           <option key={b.id} value={b.id}>{b.name} ({b.nrc || 'No NRC'})</option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 col-span-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Amount (K)</label>
                      <input
                        type="number"
                        value={newLoan.amount}
                        onChange={e => setNewLoan({ ...newLoan, amount: e.target.value })}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="0.00"
                     />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Interest (%)</label>
                     <input
                        type="number"
                        value={newLoan.interestRate}
                        onChange={e => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="0"
                     />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Payments</label>
                     <select
                        value={newLoan.instalments}
                        onChange={e => setNewLoan({ ...newLoan, instalments: e.target.value })}
                        className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                     >
                        {[1, 2, 3, 4, 5, 6, 12].map(n => <option key={n} value={n}>{n} Months</option>)}
                     </select>
                  </div>
               </div>

               {newLoan.amount && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Total Payable</p>
                        <h4 className="text-lg font-black text-blue-900 mt-1">K{(Number(newLoan.amount) + (Number(newLoan.amount) * (Number(newLoan.interestRate) || 0) / 100)).toLocaleString()}</h4>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Per Month</p>
                        <h4 className="text-sm font-black text-blue-900 mt-1">K{Math.ceil((Number(newLoan.amount) + (Number(newLoan.amount) * (Number(newLoan.interestRate) || 0) / 100)) / (Number(newLoan.instalments) || 1)).toLocaleString()}</h4>
                     </div>
                  </div>
               )}

               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Loan Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                     {['Non-collateral', 'Guaranteed', 'Collateral'].map(t => (
                        <button
                           key={t}
                           onClick={() => setNewLoan({ ...newLoan, loanType: t })}
                           className={`py-3 rounded-xl text-xs font-bold transition-all ${newLoan.loanType === t ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                           {t.split('-')[0]}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <ShieldCheck size={14} className="text-slate-400" />
                  <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">This loan is being created with Admin Override Privileges.</p>
               </div>
            </div>

            <div className="flex gap-4 pt-2">
                <button 
                  onClick={handleAdd} 
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Loan'}
                </button>
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all">Cancel</button>
            </div>
         </div>
      </Modal>

    </div>
  );
}
