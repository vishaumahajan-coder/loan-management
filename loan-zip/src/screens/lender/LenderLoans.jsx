import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
   FileText,
   Search,
   Filter,
   Plus,
   Calendar,
   CreditCard,
   Users,
   ShieldCheck,
   ChevronRight,
   AlertTriangle,
   Zap,
   Upload,
   Camera
} from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/UI';
import Modal from '../../components/Modal';
import { THEME } from '../../theme';

export default function LenderLoans() {
   const location = useLocation();
   const [loans, setLoans] = useState([]);
   const [borrowerOptions, setBorrowerOptions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [viewModal, setViewModal] = useState(null);
   const [isAddingBorrower, setIsAddingBorrower] = useState(false);
   const [collateralEnabled, setCollateralEnabled] = useState(true);
   const [collateralFiles, setCollateralFiles] = useState([]);
   const [newBorrower, setNewBorrower] = useState({ name: '', phone: '', nrc: '', dob: '' });
   const [borrowerNrcFile, setBorrowerNrcFile] = useState(null);
   const [newLoan, setNewLoan] = useState({
      borrowerId: '',
      amount: '',
      interestRate: '',
      instalments: 3,
      loanType: 'Non-collateral',
      guarantorName: '',
      guarantorPhone: '',
      guarantorNrc: ''
   });

   const fetchLoans = async () => {
      try {
         const response = await api.get('/loans');
         setLoans(response.data);
         return response.data;
      } catch (error) {
         console.error('Failed to fetch loans', error);
         return null;
      }
   };


   const fetchBorrowers = async () => {
      try {
         const response = await api.get('/borrowers');
         setBorrowerOptions(response.data);
      } catch (error) {
         console.error('Failed to fetch borrowers', error);
      }
   };

   const fetchSettings = async () => {
      try {
         const { data } = await api.get('/settings');
         const collateralSetting = data.find(s => s.setting_key === 'collateral_upload_enabled');
         setCollateralEnabled(collateralSetting?.setting_value === 'true' || collateralSetting?.setting_value === '1');
      } catch (error) {
         console.error('Failed to fetch settings', error);
      }
   };

   useEffect(() => {
      const loadData = async () => {
         setLoading(true);
         await Promise.all([fetchLoans(), fetchBorrowers(), fetchSettings()]);
         setLoading(false);
      };
      loadData();
   }, []);

   // Handle auto-selected borrower from Search screen
   useEffect(() => {
      if (location.state?.selectedBorrower) {
         const b = location.state.selectedBorrower;
         setNewLoan(prev => ({ ...prev, borrowerId: b.id }));
         setIsModalOpen(true);
         // Clear the state to avoid re-opening on manual refresh
         window.history.replaceState({}, document.title);
      }
   }, [location.state]);

   const filtered = loans.filter(l =>
      (l.borrowerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.id || '').toString().toLowerCase().includes(search.toLowerCase())
   );

   const handleAdd = async () => {
      if (!newLoan.borrowerId || !newLoan.amount) return;
      
      try {
         const data = {
            borrowerId: newLoan.borrowerId,
            amount: newLoan.amount,
            interestRate: newLoan.interestRate,
            installmentsCount: newLoan.instalments,
            type: newLoan.loanType === 'Non-collateral' ? 'Non' : (newLoan.loanType === 'Guaranteed' ? 'Guarantor' : 'Collateral'),
            guarantorName: newLoan.guarantorName,
            guarantorPhone: newLoan.guarantorPhone,
            guarantorNrc: newLoan.guarantorNrc,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + Number(newLoan.instalments) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
         };

         const response = await api.post('/loans', data);
         
         // If Collateral type and files selected, upload them
         if (newLoan.loanType === 'Collateral' && collateralEnabled && collateralFiles.length > 0) {
            const formData = new FormData();
            collateralFiles.forEach(file => formData.append('files', file));
            formData.append('description', newLoan.collateral || 'Collateral Documents');

            await api.post(`/loans/${response.data.loanId}/collateral`, formData, {
               headers: { 'Content-Type': 'multipart/form-data' }
            });
         }

         setIsModalOpen(false);
         setCollateralFiles([]); // Clear
         fetchLoans();
      } catch (error) {
         console.error('Error creating loan', error);
         alert(error.response?.data?.message || 'Error creating loan');
      }
   };

   const handleAddBorrower = async () => {
      if (!newBorrower.name || !newBorrower.phone || !newBorrower.nrc) return;

      try {
         const formData = new FormData();
         formData.append('name', newBorrower.name);
         formData.append('nrc', newBorrower.nrc);
         formData.append('phone', newBorrower.phone);
         if (newBorrower.dob) formData.append('dob', newBorrower.dob);
         if (borrowerNrcFile) formData.append('nrc_document', borrowerNrcFile);

         const { data } = await api.post('/borrowers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });
         const { borrowerId } = data;
         await fetchBorrowers();
         setNewLoan({ ...newLoan, borrowerId });
         setIsAddingBorrower(false);
         setNewBorrower({ name: '', phone: '', nrc: '', dob: '' });
         setBorrowerNrcFile(null);
         alert('Borrower added successfully!');
      } catch (error) {
         console.error('Error adding borrower', error);
         alert(error.response?.data?.message || 'Failed to add borrower');
      }
   };

   const handleRecordPayment = async (loanId, installmentId, amount) => {
      try {
         await api.post(`/loans/${loanId}/payment`, {
            amount,
            method: 'Cash/Manual',
            installmentId
         });
         alert('Payment recorded successfully! ✅');
         const updatedLoans = await fetchLoans();
         if (updatedLoans) {
            const freshData = updatedLoans.find(l => l.id === loanId);
            if (freshData) setViewModal(freshData);
         } else {
            setViewModal(null);
         }

      } catch (error) {
         console.error('Failed to record payment', error);
         alert(error.response?.data?.message || 'Failed to record payment');
      }
   };

   const handleMarkDefault = async (loanId) => {
      if (!window.confirm("Are you sure you want to mark this loan as DEFAULT? This will report the borrower to the global network.")) return;
      
      try {
         await api.put(`/loans/${loanId}/default`);
         alert('Loan marked as default and added to shared ledger! 🚨');
         fetchLoans();
         setViewModal(null);
      } catch (error) {
         console.error('Failed to mark default', error);
         alert(error.response?.data?.message || 'Failed to mark default');
      }
   };

   const handleReversePayment = async (loanId, installmentId) => {
      if (!window.confirm("Are you sure you want to REVERSE this payment? This will mark the instalment as UNPAID.")) return;
      
      try {
         await api.post(`/loans/${loanId}/reverse-payment`, {
            installmentId
         });
         alert('Payment reversed successfully! 🔄');
         const updatedLoans = await fetchLoans();
         if (updatedLoans) {
            const freshData = updatedLoans.find(l => l.id === loanId);
            if (freshData) setViewModal(freshData);
         } else {
            setViewModal(null);
         }

      } catch (error) {
         console.error('Failed to reverse payment', error);
         alert(error.response?.data?.message || 'Failed to reverse payment');
      }
   };

   return (
      <div className="space-y-8 pb-10">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <PageHeader
               title="My Loans"
               subtitle="Manage all money you have lent out"
            />
            <button
               onClick={() => setIsModalOpen(true)}
               className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-red-700 transition-colors flex items-center gap-2"
            >
               <Plus size={16} /> Give A Loan
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
               <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard size={24} />
               </div>
               <div>
                  <p className="text-xs text-gray-500 font-medium">Total Lent</p>
                  <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">{THEME.formatCurrency(loans.reduce((s, l) => s + Number(l.amount || 0), 0))}</h3>

               </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
               <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={24} />
               </div>
               <div>
                  <p className="text-xs text-gray-500 font-medium">Active Borrowers</p>
                  <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">{loans.filter(l => l.status !== 'paid').length}</h3>
               </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
               <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <p className="text-xs text-gray-500 font-medium">Network Safety</p>
                  <h3 className="text-xl font-bold text-gray-900 leading-none mt-1">92%</h3>
               </div>
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by ID or Name..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:border-blue-500 outline-none transition-all"
               />
            </div>
            <button onClick={() => alert('Advanced filtering coming soon!')} className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2">
               <Filter size={16} /> Filters
            </button>
         </div>

         <div className="space-y-3">
            {filtered.map(l => (
               <div
                  key={l.id}
                  onClick={() => setViewModal(l)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-500 transition-all"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <FileText size={18} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">{l.borrowerName}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                           <span>ID: {l.id}</span>
                           <span className="text-blue-600">{l.loanType}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-8">
                     <div className="text-right hidden sm:block">
                        <p className="text-base font-bold text-gray-900">{THEME.formatCurrency(l.amount)}</p>

                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Amount</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <StatusBadge status={l.status} />
                        <ChevronRight size={16} className="text-gray-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Give A New Loan">
            <div className="space-y-6">
               <div className="space-y-4">
                  <div className="space-y-1.5 flex flex-col">
                     <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Borrower</label>
                        {!isAddingBorrower && (
                           <button onClick={(e) => { e.preventDefault(); setIsAddingBorrower(true); }} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">+ Add New</button>
                        )}
                     </div>

                     {isAddingBorrower ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                           <input type="text" placeholder="Full Name" value={newBorrower.name} onChange={e => setNewBorrower({...newBorrower, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                           <input type="text" placeholder="NRC Number" value={newBorrower.nrc} onChange={e => setNewBorrower({...newBorrower, nrc: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                           <input type="text" placeholder="Phone Number" value={newBorrower.phone} onChange={e => setNewBorrower({...newBorrower, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                              <input type="date" value={newBorrower.dob} onChange={e => setNewBorrower({...newBorrower, dob: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                           </div>
                           <label className="flex items-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                              <Upload size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
                                 {borrowerNrcFile ? borrowerNrcFile.name : 'Upload NRC Photo / Document'}
                              </span>
                              <input type="file" accept="image/*,.pdf" capture="environment" className="hidden" onChange={e => setBorrowerNrcFile(e.target.files[0])} />
                              {borrowerNrcFile && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />}
                           </label>
                           <div className="flex gap-2 pt-1">
                              <button onClick={(e) => { e.preventDefault(); handleAddBorrower(); }} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700">Save Borrower</button>
                              <button onClick={(e) => { e.preventDefault(); setIsAddingBorrower(false); }} className="px-3 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                           </div>
                        </div>
                     ) : (
                        <select
                           value={newLoan.borrowerId}
                           onChange={e => setNewLoan({ ...newLoan, borrowerId: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                           <option value="">Select Borrower...</option>
                           {borrowerOptions.map(b => (
                              <option key={b.id} value={b.id}>{b.name} ({b.nrc})</option>
                           ))}
                        </select>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Amount (K)</label>
                         <input
                           type="number"
                           value={newLoan.amount}
                           onChange={e => setNewLoan({ ...newLoan, amount: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                           placeholder="0.00"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Interest (%)</label>
                        <input
                           type="number"
                           value={newLoan.interestRate}
                           onChange={e => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                           placeholder="0"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Repayments</label>
                     <select
                        value={newLoan.instalments}
                        onChange={e => setNewLoan({ ...newLoan, instalments: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                     >
                        {[1, 2, 3, 4, 5, 6, 12, 18, 24, 36, 48, 60].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Month' : 'Months'}</option>)}
                     </select>
                  </div>

                  {newLoan.amount && (
                     <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                        <div>
                           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Total Payable</p>
                           <h4 className="text-lg font-black text-blue-900 mt-1">{THEME.formatCurrency(Number(newLoan.amount) + (Number(newLoan.amount) * (Number(newLoan.interestRate) || 0) / 100))}</h4>
                        </div>

                        <div className="text-right">
                           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Per Month</p>
                           <h4 className="text-sm font-black text-blue-900 mt-1">{THEME.formatCurrency(Math.ceil((Number(newLoan.amount) + (Number(newLoan.amount) * (Number(newLoan.interestRate) || 0) / 100)) / (Number(newLoan.instalments) || 1)))}</h4>
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

                  {newLoan.loanType === 'Collateral' && (
                     <div className="space-y-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in zoom-in-95 duration-300">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Asset Details</label>
                           <textarea
                              className="w-full p-4 bg-white border border-blue-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                              placeholder="e.g. Toyota Vitz 2012, Reg BAA 4455..."
                              value={newLoan.collateral}
                              onChange={e => setNewLoan({ ...newLoan, collateral: e.target.value })}
                           />
                        </div>
                        {collateralEnabled && (
                           <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                 <label className="cursor-pointer py-3 bg-white border-2 border-dashed border-blue-200 rounded-xl text-[9px] font-black text-blue-600 uppercase hover:bg-blue-600 hover:text-white transition-all text-center block">
                                    Upload Agreement
                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,image/*" onChange={(e) => setCollateralFiles(prev => [...prev, ...e.target.files])} />
                                 </label>
                                 <label className="cursor-pointer py-3 bg-white border-2 border-dashed border-blue-200 rounded-xl text-[9px] font-black text-blue-600 uppercase hover:bg-blue-600 hover:text-white transition-all text-center block">
                                    Upload Photos
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => setCollateralFiles(prev => [...prev, ...e.target.files])} />
                                 </label>
                              </div>
                              {collateralFiles.length > 0 && (
                                 <div className="text-[10px] font-bold text-blue-800 text-center uppercase tracking-widest bg-blue-100 py-1.5 rounded-lg border border-blue-200">
                                    {collateralFiles.length} file(s) selected
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  )}

                  {newLoan.loanType === 'Guaranteed' && (
                     <div className="space-y-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-200 animate-in zoom-in-95 duration-300">
                        <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-200 flex items-start gap-3">
                           <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                           <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                              LENDER RESPONSIBILITY: You are required to physically verify the guarantor's identity and obtain their direct consent. The system will not verify this on your behalf.
                           </p>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest ml-1">Guarantor Details</label>
                           <input type="text" placeholder="Full Name" value={newLoan.guarantorName} onChange={e => setNewLoan({...newLoan, guarantorName: e.target.value})} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:border-amber-500 bg-white" />
                           <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="Phone Number" value={newLoan.guarantorPhone} onChange={e => setNewLoan({...newLoan, guarantorPhone: e.target.value})} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:border-amber-500 bg-white" />
                              <input type="text" placeholder="NRC Number" value={newLoan.guarantorNrc} onChange={e => setNewLoan({...newLoan, guarantorNrc: e.target.value})} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:border-amber-500 bg-white" />
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                     <AlertTriangle size={14} className="text-amber-500" />
                     <p className="text-[9px] font-bold text-amber-700 uppercase leading-tight">Rule: 3 missed payments will automatically mark this loan as "DEFAULT".</p>
                  </div>
               </div>

               <div className="flex gap-4 pt-2">
                  <button
                     onClick={handleAdd}
                     className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-xs font-bold hover:bg-red-700 transition-all active:scale-95"
                  >
                     Confirm Loan
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all">Cancel</button>
               </div>
            </div>
         </Modal>

         {/* Loan Info Modal */}
         <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Loan Ledger" size="lg">
            {viewModal && (() => {
               const schedule = viewModal.instalmentSchedule || [];
               const totalRecovered = schedule.reduce((s, i) => i.status === 'paid' ? s + Number(i.amount || 0) : s, 0);
               const remaining = viewModal.amount - totalRecovered;

               return (
                  <div className="space-y-6">
                     <div className="bg-[#020617] p-6 rounded-3xl text-white relative overflow-hidden shadow-xl group border border-blue-500/10">
                        <div className="absolute inset-0 bg-blue-900/10 blur-3xl group-hover:bg-blue-900/20 transition-all"></div>
                        <div className="relative z-10 flex flex-col items-center">
                           <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest mb-1.5 leading-none">Total Outstanding</p>
                           <h3 className="text-3xl font-black tracking-tight leading-none mb-4 italic">{THEME.formatCurrency(remaining)}</h3>


                           <div className="flex gap-2">
                              <div className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full flex flex-col items-center min-w-[80px]">
                                 <p className="text-white text-[11px] font-black leading-none">{THEME.formatCurrency(totalRecovered)}</p>
                                 <p className="text-[7px] text-blue-400 font-bold uppercase tracking-widest mt-1">Recovered</p>
                              </div>
                              <div className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full flex flex-col items-center min-w-[80px]">
                                 <p className="text-blue-300 text-[11px] font-black leading-none">{THEME.formatCurrency(viewModal.amount)}</p>
                                 <p className="text-[7px] text-blue-400 font-bold uppercase tracking-widest mt-1">Initial</p>
                              </div>
                           </div>

                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repayment Schedule</h4>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Detailed Ledger Table</p>
                        </div>
                        
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-slate-50/50">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ref</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                 {viewModal.instalmentSchedule?.map((ins) => {
                                    const isOverdue = ins.status === 'pending' && new Date(ins.dueDate || ins.due_date) < new Date();
                                    return (
                                       <tr key={ins.id} className={`transition-all hover:bg-slate-50/50 ${isOverdue ? 'bg-red-50/50' : ''}`}>
                                          <td className="px-4 py-4">
                                             <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${isOverdue ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-900 shadow-inner'}`}>
                                                {ins.id}
                                             </span>
                                          </td>
                                          <td className="px-4 py-4">
                                             <p className={`text-sm font-black italic tracking-tighter ${isOverdue ? 'text-red-900' : 'text-slate-950'}`}>{THEME.formatCurrency(ins.amount)}</p>

                                          </td>
                                          <td className="px-4 py-4 text-center">
                                             {ins.status === 'pending' ? (
                                                <div className="flex flex-col items-center gap-1">
                                                   <button 
                                                      onClick={() => handleRecordPayment(viewModal.id, ins.id, ins.amount)}
                                                      className={`px-3 py-1.5 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${isOverdue ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}
                                                   >
                                                      Record
                                                   </button>
                                                   {isOverdue && <span className="text-[7px] font-black text-red-500 uppercase tracking-tighter animate-pulse">Missed</span>}
                                                </div>
                                             ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                   <StatusBadge status={ins.status} />
                                                   {ins.status === 'paid' && (
                                                      <button 
                                                         onClick={(e) => { e.stopPropagation(); handleReversePayment(viewModal.id, ins.id); }}
                                                         className="text-[7px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors mt-0.5"
                                                      >
                                                         (Revert)
                                                      </button>
                                                   )}
                                                </div>
                                             )}
                                          </td>
                                          <td className="px-4 py-4 text-center">
                                             <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                                                {ins.reference || ins.transaction_reference || '-'}
                                             </p>
                                          </td>
                                          <td className="px-4 py-4 text-right">
                                             <p className={`text-[10px] font-bold uppercase tracking-tight ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                                                {ins.status === 'paid' ? THEME.formatDate(ins.paidDate || ins.paid_at) : THEME.formatDate(ins.dueDate || ins.due_date)}
                                             </p>
                                             {isOverdue && (
                                                <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-0.5 animate-pulse">OVERDUE</p>
                                             )}
                                          </td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     <div className="flex gap-3 justify-center pt-2">
                        {viewModal.status !== 'paid' && viewModal.status !== 'default' && (
                           <button 
                              onClick={() => handleMarkDefault(viewModal.id)}
                              className="px-6 py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
                           >
                              Mark As Default
                           </button>
                        )}
                        <button 
                           onClick={() => setViewModal(null)} 
                           className="px-8 py-3 bg-[#020617] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                        >
                           Close Entry
                        </button>
                     </div>
                  </div>
               );
            })()}
         </Modal>
      </div>
   );
}
