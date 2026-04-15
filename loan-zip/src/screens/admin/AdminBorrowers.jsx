import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Search, Filter, User, ShieldCheck, MapPin, Phone, Calendar, ArrowUpRight, TrendingUp, AlertTriangle, Hash, Lock, Database, Target, Activity, Globe } from 'lucide-react';
import api from '../../services/api';
import { RiskBadge, Btn, PageHeader, ConfirmDialog } from '../../components/UI';
import Modal from '../../components/Modal';
import { THEME } from '../../theme';

export default function AdminBorrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [viewModal, setViewModal] = useState(null);
  const [viewLoans, setViewLoans] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/borrowers');
      setBorrowers(response.data);
    } catch (error) {
      console.error('Failed to fetch borrowers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  useEffect(() => {
    if (viewModal) {
      const fetchLoans = async () => {
        try {
          const response = await api.get('/admin/loans');
          const borrowerLoans = response.data.filter(l => l.borrower_id === viewModal.id);
          setViewLoans(borrowerLoans);
        } catch (error) {
          console.error('Failed to fetch loans for borrower', error);
        }
      };
      fetchLoans();
    } else {
      setViewLoans([]);
    }
  }, [viewModal]);

  const filtered = borrowers.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = (b.name || '').toLowerCase().includes(q) || (b.nrc || '').includes(search) || (b.phone || '').includes(search);
    const matchRisk   = riskFilter === 'ALL' || b.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      <PageHeader 
        title="Borrower Management" 
        subtitle="View and manage borrower credit profiles and risk levels" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-xl transition-all group overflow-hidden relative">
           <div className="relative z-10 w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe size={22} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Total Borrowers</p>
              <h3 className="text-xl font-black text-slate-950 leading-none">{borrowers.length}</h3>
           </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-xl transition-all group overflow-hidden relative border-l-4 border-l-emerald-500">
           <div className="relative z-10 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Low Risk Cases</p>
              <h3 className="text-xl font-black text-slate-950 leading-none">{borrowers.filter(b=>b.risk==='GREEN').length}</h3>
           </div>
        </div>
        <div className="bg-[#020617] rounded-3xl p-5 text-white shadow-lg flex items-center gap-4 group overflow-hidden relative border-l-4 border-l-rose-500">
           <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle size={22} strokeWidth={2.5} />
           </div>
           <div className="relative z-10">
              <p className="text-[9px] text-rose-400/60 font-black uppercase tracking-widest mb-0.5">High Risk Cases</p>
              <h3 className="text-xl font-black text-white leading-none">{borrowers.filter(b=>b.risk==='RED').length}</h3>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, NRC, or phone..."
            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:border-blue-600 outline-none transition-all shadow-sm"
          />
        </div>
        <select 
          value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 focus:border-blue-600 outline-none transition-all shadow-sm cursor-pointer"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="GREEN">Low Risk (Good)</option>
          <option value="AMBER">Medium Risk</option>
          <option value="RED">High Risk (Bad)</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Borrower Name</th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">NRC Number</th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification</th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Level</th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-all shadow-sm">
                        <User size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{b.name}</span>
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Born: {THEME.formatDate(THEME.getDOB(b))}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.nrc}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      b.verificationStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {b.verificationStatus === 'verified' ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm scale-90 origin-left">
                    <RiskBadge risk={b.risk} />
                  </td>
                  <td className="px-6 py-4 text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.score || '--'} pts</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                          onClick={() => setViewModal(b)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 active:scale-95"
                       >
                          View
                       </button>
                       <button 
                          onClick={() => setDeleteConfirm(b)}
                          className="p-2.5 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Borrower Profile" size="lg">
        {viewModal && (
          <div className="space-y-5 pb-2">
            <div className="bg-[#020617] p-8 rounded-3xl text-white flex flex-col items-center relative overflow-hidden shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-xl mb-4 shadow-xl">
                {viewModal.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">{viewModal.name}</h3>
              <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mt-1 opacity-80">NRC: {viewModal.nrc}</p>
              <div className="mt-5 flex gap-2">
                 <RiskBadge risk={viewModal.risk} />
                 <div className={`px-3 py-1.5 rounded-full border text-[8px] font-bold uppercase tracking-widest ${
                   viewModal.verificationStatus === 'verified'
                     ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                     : 'bg-amber-500/20 border-amber-500/20 text-amber-400'
                 }`}>
                   {viewModal.verificationStatus === 'verified' ? 'Verified' : 'Unverified'}
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
               {[
                 { icon: Phone, label: 'Phone', value: viewModal.phone, color: 'text-blue-500' },
                 { icon: Calendar, label: 'Date of Birth', value: THEME.formatDate(THEME.getDOB(viewModal)), color: 'text-emerald-500' },
                 { icon: MapPin, label: 'Location', value: 'Lusaka', color: 'text-indigo-500' },
                 { icon: Activity, label: 'Loans', value: `${viewModal.totalLoans} Paid`, color: 'text-amber-500' },
               ].map((item, i) => (
                 <div key={i} className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-0.5">
                       <item.icon size={12} className={item.color} />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{item.value}</p>
                 </div>
               ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4">
               <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Detailed Loan History</h4>
                  <Database size={14} className="text-slate-400" />
               </div>
               <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                 <table className="w-full">
                    <thead className="bg-white sticky top-0 border-b border-gray-100 z-10">
                       <tr>
                          <th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ref / Lender</th>
                          <th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Amount (K)</th>
                          <th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Schedule</th>
                          <th className="px-4 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {viewLoans.length === 0 ? (
                          <tr><td colSpan="4" className="px-4 py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">No loan records found</td></tr>
                       ) : (
                          viewLoans.map((loan) => (
                             <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3">
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-slate-900 uppercase">#{loan.id}</span>
                                      <span className="text-[9px] text-slate-500 font-bold uppercase">{loan.lenderName}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-3">
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-slate-900">K{Number(loan.amount).toLocaleString()}</span>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase">Rate: {loan.interest_rate}%</span>
                                   </div>
                                </td>
                                <td className="px-4 py-3">
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-600 uppercase pb-0.5">{(loan.instalmentSchedule || []).length} Installments</span>
                                      <span className="text-[9px] text-slate-400 font-bold uppercase">Due: {THEME.formatDate(loan.due_date)}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                   <div className={`inline-block px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                      loan.status === 'active' ? 'bg-blue-50 text-blue-600' :
                                      loan.status === 'default' ? 'bg-rose-50 text-rose-600' :
                                      'bg-emerald-50 text-emerald-600'
                                   }`}>
                                      {loan.status}
                                   </div>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
               </div>
            </div>

            <div className="flex gap-2.5">
              {viewModal.verificationStatus !== 'verified' && (
                <button
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                  onClick={async () => {
                    try {
                      await api.post('/admin/approve-borrower', { borrowerId: viewModal.id });
                      fetchBorrowers();
                      setViewModal({ ...viewModal, verificationStatus: 'verified' });
                    } catch (error) {
                      console.error('Failed to verify borrower', error);
                    }
                  }}
                >
                  Verify Borrower
                </button>
              )}
              <button className="flex-1 py-4 bg-[#020617] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          try {
            await api.delete(`/admin/borrowers/${deleteConfirm.id}`);
            fetchBorrowers();
            setDeleteConfirm(null);
          } catch (error) {
            console.error('Failed to delete borrower', error);
            alert('Failed to delete borrower');
          }
        }}
        title="Delete Borrower?"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        isDanger
      />
    </div>
  );
}
