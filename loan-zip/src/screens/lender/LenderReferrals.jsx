import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Share2,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { referralService } from '../../services/ReferralService';
import { THEME } from '../../theme';

const C = THEME.role.lender;

export default function LenderReferrals() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReferrals: 0,
    qualifiedReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0
  });
  const [copied, setCopied] = useState(false);
  const referralLink = referralService.getReferralLink(user?.referralCode || 'YOURCODE');

  useEffect(() => {
    if (user?.id) {
      const fetchStats = async () => {
        const s = await referralService.getReferralStats();
        setStats(s);
      };
      fetchStats();
    }
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join LendaNet',
          text: 'Join the LendaNet network and grow your lending business!',
          url: referralLink,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div 
        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
        style={{ background: C.gradient }}
      >
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
              <Gift size={12} />
              Referral Program
            </div>
            <h1 className="text-3xl font-black tracking-tight">Invite Lenders, Earn Rewards</h1>
            <p className="text-blue-100/80 max-w-md text-sm leading-relaxed">
              Help us grow the network. Earn <span className="text-white font-bold">K500</span> for every lender you refer who onboards at least 10 borrowers.
            </p>
          </div>
          
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center min-w-[180px]">
            <p className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">Total Earned</p>
            <p className="text-4xl font-black">{THEME.formatCurrency(stats.totalEarned)}</p>

            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-300">
              <Award size={12} />
              Top 5% Referrer
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Share2 size={16} className="text-blue-600" />
          Your Referral Link
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl group transition-all hover:bg-white hover:border-blue-100">
            <ExternalLink size={18} className="text-gray-400 group-hover:text-blue-500" />
            <span className="text-sm font-medium text-gray-600 truncate">{referralLink}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={copyToClipboard}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                copied 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95'
              }`}
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button 
              onClick={shareLink}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 text-white hover:bg-black active:scale-95 transition-all"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
            <Clock size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-orange-800">Reward Condition</p>
            <p className="text-[11px] text-orange-700/80 leading-relaxed font-medium">
              Bonus is triggered when the referred lender reaches 10 active borrowers on their dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Invited', value: stats.totalReferrals, icon: Users, color: 'blue' },
          { label: 'Pending', value: stats.pendingReferrals, icon: Clock, color: 'orange' },
          { label: 'Qualified', value: stats.qualifiedReferrals, icon: CheckCircle2, color: 'green' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it Works */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <TrendingUp size={120} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-400" />
          How it works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            { step: '01', title: 'Share Link/Code', desc: 'Invite fellow lenders via your unique link or referral code.' },
            { step: '02', title: 'They Join', desc: 'New lender registers and connects their business to LendaNet.' },
            { step: '03', title: 'Reach 10 Borrowers', desc: 'Once they onboard 10 borrowers, you earn your K500 bonus.' },
          ].map((s, i) => (
            <div key={i} className="space-y-2">
              <span className="text-2xl font-black text-blue-500/50 block">{s.step}</span>
              <h4 className="text-sm font-bold">{s.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900">Recent Referrals</h2>
          <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700">View All</button>
        </div>
        
        <div className="divide-y divide-gray-50">
          {[
            { name: 'Sarah Mbewe', date: 'Feb 15, 2024', status: 'qualified', borrowers: '12/10', amount: 'K500' },
            { name: 'Robert Lungu', date: 'Mar 01, 2024', status: 'pending', borrowers: '3/10', amount: '--' },
          ].map((r, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{r.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Joined {r.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Borrowers</p>
                  <p className="text-xs font-black text-gray-700">{r.borrowers}</p>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    r.status === 'qualified' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {r.status === 'qualified' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {r.status}
                  </div>
                  <p className="mt-1 text-xs font-black text-gray-900">{r.amount}</p>
                </div>
                
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
