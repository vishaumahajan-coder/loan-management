import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Btn } from '../../components/UI';
// import { mockReferrals } from '../../data/mockData';

import api from '../../services/api';

export default function BorrowerReferrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState({ referrals: [], totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const resp = await api.get('/referrals/stats');
      setReferralData(resp.data);
    } catch (error) {
      console.error('Failed to fetch referrals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || 'DZ842'}`;
  
  const myReferrals = referralData.referrals;
  const stats = {
    total: myReferrals.length,
    qualified: myReferrals.filter(r => r.status === 'qualified').length,
    pending: myReferrals.filter(r => r.status === 'pending').length,
    earnings: referralData.totalEarned
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <PageHeader title="Refer & Earn" subtitle="Invite friends and get rewarded" />

      {/* Hero Share Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Gift size={160} className="text-blue-600" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
               <Gift size={24} />
             </div>
             <div>
               <h3 className="text-lg font-black text-gray-900 leading-tight text-blue-800">Earn K50 per Friend</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Immediate Rewards</p>
             </div>
          </div>

          <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
            Invite your friends to LendaNet. You'll earn <span className="text-blue-600 font-black">K50</span> credited to your account as soon as they complete their registration!
          </p>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Your Unique Invite Link</label>
            <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-2xl items-center">
              <div className="flex-1 px-3 text-xs font-bold text-gray-400 truncate select-all">{referralLink}</div>
              <button 
                onClick={copyToClipboard}
                className={`py-2 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-center pt-2">
               <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                 <Share2 size={14} /> Share via WhatsApp or SMS
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invited', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Qualified', value: stats.qualified, icon: CheckCircle2, color: 'green' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'orange' },
          { label: 'Total Earned', value: `K${stats.earnings}`, icon: TrendingUp, color: 'indigo' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-black text-gray-900 leading-none">{s.value}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it Works Step-by-Step */}
      <div className="bg-blue-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <h3 className="text-xs font-black uppercase tracking-widest mb-6 opacity-80">Simple 3-Step Process</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { step: '01', title: 'Send Invite', desc: 'Share your code with friends looking for easy borrowing.' },
            { step: '02', title: 'They Sign Up', desc: 'Friend completes registration using your referral code/link.' },
            { step: '03', title: 'Earn K50', desc: 'Bonus is automatically added to your referral balance.' },
          ].map((s, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-2xl font-black text-white/30 h-fit italic">{s.step}</span>
              <div>
                <h4 className="text-sm font-bold">{s.title}</h4>
                <p className="text-xs text-blue-100/70 font-medium leading-relaxed mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">My Referrals</h3>
        </div>
        
        {myReferrals.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-200">
               <Users size={32} />
            </div>
            <h4 className="text-sm font-bold text-gray-800">No Referrals Yet</h4>
            <p className="text-xs text-gray-400 font-medium mt-1">Start inviting friends to earn your first K50 bonus!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {myReferrals.map((ref) => (
              <div key={ref.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${ref.status === 'qualified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {ref.status === 'qualified' ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{ref.referredName || 'User Referred'}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ref ID: {ref.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${ref.status === 'qualified' ? 'text-gray-900' : 'text-amber-600'}`}>
                    {ref.status === 'qualified' ? '+K50' : 'Pending'}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {ref.status === 'qualified' ? 'Bonus Qualified' : 'Verifying activity'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Info Section */}
      <div className="flex items-start gap-3 p-4 bg-gray-900 rounded-3xl text-white">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Info size={16} />
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Marketing Campaigns</h4>
          <p className="text-[11px] leading-relaxed text-blue-100 opacity-80">
            Qualification criteria and reward amounts may change depending on current marketing campaigns. Check this page regularly for new earning opportunities!
          </p>
        </div>
      </div>
    </div>
  );
}
