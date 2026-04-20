import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  Filter,
  ShieldCheck,
  UserPlus,
  Trash2,
  Activity,
  ChevronRight,
  Plus,
  Globe,
  Lock,
  Hash,
  Mail,
  Phone,
  Upload,
  BarChart3,
  Database
} from 'lucide-react';
import api from '../../services/api';
import { StatusBadge, Btn, PageHeader, ConfirmDialog } from '../../components/UI';
import Modal from '../../components/Modal';
import { THEME } from '../../theme';
import { useOutletContext } from 'react-router-dom';

import Swal from 'sweetalert2';

export default function AdminLenders() {
  const { search, setSearch } = useOutletContext();
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal]     = useState(null);
  const [plans, setPlans]             = useState([]);
  const [form, setForm]               = useState({ name: '', businessName: '', email: '', phone: '', password: 'LendaNet@123', license: null, nrc_document: null, planType: 'free', nrc: '', companyRegistrationNumber: '', lenderType: 'individual' });
  const [errors, setErrors]           = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewLoans, setViewLoans] = useState([]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/admin/membership-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    }
  };

  const fetchLenders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/lenders');
      setLenders(response.data);
    } catch (error) {
      console.error('Failed to fetch lenders', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load lenders list',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenders();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (viewModal) {
      const fetchLenderLoans = async () => {
        try {
          const response = await api.get(`/admin/lenders/${viewModal.id}/loans`);
          setViewLoans(response.data);
        } catch (error) {
          console.error('Failed to fetch lender loans', error);
          setViewLoans([]);
        }
      };
      fetchLenderLoans();
    } else {
      setViewLoans([]);
    }
  }, [viewModal]);

  const handleUpdateStatus = async (userId, status, verificationStatus) => {
    const action = verificationStatus === 'verified' ? 'Approve' : 'Reject';
    const result = await Swal.fire({
      title: `${action} Lender?`,
      text: `Are you sure you want to ${action.toLowerCase()} this application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: action === 'Approve' ? '#10b981' : '#ef4444'
    });

    if (!result.isConfirmed) return;

    try {
      await api.post('/admin/update-lender-status', { userId, status, verificationStatus });
      Swal.fire('Success', `Lender ${action.toLowerCase()}d successfully!`, 'success');
      fetchLenders();
      setViewModal(null);
    } catch (error) {
      Swal.fire('Error', 'Status update failed', 'error');
    }
  };

  const filtered = lenders.filter(l => {
    const q = search.toLowerCase();
    return (l.name || '').toLowerCase().includes(q) ||
           (l.business_name || l.businessName || '').toLowerCase().includes(q) ||
           (l.id || '').toString().toLowerCase().includes(q) ||
           (l.email || '').toLowerCase().includes(q) ||
           (l.nrc || '').toLowerCase().includes(q) ||
           (l.phone || '').toLowerCase().includes(q) ||
           (l.lender_id || '').toLowerCase().includes(q) ||
           (l.company_registration_number || '').toLowerCase().includes(q);
  });

  const handleAddLender = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = 'Owner name required';
    if (!form.phone) newErrors.phone = 'Phone required';
    if (!form.nrc && !form.companyRegistrationNumber) {
        newErrors.nrc = 'NRC or Company Reg No required';
    }
    if (!form.lenderType) newErrors.lenderType = 'Lender type required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
       const formData = new FormData();
       Object.keys(form).forEach(key => {
         if (key === 'license' && form[key]) {
           formData.append('license', form[key]);
         } else if (key === 'nrc_document' && form[key]) {
           formData.append('nrc_document', form[key]);
         } else if (form[key] !== null) {
           formData.append(key, form[key]);
         }
       });
       await api.post('/auth/register', formData);
       setIsModalOpen(false);
       setForm({ name: '', businessName: '', email: '', phone: '', password: 'LendaNet@123', license: null, nrc_document: null, planType: 'free', nrc: '', companyRegistrationNumber: '', lenderType: 'individual' });
       Swal.fire('Registered!', 'New lender account has been created.', 'success');
       fetchLenders();
    } catch (error) {
       Swal.fire('Error', error.response?.data?.message || 'Failed to add lender', 'error');
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleDelete = async (lender) => {
    const result = await Swal.fire({
      title: 'Delete Lender?',
      text: `Are you sure you want to delete ${lender.businessName}? This action is permanent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/lenders/${lender.id}`);
        setLenders(p => p.filter(l => l.id !== lender.id));
        Swal.fire('Deleted!', 'Lender has been removed.', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'Failed to delete lender', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    if (lenders.length === 0) return alert('No data to export');
    
    const headers = ['ID', 'Business Name', 'Owner Name', 'Email', 'Phone', 'Verification Status', 'Plan Type'];
    const csvRows = [
      headers.join(','),
      ...lenders.map(l => [
        l.id,
        `"${l.businessName}"`,
        `"${l.name}"`,
        `"${l.email}"`,
        `"${l.phone}"`,
        `"${l.verificationStatus}"`,
        `"${l.plan_type || 'free'}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `lenders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <PageHeader 
          title="Lender Management" 
          subtitle="Manage and verify all registered micro-lenders in the system" 
        />
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-gray-100 text-[#020617] px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <BarChart3 size={16} /> Export Report
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
          >
            <UserPlus size={16} /> Add New Lender
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group overflow-hidden relative">
           <div className="relative z-10 w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe size={22} />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Total Lenders</p>
              <h3 className="text-xl font-black text-slate-950 leading-none">{lenders.length}</h3>
           </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group overflow-hidden relative">
           <div className="relative z-10 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Verified</p>
              <h3 className="text-xl font-black text-slate-950 leading-none">{lenders.filter(l=>l.verificationStatus==='verified').length}</h3>
           </div>
        </div>
        <div className="bg-[#020617] rounded-3xl p-6 text-white shadow-lg flex items-center gap-4 group overflow-hidden relative border-l-4 border-l-blue-600">
           <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={22} />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest mb-0.5">Total Portfolio</p>
              <h3 className="text-xl font-black text-white leading-none">K2.4M</h3>
           </div>
        </div>
      </div>

     <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, NRC, phone, or business..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:border-blue-600 outline-none transition-all shadow-sm"
          />
        </div>
        <button onClick={() => Swal.fire('Info', 'Advanced filtering options arriving soon.', 'info')} className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm">
           <Filter size={16} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(l => (
          <div key={l.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-blue-400 hover:shadow-xl transition-all group relative flex flex-col justify-between h-full">
             <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Building size={24} />
                   </div>
                    <div className="flex flex-col items-end gap-2">
                       <StatusBadge status={l.verificationStatus} />
                       <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                         l.plan_type !== 'free'
                           ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                           : 'bg-blue-50 text-blue-600 border-blue-100'
                       }`}>
                         {l.plan_type !== 'free' ? `⭐ Premium (${l.plan_type})` : '🔒 Free'}
                       </div>
                    </div>
                 </div>
                <div>
                   <h4 className="text-[14px] font-black text-slate-950 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight mb-1">{l.business_name || l.businessName || l.name}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.name}</p>
                   {l.nrc && <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">NRC: {l.nrc}</p>}
                   {l.lender_id && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {l.lender_id}</p>}
                </div>
             </div>
  
             <div className="flex gap-2.5 mt-auto">
                <button 
                   onClick={() => setViewModal(l)}
                   className="flex-1 py-3 bg-[#020617] text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-blue-600 shadow-lg shadow-black/5"
                 >
                    View Details
                 </button>
                 <button 
                    onClick={() => handleDelete(l)}
                    className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-sm"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>
           </div>
        ))}
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Lender Profile" size="lg">
        {viewModal && (
          <div className="space-y-6 pb-2">
            <div className="relative p-6 bg-[#020617] rounded-3xl text-white overflow-hidden shadow-lg group">
              <div className="relative z-10 flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-xl shadow-xl overflow-hidden">
                    {viewModal.profile_image_url ? (
                      <img 
                        src={api.defaults.baseURL.replace('/api', '') + viewModal.profile_image_url} 
                        alt="Lender" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <span className={viewModal.profile_image_url ? 'hidden' : ''}>
                      {viewModal.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </span>
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black truncate tracking-tight uppercase">{viewModal.businessName}</h3>
                    <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mt-1 opacity-80">{viewModal.name}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/10 text-[9px] font-bold uppercase tracking-widest text-blue-300">Lender ID: {viewModal.lender_id || viewModal.id}</div>
                       <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                          viewModal.plan_type !== 'free'
                            ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                            : 'bg-yellow-500/20 border-yellow-500/20 text-yellow-400'
                       }`}>
                         {viewModal.plan_type !== 'free' ? `⭐ Premium Plan (${viewModal.plan_type})` : '🔒 Free Plan'}
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                  <p className="text-[10px] font-bold text-slate-900 truncate relative z-10">{viewModal.email || 'N/A'}</p>
               </div>
               <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Phone</p>
                  <p className="text-[10px] font-bold text-slate-900 relative z-10">{viewModal.phone}</p>
               </div>
               <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">NRC</p>
                  <p className="text-[10px] font-bold text-slate-900 relative z-10">{viewModal.nrc || 'N/A'}</p>
               </div>
               <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Company Reg</p>
                  <p className="text-[10px] font-bold text-slate-900 relative z-10">{viewModal.company_registration_number || 'N/A'}</p>
               </div>
               <div className="flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Lender Type</p>
                  <p className="text-[10px] font-bold text-slate-900 relative z-10 capitalize">{viewModal.lender_type ? viewModal.lender_type.replace('_', ' ') : 'N/A'}</p>
               </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4">
               <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Uploaded Documents</h4>
                  <Upload size={14} className="text-slate-400" />
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-gray-100 rounded-3xl p-5 flex flex-col items-center gap-3 bg-gray-50/50 shadow-sm">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proof of Licence</p>
                     {viewModal.license_url ? (
                       <a
                         href={api.defaults.baseURL.replace('/api', '') + viewModal.license_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full relative group/img cursor-zoom-in"
                       >
                         <img
                           src={api.defaults.baseURL.replace('/api', '') + viewModal.license_url}
                           alt="License Document"
                           className="w-full h-48 object-cover rounded-2xl border border-gray-200 shadow-sm group-hover/img:brightness-75 transition-all"
                           onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                         />
                         <div style={{display:'none'}} className="w-full h-48 rounded-2xl border border-gray-200 bg-blue-50 items-center justify-center flex-col gap-2">
                           <Upload size={24} className="text-blue-400" />
                           <p className="text-[10px] font-bold text-blue-500 uppercase">Click to View File</p>
                         </div>
                       </a>
                     ) : (
                       <div className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
                         <Upload size={24} className="text-slate-300" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Not Uploaded</p>
                       </div>
                     )}
                  </div>
                  <div className="border border-gray-100 rounded-3xl p-5 flex flex-col items-center gap-3 bg-gray-50/50 shadow-sm">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NRC Document</p>
                     {viewModal.nrc_url ? (
                       <a
                         href={api.defaults.baseURL.replace('/api', '') + viewModal.nrc_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full relative group/img cursor-zoom-in"
                       >
                         <img
                           src={api.defaults.baseURL.replace('/api', '') + viewModal.nrc_url}
                           alt="NRC Document"
                           className="w-full h-48 object-cover rounded-2xl border border-gray-200 shadow-sm group-hover/img:brightness-75 transition-all"
                           onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                         />
                         <div style={{display:'none'}} className="w-full h-48 rounded-2xl border border-gray-200 bg-blue-50 items-center justify-center flex-col gap-2">
                           <Upload size={24} className="text-blue-400" />
                           <p className="text-[10px] font-bold text-blue-500 uppercase">Click to View File</p>
                         </div>
                       </a>
                     ) : (
                       <div className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
                         <Upload size={24} className="text-slate-300" />
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Not Uploaded</p>
                       </div>
                     )}
                  </div>
                </div>
   </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4">
               <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Lending History</h4>
                  <Database size={14} className="text-slate-400" />
               </div>
               <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                 <table className="w-full">
                    <thead className="bg-white sticky top-0 border-b border-gray-100 z-10">
                       <tr>
                          <th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ref / Borrower</th>
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
                                      <span className="text-[9px] text-slate-500 font-bold uppercase">{loan.borrowerName}</span>
                                   </div>
                                </td>
                                <td className="px-4 py-3">
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-slate-900">{THEME.formatCurrency(loan.amount)}</span>

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
               {viewModal.verificationStatus === 'pending' && (
                 <>
                   <button 
                     className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                     onClick={() => handleUpdateStatus(viewModal.id, 'active', 'verified')}
                   >
                     Approve Lender
                   </button>
                   <button 
                     className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md active:scale-95"
                     onClick={() => handleUpdateStatus(viewModal.id, 'suspended', 'rejected')}
                   >
                     Reject Application
                   </button>
                 </>
               )}
               {viewModal.verificationStatus !== 'pending' && (
                 <button className="w-full py-4 bg-[#020617] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md" onClick={() => setViewModal(null)}>Close Profile</button>
               )}
             </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lender" size="md">
        <form onSubmit={handleAddLender} className="space-y-4 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name (Optional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Building size={16} /></div>
                <input 
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all ${errors.businessName ? 'border-rose-500 bg-rose-50/20' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'}`}
                  value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})}
                  placeholder="e.g. Quick Cash Ltd"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Name *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><UserPlus size={16} /></div>
                <input 
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all ${errors.name ? 'border-rose-500 bg-rose-50/20' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'}`}
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Mail size={16} /></div>
                <input 
                   type="email"
                   className="w-full pl-11 pr-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                   value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                   placeholder="lender@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Phone size={16} /></div>
                <input 
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all ${errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'}`}
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="097..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NRC Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><ShieldCheck size={16} /></div>
                <input 
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all ${errors.nrc ? 'border-rose-500 bg-rose-50/20' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'}`}
                  value={form.nrc} onChange={e => {
                    let input = e.target.value;
                    let digits = input.replace(/\D/g, '');
                    let formatted = digits.substring(0, 6);
                    if (digits.length > 6) formatted += '/' + digits.substring(6, 8);
                    if (digits.length > 8) formatted += '/' + digits.substring(8, 9);
                    setForm({...form, nrc: formatted});
                  }}
                  placeholder="123456/78/1"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Reg Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Hash size={16} /></div>
                <input 
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all ${errors.nrc ? 'border-rose-500 bg-rose-50/20' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'}`}
                  value={form.companyRegistrationNumber} onChange={e => setForm({...form, companyRegistrationNumber: e.target.value})}
                  placeholder="e.g. 101/2023"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lender Type *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Building size={16} /></div>
                <select 
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-bold outline-none transition-all appearance-none ${errors.lenderType ? 'border-rose-500 bg-rose-50/20' : 'border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white'}`}
                  value={form.lenderType} onChange={e => setForm({...form, lenderType: e.target.value})}
                >
                  <option value="individual">Individual</option>
                  <option value="micro_lender">Micro Lender</option>
                  <option value="cooperative">Cooperative</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Lock size={16} /></div>
                  <input 
                     type="text"
                     className="w-full pl-11 pr-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                     value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  />
                </div>
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Membership Plan</label>
             <div className="grid grid-cols-3 gap-2">
                {plans.length > 0 ? (
                  plans.map(p => {
                    const value = p.name.toLowerCase();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm({...form, planType: value})}
                        className={`py-3 rounded-xl text-center transition-all ${
                          form.planType === value 
                            ? 'bg-[#020617] text-white shadow-lg' 
                            : 'bg-gray-50 text-slate-400 border border-gray-100'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest block">{p.name}</span>
                        <span className="text-[9px] font-bold block mt-0.5 opacity-70">
                           K{p.price}{value.includes('monthly') ? '/mo' : value.includes('annual') ? '/yr' : ''}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  ['free', 'monthly', 'annual'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-50 text-slate-300 border border-gray-100 opacity-50 cursor-not-allowed"
                    >
                      {p === 'free' ? '🔒 Free' : `⭐ ${p}`}
                    </button>
                  ))
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proof of Licence</label>
              <label className="block w-full border-2 border-dashed border-gray-100 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group/upload relative overflow-hidden">
                 <input type="file" className="hidden" onChange={e => setForm({...form, license: e.target.files[0]})} />
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-slate-400 group-hover/upload:scale-110 group-hover/upload:text-blue-600 transition-all">
                      <Upload size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                        {form.license ? form.license.name : 'Upload License'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {form.license ? 'File selected' : 'PDF, JPG or PNG'}
                      </p>
                    </div>
                 </div>
                 {form.license && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NRC Document</label>
              <label className="block w-full border-2 border-dashed border-gray-100 rounded-2xl p-5 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group/upload relative overflow-hidden">
                 <input type="file" className="hidden" onChange={e => setForm({...form, nrc_document: e.target.files[0]})} />
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-slate-400 group-hover/upload:scale-110 group-hover/upload:text-blue-600 transition-all">
                      <Upload size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                        {form.nrc_document ? form.nrc_document.name : 'Upload NRC'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {form.nrc_document ? 'File selected' : 'PDF, JPG or PNG'}
                      </p>
                    </div>
                 </div>
                 {form.nrc_document && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : 'Register Lender'}
            </button>
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
