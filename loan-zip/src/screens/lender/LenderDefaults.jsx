import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Search } from 'lucide-react';
import api from '../../services/api';
// import { mockDefaultLedger } from '../../data/mockData';
import { Btn, PageHeader, EmptyState, ConfirmDialog } from '../../components/UI';
import Modal from '../../components/Modal';

export default function LenderDefaults() {
  const [ledger, setLedger]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [viewModal, setViewModal]   = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loans/lender-defaults');
      setLedger(response.data);
    } catch (error) {
      console.error('Failed to fetch default ledger', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filtered = ledger.filter(d =>
    (d.borrowerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.borrowerNRC || '').includes(search)
  );

  const statusColor = (s) => (s || 'active') === 'active'
    ? { bg: '#fee2e2', text: '#991b1b' }
    : { bg: '#dcfce7', text: '#166534' };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Default Ledger"
        subtitle={`${ledger.length} default entries — Global Shared Ledger`}
      />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          These are default records you have reported. They contribute to the borrower's global
          risk rating visible to all lenders on the network. Only an admin can clear a default entry.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or NRC…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon="✅" title="No defaults recorded"
          description="You haven't flagged any borrowers as defaulted yet." />
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const sc = statusColor(d.status);
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">
                        {d.borrowerName.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{d.borrowerName}</p>
                        <p className="text-xs text-gray-400 font-mono">{d.borrowerNRC}</p>
                      </div>
                    </div>
                    <p className="text-xl font-black text-red-600 mt-2">K{d.defaultAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Loan {d.loanId} · Defaulted {d.defaultDate}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={sc}>
                    {d.status}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => setViewModal(d)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 text-[10px] font-black uppercase text-gray-500 hover:text-blue-600 transition-colors">
                    <Eye size={12}/> View Details
                  </button>
                  <button onClick={() => setDeleteConfirm(d)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Default Entry Details">
        {viewModal && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Entry ID',        value: viewModal.id },
                { label: 'Borrower',        value: viewModal.borrowerName },
                { label: 'NRC',             value: viewModal.borrowerNRC },
                { label: 'Loan ID',         value: viewModal.loanId },
                { label: 'Default Amount',  value: `K${viewModal.defaultAmount.toLocaleString()}` },
                { label: 'Default Date',    value: viewModal.defaultDate },
                { label: 'Reported By',     value: viewModal.lenderName },
                { label: 'Status',          value: viewModal.status },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5 capitalize">{value}</p>
                </div>
              ))}
            </div>
            <Btn variant="ghost" className="w-full" onClick={() => setViewModal(null)}>Close</Btn>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { setLedger(prev => prev.filter(d => d.id !== deleteConfirm?.id)); setDeleteConfirm(null); }}
        title="Remove Default Entry?"
        message={`Remove the default record for ${deleteConfirm?.borrowerName}? This will affect their risk score.`}
        confirmLabel="Remove Entry"
        isDanger
      />
    </div>
  );
}
