import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Mail, Shield, Edit2 } from 'lucide-react';
import { PageHeader, Btn } from '../../components/UI';
import Modal from '../../components/Modal';

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || 'admin@lendanet.com',
    newPassword: '',
    confirmPassword: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Admin Profile" subtitle="System administrator account" />

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6 relative">
        <div className="absolute top-5 right-5">
          <Btn size="xs" variant="outline" onClick={() => setEditModal(true)}>
            <Edit2 size={12}/> Edit Profile
          </Btn>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-2xl mx-auto mb-3 border-4 border-blue-50/50">
            {user?.initials || 'AU'}
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{user?.name}</h2>
          <p className="text-blue-600 font-bold text-[11px] uppercase tracking-widest leading-none mt-1">System Administrator</p>
        </div>

        <div className="mt-6 space-y-2 text-left max-w-sm mx-auto">
          {[
            { icon: Mail, label: 'Email Address', value: user?.email || 'admin@lendanet.com' },
            { icon: Shield, label: 'Access Level', value: 'Full System Access' },
            { icon: User, label: 'Username', value: user?.name?.toLowerCase().replace(' ', '.') || 'admin' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100/50">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Icon size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-[13px] font-bold text-gray-800 tracking-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-3.5 rounded-2xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Admin Account">
        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Email Address', key: 'email', type: 'email' },
          ].map(({ label, key, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Update Password</h4>
            <div className="grid grid-cols-1 gap-4">
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
          <Btn className="flex-1" onClick={() => {
            if (form.newPassword && form.newPassword !== form.confirmPassword) {
              showToast('Passwords do not match');
              return;
            }
            setEditModal(false);
            showToast('Admin profile updated');
          }}><Edit2 size={14}/> Save Changes</Btn>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 right-10 z-[60] bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center gap-3 font-bold text-sm animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
