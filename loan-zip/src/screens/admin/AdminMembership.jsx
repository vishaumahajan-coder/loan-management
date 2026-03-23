import React from 'react';
import { Star } from 'lucide-react';
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
        subtitle="Manage the pricing, duration, and trial offers for platform memberships" 
      />

      {loading ? (
         <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
           {plans.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner overflow-hidden relative">
                          <div className={`absolute inset-0 opacity-20 ${plan.name.toLowerCase().includes('monthly') ? 'bg-blue-600' : 'bg-indigo-600'}`}></div>
                          <Star size={18} className={plan.name.toLowerCase().includes('monthly') ? 'text-blue-600 relative z-10' : 'text-indigo-600 relative z-10'} />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{plan.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Platform Access</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (K)</label>
                       <input 
                          type="number"
                          value={plan.price}
                          onChange={(e) => handleUpdate(plan.id, Number(e.target.value), plan.duration_days)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Days</label>
                       <input 
                          type="number"
                          value={plan.duration_days}
                          onChange={(e) => handleUpdate(plan.id, plan.price, Number(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                       />
                    </div>
                 </div>
              </div>
           ))}
         </div>
      )}
    </div>
  );
}
