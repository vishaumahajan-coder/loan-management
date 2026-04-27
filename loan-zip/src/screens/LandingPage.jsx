import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Users, Zap, ArrowRight, Lock, Globe, Facebook, Twitter, Linkedin, Mail, Phone, MessageSquare, Star, PlayCircle, Search } from 'lucide-react';
import { Btn } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { THEME } from '../theme';
import api from '../services/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { membershipConfig } = useConfig();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'lender') return '/lender';
    if (user.role === 'borrower') return '/borrower';
    return '/login';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-600">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">LENDANET</span>
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Zambia's Credit Network</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'How it Works', 'Pricing', 'Security', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate(getDashboardPath())}
                className="px-6 py-2.5 bg-[#020617] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-2"
              >
                Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                >
                  Join Network
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Redesigned for Premium Look */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-blue-400/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e2e8f0_2px,transparent_2px)] [background-size:40px_40px] opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-left">
          <div className="space-y-10 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              Trusted by 500+ Lenders in Zambia
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter italic">
              Lend Safer. <br />
              <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-4">Risk Less.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Access the shared intelligence of hundreds of lenders. Detect risky borrowers in seconds and protect your capital.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button 
                onClick={() => navigate(user ? getDashboardPath() : '/register')}
                className="px-12 py-6 bg-[#020617] text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {user ? 'Go To Dashboard' : 'Join The Network'} <ArrowRight size={18} />
              </button>
              {!user && (
                <button 
                  onClick={() => navigate('/login')}
                  className="px-12 py-6 bg-white text-slate-900 border-2 border-slate-100 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3"
                >
                  <PlayCircle size={18} /> View Demo
                </button>
              )}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600/30 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="relative bg-slate-950 rounded-[50px] p-2.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-1000">
              <img 
                src="/hero_dashboard.png" 
                alt="LendaNet Intelligence Dashboard" 
                className="w-full h-auto rounded-[42px] opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            </div>
            
            {/* Floating Info Cards */}
            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 animate-bounce-slow hidden md:block">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Live Status</p>
                    <p className="text-sm font-black text-slate-900">BORROWER VERIFIED</p>
                  </div>
               </div>
            </div>
            <div className="absolute -bottom-5 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 animate-float hidden md:block">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Global Database</p>
                    <p className="text-sm font-black text-slate-900">12k+ DEFAULT RECORDS</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-white py-16 border-y border-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-12">Empowering Local Financial Ecosystems</p>
           <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-20 grayscale hover:opacity-40 transition-opacity">
            {['ZAMTEL', 'MTN MONEY', 'AIRTEL MONEY', 'STANBIC', 'FNB', 'ABSA'].map(brand => (
              <span key={brand} className="text-2xl font-black tracking-tighter italic">{brand}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Security Section - NEW */}
      <section id="security" className="py-32 px-6 bg-[#020617] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/5 blur-[120px]" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="relative">
              <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center mb-10 shadow-2xl shadow-blue-600/40">
                 <Shield size={48} className="text-white" />
              </div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none mb-8 uppercase">Bank-Grade <br /> <span className="text-blue-500">Protection.</span></h3>
              <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-md">Your data is encrypted and secure. LendaNet uses advanced security protocols to ensure that private lending data remains private.</p>
              
              <div className="grid grid-cols-2 gap-8 pt-12">
                 <div className="space-y-3">
                    <div className="w-12 h-1 bg-blue-600 rounded-full" />
                    <p className="text-sm font-black uppercase tracking-widest">256-bit AES</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Encryption Standard</p>
                 </div>
                 <div className="space-y-3">
                    <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                    <p className="text-sm font-black uppercase tracking-widest">Zero-Trust</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Access Protocol</p>
                 </div>
              </div>
           </div>
           <div className="space-y-4">
              {[
                { t: 'Encrypted Records', d: 'Every borrower NRC and phone number is hashed and encrypted before storage.' },
                { t: 'Identity Verification', d: 'Lenders must upload proof of license to access the shared intelligence network.' },
                { t: 'Activity Auditing', d: 'Every search and record update is logged for transparency and security.' }
              ].map((s, i) => (
                <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[32px] hover:bg-white/10 transition-colors">
                  <h4 className="text-lg font-black uppercase italic text-blue-400 mb-2">{s.t}</h4>
                  <p className="text-slate-400 text-sm font-medium">{s.d}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Features Grid - Redesigned */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em]">Core Intelligence</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">Everything you need to <span className="italic">lend with confidence.</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Network Search',
                desc: 'Instantly search any NRC or Phone number to see their global risk profile and lending history.',
                icon: Search,
                color: 'blue'
              },
              {
                title: 'Risk Analysis',
                desc: 'Our intelligence engine categorizes borrowers into RED/AMBER/GREEN based on real-time data.',
                icon: Zap,
                color: 'emerald'
              },
              {
                title: 'Secure Ledger',
                desc: 'Contribute to and benefit from a shared default ledger, protecting the entire lender community.',
                icon: Lock,
                color: 'rose'
              }
            ].map((f, i) => (
              <div key={i} className="group relative p-10 bg-slate-50 rounded-[40px] border border-slate-100 hover:bg-[#020617] transition-all duration-500 hover:translate-y-[-8px]">
                <div className={`w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon size={28} className={`text-${f.color}-600`} />
                </div>
                <h4 className="text-xl font-black text-slate-900 group-hover:text-white mb-4 transition-colors uppercase italic">{f.title}</h4>
                <p className="text-slate-500 group-hover:text-slate-400 font-medium leading-relaxed transition-colors">{f.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Timeline Design */}
      <section id="how-it-works" className="py-32 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">
             <div className="lg:w-1/3 space-y-6">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase italic">The LendaNet <br /> <span className="text-blue-600">Workflow</span></h3>
                <p className="text-slate-500 font-medium">Join thousands of independent lenders who have standardized their risk management processes.</p>
                <div className="pt-6">
                  <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-blue-600 transition-all active:scale-95">Get Detailed Guide</button>
                </div>
             </div>
             <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                {[
                  { n: '01', t: 'Identity Search', d: 'Enter the borrower\'s NRC. If they have defaulted elsewhere, you\'ll see it instantly.' },
                  { n: '02', t: 'Risk Check', d: 'Review their risk rating and active loans before committing your capital.' },
                  { n: '03', t: 'Confirm Loan', d: 'If safe, issue the loan. Our system generates a professional repayment schedule.' },
                  { n: '04', t: 'Protect Others', d: 'If a borrower defaults, mark them in the ledger to protect the entire network.' }
                ].map((step, idx) => (
                  <div key={idx} className="relative pl-12 border-l border-slate-200">
                    <div className="absolute top-0 left-[-1px] w-[2px] h-8 bg-blue-600" />
                    <span className="text-4xl font-black text-blue-600/10 absolute left-[-60px] top-[-10px]">{step.n}</span>
                    <h5 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tighter italic">{step.t}</h5>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.d}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Added for Professional Look */}
      <section id="pricing" className="py-32 px-6 bg-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#3b82f605_0%,transparent_70%)] -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em]">Membership</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">Transparent <span className="italic text-blue-600">Pricing</span> for every lender.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                plan: 'Free Tier', 
                price: THEME.formatCurrency(membershipConfig?.free?.price || 0), 
                sub: 'Per Month',
                desc: 'Perfect for small independent lenders starting out.',
                features: ['Up to 5 Active Loans', 'Basic Borrower Search', 'Standard Risk Rating', 'Email Support'],
                btn: 'Start Free',
                highlight: false
              },
              { 
                plan: 'Premium Monthly', 
                price: THEME.formatCurrency(membershipConfig?.monthly?.price || 200), 
                sub: 'Per Month',
                desc: 'Full access to the shared default network.',
                features: ['Unlimited Active Loans', 'Deep Network Search', 'Detailed Risk Reports', 'Priority Support', 'Data Export'],
                btn: 'Get Started',
                highlight: true
              },
              { 
                plan: 'Premium Annual', 
                price: THEME.formatCurrency(membershipConfig?.annual?.price || 1500), 
                sub: 'Per Year',
                desc: 'Best value for established lending businesses.',
                features: ['All Premium Features', '2 Months Free', 'Multi-user Access', 'Dedicated Account Manager', 'Custom API Access'],
                btn: 'Get Started',
                highlight: false
              }
            ].map((p, i) => (
              <div key={i} className={`relative p-10 rounded-[40px] border transition-all duration-500 hover:scale-[1.02] flex flex-col ${p.highlight ? 'bg-[#020617] text-white border-blue-600 shadow-2xl shadow-blue-900/20' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                {p.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</div>
                )}
                <div className="mb-8">
                  <h4 className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">{p.plan}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black italic tracking-tighter">{p.price}</span>
                    <span className="text-xs font-bold opacity-60">{p.sub}</span>
                  </div>
                </div>
                <p className="text-sm font-medium mb-8 opacity-70 leading-relaxed">{p.desc}</p>
                <div className="space-y-4 mb-10 flex-1">
                  {p.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p.highlight ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <CheckCircle size={12} className={p.highlight ? 'text-white' : 'text-slate-600'} />
                      </div>
                      <span className="text-xs font-bold">{f}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => navigate('/register')}
                  className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${p.highlight ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white border border-slate-200 text-slate-900 hover:border-blue-600'}`}
                >
                  {p.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Added */}
      <section id="contact" className="py-32 px-6 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
             <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase italic">Get in <span className="text-blue-600">Touch.</span></h3>
             <p className="text-slate-500 font-medium leading-relaxed">Have questions about our shared network or need technical assistance? Our Lusaka-based team is here to help you secure your lending business.</p>
             
             <div className="space-y-6 pt-4">
                {[
                  { icon: Mail, title: 'Email Us', info: 'support@lendanet.com' },
                  { icon: Phone, title: 'Call Us', info: '+260 970 000 000' },
                  { icon: MessageSquare, title: 'Live Chat', info: 'Available 08:00 - 17:00' }
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <c.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{c.title}</p>
                      <p className="text-sm font-black text-slate-900">{c.info}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-blue-900/10 border border-slate-100">
             <form className="space-y-6" onSubmit={async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                try {
                  await api.post('/contact', data);
                  alert('Thank you! Your message has been sent. Our team will contact you shortly.');
                  e.target.reset();
                } catch (err) {
                  console.error('Contact Form Error:', err);
                  alert('Failed to send message. Please try again.');
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                    <input name="first_name" type="text" placeholder="John" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                    <input name="last_name" type="text" placeholder="Mwansa" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                  <input name="email" type="email" placeholder="john@example.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Message</label>
                  <textarea name="message" placeholder="How can we help?" rows="4" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" required></textarea>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">Send Message</button>
             </form>
          </div>
        </div>
      </section>

      {/* Legal Content Section - Added for SEO & Professionalism */}
      <section id="about-us" className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-16">
          <div id="about" className="space-y-6 text-center">
            <h4 className="text-2xl font-black text-slate-900 uppercase italic">About LendaNet</h4>
            <p className="text-slate-500 font-medium leading-relaxed">
              LendaNet was founded with a single mission: to empower the independent lending community in Zambia. In an informal market, trust is everything. Our platform provides the digital infrastructure needed to share critical risk data securely and ethically, helping lenders protect their hard-earned capital from repeat defaulters.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div id="terms-&-conditions" className="space-y-4">
              <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> Terms & Conditions
              </h5>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                By using LendaNet, you agree to provide accurate default information and use borrower data only for credit assessment purposes. Misuse of data or submission of false records may lead to permanent ban from the network.
              </p>
            </div>
            <div id="privacy-policy" className="space-y-4">
              <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Shield size={14} /> Privacy Policy
              </h5>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                We take data privacy seriously. All borrower NRC and payment records are encrypted. We do not sell data to third parties. Access to default records is restricted only to verified, paid lenders.
              </p>
            </div>
            <div id="cookie-usage" className="space-y-4">
              <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Cookie Usage
              </h5>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                We use strictly necessary cookies to keep you logged in and improve security. By continuing to use our site, you consent to our use of essential cookies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-[#020617] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-900/50">
                  <Zap size={24} fill="currentColor" />
                </div>
                <span className="text-2xl font-black tracking-tighter">LENDANET</span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Empowering Zambia's informal economy with state-of-the-art credit intelligence and risk protection.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h6 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8">Platform</h6>
              <ul className="space-y-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <li><a href="#features" className="hover:text-white transition-colors">Network Search</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Premium Plans</a></li>
              </ul>
            </div>

            <div>
              <h6 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8">Resources</h6>
              <ul className="space-y-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <li><a href="#about-us" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#terms-&-conditions" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#cookie-usage" className="hover:text-white transition-colors">Cookie Usage</a></li>
              </ul>
            </div>

            <div>
              <h6 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-8">Contact</h6>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase leading-none mb-1">Email Support</p>
                    <p className="text-xs font-bold text-white">support@lendanet.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase leading-none mb-1">Office Line</p>
                    <p className="text-xs font-bold text-white">+260 970 000 000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              © 2024 LENDANET SOLUTIONS. CRAFTED WITH PRIDE IN ZAMBIA.
            </p>
            <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Globe size={14}/> GLOBAL NETWORK</span>
              <span className="flex items-center gap-2"><Shield size={14}/> BANK-GRADE SECURITY</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        html { scroll-behavior: smooth; }
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        .animate-slide-up { animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
