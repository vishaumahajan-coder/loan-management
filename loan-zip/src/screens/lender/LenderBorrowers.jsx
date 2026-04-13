import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Send,
  ChevronRight,
  AlertTriangle,
  Shield,
  Zap,
  Phone,
  Calendar,
  Activity,
  Layers,
  Lock,
  Upload,
  Camera
} from 'lucide-react';
import { RiskBadge, Btn, PageHeader, EmptyState, ConfirmDialog } from '../../components/UI';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = { name: '', nrc: '', phone: '', dob: '' };

export default function LenderBorrowers() {
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]           = useState('');
  const [riskFilter, setRiskFilter]   = useState('ALL');
  const [addModal, setAddModal]       = useState(false);
  const [viewModal, setViewModal]     = useState(null);
  const [editModal, setEditModal]     = useState(null);
  const [shareModal, setShareModal]   = useState(null);
  const [viewLoans, setViewLoans]     = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [errors, setErrors]           = useState({});
  const [toastMsg, setToastMsg]       = useState('');
  const [photoFile, setPhotoFile]     = useState(null);
  const [nrcFile, setNrcFile]         = useState(null);
  const { user } = useAuth();
  const isFree = user?.role === 'lender' && user?.status === 'pending';

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/borrowers');
      setBorrowers(response.data);
    } catch (error) {
      console.error('Failed to fetch borrowers', error);
      showToast('Error loading borrowers');
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
          const response = await api.get('/loans');
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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filtered = borrowers.filter(b => {
    const matchSearch = (b.name || '').toLowerCase().includes(search.toLowerCase()) || 
                       (b.nrc || '').includes(search) || 
                       (b.phone || '').includes(search);
    const matchRisk   = riskFilter === 'ALL' || b.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  const validate = (f) => {
    const e = {};
    if (!f.name?.trim())  e.name  = 'Name required';
    if (!f.nrc?.trim())   e.nrc   = 'NRC required';
    if (!f.phone?.trim()) e.phone = 'Phone required';
    if (!f.dob)          e.dob   = 'Date of birth required';
    return e;
  };

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setPhotoFile(null); setNrcFile(null); setAddModal(true); };
  const openEdit = (b) => { setForm({ name: b.name, nrc: b.nrc, phone: b.phone, dob: b.dob }); setErrors({}); setEditModal(b); };

  const handleAdd = async () => {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('nrc', form.nrc);
      formData.append('phone', form.phone);
      if (form.dob) formData.append('dob', form.dob);
      if (photoFile) formData.append('photo', photoFile);
      if (nrcFile) formData.append('nrc_document', nrcFile);

      await api.post('/borrowers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAddModal(false);
      setPhotoFile(null);
      setNrcFile(null);
      showToast(`${form.name} processed successfully.`);
      fetchBorrowers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error adding borrower');
    }
  };

  const handleSendCredentials = async (b) => {
    try {
      const response = await api.post(`/borrowers/${b.id}/enable-login`);
      const { phone, password } = response.data.credentials;
      alert(`LOGIN ENABLED!\n\nPhone: ${phone}\nPassword: ${password}\n\nPlease share these with the borrower.`);
      showToast(`Login info generated for ${b.name}.`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error enabling login');
    }
  };

  const handleEdit = async () => {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await api.put(`/borrowers/${editModal.id}`, form);
      setEditModal(null);
      showToast('Borrower updated successfully');
      fetchBorrowers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating borrower');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/borrowers/${id}`);
      setDeleteConfirm(null);
      showToast('Borrower removed successfully');
      fetchBorrowers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting borrower');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Borrower Info" subtitle="Add and manage all people you have lent money to" />
        <button 
          onClick={openAdd}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <UserPlus size={16} /> Add Person
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={20} />
           </div>
           <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Total People</p>
              <h3 className="text-xl font-black text-gray-900 leading-none mt-1.5">{borrowers.length}</h3>
           </div>
        </div>
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Activity size={20} />
           </div>
           <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Health Index</p>
              <h3 className="text-xl font-black text-gray-900 leading-none mt-1.5">{((borrowers.filter(b=>b.risk==='GREEN').length / borrowers.length)*100).toFixed(0)}%</h3>
           </div>
        </div>
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex items-center gap-4 border-l-4 border-l-red-500">
           <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
           </div>
           <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Late Payers</p>
              <h3 className="text-xl font-black text-gray-900 leading-none mt-1.5">{borrowers.filter(b=>b.risk==='RED').length}</h3>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search by NRC, Phone, or Name..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <select 
          value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-500 cursor-pointer outline-none shadow-sm"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="GREEN">Low Risk</option>
          <option value="AMBER">Medium Risk</option>
          <option value="RED">High Risk</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all group">
             <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#020617] group-hover:text-white transition-all duration-300">
                      <Zap size={16} />
                   </div>
                   <div>
                      <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tighter leading-tight">{b.name}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-70">ID: {b.nrc}</p>
                   </div>
                </div>
                {user?.status === 'pending' ? (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                     <Lock size={10} />
                     <span className="text-[8px] font-black uppercase tracking-widest">Premium</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <RiskBadge risk={b.risk} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">{b.score || '--'} pts</span>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-2 mb-3 text-center border-y border-gray-50 py-2">
                <div>
                   <p className="text-base font-black text-slate-950 leading-none">{b.totalLoans}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 leading-none tracking-widest">Loans</p>
                </div>
                <div>
                   <p className="text-base font-black text-rose-500 leading-none">{b.totalDefaults}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 leading-none tracking-widest">Unpaid</p>
                </div>
             </div>

             <div className="flex gap-2">
                <button 
                   onClick={() => setViewModal(b)}
                   className="flex-1 h-9 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm hover:bg-blue-700 flex items-center justify-center"
                >
                   View
                </button>
                <button 
                   onClick={() => setShareModal(b)}
                   className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center active:scale-95 transition-all hover:bg-blue-600 hover:text-white"
                >
                   <Send size={14} />
                </button>
                <button 
                   onClick={() => setDeleteConfirm(b)}
                   className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center active:scale-95 transition-all hover:bg-red-500 hover:text-white"
                >
                   <Trash2 size={14} />
                </button>
                <button 
                   onClick={() => openEdit(b)}
                   className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center active:scale-95 transition-all hover:bg-amber-500 hover:text-white"
                >
                   <Edit2 size={14} />
                </button>
             </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Borrower Info" size="lg">
        {viewModal && (() => {
          const loans = viewLoans;
          const hasDefaults = viewModal.totalDefaults > 0 || viewModal.activeDefaults > 0;
          
          return (
            <div className="space-y-4">
              <div className="bg-[#020617] p-5 rounded-3xl text-white flex flex-col items-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-600/10 blur-[60px]"></div>
                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-xl mb-3 shadow-xl border border-white/10 relative z-10">
                    {viewModal.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                 </div>
                 <h3 className="text-lg font-black italic tracking-tight relative z-10">{viewModal.name}</h3>
                 <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 opacity-80 relative z-10">{viewModal.nrc}</p>
                 <div className="mt-4 relative z-10 scale-90">
                    {user?.status === 'pending' ? (
                      <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg">
                        <Lock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upgrade to Unlock Risk Level</span>
                      </div>
                    ) : (
                      <RiskBadge risk={viewModal.risk} />
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 {[
                   { icon: Activity, label: 'Active Loans', value: loans.filter(l=>l.status!=='paid').length, color: 'text-blue-600' },
                   { icon: AlertTriangle, label: 'Late Loans', value: isFree ? '???' : loans.filter(l=>l.status==='overdue').length, color: 'text-rose-500' },
                   { icon: Calendar, label: 'Born On', value: viewModal.dob, color: 'text-slate-500' },
                   { icon: Layers, label: 'Member Since', value: viewModal.addedDate || '2025', color: 'text-slate-500' },
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col gap-0.5 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                      {item.label === 'Late Loans' && isFree && (
                        <div className="absolute inset-0 bg-blue-50/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                           <Lock size={10} className="text-blue-600" />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mb-0.5">
                         <item.icon size={10} className={item.color} />
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      </div>
                      <p className={`text-[13px] font-black ${item.label.includes('Late') && item.value > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{item.value}</p>
                   </div>
                 ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Known Loan Types</h4>
                 <div className="flex flex-wrap gap-1.5">
                    {(viewModal.loanTypes || ['Non Collateral Loan']).map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-600 uppercase italic">
                         {t}
                      </span>
                    ))}
                 </div>
              </div>

              {isFree ? (
                <div className="p-10 bg-blue-50/50 rounded-[40px] border-2 border-dashed border-blue-100 flex flex-col items-center text-center">
                   <Lock size={32} className="text-blue-300 mb-4" />
                   <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Premium Content Restricted</h4>
                   <p className="text-[11px] text-blue-700/60 font-bold leading-relaxed max-w-[240px] mt-2 uppercase italic">Upgrade to premium to access full credit history and risk analysis.</p>
                </div>
              ) : hasDefaults ? (
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                      <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Default History Disclosure</h4>
                      <Zap size={12} className="text-red-500 animate-pulse" />
                   </div>
                   <div className="space-y-2.5">
                      {loans.filter(l => l.status === 'defaulted' || l.status === 'overdue').map(l => (
                        <div key={l.id} className="p-5 bg-red-50/50 border border-red-100 rounded-3xl flex justify-between items-center group hover:bg-red-50 transition-all">
                           <div>
                              <p className="text-base font-black italic text-red-950 leading-none">K{l.amount.toLocaleString()}</p>
                              <p className="text-[9px] text-red-400 font-bold uppercase mt-2 tracking-widest">{l.loanType} • ID: {l.id}</p>
                           </div>
                           <div className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-md shadow-red-500/20">DEFAULT</div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="p-10 bg-blue-50/50 rounded-[40px] border-2 border-dashed border-blue-100 flex flex-col items-center text-center">
                   <Shield size={32} className="text-blue-300 mb-4" />
                   <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Privacy Protection Active</h4>
                   <p className="text-[11px] text-blue-700/60 font-bold leading-relaxed max-w-[240px] mt-2 uppercase italic">Full loan history is restricted for compliant borrowers per system rules.</p>
                </div>
              )}

              <div className="flex justify-center">
                 <button className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all" onClick={() => setViewModal(null)}>Close Profile</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add New Person">
         <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-2xl space-y-3">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="e.g. Memory Tembo" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NRC Number</label>
                  <input className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.nrc} onChange={e=>setForm({...form, nrc: e.target.value})} placeholder="000000/00/1" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                     <input className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="097..." />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                     <input type="date" className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.dob} onChange={e=>setForm({...form, dob: e.target.value})} />
                  </div>
               </div>

               {/* Photo & NRC Upload */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Borrower Photo</label>
                     <label className="flex flex-col items-center justify-center gap-1.5 w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                        <Camera size={20} className="text-gray-400" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                           {photoFile ? photoFile.name : 'Take / Upload Photo'}
                        </span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => setPhotoFile(e.target.files[0])} />
                        {photoFile && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                     </label>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NRC Document</label>
                     <label className="flex flex-col items-center justify-center gap-1.5 w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                           {nrcFile ? nrcFile.name : 'Upload NRC Copy'}
                        </span>
                        <input type="file" accept="image/*,.pdf" capture="environment" className="hidden" onChange={e => setNrcFile(e.target.files[0])} />
                        {nrcFile && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                     </label>
                  </div>
               </div>
            </div>
            <div className="flex gap-3 pt-1">
               <button onClick={handleAdd} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">Add Person</button>
               <button onClick={()=>setAddModal(false)} className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Borrower Profile">
         <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl space-y-3">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NRC Number</label>
                  <input className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.nrc} onChange={e=>setForm({...form, nrc: e.target.value})} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                     <input className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                     <input type="date" className="w-full px-4 py-2.5 border border-gray-100 bg-white rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all" value={form.dob} onChange={e=>setForm({...form, dob: e.target.value})} />
                  </div>
               </div>
            </div>
            <div className="flex gap-3 pt-1">
               <button onClick={handleEdit} className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">Save Changes</button>
               <button onClick={()=>setEditModal(null)} className="flex-1 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={!!shareModal} onClose={() => setShareModal(null)} title="Share Account Details">
         <div className="space-y-5 text-center px-4 py-2">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-2">
               <Send size={32} />
            </div>
            <div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Send Credentials to {shareModal?.name}?</h4>
               <p className="text-[11px] text-slate-400 font-bold mt-2 leading-relaxed uppercase">
                  They will receive their login password and app link via SMS to: <br/>
                  <span className="text-blue-600 tracking-widest">{shareModal?.phone}</span>
               </p>
            </div>
            <div className="flex gap-3 pt-2">
               <button 
                  onClick={() => { handleSendCredentials(shareModal); setShareModal(null); }} 
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
               >
                  Send Now
               </button>
               <button onClick={()=>setShareModal(null)} className="flex-1 py-3.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Later</button>
            </div>
         </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm?.id)}
        title="Delete Person?"
        message={`Are you sure you want to remove ${deleteConfirm?.name}?`}
        confirmLabel="Remove"
        isDanger
      />
    </div>
  );
}
