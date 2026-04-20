# LENDANET - Complete Flow Report & Changes Checklist

---

## PART 1: ROLE-WISE COMPLETE FLOW

---

### ADMIN - Kya Kar Sakta Hai

| Action | Screen | API | Database Table |
|--------|--------|-----|----------------|
| Sab lenders dekho | AdminLenders | GET /admin/lenders | users (role=lender) |
| Lender approve/reject karo | AdminLenders | POST /admin/update-lender-status | users, audit_logs |
| Sab borrowers dekho (risk ke saath) | AdminBorrowers | GET /admin/borrowers | borrowers, loans, installments |
| Borrower verify karo | AdminBorrowers | POST /admin/approve-borrower | users, borrowers, audit_logs |
| Sab loans dekho | AdminLoans | GET /admin/loans | loans, borrowers, users |
| Default ledger dekho | AdminDefaults | GET /admin/defaults | default_ledger, loans |
| Default hataao | AdminDefaults | POST /admin/remove-default | default_ledger, loans |
| Membership plans manage karo | AdminMembership | GET/POST /admin/membership-plans | membership_plans |
| Upgrade requests handle karo | AdminMembership | POST /membership/handle-request | upgrade_requests, users |
| System settings change karo | AdminSettings | POST /settings/update | system_settings |
| Audit logs dekho | AdminAudit | GET /admin/audit-logs | audit_logs |
| Referrals dekho | AdminReferrals | GET /admin/referrals | referrals, referral_rewards |
| Naya lender manually banao | AdminLenders | POST /auth/register | users |
| User documents dekho | AdminLenders/AdminBorrowers | View Modal | license_url, nrc_url |

**Admin Data Flow:**
```
Admin Login
  |
  v
AdminDashboard --> Stats dekhta hai (total capital, lenders, pending upgrades)
  |
  +--> AdminLenders --> Lender list --> View Profile (documents dekho) --> Approve/Reject
  |
  +--> AdminBorrowers --> Borrower list (risk GREEN/AMBER/RED) --> Verify --> View loans
  |
  +--> AdminLoans --> Sab loans --> Installment schedules dekho
  |
  +--> AdminDefaults --> Default ledger --> Remove default (loan active ho jaata hai)
  |
  +--> AdminMembership --> Plans pricing change karo --> Upgrade requests approve/reject
  |
  +--> AdminSettings --> Default threshold, borrower registration toggle
  |
  +--> AdminAudit --> Har action ka record dekho
```

---

### LENDER - Kya Kar Sakta Hai

| Action | Screen | API | Database Table |
|--------|--------|-----|----------------|
| Register karo | RegisterScreen | POST /auth/register | users |
| Login karo | LoginScreen | POST /auth/login | users |
| Borrower add karo | LenderBorrowers | POST /borrowers | borrowers, lender_borrowers |
| Existing borrower confirm karo | LenderBorrowers | POST /borrowers/confirm-add | lender_borrowers |
| Borrower edit karo | LenderBorrowers | PUT /borrowers/:id | borrowers |
| Borrower delete karo (ledger se) | LenderBorrowers | DELETE /borrowers/:id | lender_borrowers |
| Borrower ka login enable karo | LenderBorrowers | POST /borrowers/:id/enable-login | users |
| Loan create karo | LenderLoans | POST /loans | loans, loan_installments |
| Payment record karo | LenderLoans | POST /loans/:id/payment | payments, loan_installments |
| Loan default mark karo | LenderLoans | PUT /loans/:id/default | loans, default_ledger |
| Paid undo karo | LenderLoans | POST /loans/:id/undo-paid | loans |
| Borrower search karo (Premium) | LenderSearch | GET /search?q= | borrowers, loans, default_ledger |
| Upgrade request bhejo | LenderDashboard | POST /membership/upgrade | upgrade_requests |
| Profile update karo | LenderProfile | PUT /auth/update-profile | users |

**Lender Data Flow:**
```
Register --> OTP Verify --> Admin Approval (pending) --> Login
  |
  v
LenderDashboard --> Portfolio stats dekho
  |
  +--> LenderBorrowers
  |      |
  |      +--> Add Person --> NRC check --> Agar exists: Confirm popup --> Link to ledger
  |      |                              --> Agar new: Create borrower --> Auto-link
  |      |
  |      +--> View --> Borrower details + risk (if premium)
  |      +--> Edit --> Update name, phone, email, DOB
  |      +--> Delete --> Remove from ledger (borrower still exists in system)
  |      +--> Send Credentials --> Enable login --> Auto-generate password
  |
  +--> LenderLoans
  |      |
  |      +--> Create Loan --> Amount + Interest + Installments --> Auto-generate schedule
  |      +--> Record Payment --> Select installment --> Mark paid --> Auto-complete check
  |      +--> Mark Default --> RED button --> Adds to shared default ledger
  |      +--> Undo Paid --> Revert loan to active
  |
  +--> LenderSearch (PREMIUM ONLY)
  |      |
  |      +--> Search by NRC/Phone/Name
  |      +--> Results: Borrower info + Risk level + Default history
  |      +--> Free user: Masked data, "Upgrade to Premium" message
  |
  +--> Upgrade Plan --> Select Monthly/Annual --> Send request --> Admin approves
```
 
