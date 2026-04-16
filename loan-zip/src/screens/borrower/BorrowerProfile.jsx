import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge, Btn, PageHeader } from '../../components/UI';
import Modal from '../../components/Modal';
import { LogOut, Phone, UserCheck, Shield, Calendar, Edit3, Lock, Camera, Upload, Gift } from 'lucide-react';
import { THEME } from '../../theme';
import api from '../../services/api';

export default function BorrowerProfile() {
  const { user, logout, updateUser } = useAuth();
  const navigate         = useNavigate();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchRisk = async () => {
    try {
      const statsResp = await api.get('/stats/borrower');
      setRiskData(statsResp.data);
    } catch (error) {
      console.error('Failed to fetch profile stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  const borrowerData = riskData ? {
    risk: riskData.defaultedLoans > 0 ? 'RED' : (riskData.activeLoans > 0 ? 'AMBER' : 'GREEN'),
    totalLoans: riskData.totalLoans,
    totalDefaults: riskData.defaultedLoans,
    activeDefaults: riskData.defaultedLoans,
    dob: THEME.formatDate(THEME.getDOB(riskData) || THEME.getDOB(user))
  } : null;

  const [toastMsg, setToastMsg] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name || '',
        phone: user.phone || '',
        dob: user.dob || ''
      }));
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      setUploading(true);
      const response = await api.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.user) {
        updateUser(response.data.user);
        showToast(`${fieldName === 'license' ? 'ID Proof' : 'Photo'} updated successfully!`);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await api.put('/auth/update-profile', {
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        newPassword: form.newPassword || undefined
      });
      
      showToast('Profile updated successfully! 🚀');
      setEditModal(false);
      fetchRisk();
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="space-y-5">
      <PageHeader title="My Profile" subtitle="Your borrower account" />

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 rounded-t-2xl" style={{ background: THEME.role.borrower.gradient }} />
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-4 relative w-fit">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border-4 border-white shadow-lg flex items-center justify-center text-blue-700 font-black text-2xl overflow-hidden relative group">
              {user?.profile_image_url ? (
                <img 
                  src={api.defaults.baseURL.replace('/api', '') + user.profile_image_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span>{user?.initials || 'BW'}</span>
              )}
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Camera size={20} className="text-white" />
                <span className="text-[8px] font-black uppercase mt-1">Change</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profile_photo')} />
              </label>
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profile_photo')} />
            </label>
          </div>
          <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
          {borrowerData && <div className="mt-1.5"><RiskBadge risk={borrowerData.risk} /></div>}

          <div className="mt-5 space-y-3">
            {[
              { icon: Phone,     label: 'Phone',         value: user?.phone },
              { icon: UserCheck, label: 'NRC Number',    value: user?.nrc || borrowerData?.nrc || '—' },
              { icon: Calendar,  label: 'Date of Birth', value: borrowerData?.dob || '—' },
              { icon: Gift,      label: 'Referral Code', value: user?.referral_code || user?.referralCode || '—' },
              { icon: Shield,    label: 'Account Type',  value: 'Borrower' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon size={15} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <button onClick={() => setEditModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all active:scale-95 text-[11px]">
              <Edit3 size={12} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Profile">
        <div className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Phone Number', key: 'phone', type: 'tel' },
            { label: 'Date of Birth', key: 'dob', type: 'date' },
          ].map(({ label, key, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
              <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
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
          <Btn className="flex-1" onClick={handleUpdateProfile} loading={loading}><Edit3 size={14}/> Save Changes</Btn>
        </div>
      </Modal>

      {/* ID Proof Upload Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Identification Proof (NRC)</h3>
          {user?.license_url ? (
            <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold uppercase">Verified</span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">Pending</span>
          )}
        </div>
        <label className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-gray-600 font-bold text-sm">
          <Upload size={16} />
          {user?.license_url ? 'Update NRC Document' : 'Upload NRC Document'}
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e, 'license')} />
        </label>
        {user?.license_url && (
           <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-[9px] font-black text-blue-600 uppercase italic">Your NRC document is securely attached</span>
              <a href={api.defaults.baseURL.replace('/api', '') + user.license_url} target="_blank" rel="noreferrer" className="text-[9px] bg-blue-600 text-white px-3 py-1.5 rounded-md font-bold uppercase tracking-wider">View</a>
           </div>
        )}
      </div>

      {/* Uploading Overlay */}
      {uploading && (
         <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Processing Transaction...</p>
         </div>
      )}

      {/* Credit Info */}
      {borrowerData && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Credit Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Loans', value: borrowerData.totalLoans },
              { label: 'Defaults',    value: borrowerData.totalDefaults, danger: borrowerData.totalDefaults > 0 },
              { label: 'Active Def.', value: borrowerData.activeDefaults, danger: borrowerData.activeDefaults > 0 },
            ].map(({ label, value, danger }) => (
              <div key={label} className={`rounded-xl p-3 text-center ${danger && value > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className={`text-xl font-black ${danger && value > 0 ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors active:scale-95 bg-white">
          <LogOut size={14}/> Sign Out
        </button>
      </div>

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
