// ============================================================
// LENDANET – Central Theme & Config
// Change colors here and they propagate across the whole app.
// ============================================================

export const THEME = {
  // Brand colors (use CSS-compatible values)
  brand: {
    primary: '#1e40af',   // deep blue
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    primaryDark: '#1e3a8a',
    secondary: '#0ea5e9',   // sky
    accent: '#6366f1',   // indigo
  },
  role: {
    lender: {
      primary: '#1e40af',
      light: '#dbeafe',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    admin: {
      primary: '#1e40af', // Changed from purple
      light: '#dbeafe',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    borrower: {
      primary: '#1e40af', // Changed from teal
      light: '#dbeafe',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
  },
  risk: {
    GREEN: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#166534',
      badge: '#dcfce7',
      dot: '#22c55e',
      label: 'Low Risk',
    },
    AMBER: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#92400e',
      badge: '#fef3c7',
      dot: '#f59e0b',
      label: 'Medium Risk',
    },
    RED: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      badge: '#fee2e2',
      dot: '#ef4444',
      label: 'High Risk',
    },
  },
  status: {
    active: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
    pending: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
    paid: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    defaulted: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    default: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    overdue: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    suspended: { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' },
  },
  formatCurrency: (amount) => {
    const num = Number(amount) || 0;
    return 'K' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  // Standard date format: dd mm yyyy (no time)
  formatDate: (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  },

  getDOB: (obj) => {
    if (!obj) return null;
    return obj.dob ||
      obj.date_of_birth ||
      obj.dateOfBirth ||
      obj.birthday ||
      obj.birth_date ||
      obj.birthDate ||
      obj.born ||
      obj.birth ||
      obj.profile?.dob ||
      obj.profile?.date_of_birth ||
      obj.profile?.birthday ||
      obj.profile?.dateOfBirth;
  },

  // Audit log format: dd mm yyyy - hh:mm AM/PM
  formatDateTime: (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} - ${hours}:${mins} ${ampm}`;
  },
};

export const DEMO_CREDENTIALS = [
  {
    role: 'lender',
    name: 'John Phiri',
    phone: '0987654321',
    email: 'lender@gmail.com',
    password: '@Lender1',
    businessName: 'Phiri Fast Loans',
    initials: 'JP',
    referralCode: 'JOHN762',
    plan: 'free',
  },
  {
    role: 'admin',
    name: 'Admin',
    phone: '0999999999',
    email: 'admin@gmail.com',
    password: '@Admin123',
    businessName: 'LendaNet HQ',
    initials: 'AD',
  },

  {
    role: 'borrower',
    name: 'james',
    phone: '0123456789',
    email: 'borrower@gmail.com',
    password: '@Borrower1',
    nrc: '123456/78/1',
    initials: 'DZ',
    referralCode: 'DAVID842',
  },
];
