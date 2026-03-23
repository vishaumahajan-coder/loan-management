export const systemConfig = {
  collateralEnabled: true,
  defaultThreshold: 3, // Missed payments before auto-default
  adminVerificationRequired: true
};

export const mockBorrowers = [
  { 
    id: 'B1', 
    name: 'James Mwansa', 
    nrc: '123456/11/1', 
    phone: '0971234567',
    dob: '1985-05-12', 
    risk: 'GREEN', 
    totalLoans: 5, 
    activeDefaults: 0, 
    totalDefaults: 0,
    loanTypes: ['Non Collateral Loan', 'Guarantor Loan']
  },
  { 
    id: 'B2', 
    name: 'Sarah Phiri', 
    nrc: '987654/22/1', 
    phone: '0969876543',
    dob: '1992-11-20', 
    risk: 'RED', 
    totalLoans: 3, 
    activeDefaults: 1, 
    totalDefaults: 2,
    loanTypes: ['Collateral Loan', 'Non Collateral Loan']
  },
  { 
    id: 'B3', 
    name: 'Banda Chilufya', 
    nrc: '456123/33/1', 
    phone: '0954561234',
    dob: '1978-02-28', 
    risk: 'AMBER', 
    totalLoans: 8, 
    activeDefaults: 0, 
    totalDefaults: 1,
    loanTypes: ['Guarantor Loan', 'Collateral Loan']
  }
];

export const mockLenders = [
  {
    id: 'L1',
    name: 'John Phiri',
    businessName: 'JP Quick Loans',
    phone: '0977111222',
    email: 'john@jpquick.com',
    status: 'active',
    verificationStatus: 'verified', // verified, pending, rejected
    joinDate: '2025-01-10',
    totalLoans: 45,
    totalBorrowers: 32,
    totalDefaults: 2,
    plan: 'paid'
  },
  {
    id: 'L2',
    name: 'Alice Mumba',
    businessName: 'Mumba Credit',
    phone: '0966333444',
    email: 'alice@mumba.com',
    status: 'active',
    verificationStatus: 'pending',
    joinDate: '2026-03-01',
    totalLoans: 0,
    totalBorrowers: 0,
    totalDefaults: 0,
    plan: 'free'
  }
];

export const mockLoans = [
  {
    id: 'L1001',
    borrowerId: 'B2',
    borrowerName: 'Sarah Phiri',
    lenderId: 'L1',
    lenderName: 'John Phiri',
    amount: 330,
    principal: 300,
    interestRate: 10,
    issueDate: '2026-01-10',
    dueDate: '2026-04-10',
    instalments: 3,
    status: 'active',
    loanType: 'Non-Collateral',
    instalmentSchedule: [
      { id: 1, amount: 100, dueDate: '2026-02-10', status: 'paid', paidDate: '2026-02-09', remainingBalance: 300 },
      { id: 2, amount: 100, dueDate: '2026-03-10', status: 'pending', remainingBalance: 200 },
      { id: 3, amount: 100, dueDate: '2026-04-10', status: 'pending', remainingBalance: 100 }
    ]
  },
  {
    id: 'L1002',
    borrowerId: 'B2',
    borrowerName: 'Sarah Phiri',
    lenderId: 'L5',
    lenderName: 'Finance Co',
    amount: 5000,
    principal: 5000,
    interestRate: 0,
    issueDate: '2025-10-01',
    dueDate: '2026-01-01',
    instalments: 5,
    status: 'defaulted',
    loanType: 'Collateral',
    collateralDetails: 'Toyota Vitz 2012, BAA 4455',
    instalmentSchedule: [
      { id: 1, amount: 1000, dueDate: '2025-11-01', status: 'paid', paidDate: '2025-10-30', remainingBalance: 5000 },
      { id: 2, amount: 1000, dueDate: '2025-12-01', status: 'missed', remainingBalance: 4000 },
      { id: 3, amount: 1000, dueDate: '2026-01-01', status: 'missed', remainingBalance: 3000 },
      { id: 4, amount: 1000, dueDate: '2026-02-01', status: 'missed', remainingBalance: 2000 },
      { id: 5, amount: 1000, dueDate: '2026-03-01', status: 'missed', remainingBalance: 1000 }
    ]
  }
];

export const mockDefaultLedger = [
  { 
    id: 'D1', 
    borrowerName: 'Sarah Phiri', 
    borrowerNRC: '987654/22/1', 
    defaultAmount: 5000, 
    loanId: 'L1002',
    lenderName: 'Finance Co', 
    defaultDate: '2026-01-05', 
    status: 'active' 
  }
];

export const mockAuditLogs = [
  { id: 1, action: 'User Login', entity: 'Admin', performedBy: 'SuperAdmin', timestamp: '2026-03-12T08:00:00Z' },
  { id: 2, action: 'Lender Verified', entity: 'L1', performedBy: 'SuperAdmin', timestamp: '2026-03-12T09:30:00Z' }
];

export const mockReferrals = [
  { id: 'REF1', referrerId: 'L1', referrer: 'James Mwansa', referee: 'George Phiri', date: '2026-02-15', status: 'verified', bonus: 250 },
  { id: 'REF2', referrerId: 'L1', referrer: 'James Mwansa', referee: 'Sarah Mumba', date: '2026-03-01', status: 'pending', bonus: 250 }
];
export const mockReferralRules = [
  { id: 'RULE1', ruleType: 'lender_referral', conditionType: 'registration', conditionValue: 1, rewardAmount: 250, isActive: true },
  { id: 'RULE2', ruleType: 'borrower_referral', conditionType: 'borrower_count', conditionValue: 10, rewardAmount: 500, isActive: true },
  { id: 'RULE3', ruleType: 'lender_referral', conditionType: 'loan_count', conditionValue: 5, rewardAmount: 1000, isActive: false }
];
export const mockReferralRewards = [
  { id: 'REW1', referrerId: 'L1', amount: 250, date: '2026-02-20', status: 'processed' },
  { id: 'REW2', referrerId: 'L2', amount: 500, date: '2026-03-05', status: 'pending' },
  { id: 'REW3', referrerId: 'L1', amount: 250, date: '2026-03-10', status: 'processed' }
];
