import React, { useState } from 'react';
import { LogOut, Edit2, Phone, Mail, Building, User, Shield, Camera, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Btn, PageHeader } from '../../components/UI';
import Modal from '../../components/Modal';

export default function LenderProfile() {
  const { user, logout, updateUser } = useAuth();
  const navigate         = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="space-y-5">
      <PageHeader title="My Profile" subtitle="Manage your lender account" />

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-700 to-indigo-600" />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative w-fit">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 border-4 border-white shadow-lg flex items-center justify-center text-blue-700 font-black text-2xl overflow-hidden relative group">
                {user?.initials || 'LP'}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={() => showToast('Profile photo updated')} />
                </label>
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera size={12} />
                <input type="file" accept="image/*" capture="user" className="hidden" onChange={() => showToast('Profile photo updated')} />
              </label>
            </div>
            <Btn size="sm" variant="outline" onClick={() => setEditModal(true)}>
              <Edit2 size={14}/> Edit
            </Btn>
          </div>
          <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{user?.businessName}</p>

          <div className="mt-5 space-y-3">
            {[
              { icon: Phone, label: 'Phone',    value: user?.phone },
              { icon: Mail,  label: 'Email',    value: user?.email },
              { icon: Building, label: 'Business', value: user?.businessName },
              { icon: Gift,     label: 'Referral Code', value: user?.referral_code || user?.referralCode || '—' },
              { icon: Shield, label: 'Role',    value: 'Lender' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon size={15} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* License Upload Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Money Lender's License</h3>
          <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">Verified</span>
        </div>
        <label className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-gray-600 font-bold text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          Update Proof Document
          <input type="file" accept="image/*,.pdf" capture="environment" className="hidden" onChange={() => showToast('License document uploaded successfully')} />
        </label>
        <p className="text-[10px] text-gray-400 mt-2 text-center pointer-events-none">Take a picture or upload a PDF</p>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Account Status</h3>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="text-sm font-bold text-green-700">Active & Verified</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Connected to LendaNet shared default network</p>
      </div>

      {/* Sign Out */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors active:scale-95 bg-white"
        >
          <LogOut size={14}/> Sign Out
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Business Name', key: 'businessName', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'tel' },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Security & Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'New Password', key: 'newPassword', type: 'password' },
                { label: 'Confirm Password', key: 'confirmPassword', type: 'password' },
              ].map(({ label, key, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <Btn variant="ghost" className="flex-1" onClick={() => setEditModal(false)}>Cancel</Btn>
          <Btn className="flex-1" onClick={async () => {
            if (form.newPassword && form.newPassword !== form.confirmPassword) {
              showToast('Passwords do not match');
              return;
            }
            try {
              const response = await api.put('/auth/update-profile', form);
              if (response.data && response.data.user) {
                updateUser(response.data.user);
              }
              showToast('Profile updated successfully');
              setEditModal(false);
            } catch (error) {
              showToast(error.response?.data?.message || 'Error updating profile');
            }
          }}><Edit2 size={14}/> Save Changes</Btn>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-80 z-[60] bg-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center gap-3 font-bold text-sm" style={{ animation: 'slideUp 0.3s ease' }}>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">ℹ</div>
          {toastMsg}
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
