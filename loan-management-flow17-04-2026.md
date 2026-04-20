Zaroor! Aapka project "Lendanet" ek comprehensive Loan Management System hai. Maine pure project ka deep analysis kar liya hai, aur niche Hinglish me samjhaya hai ki ye backend, frontend aur database level par kaise kaam karta hai.

1. Membership Menu Kaam Kaise Karta Hai (Admin Panel)
Jo image aapne share ki hai, wo Membership Plans manage karne ki screen hai. Iska kaam platform ki monetization aur subscription model ko handle karna hai.

Logic (Frontend): AdminMembership.jsx file iska UI handle karti hai. Isme Admin ko 3 cards dikhte hain: Free, Monthly, aur Annual.
Fields:
Price (K): Ye wo amount hai jo ek Lender ko pay karni hogi premium features (jaise shared borrower search) ke liye.
Days: Ye subscription ki validity hai (jaise 30 days ya 365 days).
Backend Flow: Jab Admin koi price ya days change karke update karta hai, toh ek POST request /admin/membership-plans/:id par jaati hai. Backend controller (admin.controller.js) database ki membership_plans table me value update kar deta hai.
Impact: Jab koi Lender apna plan upgrade karne ki koshish karta hai, toh use yahi dynamically updated prices dikhte hain.
2. Pura Project Flow (Kahan se kya hota hai)
Project me main 3 roles hain: Admin, Lender, aur Borrower. Unka flow niche diya gaya hai:

A. Registration & Approval Flow
Lender/Borrower Register karte hain (License aur NRC documents upload karke).
Unka status initially "Pending" hota hai.
Admin unke documents verify karke unhe "Approve" karta hai (AdminLenders.jsx / AdminBorrowers.jsx).
B. Borrower Management (Shared Database)
Lender kisi bhi borrower ko NRC (National ID) ke through add karta hai.
Agar wo borrower pehle se system me hai (kisi aur lender ke paas), toh system Duplicate NRC Alert deta hai aur risk history dikhata hai.
Isse lenders ko pata chalta hai ki borrower pehle se defaulter toh nahi hai.
C. Loan & Installment Flow
Lender loan create karta hai: Amount + Interest + Number of Installments.
System auto-calculate karke Installment Schedule bana deta hai (loan.controller.js).
Borrower ya Lender payment record karte hain, jisse installments "Paid" mark ho jaati hain.
D. Risk Engine (Sabse Import Features)
System har borrower ka Risk Level (RED, AMBER, GREEN) calculate karta hai.
RED: Agar borrower ne kisi bhi lender ka loan default kiya hai ya bahut saari installments miss ki hain.
AMBER: Agar kuch installments overdue hain.
GREEN: Agar borrower time par pay kar raha hai.
Ye data default_ledger table se aata hai jo saare Lenders ke beech shared rehta hai.
E. Premium Features (Membership)
Free Lenders: Sirf apne hi borrowers aur loans dekh sakte hain.
Premium Lenders (Monthly/Annual): Pure system me search kar sakte hain (LenderSearch.jsx) aur kisi bhi borrower ki purani defaults/risk profile dekh sakte hain loan dene se pehle.