---

### BORROWER - Kya Kar Sakta Hai

| Action | Screen | API | Database Table |
|--------|--------|-----|----------------|
| Register karo (if enabled) | RegisterScreen | POST /auth/register | users, borrowers |
| Login karo | LoginScreen | POST /auth/login | users |
| Apne loans dekho | BorrowerLoans | GET /loans/my-loans | loans, installments |
| Payment karo | BorrowerLoans | POST /loans/:id/payment | payments, loan_installments |
| Profile update karo | BorrowerProfile | PUT /auth/update-profile | users |
| Referral stats dekho | BorrowerReferrals | GET /referrals/stats | referrals |

**Borrower Data Flow:**
```
Option 1: Lender adds borrower --> Enable login --> Borrower gets credentials
Option 2: Self-register (if enabled) --> OTP --> Admin approval --> Login
  |
  v
BorrowerDashboard --> Total debt, active loans, risk status dekho
  |
  +--> BorrowerLoans --> Apne sab loans dekho (from all lenders)
  |      |
  |      +--> View loan details + installment schedule
  |      +--> Make Payment --> Select installment --> Pay
  |
  +--> BorrowerProfile --> Update phone, email, DOB
```

---

## PART 2: DATA TRAVEL MAP

### Kahan Se Kahan Data Travel Hota Hai

```
[REGISTRATION]
RegisterScreen (Frontend)
    |
    | POST /auth/register (FormData with files)
    v
auth.controller.js (Backend)
    |
    | INSERT INTO users (...) + INSERT INTO borrowers (if role=borrower)
    v
MySQL Database (Railway)
    |
    | Generate lender_id (001-3XXX format)
    | Store license_url, nrc_url (uploaded files)
    v
/uploads/ folder on server

---

[BORROWER ADD]
LenderBorrowers.jsx
    |
    | POST /borrowers (name, nrc, phone, email, dob)
    v
borrower.controller.js
    |
    | SELECT * FROM borrowers WHERE nrc = ?
    |
    +--> NRC EXISTS? --> Return {exists: true, borrower details}
    |                      |
    |                      v
    |                 SweetAlert confirmation popup
    |                      |
    |                      | POST /borrowers/confirm-add
    |                      v
    |                 INSERT INTO lender_borrowers
    |
    +--> NRC NEW? --> INSERT INTO borrowers
                      INSERT INTO lender_borrowers

---

[LOAN CREATION]
LenderLoans.jsx
    |
    | POST /loans (borrower_id, amount, interest_rate, installments, type)
    v
loan.controller.js
    |
    | Calculate: total = amount + (amount * rate / 100)
    | Per installment = total / installments_count
    |
    | INSERT INTO loans
    | INSERT INTO loan_installments (x installments)
    | INSERT INTO audit_logs
    v
Database: loans + loan_installments tables

---

[PAYMENT]
LenderLoans.jsx or BorrowerLoans.jsx
    |
    | POST /loans/:id/payment (installment_id, amount)
    v
loan.controller.js
    |
    | INSERT INTO payments
    | UPDATE loan_installments SET status='paid'
    | Check: all installments paid?
    |   YES --> UPDATE loans SET status='paid'
    |   NO  --> loan stays 'active'
    v
Database: payments + loan_installments + loans

---

[DEFAULT MARKING]
LenderLoans.jsx (RED button)
    |
    | PUT /loans/:id/default
    v
loan.controller.js
    |
    | UPDATE loans SET status='default'
    | INSERT INTO default_ledger (nrc, loan_id, lender_id, amount)
    | INSERT INTO audit_logs
    v
default_ledger --> VISIBLE TO ALL LENDERS (shared risk data)

---

[SEARCH]
LenderSearch.jsx
    |
    | GET /search?q=NRC_or_Phone_or_Name
    v
search.controller.js
    |
    | SELECT * FROM borrowers WHERE nrc LIKE ? OR phone LIKE ? OR name LIKE ?
    | Check: is lender FREE or PREMIUM?
    |
    | FREE --> masked phone, no risk data, "Upgrade" message
    | PREMIUM --> full data + risk + default_ledger history
    v
Response to frontend

---

[MEMBERSHIP UPGRADE]
LenderDashboard.jsx
    |
    | POST /membership/upgrade (selected_plan: 'monthly'/'annual')
    v
membership.controller.js
    |
    | INSERT INTO upgrade_requests (status='pending')
    v
AdminMembership.jsx
    |
    | GET /membership/requests --> Show pending
    | POST /membership/handle-request (status='approved')
    v
membership.controller.js
    |
    | UPDATE upgrade_requests SET status='approved'
    | UPDATE users SET plan_type='monthly', membership_tier='premium', isPaid=true
    v
User refreshes dashboard --> GET /auth/me --> Updated plan_type shown

---

[PRICE UPDATE]
AdminMembership.jsx
    |
    | POST /admin/membership-plans/:id (price, duration_days)
    v
admin.controller.js
    |
    | UPDATE membership_plans SET price=?, duration_days=?
    v
ConfigContext.jsx (Frontend)
    |
    | On load: GET /membership/plans --> Fetch latest prices
    | Updates membershipConfig state
    v
LenderDashboard.jsx --> Shows live prices in upgrade modal
```

