import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Upload, Gift, User, Phone, Mail, Briefcase, Lock, Shield, ChevronRight, CreditCard, Hash, Building } from 'lucide-react';
import axios from 'axios';
import api, { API_BASE_URL } from '../services/api';

const Field = ({ label, icon: Icon, children }) => (
  <div className="group">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1 group-focus-within:text-blue-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none">
        <Icon size={18} />
      </div>
      {children}
    </div>
  </div>
);

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', businessName: '', license: null,
    referralCode: searchParams.get('ref') || '', role: 'lender',
    nrc: '', companyRegistrationNumber: '', lenderType: 'individual', planType: 'free',
  });
  const [platformSettings, setPlatformSettings] = useState(null);

  React.useEffect(() => {
    // Fetch settings on mount
    api.get('/settings').then((res) => setPlatformSettings(res.data)).catch(() => {});
  }, []);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('password', form.password);
    if (form.businessName && form.role === 'lender') formData.append('businessName', form.businessName);
    if (form.referralCode) formData.append('referralCode', form.referralCode);
    if (form.license && form.role === 'lender') formData.append('license', form.license);
    if (form.role === 'lender') {
      if (form.nrc) formData.append('nrc', form.nrc);
      if (form.companyRegistrationNumber) formData.append('companyRegistrationNumber', form.companyRegistrationNumber);
      formData.append('lenderType', form.lenderType);
      formData.append('planType', form.planType);
    }
    formData.append('role', form.role);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      if (form.role === 'borrower') {
        // Borrower doesn't need OTP in this flow as they are active immediately
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        navigate('/otp', { state: { userId: response.data.userId } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col font-['Outfit'] relative overflow-x-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-8 pb-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button onClick={() => navigate('/login')}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 transition-all active:scale-90">
          <ArrowLeft size={20}/>
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
             <Shield size={18} />
           </div>
           <span className="text-sm font-black tracking-tighter text-gray-900 uppercase">Lendan<span className="text-blue-600">et</span></span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Form Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-5 pb-10 pt-4">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Join LendaNet</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.15em]">Create your account</p>
          </div>

          {platformSettings?.borrower_self_registration && (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-100">
              <button
                type="button"
                onClick={() => update('role', 'lender')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${form.role === 'lender' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600 border border-transparent'}`}
              >
                Lender
              </button>
              <button
                type="button"
                onClick={() => update('role', 'borrower')}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${form.role === 'borrower' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600 border border-transparent'}`}
              >
                Borrower
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Full Name" icon={User}>
              <input type="text" placeholder="e.g. James Banda" value={form.name} required
                onChange={e => update('name', e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Phone" icon={Phone}>
                <input type="tel" placeholder="0987654321" value={form.phone} required
                  onChange={e => update('phone', e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              </Field>
              <Field label="Email" icon={Mail}>
                <input type="email" placeholder="you@example.com" value={form.email} required
                  onChange={e => update('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              </Field>
            </div>

            {form.role === 'lender' && (
              <Field label="Business Name (Optional)" icon={Briefcase}>
                <input type="text" placeholder="e.g. Banda Micro-Lending" value={form.businessName}
                  onChange={e => update('businessName', e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              </Field>
            )}

            {form.role === 'lender' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="NRC Number" icon={Hash}>
                    <input type="text" placeholder="XXXXXX/XX/X" value={form.nrc}
                      onChange={e => update('nrc', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
                  </Field>
                  <Field label="Company Reg No (if applicable)" icon={Building}>
                    <input type="text" placeholder="Optional" value={form.companyRegistrationNumber}
                      onChange={e => update('companyRegistrationNumber', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
                  </Field>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Lender Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'individual', label: 'Individual' },
                      { value: 'micro_lender', label: 'Micro Lender' },
                      { value: 'cooperative', label: 'Cooperative' },
                    ].map(t => (
                      <button key={t.value} type="button"
                        onClick={() => update('lenderType', t.value)}
                        className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                          form.lenderType === t.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-gray-400 hover:border-blue-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Membership Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'free', label: 'Free', sub: 'K0' },
                      { value: 'monthly', label: 'Monthly', sub: 'K10/mo' },
                      { value: 'annual', label: 'Annual', sub: 'K100/yr' },
                    ].map(p => (
                      <button key={p.value} type="button"
                        onClick={() => update('planType', p.value)}
                        className={`py-3 rounded-2xl text-center transition-all ${
                          form.planType === p.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-gray-400 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-wider block">{p.label}</span>
                        <span className="text-[9px] font-bold block mt-0.5 opacity-70">{p.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Field label="Referral Code" icon={Gift}>
              <input type="text" placeholder="DANIEL842 (Optional)" value={form.referralCode}
                onChange={e => update('referralCode', e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-black tracking-widest text-blue-600 placeholder:text-gray-200 placeholder:font-medium placeholder:tracking-normal shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" />
            </Field>

            <Field label="Security Password" icon={Lock}>
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} required
                onChange={e => update('password', e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors">
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </Field>

            {/* License Upload */}
            {form.role === 'lender' && (
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Lender's License
                </label>
                <label className="flex flex-col items-center justify-center gap-3 w-full py-8 bg-blue-50/30 border-2 border-dashed border-blue-100 rounded-3xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group/upload relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover/upload:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-wider">
                      {form.license ? 'Document Selected' : 'Upload Proof of License'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tighter">
                      {form.license ? form.license.name : 'Image or PDF (Max 5MB)'}
                    </p>
                  </div>
                  <input type="file" accept="image/*,.pdf" capture="environment" className="hidden"
                    onChange={e => update('license', e.target.files[0])} />
                  {form.license && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </label>
              </div>
            )}

            <button type="submit"
              className="w-full py-4 rounded-2xl font-black text-white text-[12px] tracking-widest uppercase
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                shadow-[0_10px_30px_rgba(220,38,38,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
              {form.role === 'borrower' ? 'Sign Up' : 'Continue to Verify'}
              <ChevronRight size={18} />
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-8">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 font-black hover:underline px-1">Sign In</button>
          </p>
        </div>
      </div>
    </div>
  );
}
