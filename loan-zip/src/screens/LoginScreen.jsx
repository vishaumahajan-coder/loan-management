import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle, Building2, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../theme';

const ROLE_ICONS = { 
  lender: <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl shadow-sm border border-emerald-100 group-hover:scale-110 transition-transform"><Building2 size={24} /></div>, 
  admin: <div className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl shadow-sm border border-rose-100 group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>, 
  borrower: <div className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-500 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform"><User size={24} /></div> 
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(identifier.trim(), password);
      if (result.success) {
        if (result.role === 'admin')    navigate('/admin/dashboard');
        else if (result.role === 'lender') navigate('/lender/dashboard');
        else navigate('/borrower/dashboard');
      } else {
        setError('Invalid credentials. Check the demo roles below.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autoFill = (cred) => {
    setIdentifier(cred.email || cred.phone || '');
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col lg:flex-row font-['Outfit'] overflow-hidden">
      
      {/* LEFT SIDE: BRANDING AREA (Matches Screenshot) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative overflow-hidden bg-[#0A2684] h-full">
        {/* Techy Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A2684] via-[#1034A6] to-[#0A2684] opacity-95"></div>
          {/* Subtle tech dots/lines simulation */}
          <div className="absolute inset-0 opacity-[0.08]" 
               style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-400/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="relative z-10 w-full h-full p-8 lg:p-10 xl:p-12 2xl:p-16 flex flex-col justify-between text-white overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
             <div className="w-9 h-9 xl:w-11 xl:h-11 rounded-xl border-2 border-white/30 flex items-center justify-center backdrop-blur-md bg-white/5">
                <Shield size={20} className="text-white xl:hidden" />
                <Shield size={24} className="text-white hidden xl:block" />
             </div>
             <span className="text-lg xl:text-xl font-black tracking-[0.2em] uppercase">LENDANET</span>
          </div>

          {/* Main Slogan & Features */}
          <div className="max-w-lg my-6 xl:my-0 shrink-0">
             <h2 className="text-4xl xl:text-5xl 2xl:text-[68px] font-black leading-[1.05] mb-6 2xl:mb-10 tracking-tighter italic">
                Empowering <br/>
                <span className="not-italic text-white">Micro-Lenders.</span>
             </h2>

             <ul className="space-y-4 2xl:space-y-6">
                {[
                   { title: 'SHARED RISK LEDGER', desc: 'Real-time default reporting.' },
                   { title: 'NRC VERIFICATION', desc: 'Instant identity checks.' },
                   { title: 'SMS NOTIFICATIONS', desc: 'Automatic payment reminders.' }
                ].map((item, i) => (
                   <li key={i} className="flex items-start gap-4">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.8)] flex-shrink-0" />
                      <div>
                         <p className="font-black text-[13px] xl:text-[14px] uppercase tracking-[0.1em] leading-none mb-1 shadow-sm">{item.title}</p>
                         <p className="text-blue-100/50 text-[12px] xl:text-[13px] font-semibold">{item.desc}</p>
                      </div>
                   </li>
                ))}
             </ul>

             {/* Testimonial Panel */}
             <div className="mt-8 2xl:mt-14 p-5 2xl:p-8 rounded-[24px] 2xl:rounded-[36px] bg-white/5 border border-white/10 backdrop-blur-2xl max-w-sm shadow-2xl transition-all hover:bg-white-[0.07]">
                <p className="text-blue-50/80 text-[13px] 2xl:text-[14px] font-bold leading-relaxed italic mb-4 2xl:mb-6">
                   "Default rates dropped by 40% in 3 months. Essential for Zambian lenders."
                </p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-full bg-blue-600/30 border border-white/20 flex items-center justify-center">
                      <User size={14} className="text-blue-200 2xl:hidden" />
                      <User size={16} className="text-blue-200 hidden 2xl:block" />
                   </div>
                   <div>
                      <p className="text-[11px] 2xl:text-[12px] font-black uppercase tracking-widest leading-none">Mwaba K. <span className="text-blue-400 font-bold ml-1 opacity-70">Lender</span></p>
                   </div>
                </div>
             </div>
          </div>

          {/* Bottom Indicators */}
          <div className="flex gap-12 xl:gap-16 pt-6 2xl:pt-8 border-t border-white/5 shrink-0">
             <div>
                <p className="text-3xl xl:text-4xl 2xl:text-[42px] font-black text-white leading-none tracking-tighter">2.4k+</p>
                <p className="text-[9px] 2xl:text-[10px] font-black text-blue-300/40 uppercase tracking-[0.4em] 2xl:tracking-[0.5em] mt-2 2xl:mt-3">Lenders</p>
             </div>
             <div>
                <p className="text-3xl xl:text-4xl 2xl:text-[42px] font-black text-white leading-none tracking-tighter">150k+</p>
                <p className="text-[9px] 2xl:text-[10px] font-black text-blue-300/40 uppercase tracking-[0.4em] 2xl:tracking-[0.5em] mt-2 2xl:mt-3">Profiles</p>
             </div>
          </div>
        </div>
      </div>


      {/* RIGHT SIDE: FORM AREA (Matches Screenshot) */}
      <div className="flex-1 lg:w-[45%] xl:w-[42%] bg-white flex flex-col justify-center items-center p-8 h-full relative overflow-y-auto">
        <div className="w-full max-w-[420px]">
          
          {/* Welcome Text */}
          <div className="mb-4 text-center lg:text-left">
            <h2 className="text-[28px] xl:text-[34px] font-black text-gray-900 tracking-tighter leading-none mb-1">Welcome Back</h2>
            <p className="text-gray-400 font-bold text-[8px] uppercase tracking-[0.2em] opacity-80">SIGN IN TO YOUR DASHBOARD</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-shake">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="group">
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5 px-1 group-focus-within:text-[#1D58FF] transition-colors">
                EMAIL OR PHONE NUMBER
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or Phone Number"
                className="w-full px-5 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900
                  focus:outline-none focus:border-[#1D58FF] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                required
              />
            </div>

            <div className="group relative">
              <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5 px-1 group-focus-within:text-[#1D58FF] transition-colors">
                PASSWORD
              </label>
              <div className="relative">
                 <input
                   type={showPass ? 'text' : 'password'}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full px-5 py-3 bg-[#F8FAFC] border border-gray-100 rounded-xl text-[13px] font-bold text-gray-900
                     focus:outline-none focus:border-[#1D58FF] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                   required
                 />
                 <button
                   type="button"
                   onClick={() => setShowPass(!showPass)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D58FF] transition-colors"
                 >
                   {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
              </div>
            </div>

            <div className="pt-0.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-black text-white text-[12px] tracking-[0.1em] uppercase
                  bg-[#3B82F6] hover:bg-[#2563EB] shadow-[0_8px_25px_rgba(59,130,246,0.2)] 
                  transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "SIGN IN NOW"}
              </button>
            </div>

            <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-1.5">
              NEW LENDER?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/register')} 
                className="text-[#1D58FF] font-black hover:underline px-1 uppercase tracking-widest"
              >
                Create Account
              </button>
            </p>
          </form>

          {/* Demo Roles matching screenshot exactly */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col items-center">
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">DEMO ROLES</p>
             <div className="flex justify-center gap-10 sm:gap-14">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => autoFill(cred)}
                    className="flex flex-col items-center group gap-2"
                  >
                    {ROLE_ICONS[cred.role]}
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] group-hover:text-[#1D58FF] transition-colors">
                      {cred.role}
                    </span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .py-4\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
      `}</style>
    </div>
  );
}
