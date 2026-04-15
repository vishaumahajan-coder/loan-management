import React, { useState } from 'react';
import { Search, Loader, Shield, AlertTriangle, UserPlus, ChevronRight, Lock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Btn } from '../../components/UI';
import Modal from '../../components/Modal';
import { THEME } from '../../theme';

export default function LenderSearch() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const { user } = useAuth();
  const isFree = false; 

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    
    try {
      const response = await api.get('/search', { params: { q: query } });
      setResults(Array.isArray(response.data) ? response.data : [response.data]);
      setSearched(true);
    } catch (error) {
      console.error('Search failed', error);
      alert(error.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const directLend = (borrower) => {
    alert(`AUTOMATION: Creating new loan for ${borrower.name}. \n1. Borrower added to your local ledger. \n2. Loan issuance form opened.`);
    setViewModal(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Network Search" subtitle="Identify borrowers by NRC or Phone" />

      {/* Primary Search Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
        <Shield size={32} className="mx-auto mb-4 text-blue-500 opacity-20" />
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-1">Verify Identity</h3>
        <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase">NRC or Phone Number required for search</p>
        
        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 100456/11/1"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {searched && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-sm font-bold text-gray-400">No network matches found.</p>
            </div>
          ) : (
            results.map(b => (
              <div key={b.id} 
                onClick={() => setViewModal(b)}
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                    {b.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{b.name}</p>
                    <p className="text-[9px] font-mono text-gray-400 capitalize">{b.nrc} • Born: {THEME.formatDate(THEME.getDOB(b))}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile/Compliance Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Network Verification" size="lg">
        {viewModal && (() => {
          const loans = []; // Should be fetched or passed if needed
          const hasDefaults = viewModal.totalDefaults > 0 || viewModal.activeDefaults > 0;
          
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-black">
                   {viewModal.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                   <h3 className="text-base font-black text-gray-900 leading-tight">{viewModal.name}</h3>
                   <p className="text-xs font-mono text-gray-500">{viewModal.nrc} • {viewModal.phone}</p>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mt-1">Born: {THEME.formatDate(THEME.getDOB(viewModal))}</p>
                </div>
              </div>

              {/* Compliance Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Active Loans', value: viewModal.activeLoans || 0 },
                  { label: 'Risk Rating', value: viewModal.risk_status || 'GREEN' },
                  { label: 'Total Defaults', value: viewModal.total_defaults || 0 },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-white border border-gray-100 rounded-2xl text-center relative overflow-hidden">
                    {item.label === 'Risk Rating' && isFree && (
                      <div className="absolute inset-0 bg-blue-50/80 backdrop-blur-[1px] flex items-center justify-center">
                         <Lock size={10} className="text-blue-600" />
                      </div>
                    )}
                    <p className={`text-sm font-black ${item.label === 'Risk Rating' && item.value === 'RED' ? 'text-red-500' : 'text-gray-800'}`}>{item.value}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Privacy/Compliance Rules or History */}
              {isFree ? (
                <div className="p-10 bg-blue-50/50 rounded-[40px] border-2 border-dashed border-blue-100 flex flex-col items-center text-center">
                   <Lock size={32} className="text-blue-300 mb-4" />
                   <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Premium Content Restricted</h4>
                   <p className="text-[11px] text-blue-700/60 font-bold leading-relaxed max-w-[240px] mt-2 uppercase italic">Full credit history and deep risk levels are blocked for Free members.</p>
                </div>
              ) : !hasDefaults ? (
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                  <Shield size={20} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-[10px] font-black text-blue-900 uppercase">Privacy Shield Active</p>
                  <p className="text-[9px] text-blue-800 leading-relaxed font-medium mt-1">
                    Full transaction history is protected by compliance rules. 
                    History details are only revealed for accounts with reported defaults.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                   <div className="flex items-center gap-2 mb-1 px-1">
                      <AlertTriangle size={14} className="text-red-500" />
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Public Default Records</p>
                   </div>
                    {(viewModal.defaults || []).map((d, idx) => (
                      <div key={idx} className="p-4 border border-red-100 rounded-2xl bg-red-50/30">
                         <div className="flex justify-between items-start">
                           <div>
                             <p className="text-sm font-black text-gray-800">K{(d.amount || 0).toLocaleString()}</p>
                             <p className="text-[10px] text-gray-500 font-bold uppercase">{d.type} • ID: {d.loan_id}</p>
                           </div>
                          {d.type === 'Collateral' && (
                            <button 
                              onClick={() => alert(`Viewing Collateral for Loan ${d.loan_id}:\n${d.collateral_details || 'Documents: Property Title, Asset Proof'}`)}
                              className="px-3 py-1 bg-white border border-red-200 rounded-lg text-[8px] font-black text-red-600 uppercase hover:bg-red-50 transition-colors"
                            >
                              View Collateral
                            </button>
                          )}
                        </div>
                     </div>
                   ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Btn variant="ghost" className="flex-1" onClick={() => setViewModal(null)}>Close</Btn>
                <button onClick={() => directLend(viewModal)} className="flex-[2] bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 active:scale-95 transition-all">
                  <UserPlus size={14} className="inline mr-2" /> Lend to this Borrower
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
