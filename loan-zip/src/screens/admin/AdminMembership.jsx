import React from 'react';
import { Star, Shield, Zap } from 'lucide-react';
import { PageHeader } from '../../components/UI';
import api from '../../services/api';

export default function AdminMembership() {
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/admin/membership-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdate = async (id, price, duration) => {
     try {
        await api.post(`/admin/membership-plans/${id}`, { price, duration_days: duration });
        fetchPlans(); // Refresh
     } catch (error) {
        console.error('Update failed', error);
     }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <PageHeader 
        title="Membership Plans" 
        subtitle="MANAGE THE PRICING, DURATION, AND TRIAL OFFERS FOR PLATFORM MEMBERSHIPS" 
      />

      {loading ? (
         <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl uppercase">
           {plans.map(plan => {
              const isMonthly = plan.name.toLowerCase().includes('monthly');
              const isAnnual = plan.name.toLowerCase().includes('annual');
              const isFree = plan.name.toLowerCase().includes('free');
              
              const colorClass = isFree ? 'blue' : (isMonthly ? 'blue' : 'indigo');
              
              return (
                <div key={plan.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/40 space-y-6 transition-all hover:shadow-2xl hover:translate-y-[-4px]">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden bg-${colorClass}-50`}>
                            <div className={`absolute inset-0 opacity-20 bg-${colorClass}-600`}></div>
                            <Star size={24} className={`text-${colorClass}-600 relative z-10`} />
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{plan.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] leading-none mt-1">Platform Access</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-1">Price (K)</label>
                         <input 
                            type="number"
                            value={plan.price}
                            onChange={(e) => handleUpdate(plan.id, Number(e.target.value), plan.duration_days)}
                            className="w-full px-6 py-5 bg-slate-50 border border-gray-100 rounded-[22px] text-sm font-black outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                         />
                      </div>
                      <div className="space-y-2.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] ml-1">Days</label>
                         <input 
                            type="number"
                            value={plan.duration_days}
                            onChange={(e) => handleUpdate(plan.id, plan.price, Number(e.target.value))}
                            className="w-full px-6 py-5 bg-slate-50 border border-gray-100 rounded-[22px] text-sm font-black outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                         />
                      </div>
                   </div>
                </div>
              );
           })}
         </div>
      )}
    </div>
  );
}

