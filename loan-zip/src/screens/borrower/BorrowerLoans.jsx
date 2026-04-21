import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ChevronRight,
  Zap,
  Info,
  DollarSign,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Shield,
  Target,
  FileText,
  Lock,
  Wallet,
  AlertTriangle,
  Calendar
} from 'lucide-react';
// import { mockLoans } from '../../data/mockData';
import { PageHeader, StatusBadge } from '../../components/UI';
import Modal from '../../components/Modal';
import { THEME } from '../../theme';
import api from '../../services/api';

export default function BorrowerLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [manualPaymentTask, setManualPaymentTask] = useState(null); // { loanId, installmentId, amount }
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const fetchLoans = async () => {
    try {
      const resp = await api.get('/loans/my-loans');
      setLoans(resp.data);
      return resp.data;
    } catch (error) {
      console.error('Failed to fetch my loans', error);
      return null;
    } finally {
      setLoading(false);
    }
  };


  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setPlatformSettings(data);
    } catch (error) {
      console.error('Failed to fetch platform settings', error);
    }
  };


  useEffect(() => {
    fetchLoans();
    fetchSettings();
  }, []);

  const activeLoans = loans.filter(l => l.status !== 'paid');

  let totalBorrowed = 0;
  let totalRemaining = 0;
  let totalPaidAmount = 0;
  let totalPaidTimes = 0;

  loans.forEach(loan => {
    const loanAmount = parseFloat(loan.amount) || 0;
    totalBorrowed += loanAmount;
    
    const schedule = loan.instalmentSchedule || [];
    
    // Sum of paid amounts in this loan
    const paidInThisLoan = schedule.reduce((sum, ins) => {
       if (ins.status === 'paid') {
           totalPaidTimes += 1;
           return sum + (parseFloat(ins.paid_amount || ins.amount) || 0);
       }
       return sum;
    }, 0);

    totalPaidAmount += paidInThisLoan;
    if (loan.status !== 'paid') {
        totalRemaining += Math.max(0, loanAmount - paidInThisLoan);
    }
  });

  const handlePayment = async (loanId, installmentId, amount) => {
    if (platformSettings?.online_payment_gateway_enabled === true || platformSettings?.online_payment_gateway_enabled === 'true') {
      alert('Online Payment Gateway integration is coming soon! Please use manual transfer for now.');
      return;
    }

    setManualPaymentTask({ loanId, installmentId, amount });
    setTransactionRef('');
  };

  const confirmManualPayment = async () => {
    if (!transactionRef.trim()) {
      alert('Please enter a transaction reference / ID for tracking.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/loans/${manualPaymentTask.loanId}/payment`, {
        amount: manualPaymentTask.amount,
        method: 'Bank Transfer',
        installmentId: manualPaymentTask.installmentId,
        reference: transactionRef
      });
      
      alert('Payment reference submitted! An admin/lender will verify it. 🎉');
      setManualPaymentTask(null);
      const updatedLoans = await fetchLoans();
      
      // Update the current modal with the new data from the list
      if (updatedLoans) {
        const freshData = updatedLoans.find(l => l.id === manualPaymentTask.loanId);
        if (freshData) setViewModal(freshData);
      } else {
        setViewModal(null); 
      }

    } catch (error) {
       console.error('Payment failed', error);
       alert(error.response?.data?.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <PageHeader title="My Loans" subtitle="Track and manage your active loans and repayments" />

      {/* Small & Attractive Horizontal Exposure Card */}
      <div className="relative bg-[#020617] rounded-[32px] p-6 md:p-8 text-white overflow-hidden shadow-xl group border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#020617] opacity-90 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          {/* Left: Exposure Data */}
          <div className="text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-500/10 backdrop-blur-xl rounded-full border border-emerald-500/20 w-fit mx-auto lg:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Status: Good Standing</p>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-8 pt-2">
              <div>
                <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest mb-1 leading-none">Total Loan</p>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight leading-none mb-3 text-white">{THEME.formatCurrency(totalBorrowed)}</h2>
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-1 leading-none">Total Paid</p>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight leading-none mb-3 text-emerald-400">{THEME.formatCurrency(totalPaidAmount)}</h2>
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest mb-1 leading-none">Remaining Due</p>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight leading-none mb-3 text-amber-400">{THEME.formatCurrency(totalRemaining)}</h2>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
              <div className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-center">
                <p className="text-[10px] font-black text-white uppercase tracking-tight">{activeLoans.length} Active Loans</p>
              </div>
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">{totalPaidTimes} Payments Made</p>
              </div>
            </div>
          </div>
        </div>

      </div>



      <div className="space-y-4 px-1 pb-16">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Loans</h3>
          <Target size={14} className="text-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {loans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => setViewModal(loan)}
              className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm transition-all hover:border-blue-500 group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-600 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#020617] group-hover:text-white transition-all flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-slate-900 uppercase group-hover:text-blue-600 transition-colors tracking-tight leading-none mb-1">Lender: {loan.lenderName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase opacity-70">ID: {loan.id}</p>
                  </div>
                </div>
                <StatusBadge status={loan.status} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 relative z-10 gap-2">
                {/* Next Payment Due */}
                {(() => {
                  const schedule = loan.instalmentSchedule || [];
                  const nextDue = schedule.find(i => i.status === 'pending');
                  const paidCount = schedule.filter(i => i.status === 'paid').length;
                  return (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                          <Calendar size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest leading-none">Next Payment Due</p>
                          <p className="text-[11px] font-black text-slate-800 leading-tight mt-0.5">
                            {nextDue ? THEME.formatDate(nextDue.due_date) : 'All Paid'}
                          </p>
                        </div>
                      </div>
                      <div className="text-center px-2">
                        <p className="text-sm font-black text-green-700 leading-none">{THEME.formatCurrency(nextDue ? nextDue.amount : 0)}</p>
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Amount Due</p>
                      </div>

                      <div className="px-3 py-2 bg-[#020617] rounded-xl text-center min-w-[60px]">
                        <p className="text-sm font-black text-white leading-none">{paidCount}/{schedule.length}</p>
                        <p className="text-[7px] text-blue-400 font-bold uppercase tracking-widest mt-1">Payments Paid</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Loan Tracking" size="sm">
        {viewModal && (() => {
          const totalPaid = (viewModal.instalmentSchedule || []).reduce((s, i) => s + (parseFloat(i.paid_amount) || 0), 0);
          const balance = viewModal.amount - totalPaid;

          return (
            <div className="space-y-6 pb-2">
              <div className="bg-[#020617] p-6 rounded-[32px] text-center text-white relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-blue-900/10 blur-3xl"></div>
                <p className="relative z-10 text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 opacity-70">Remaining Balance</p>
                <h3 className="relative z-10 text-2xl font-black italic tracking-tighter leading-none mb-3">{THEME.formatCurrency(balance)}</h3>

                <div className="relative z-10 flex gap-2 justify-center">
                  <div className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full">
                    <p className="text-[8px] font-black text-white uppercase tracking-widest">Paid: {THEME.formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full">
                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Total: {THEME.formatCurrency(viewModal.amount)}</p>
                  </div>

                </div>
              </div>

              {/* Next Payment Due Summary */}
              {(() => {
                const schedule = viewModal.instalmentSchedule || [];
                const nextDue = schedule.find(i => i.status === 'pending' || i.status === 'missed');
                const paidCount = schedule.filter(i => i.status === 'paid').length;
                const isOverdue = nextDue && new Date(nextDue.due_date) < new Date();
                return (
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 p-3 rounded-2xl border flex items-center gap-3 ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : 'text-amber-600'}`}>
                          {isOverdue ? 'Payment Overdue!' : 'Next Payment Due'}
                        </p>
                        <p className="text-xs font-black text-slate-900 mt-0.5">
                          {nextDue ? THEME.formatDate(nextDue.due_date) : 'All Paid'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-center">
                        <p className="text-lg font-black text-green-700 leading-none">{THEME.formatCurrency(nextDue ? nextDue.amount : 0)}</p>
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Amount Due</p>
                      </div>
                    </div>

                    <div className="px-3 py-2.5 bg-[#020617] rounded-xl text-center min-w-[60px]">
                      <p className="text-base font-black text-white leading-none">{paidCount}/{schedule.length}</p>
                      <p className="text-[7px] text-blue-400 font-bold uppercase tracking-widest mt-1">Payments Paid</p>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Repayment Schedule</h4>
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-left">
                    <table className="w-full border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50">
                             <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                             <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                             <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                             <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {viewModal.instalmentSchedule?.map((ins) => {
                             const isMissed = ins.status === 'missed';
                             return (
                                <tr key={ins.id} className={`transition-all ${isMissed ? 'bg-red-50/50' : ''}`}>
                                   <td className="px-4 py-4">
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${isMissed ? 'bg-red-500 text-white' : 'bg-[#020617] text-white'}`}>
                                         {ins.id}
                                      </div>
                                   </td>
                                   <td className="px-4 py-4">
                                      <p className={`text-sm font-black italic tracking-tighter ${isMissed ? 'text-red-900' : 'text-slate-950'}`}>{THEME.formatCurrency(ins.amount)}</p>

                                   </td>
                                   <td className="px-4 py-4 text-center">
                                      {ins.status === 'pending' || ins.status === 'missed' ? (
                                         <button 
                                            onClick={() => handlePayment(viewModal.id, ins.id, ins.amount)}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-sm shadow-blue-200"
                                         >
                                            Pay Now
                                         </button>
                                      ) : (
                                         <StatusBadge status={ins.status} />
                                      )}
                                   </td>
                                   <td className="px-4 py-4 text-right">
                                      <p className={`text-[10px] font-bold uppercase tracking-tight ${isMissed ? 'text-red-600' : 'text-slate-500'}`}>
                                         {ins.status === 'paid' ? THEME.formatDate(ins.paid_at) : THEME.formatDate(ins.due_date)}
                                      </p>
                                      {isMissed && (
                                         <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-0.5 animate-pulse">Action Due</p>
                                      )}
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="flex justify-center pt-2">
                 <button 
                  onClick={() => setViewModal(null)} 
                  className="px-8 py-3 bg-[#020617] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                 >
                    Close Tracker
                 </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Manual Payment Modal */}
      <Modal 
        isOpen={!!manualPaymentTask} 
        onClose={() => !isSubmitting && setManualPaymentTask(null)} 
        title="Complete Payment" 
        size="sm"
      >
        {manualPaymentTask && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Info size={16} className="text-blue-600" />
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Manual Bank Transfer</h4>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                Please transfer <strong>{THEME.formatCurrency(manualPaymentTask.amount)}</strong> to the bank account below and enter the reference ID.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                  <p className="text-xs font-bold text-slate-900">{platformSettings?.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                  <p className="text-xs font-bold text-slate-900">{platformSettings?.bank_account_name || 'N/A'}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                  <p className="text-lg font-black text-[#020617] tracking-wider font-mono">{platformSettings?.bank_account_number || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IFSC / Branch Code</p>
                  <p className="text-xs font-bold text-slate-900 font-mono uppercase">{platformSettings?.bank_ifsc_code || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Reference / Transaction ID</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. TXN1234567890"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:font-medium placeholder:text-slate-300"
                />
                <Activity size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
              <p className="text-[9px] text-slate-400 italic px-1 font-medium italic">
                * Note: Your record will be updated once the transfer is verified.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={confirmManualPayment}
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Submit Payment Record
                  </>
                )}
              </button>
              <button
                onClick={() => setManualPaymentTask(null)}
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>



    </div>
  );
}