---

## PART 3: RISK CALCULATION FLOW

```
Risk Engine (calculated on every view, not stored):

Step 1: Count defaults
  SELECT COUNT(*) FROM default_ledger WHERE nrc = borrower.nrc
  --> defaultCount

Step 2: Count missed installments
  SELECT COUNT(*) FROM loan_installments
  WHERE loan.borrower_id = X
  AND status = 'pending'
  AND due_date < TODAY
  --> missedCount

Step 3: Get threshold from settings
  SELECT setting_value FROM system_settings WHERE setting_key = 'default_threshold'
  --> threshold (default: 3)

Step 4: Calculate risk
  if (defaultCount > 0 OR missedCount >= threshold) --> RED
  else if (missedCount > 0) --> AMBER
  else --> GREEN

Where it shows:
  - AdminBorrowers list (all borrowers)
  - LenderBorrowers list (own borrowers only)
  - LenderSearch results (premium only)
  - BorrowerDashboard (own risk)
```

---

## PART 4: PERMISSIONS MATRIX

| Feature | Admin | Lender (Free) | Lender (Premium) | Borrower |
|---------|:-----:|:-------------:|:-----------------:|:--------:|
| Register | - | Self | Self | Self |
| Approve users | YES | - | - | - |
| Add borrowers | - | YES | YES | - |
| Create loans | YES | YES | YES | - |
| Record payments | YES | YES | YES | YES |
| Mark defaults | YES | YES | YES | - |
| Remove defaults | YES | - | - | - |
| Search borrowers | - | NO | YES | - |
| See risk levels | YES | Own only | All | Own only |
| See default ledger | YES | NO | YES | - |
| Manage membership | YES | Request only | Request only | - |
| View audit logs | YES | - | - | - |
| Update settings | YES | - | - | - |
| View documents | YES | - | - | - |

---

## PART 5: CHANGES CHECKLIST - Kaise Check Karein

Below are ALL changes made. Follow each step to verify.

---

### Change 1: NRC Search Fix
**Files Changed:** `search.controller.js`
**What Changed:** Exact match (`nrc = ?`) replaced with partial match (`nrc LIKE ?`), name search added

**How to Test:**
1. Login as Lender (Premium plan)
2. Go to "Search Borrowers" page
3. Enter partial NRC (e.g., `1234` instead of `123456/78/1`)
4. Result should show matching borrowers
5. Search by name (e.g., `Memory`) -- should also work
6. Search by partial phone number -- should also work

---

### Change 2: Missing Database Columns (Registration & Membership Fix)
**Files Changed:** `schema.sql`, `manual_migrate.js`
**Columns Added to users table:** `company_registration_number`, `lender_type`, `lender_id`, `plan_type`, `nrc_url`
**Columns Added to upgrade_requests:** `requested_plan`
**Columns Added to borrowers:** `nrc_url`

**How to Test:**
1. Railway pe `node manual_migrate.js` run karo
2. Console mein dekhna chahiye: "Added company_registration_number to users" etc.
3. Try registering a new lender -- should NOT crash anymore
4. Try membership upgrade request -- should NOT give server error

---

### Change 3: Duplicate NRC Handling
**Files:** `borrower.controller.js` (backend), `LenderBorrowers.jsx` (frontend)
**Status:** Already implemented (was already working)

