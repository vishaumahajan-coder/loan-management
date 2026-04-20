import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, Mail, Phone, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/UI';
import api from '../../services/api';

export default function AdminMembershipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/membership/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch upgrade requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, status) => {
    setProcessing(requestId);
    try {
      await api.post('/membership/handle-request', { requestId, status });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <PageHeader 
        title="Upgrade Requests" 
        subtitle="Review and manage lender membership upgrade applications" 
      />

      {requests.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={32} />
           </div>
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">No Pending Requests</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">All upgrade requests have been processed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                        <User size={24} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h4 className="text-base font-black text-slate-950 uppercase tracking-tight">{request.userName}</h4>
                           <StatusBadge status={request.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {request.email || 'N/A'}</span>
                           <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {request.phone}</span>
                           <span className="flex items-center gap-1.5 text-blue-600 font-black"><CreditCard size={12} /> {request.planName} PLAN</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                     {request.notes && (
                        <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 max-w-md">
                           <p className="text-[10px] text-slate-500 font-bold italic">"{request.notes}"</p>
                        </div>
                     )}
                     
                     {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                           <button 
                              onClick={() => handleAction(request.id, 'approved')}
                              disabled={processing === request.id}
                              className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                           >
                              {processing === request.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              Approve
                           </button>
                           <button 
                              onClick={() => handleAction(request.id, 'rejected')}
                              disabled={processing === request.id}
                              className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                           >
                              {processing === request.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                              Reject
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
