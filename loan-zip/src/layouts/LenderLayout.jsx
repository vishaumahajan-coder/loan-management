import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Search, Shield,
  User, LogOut, Menu, X, ChevronRight, Bell, Gift, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../theme';
import api, { API_BASE_URL, IMAGE_BASE_URL } from '../services/api';

const NAV = [
  { path: '/lender/dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/lender/borrowers',  label: 'Borrowers',       icon: Users },
  { path: '/lender/loans',      label: 'Loans',           icon: CreditCard },
  { path: '/lender/defaults',   label: 'Default Ledger',  icon: Shield },
  { path: '/lender/referrals',  label: 'Referrals',       icon: Gift },
  { path: '/lender/search',     label: 'Search Borrower', icon: Search },
  { path: '/lender/profile',    label: 'My Profile',      icon: User },
];

const C = THEME.role.lender;

export default function LenderLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState('');
  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  const handleLogout = () => { logout(); navigate('/login'); setIsSidebarOpen(false); };

  const SidebarContent = ({ onLinkClick }) => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-blue-800/40">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 text-white font-black text-sm">L</div>
        <div>
          <h1 className="text-base font-black text-white tracking-tight">LENDANET</h1>
          <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-widest">Lender Portal</p>
        </div>
      </div>

      {/* User Badge */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
          {user?.profile_image_url ? (
            <img 
              src={IMAGE_BASE_URL + user.profile_image_url} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user?.initials || 'LP'}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs font-bold truncate">{user?.name || 'Lender'}</p>
          <p className="text-blue-300 text-[10px] truncate">{user?.businessName || ''}</p>
          <span className={`mt-1 inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
            user?.isPaid
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
          }`}>{user?.isPaid ? `⭐ ${user?.plan_label || 'Premium'}` : '🔒 Free Plan'}</span>
        </div>

      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          const isPremiumSearch = path === '/lender/search' && !user?.isPaid;
          const NavComponent = isPremiumSearch ? 'div' : Link;
          
          return (
            <NavComponent
              key={path}
              to={isPremiumSearch ? undefined : path}
              onClick={(e) => {
                if (isPremiumSearch) {
                  Swal.fire({
                    title: 'Premium Feature',
                    text: 'Borrower search is only available for Premium members. Upgrade your plan to unlock this feature!',
                    icon: 'lock',
                    confirmButtonText: 'View Plans',
                    confirmButtonColor: '#3b82f6',
                    showCancelButton: true,
                    cancelButtonText: 'Maybe Later'
                  }).then((result) => {
                    if (result.isConfirmed) navigate('/lender/profile');
                  });
                  return;
                }
                onLinkClick();
              }}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} className={active ? 'text-blue-600' : 'text-blue-300'} />
              <span>{label}</span>
              {isPremiumSearch ? (
                 <div className="ml-auto bg-yellow-400 p-1 rounded shadow-sm">
                    <Lock size={10} className="text-yellow-900" />
                 </div>
              ) : active ? (
                 <ChevronRight size={14} className="ml-auto text-blue-400" />
              ) : null}
            </NavComponent>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-blue-800/40 mt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all text-sm font-semibold"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 uppercase">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 z-[60] lg:hidden transform transition-transform duration-300 ease-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: C.gradient }}
      >
        <SidebarContent onLinkClick={() => setIsSidebarOpen(false)} />
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
        >
          <X size={20} />
        </button>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen shadow-2xl" style={{ background: C.gradient }}>
        <SidebarContent onLinkClick={() => {}} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm uppercase">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100 active:scale-95"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-lg font-black text-[#020617] tracking-tighter hidden md:block uppercase italic">Lenda<span className="text-blue-600">Net</span></h1>
            <h1 className="text-base font-black text-[#020617] tracking-tighter md:hidden uppercase italic">Lenda<span className="text-blue-600">Net</span></h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div 
              onClick={() => {
                if (!user?.isPaid) {
                  Swal.fire({
                    title: 'Premium Required',
                    text: 'Upgrade to Premium to search the borrower network.',
                    icon: 'lock',
                    confirmButtonText: 'Upgrade Now'
                  }).then(r => r.isConfirmed && navigate('/lender/profile'));
                  return;
                }
                navigate('/lender/search');
              }}
              className="hidden sm:flex items-center gap-2 p-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-400 hover:border-blue-100 transition-all group relative cursor-pointer"
            >
               <Search size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-blue-600 transition-colors">Search Network</span>
               {!user?.isPaid && <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white"><Lock size={8} className="text-yellow-900" /></div>}
            </div>

            <button 
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-gray-100" 
              onClick={() => {
                if (!user?.isPaid) {
                  Swal.fire({
                    title: 'Premium Required',
                    text: 'Upgrade to Premium to search the borrower network.',
                    icon: 'lock',
                    confirmButtonText: 'Upgrade Now'
                  }).then(r => r.isConfirmed && navigate('/lender/profile'));
                  return;
                }
                navigate('/lender/search');
              }}
            >
               <Search size={20} />
            </button>
            <Link to="/lender/profile" className="flex items-center gap-2 p-1 md:p-1.5 pr-3 md:pr-4 rounded-xl bg-slate-50 border border-gray-100 hover:border-blue-100 transition-all active:scale-95">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-emerald-500/20 overflow-hidden">
                {user?.profile_image_url ? (
                  <img 
                    src={IMAGE_BASE_URL + user.profile_image_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.initials || 'LP'}</span>
                )}
              </div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest hidden sm:block">{user?.name?.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 pb-28 lg:pb-10 overflow-y-auto w-full max-w-[1600px] mx-auto not-italic">
          <Outlet context={{ search, setSearch }} />
        </main>

        {/* Improved Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40 px-2 pb-safe-area-inset-bottom">
          <div className="flex justify-around items-center max-w-md mx-auto h-16">
            {[NAV[0], NAV[1], NAV[2], NAV[3], { ...NAV[6], label: 'Me' }].map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              const displayLabel = label === 'Me' ? 'Me' : label.split(' ')[0];
              return (
                <Link key={path} to={path}
                  className={`relative flex flex-col items-center justify-center w-14 h-12 transition-all duration-300 ${active ? 'text-blue-600 translate-y-[-2px]' : 'text-slate-400'}`}>
                  {active && <div className="absolute top-[-8px] w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                  <Icon size={20} strokeWidth={active ? 3 : 2} />
                  <span className={`text-[8px] font-black mt-1 uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{displayLabel}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
