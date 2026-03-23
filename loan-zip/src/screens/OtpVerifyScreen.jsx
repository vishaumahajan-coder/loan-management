import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Shield, Smartphone, ChevronRight, RefreshCw } from 'lucide-react';

export default function OtpVerifyScreen() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const location = useLocation();
  const userId = location.state?.userId;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userId) {
       alert("Session expired. Please register again.");
       navigate('/register');
       return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { userId, otp: otp.join('') });
      navigate('/login');
    } catch (error) {
       console.error('OTP verification failed', error);
       alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col font-['Outfit'] relative overflow-x-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-8 pb-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 transition-all active:scale-90">
          <ArrowLeft size={20}/>
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
             <Shield size={18} />
           </div>
           <span className="text-sm font-black tracking-tighter text-gray-900 uppercase">Lendan<span className="text-blue-600">et</span></span>
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm border border-blue-100/50">
              <Smartphone size={36} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Verify Account</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.15em]">Enter the 6-digit verification code</p>
            <p className="text-[11px] text-blue-600/60 font-medium mt-3 uppercase tracking-wider">Sent to your registered phone number</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex gap-2.5 justify-center">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl font-black bg-white border border-gray-100 rounded-2xl shadow-sm
                    focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all outline-none"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button type="submit" disabled={loading || otp.join('').length < 6}
                className="w-full py-4 rounded-2xl font-black text-white text-[12px] tracking-widest uppercase
                  bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                  shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    Verify & Continue
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button type="button" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors group">
                  <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                  Request New Code
                </button>
              </div>
            </div>
          </form>

          <div className="mt-12 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
            <p className="text-[10px] text-blue-800/60 font-bold text-center leading-relaxed italic uppercase tracking-wider">
               "Security is our top priority. We use industry-standard encryption to protect your data."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
