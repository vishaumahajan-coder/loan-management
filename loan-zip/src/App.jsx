import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public screens
import LoginScreen    from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OtpVerifyScreen from './screens/OtpVerifyScreen';
import LandingPage     from './screens/LandingPage';

// Layouts
import LenderLayout   from './layouts/LenderLayout';
import AdminLayout    from './layouts/AdminLayout';
import BorrowerLayout from './layouts/BorrowerLayout';

// Lender screens
import LenderDashboard  from './screens/lender/LenderDashboard';
import LenderBorrowers  from './screens/lender/LenderBorrowers';
import LenderLoans      from './screens/lender/LenderLoans';
import LenderDefaults   from './screens/lender/LenderDefaults';
import LenderSearch     from './screens/lender/LenderSearch';
import LenderProfile    from './screens/lender/LenderProfile';
import LenderReferrals  from './screens/lender/LenderReferrals';

// Admin screens
import AdminDashboard   from './screens/admin/AdminDashboard';
import AdminLenders     from './screens/admin/AdminLenders';
import AdminBorrowers   from './screens/admin/AdminBorrowers';
import AdminLoans       from './screens/admin/AdminLoans';
import AdminDefaults    from './screens/admin/AdminDefaults';
import AdminAudit       from './screens/admin/AdminAudit';
import AdminProfile     from './screens/admin/AdminProfile';
import AdminReferrals   from './screens/admin/AdminReferrals';
import AdminMembership  from './screens/admin/AdminMembership';
import AdminMembershipRequests from './screens/admin/AdminMembershipRequests';
import AdminSettings    from './screens/admin/AdminSettings';
import AdminMessages    from './screens/admin/AdminMessages';

// Borrower screens
import BorrowerDashboard from './screens/borrower/BorrowerDashboard';
import BorrowerLoans     from './screens/borrower/BorrowerLoans';
import BorrowerProfile   from './screens/borrower/BorrowerProfile';
import BorrowerReferrals from './screens/borrower/BorrowerReferrals';

// ── Route Guards ──────────────────────────────────────────────────────────────
function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root - Always show Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public */}
      <Route path="/login"    element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/otp"      element={<OtpVerifyScreen />} />

      {/* ── Lender ── */}
      <Route path="/lender" element={
        <RequireRole role="lender">
          <LenderLayout />
        </RequireRole>
      }>
        <Route index                    element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"         element={<LenderDashboard />} />
        <Route path="borrowers"         element={<LenderBorrowers />} />
        <Route path="loans"             element={<LenderLoans />} />
        <Route path="defaults"          element={<LenderDefaults />} />
        <Route path="search"            element={<LenderSearch />} />
        <Route path="profile"           element={<LenderProfile />} />
        <Route path="referrals"         element={<LenderReferrals />} />
      </Route>

      {/* ── Admin ── */}
      <Route path="/admin" element={
        <RequireRole role="admin">
          <AdminLayout />
        </RequireRole>
      }>
        <Route index                    element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"         element={<AdminDashboard />} />
        <Route path="lenders"           element={<AdminLenders />} />
        <Route path="borrowers"         element={<AdminBorrowers />} />
        <Route path="loans"             element={<AdminLoans />} />
        <Route path="defaults"          element={<AdminDefaults />} />
        <Route path="audit"             element={<AdminAudit />} />
        <Route path="profile"           element={<AdminProfile />} />
        <Route path="referrals"         element={<AdminReferrals />} />
        <Route path="membership"        element={<AdminMembership />} />
        <Route path="membership-requests" element={<AdminMembershipRequests />} />
        <Route path="settings"          element={<AdminSettings />} />
        <Route path="messages"          element={<AdminMessages />} />
      </Route>

      {/* ── Borrower ── */}
      <Route path="/borrower" element={
        <RequireRole role="borrower">
          <BorrowerLayout />
        </RequireRole>
      }>
        <Route index                    element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"         element={<BorrowerDashboard />} />
        <Route path="loans"             element={<BorrowerLoans />} />
        <Route path="profile"           element={<BorrowerProfile />} />
        <Route path="referrals"         element={<BorrowerReferrals />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { ConfigProvider } from './context/ConfigContext';

export default function App() {
  return (
    <Router>
      <ConfigProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ConfigProvider>
    </Router>
  );
}
