// ============================================================
// LENDANET – Central Theme & Config
// Change colors here and they propagate across the whole app.
// ============================================================

export const THEME = {
  // Brand colors (use CSS-compatible values)
  brand: {
    primary:        '#1e40af',   // deep blue
    primaryHover:   '#1d4ed8',
    primaryLight:   '#dbeafe',
    primaryDark:    '#1e3a8a',
    secondary:      '#0ea5e9',   // sky
    accent:         '#6366f1',   // indigo
  },
  role: {
    lender: {
      primary:  '#1e40af',
      light:    '#dbeafe',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    admin: {
      primary:  '#1e40af', // Changed from purple
      light:    '#dbeafe',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    borrower: {
      primary:  '#1e40af', // Changed from teal
      light:    '#dbeafe',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
  },
  risk: {
    GREEN: {
      bg:      '#f0fdf4',
      border:  '#bbf7d0',
      text:    '#166534',
      badge:   '#dcfce7',
      dot:     '#22c55e',
      label:   'Low Risk',
    },
    AMBER: {
      bg:      '#fffbeb',
      border:  '#fde68a',
      text:    '#92400e',
      badge:   '#fef3c7',
      dot:     '#f59e0b',
      label:   'Medium Risk',
    },
    RED: {
      bg:      '#fef2f2',
      border:  '#fecaca',
      text:    '#991b1b',
      badge:   '#fee2e2',
      dot:     '#ef4444',
      label:   'High Risk',
    },
  },
  status: {
    active:    { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
    paid:      { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    defaulted: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    overdue:   { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    suspended: { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' },
  },
};

export const DEMO_CREDENTIALS = [
  {
    role: 'lender',
    name: 'John Phiri',
    phone: '0987654321',
    email: 'john@lendanet.zm',
    password: '123456',
    businessName: 'Phiri Fast Loans',
    initials: 'JP',
    referralCode: 'JOHN762',
    plan: 'free',
  },
  {
    role: 'admin',
    name: 'Admin User',
    phone: '0999999999',
    email: 'admin@lendanet.com',
    password: 'admin123',
    businessName: 'LendaNet HQ',
    initials: 'AU',
  },
  {
    role: 'borrower',
    name: 'David Zulu',
    phone: '0123456789',
    email: 'david@gmail.com',
    password: '123456',
    nrc: '123456/78/1',
    initials: 'DZ',
    referralCode: 'DAVID842',
  },
];
