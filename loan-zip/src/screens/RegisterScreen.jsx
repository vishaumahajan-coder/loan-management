import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Upload, Gift, User, Phone, Mail, Briefcase, Lock, Shield, ChevronRight, CreditCard, Hash, Building, Calendar, Camera } from 'lucide-react';
import axios from 'axios';
import api, { API_BASE_URL } from '../services/api';
import Swal from 'sweetalert2';
import { THEME } from '../theme';

const Field = ({ label, icon: Icon, children }) => (
  <div className="group">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 px-1 group-focus-within:text-blue-600 transition-colors">
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
    photo: null, nrc_document: null,
    referralCode: searchParams.get('ref') || '', role: 'lender',
    nrc: '', dob: '', companyRegistrationNumber: '', lenderType: 'individual', planType: 'free',
  });
  const [platformSettings, setPlatformSettings] = useState(null);

  const [membershipPlans, setMembershipPlans] = useState([]);

  React.useEffect(() => {
    // Fetch settings on mount
    api.get('/settings').then((res) => setPlatformSettings(res.data)).catch(() => { });
    api.get('/membership/plans').then((res) => setMembershipPlans(res.data)).catch((err) => console.log('Err plans', err));
  }, []);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one special character.',
        confirmButtonColor: '#3B82F6'
      });
      setLoading(false);
      return;
    }

    try {
      let response;

      if (form.role === 'lender') {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('phone', form.phone);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('role', form.role);
        if (form.nrc) formData.append('nrc', form.nrc);
        if (form.businessName) formData.append('businessName', form.businessName);
        if (form.companyRegistrationNumber) formData.append('companyRegistrationNumber', form.companyRegistrationNumber);
        if (form.referralCode) formData.append('referralCode', form.referralCode);
        if (form.dob) formData.append('dob', form.dob);
        formData.append('lenderType', form.lenderType);
        formData.append('planType', form.planType);
        if (form.license) formData.append('license', form.license);
        if (form.nrc_document) formData.append('nrc_document', form.nrc_document);
        if (form.photo) formData.append('photo', form.photo);

        response = await api.post('/auth/register', formData);

        await Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Welcome to LendaNet. Your account is being verified.',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Continue to Verify'
        });
      } else {
        // Borrower - Send as FormData to include attached files
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('phone', form.phone);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('role', form.role);
        formData.append('nrc', form.nrc);
        formData.append('dob', form.dob);
        formData.append('date_of_birth', form.dob);
        if (form.referralCode) formData.append('referralCode', form.referralCode);

        if (form.photo) formData.append('photo', form.photo);
        if (form.nrc_document) formData.append('nrc_document', form.nrc_document);

        response = await api.post('/auth/register', formData);
      }

      if (form.role === 'borrower') {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Registration successful! Please login.',
          confirmButtonColor: '#3B82F6'
        });
        navigate('/login');
      } else {
        navigate('/otp', { state: { userId: response.data.userId } });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      Swal.fire({
        icon: 'error',
        title: 'Registration Error',
        text: errorMsg,
        confirmButtonColor: '#EF4444'
      });
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
          <ArrowLeft size={20} />
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-5 pb-8 pt-4">
        <div className="w-full max-w-[500px]">
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Join LendaNet</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.15em]">Create your account</p>
          </div>

          {platformSettings?.borrower_self_registration && (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-100">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" icon={User}>
              <input type="text" placeholder="e.g. James Banda" value={form.name} required
                onChange={e => update('name', e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Phone" icon={Phone}>
                <input type="tel" placeholder="0987654321" value={form.phone} required
                  onChange={e => update('phone', e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              </Field>
              <Field label="Email" icon={Mail}>
                <input type="email" placeholder="you@example.com" value={form.email} required
                  onChange={e => update('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              </Field>
            </div>

            {form.role === 'lender' && (
              <Field label="Business Name (Optional)" icon={Briefcase}>
                <input type="text" placeholder="e.g. Banda Micro-Lending" value={form.businessName}
                  onChange={e => update('businessName', e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              </Field>
            )}

            {(form.role === 'lender' || form.role === 'borrower') && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="NRC Number" icon={Hash}>
                    <input type="text" placeholder="XXXXXX/XX/X" value={form.nrc} required
                      onChange={e => update('nrc', e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
                  </Field>
                  <Field label="Date of Birth" icon={Calendar}>
                    <input type="date" value={form.dob} required
                      onChange={e => update('dob', e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
                  </Field>
                </div>

                {form.role === 'borrower' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 px-1">
                        Borrower Photo
                      </label>
                      <label className="flex flex-col items-center justify-center gap-1.5 w-full py-4 bg-white border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all relative overflow-hidden">
                        <Camera size={20} className="text-gray-400" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center px-2 truncate w-full">
                          {form.photo ? form.photo.name : 'Take / Upload Photo'}
                        </span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" 
                          onChange={e => update('photo', e.target.files[0])} />
                        {form.photo && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                      </label>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 px-1">
                        NRC Document
                      </label>
                      <label className="flex flex-col items-center justify-center gap-1.5 w-full py-4 bg-white border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all relative overflow-hidden">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center px-2 truncate w-full">
                          {form.nrc_document ? form.nrc_document.name : 'Upload NRC Copy'}
                        </span>
                        <input type="file" accept="image/*,.pdf" capture="environment" className="hidden" 
                          onChange={e => update('nrc_document', e.target.files[0])} />
                        {form.nrc_document && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                      </label>
                    </div>
                  </div>
                )}

                {form.role === 'lender' && (
                  <div className="mt-2">
                    <Field label="Company Reg No (if applicable)" icon={Building}>
                      <input type="text" placeholder="Optional" value={form.companyRegistrationNumber}
                        onChange={e => update('companyRegistrationNumber', e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
                    </Field>
                  </div>
                )}

                {form.role === 'lender' && (
                  <>
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
                            className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${form.lenderType === t.value
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
                        {membershipPlans.length > 0 ? (
                           membershipPlans.map(p => {
                             const value = p.name.toLowerCase();
                             const label = p.name;
                             let subLabel = THEME.formatCurrency(p.price);
                             if (value.includes('monthly')) subLabel += '/mo';
                             if (value.includes('annual')) subLabel += '/yr';
                             
                             return (
                               <button key={p.id} type="button"
                                 onClick={() => update('planType', value)}
                                 className={`py-3 rounded-2xl text-center transition-all ${form.planType === value
                                   ? 'bg-blue-600 text-white shadow-md'
                                   : 'bg-white border border-slate-200 text-gray-400 hover:border-blue-300'
                                   }`}
                               >
                                 <span className="text-[11px] font-black uppercase tracking-wider block">{label}</span>
                                 <span className="text-[9px] font-bold block mt-0.5 opacity-70">{subLabel}</span>
                               </button>
                             );
                           })
                        ) : (
                          [
                            { value: 'free', label: 'Free', sub: 'K0.00' },
                            { value: 'monthly', label: 'Monthly', sub: 'K0.00' },
                            { value: 'annual', label: 'Annual', sub: 'K0.00' },
                          ].map(p => (
                            <button key={p.value} type="button"
                              className="py-3 rounded-2xl text-center bg-white border border-slate-200 text-gray-400 opacity-50 cursor-not-allowed"
                            >
                              <span className="text-[11px] font-black uppercase tracking-wider block">{p.label}</span>
                              <span className="text-[9px] font-bold block mt-0.5 opacity-70">Loading...</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <Field label="Referral Code" icon={Gift}>
              <input type="text" placeholder="DANIEL842 (Optional)" value={form.referralCode}
                onChange={e => update('referralCode', e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-black tracking-widest text-blue-600 placeholder:text-gray-200 placeholder:font-medium placeholder:tracking-normal shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" />
            </Field>

            <Field label="Security Password" icon={Lock}>
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} required
                onChange={e => update('password', e.target.value)}
                className="w-full pl-12 pr-12 py-2.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-bold shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none placeholder:text-gray-200 placeholder:font-medium" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>
            <p className="text-[10px] text-gray-500 font-bold px-1 mt-1 leading-relaxed">
              <span className="text-blue-500 font-black">NOTE:</span> Password must contain at least 8 characters, one uppercase, one lowercase, and one special character (@#$%^&*).
            </p>

            {/* Photo, License & NRC Upload - Premium Single Row */}
            {form.role === 'lender' && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Your Photo */}
                  <div className="group">
                    <label className="flex flex-col items-center justify-center gap-4 w-full py-10 bg-blue-600/5 border-2 border-dashed border-blue-200 rounded-[2rem] cursor-pointer hover:bg-blue-600/10 hover:border-blue-400 transition-all group/upload relative overflow-hidden text-center shadow-sm h-full">
                      <div className="text-blue-500 group-hover/upload:scale-110 transition-transform">
                        <Camera size={32} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.12em]">
                          {form.photo ? 'Photo Ready' : 'Take / Upload Photo'}
                        </p>
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider opacity-60 truncate max-w-[120px] mx-auto">
                          {form.photo ? form.photo.name : 'Your Photo'}
                        </p>
                      </div>
                      <input type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={e => update('photo', e.target.files[0])} />
                      {form.photo && <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg" />}
                    </label>
                  </div>

                  {/* Lender's License */}
                  <div className="group">
                    <label className="flex flex-col items-center justify-center gap-4 w-full py-10 bg-blue-600/5 border-2 border-dashed border-blue-200 rounded-[2rem] cursor-pointer hover:bg-blue-600/10 hover:border-blue-400 transition-all group/upload relative overflow-hidden text-center shadow-sm h-full">
                      <div className="text-blue-500 group-hover/upload:scale-110 transition-transform">
                        <Upload size={32} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.12em]">
                          {form.license ? 'License Ready' : 'Upload License'}
                        </p>
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider opacity-60 truncate max-w-[120px] mx-auto">
                          {form.license ? form.license.name : 'Proof of License'}
                        </p>
                      </div>
                      <input type="file" accept="image/*,.pdf" capture="environment" className="hidden"
                        onChange={e => update('license', e.target.files[0])} />
                      {form.license && <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg" />}
                    </label>
                  </div>

                  {/* NRC Copy */}
                  <div className="group">
                    <label className="flex flex-col items-center justify-center gap-4 w-full py-10 bg-blue-600/5 border-2 border-dashed border-blue-200 rounded-[2rem] cursor-pointer hover:bg-blue-600/10 hover:border-blue-400 transition-all group/upload relative overflow-hidden text-center shadow-sm h-full">
                      <div className="text-blue-500 group-hover/upload:scale-110 transition-transform">
                        <Upload size={32} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.12em]">
                          {form.nrc_document ? 'NRC Ready' : 'Upload NRC Copy'}
                        </p>
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider opacity-60 truncate max-w-[120px] mx-auto">
                          {form.nrc_document ? form.nrc_document.name : 'NRC Document'}
                        </p>
                      </div>
                      <input type="file" accept="image/*,.pdf" capture="environment" className="hidden"
                        onChange={e => update('nrc_document', e.target.files[0])} />
                      {form.nrc_document && <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg" />}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button type="submit"
              className="w-full py-4 rounded-2xl font-black text-white text-[12px] tracking-widest uppercase
                bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                shadow-[0_10px_30px_rgba(220,38,38,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6">
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
