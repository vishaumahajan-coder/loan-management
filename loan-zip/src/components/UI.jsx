import React from 'react';
import { THEME } from '../theme';

export function RiskBadge({ risk }) {
  const s = THEME.risk[risk] || THEME.risk.GREEN;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-black uppercase tracking-tight"
      style={{ background: s.badge, color: s.text }}
    >
      <span
        className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
        style={{ background: s.dot }}
      />
      {risk === 'GREEN' ? 'Low Risk' : risk === 'AMBER' ? 'Medium Risk' : 'High Risk'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = THEME.status[status?.toLowerCase()] || THEME.status.active;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-black capitalize tracking-tight"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

export function StatCard({ label, value, color = '#1e40af', accent, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between">
      {accent && (
        <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl" style={{ background: accent }} />
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-none" style={{ color }}>{value}</p>
        {Icon && (
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color: color }}>
            <Icon size={22} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-widest mt-3">{label}</p>
    </div>
  );
}

export function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</label>}
      {children}
      {error && <p className="text-xs md:text-sm text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-3 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-300
        transition-all placeholder:text-gray-400 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-4 py-3 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-300
        transition-all appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Btn({ children, variant = 'primary', size = 'md', className = '', roleColor, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer';
  const sizes = { sm: 'px-4 py-2 text-xs md:text-sm', md: 'px-4 py-3 md:px-6 md:py-3.5 text-sm md:text-base', lg: 'px-8 py-4 text-base md:text-lg' };

  const variants = {
    primary:  'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 shadow-md shadow-blue-600/20',
    danger:   'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 shadow-md shadow-red-600/20',
    success:  'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 shadow-md shadow-green-600/20',
    ghost:    'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm',
    outline:  'border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    amber:    'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 shadow-md shadow-amber-500/20',
  };

  const style = roleColor
    ? { background: roleColor, color: '#fff', boxShadow: `0 4px 12px ${roleColor}40` }
    : {};

  return (
    <button
      className={`${base} ${sizes[size]} ${roleColor ? '' : variants[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, action, back, onBack }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-none tracking-tight">{title}</h1>
          {subtitle && <p className="text-[10px] md:text-sm lg:text-base text-gray-500 font-medium mt-1.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
      <div className="text-5xl md:text-6xl mb-4">{icon || '📋'}</div>
      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm md:text-base text-gray-500 mb-5 max-w-xs md:max-w-md">{description}</p>}
      {action}
    </div>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isDanger = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10" style={{ animation: 'slideUp 0.25s ease' }}>
        <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }`}</style>
    </div>
  );
}