**How to Test:**
1. Login as Lender
2. Go to "Borrower Info" page
3. Click "Add Person"
4. Enter an NRC that already exists in system
5. Should see popup: "People Already Registered!" with borrower name
6. Click "Yes, Add to Ledger" -- borrower links to your ledger
7. Click "No, Cancel" -- nothing happens
8. Try same NRC again -- should say "already in your ledger"

---

### Change 4: Document Viewing in Admin Panel
**Files Changed:** `AdminLenders.jsx`, `AdminBorrowers.jsx` (frontend), `auth.controller.js`, `borrower.controller.js`, `admin.controller.js` (backend)

**How to Test:**
1. Login as Admin
2. Go to "Lender Management"
3. Click "View Details" on any lender
4. Scroll down -- should see "Uploaded Documents" section with:
   - Proof of Licence (image or "Not Uploaded")
   - NRC Document (image or "Not Uploaded")
5. Go to "Borrower Management"
6. Click "View" on any borrower
7. Scroll down -- should see "Uploaded Documents" section with:
   - Proof of ID / Photo
   - NRC Document

---

### Change 5: Membership Plans (3 Tiers: Free, Monthly, Annual)
**Files Changed:** `schema.sql`, `manual_migrate.js`

**How to Test:**
1. Railway pe `node manual_migrate.js` run karo
2. Login as Admin
3. Go to "Membership Plans"
4. Should see 3 plans: Free, Monthly, Annual
5. Previously only Free + Premium dikhta tha, ab Monthly + Annual alag hain
6. Change Monthly price (e.g., 15) -- save
7. Logout, login as Lender
8. Go to Dashboard -- click "Upgrade to Premium"
9. Monthly price should show K15 (updated price, not hardcoded K10)

---

### Change 6: Dynamic Pricing (Admin price change reflects on user side)
**Files Changed:** `ConfigContext.jsx`, `membership.routes.js`

**How to Test:**
1. Login as Admin
2. Go to "Membership Plans"
3. Change Monthly price to K20, Annual to K150
4. Now login as Lender (or open new tab)
5. Go to Dashboard -- click "Upgrade to Premium"
6. Modal should show: Monthly = K20/Mo, Annual = K150/Yr
7. These are LIVE prices from database, not hardcoded

---

### Change 7: Admin Upgrade Reflects in User Profile
**Files Changed:** `AuthContext.jsx`, `auth.controller.js`, `auth.routes.js`, `LenderDashboard.jsx`

**How to Test:**
1. Login as Admin
2. Go to "Membership Plans" -- approve an upgrade request
   OR go to "Borrower Management" -- change user tier
3. Now login as that Lender
4. Dashboard should show "Premium Plan" (not "Free Plan")
5. Header should say "Premium Plan (Monthly)" or "Premium Plan (Annual)"
6. This works because dashboard calls `/auth/me` to refresh user data

---

### Change 8: Registration Flow (Lender)
**Status:** Already implemented

**How to Test:**
1. Go to Register page
2. Select "Lender" tab
3. Fill: Name*, Phone*, Password*, NRC or Company Reg No*, Lender Type*
4. Optional: Business Name, Email, License upload, NRC document upload
5. Click Register
6. OTP screen appears -- enter `123456` (hardcoded for now)
7. Redirect to Login
8. Login -- see "Awaiting Admin Approval" message
9. Admin approves -- lender can now use full platform

---

### Change 9: Lender ID Format (001-3XXX)
**Status:** Already implemented

**How to Test:**
1. Register a new lender
2. After admin approval, login as that lender
3. Dashboard header shows Lender ID like `001-3001`
4. Register another lender -- ID should be `001-3002`
5. IDs auto-increment sequentially

---

### Change 10: Loan Default Red Button
**Status:** Already implemented

**How to Test:**
1. Login as Lender
2. Go to "Loans" page
3. View any active loan
4. Scroll to bottom -- "Mark As Default" button is RED (bg-red-600)
5. Click it -- confirmation popup appears
6. Confirm -- loan status changes to "default"
7. Button disappears (can't mark default twice)

---

## QUICK DEPLOYMENT CHECKLIST

After pushing code to Railway:

```
Step 1: Backend deploy ho jaaye (auto-deploy from GitHub)
Step 2: Railway console me run karo:
        node manual_migrate.js
Step 3: Console output check karo:
        - "Renamed Premium to Monthly"
        - "Added nrc_url to users"
        - "Added nrc_url to borrowers"
        - "Added requested_plan to upgrad
        - "Migration complete!"
Step 4: Frontend build banao aur deploy karo
Step 5: Test login karo (admin/lender/borrower)
Step 6: Upar diye gaye test steps follow karo
```
