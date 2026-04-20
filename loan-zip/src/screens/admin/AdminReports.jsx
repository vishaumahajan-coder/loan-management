import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, CreditCard, AlertTriangle,
  DollarSign, PieChart, Download, Calendar, Shield
} from 'lucide-react';
import api from '../../services/api';
import { THEME } from '../../theme';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [loansRes, lendersRes, borrowersRes, defaultsRes, settingsRes] = await Promise.all([
        api.get('/admin/loans'),
        api.get('/admin/lenders'),
        api.get('/admin/borrowers'),
        api.get('/admin/defaults'),
        api.get('/settings')
      ]);

      const loans = loansRes.data;
      const lenders = lendersRes.data;
      const borrowers = borrowersRes.data;
      const defaults = defaultsRes.data;

      // Calculate report data
      const totalDisbursed = loans.reduce((s, l) => s + Number(l.amount), 0);
      const totalRecovered = loans.reduce((s, l) => {
        const paid = (l.instalmentSchedule || []).filter(i => i.status === 'paid').reduce((ps, i) => ps + Number(i.amount), 0);
        return s + paid;
      }, 0);
      const totalOutstanding = totalDisbursed - totalRecovered;
      const activeLoans = loans.filter(l => l.status === 'active');
      const paidLoans = loans.filter(l => l.status === 'paid');
      const defaultedLoans = loans.filter(l => l.status === 'default');

      const collateralLoans = loans.filter(l => l.type === 'Collateral');
      const nonCollateralLoans = loans.filter(l => l.type === 'Non');
      const guarantorLoans = loans.filter(l => l.type === 'Guarantor');

      const activeLenders = lenders.filter(l => l.status === 'active');
      const pendingLenders = lenders.filter(l => l.status === 'pending');
      const freeLenders = lenders.filter(l => l.plan_type === 'free' || !l.plan_type);
      const premiumLenders = lenders.filter(l => l.plan_type && l.plan_type !== 'free');

      // Overdue installments
      const now = new Date();
      let overdueCount = 0;
      let overdueAmount = 0;
      loans.forEach(l => {
        (l.instalmentSchedule || []).forEach(i => {
          if (i.status === 'pending' && new Date(i.due_date) < now) {
            overdueCount++;
            overdueAmount += Number(i.amount);
          }
        });
      });

      const recoveryRate = totalDisbursed > 0 ? ((totalRecovered / totalDisbursed) * 100).toFixed(1) : 0;
      const defaultRate = loans.length > 0 ? ((defaultedLoans.length / loans.length) * 100).toFixed(1) : 0;

      setData({
        totalDisbursed, totalRecovered, totalOutstanding, recoveryRate, defaultRate,
        totalLoans: loans.length,
        activeLoans: activeLoans.length,
        paidLoans: paidLoans.length,
        defaultedLoans: defaultedLoans.length,
        collateralLoans: collateralLoans.length,
        nonCollateralLoans: nonCollateralLoans.length,
        guarantorLoans: guarantorLoans.length,
        totalLenders: lenders.length,
        activeLenders: activeLenders.length,
        pendingLenders: pendingLenders.length,
        freeLenders: freeLenders.length,
        premiumLenders: premiumLenders.length,
        totalBorrowers: borrowers.length,
        totalDefaults: defaults.length,
        overdueCount, overdueAmount,
        threshold: settingsRes.data.default_threshold || 3,
        topLenders: getTopLenders(loans, lenders),
        recentDefaults: defaults.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to load report data', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopLenders = (loans, lenders) => {
    const map = {};
    loans.forEach(l => {
      if (!map[l.lender_id]) map[l.lender_id] = { name: l.lenderName, total: 0, count: 0 };
      map[l.lender_id].total += Number(l.amount);
      map[l.lender_id].count++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <p className="text-center text-gray-400 py-20">Failed to load reports</p>;

  const colorMap = {
    blue:    'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    red:     'bg-red-50 text-red-600',
    slate:   'bg-slate-50 text-slate-600',
  };

  const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          <Icon size={20} />
        </div>
        {sub && <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{sub}</span>}
      </div>
      <p className="text-xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-3">
            <BarChart3 size={24} className="text-red-600" /> Platform Reports
          </h1>
          <p className="text-slate-500 font-medium mt-1">Overview of all platform activity and financial metrics.</p>
        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Financial Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Disbursed" value={THEME.formatCurrency(data.totalDisbursed)} color="blue" />
          <StatCard icon={TrendingUp} label="Total Recovered" value={THEME.formatCurrency(data.totalRecovered)} color="emerald" />
          <StatCard icon={CreditCard} label="Outstanding" value={THEME.formatCurrency(data.totalOutstanding)} color="amber" />
          <StatCard icon={AlertTriangle} label="Overdue Amount" value={THEME.formatCurrency(data.overdueAmount)} sub={`${data.overdueCount} Payments`} color="red" />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#020617] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-600/10 blur-3xl"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Recovery Rate</p>
            <h3 className="text-4xl font-black tracking-tight">{data.recoveryRate}%</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2">{THEME.formatCurrency(data.totalRecovered)} of {THEME.formatCurrency(data.totalDisbursed)}</p>

          </div>
        </div>
        <div className="bg-[#020617] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-red-600/10 blur-3xl"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Default Rate</p>
            <h3 className="text-4xl font-black tracking-tight">{data.defaultRate}%</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-2">{data.defaultedLoans} of {data.totalLoans} loans defaulted</p>
          </div>
        </div>
      </div>

      {/* Loan Breakdown */}
      <div>
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Loan Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={CreditCard} label="Total Loans" value={data.totalLoans} color="blue" />
          <StatCard icon={TrendingUp} label="Active" value={data.activeLoans} color="blue" />
          <StatCard icon={Shield} label="Paid Off" value={data.paidLoans} color="emerald" />
          <StatCard icon={AlertTriangle} label="Defaulted" value={data.defaultedLoans} color="red" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4 text-center">
            <p className="text-2xl font-black text-red-700">{data.collateralLoans}</p>
            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">Collateral</p>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-black text-slate-700">{data.nonCollateralLoans}</p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Non-Collateral</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center">
            <p className="text-2xl font-black text-amber-700">{data.guarantorLoans}</p>
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Guarantor</p>
          </div>
        </div>
      </div>

      {/* Users */}
      <div>
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Users Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Lenders" value={data.totalLenders} color="blue" />
          <StatCard icon={Users} label="Active Lenders" value={data.activeLenders} sub={`${data.pendingLenders} pending`} color="emerald" />
          <StatCard icon={Users} label="Free / Premium" value={`${data.freeLenders} / ${data.premiumLenders}`} color="amber" />
          <StatCard icon={Users} label="Total Borrowers" value={data.totalBorrowers} color="slate" />
        </div>
      </div>

      {/* Top Lenders */}
      {data.topLenders.length > 0 && (
        <div>
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Top Lenders by Volume</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">#</th>
                  <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Lender</th>
                  <th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Loans</th>
                  <th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.topLenders.map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</span>
                    </td>
                    <td className="px-5 py-3 text-sm font-black text-slate-900 uppercase">{l.name}</td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-slate-600">{l.count}</td>
                    <td className="px-5 py-3 text-right text-sm font-black text-slate-900">{THEME.formatCurrency(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Rules */}
      <div>
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Active System Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">{data.threshold} Missed Payments</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Default Threshold</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">{data.totalDefaults} Records</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Default Ledger</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
