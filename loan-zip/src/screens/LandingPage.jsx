import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Users, Zap, ArrowRight, Lock, Globe } from 'lucide-react';
import { Btn } from '../components/UI';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">L</div>
          <span className="text-xl font-black text-slate-900 tracking-tight">LENDANET</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600">How it Works</a>
          <a href="#security" className="hover:text-blue-600">Security</a>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-slate-700 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            Login
          </button>
          <Btn size="sm" onClick={() => navigate('/register')}>Get Started</Btn>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-[-10%] w-[40%] h-[50%] bg-teal-100/40 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <Zap size={14} /> The Future of Informal Lending
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
            The Shared Default <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence</span> Network
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Secure your lending business by accessing a trusted network of informal lenders. Identify repeat defaulters before you lend.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Start for Free <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
              Demo Access
            </button>
          </div>

          <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-slide-up">
            <img 
              src="/lendanet_hero_dashboard_1773212811030.png" 
              alt="LendaNet Dashboard Preview" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section id="features" className="bg-white py-24 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Protect Your Capital</h2>
            <p className="text-slate-500 font-medium">LendaNet provides tools designed specifically for informal lenders.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Instant NRC Search',
                desc: 'Verify any borrower instantly using their NRC number against our global database.',
                icon: Shield,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                title: 'Risk Scoring',
                desc: 'Real-time Green/Amber/Red risk indicators based on historical lending behavior.',
                icon: Zap,
                color: 'bg-amber-50 text-amber-600'
              },
              {
                title: 'Default Ledger',
                desc: 'Securely share default information with other trusted lenders in the network.',
                icon: Lock,
                color: 'bg-red-50 text-red-600'
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all cursor-default group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-black">"</div>
          <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
            "LendaNet has reduced my default rate by 40% in just three months. I never lend without searching first."
          </h2>
          <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">John Kapambwe — Independent Lender</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">L</div>
            <span className="text-lg font-black text-slate-900 tracking-tight">LENDANET</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2024 Lendanet.com – Secure Default Ledger for Zambia</p>
          <div className="flex gap-6">
            <Globe className="text-slate-400 hover:text-blue-600 cursor-pointer" size={20} />
            <Shield className="text-slate-400 hover:text-blue-600 cursor-pointer" size={20} />
            <Lock className="text-slate-400 hover:text-blue-600 cursor-pointer" size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
}
