# Sonachala Pay — Phase 1 (Frontend Only)

Frontend-only prototype for Phase 1 scope: **Admin + Merchant (QR & Payment Link based)**, built per Sir's IppoPay MVP reference (auth -> onboarding -> KYC -> admin approval -> QR/Payment Link -> transactions -> settlements -> dashboards).

No backend. All data is mock, stored in the browser's `localStorage`. Refreshing the page keeps your data; clearing browser storage resets it to the seed data.

## Tech Stack
- React + Vite
- Tailwind CSS
- Framer Motion (animations)
- Recharts (admin KPI chart)
- Lucide React (icons)
- qrcode.react (QR code generation)
- React Router

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## Demo Logins

**Merchant** (already active + KYC approved, so you can explore QR & Payment Links immediately)
- Email: `selvi@shop.com`
- Password: `merchant123`

**Admin**
- Email: `admin@sonachalapay.in`
- Password: `admin123`

Both demo buttons are also available directly on the Login screen.

## Try the flow end-to-end

1. Logout, then click Register -> create a brand-new merchant account.
2. You'll be routed to KYC Upload — enter any PAN/Aadhaar and a fake file, submit.
3. Your new merchant is now "pending" — QR/Payment Links stay locked.
4. Login as Admin, go to KYC Verification, approve the new merchant.
5. Login back as that merchant — QR and Payment Link screens are now unlocked.
6. Generate a QR or Payment Link, click "Simulate payment" — it creates a Transaction + a pending Settlement.
7. As Admin, go to Settlements and mark it "Settled".

## What's implemented (Phase 1 scope only)

- Auth: Register, Login, Logout, session persistence
- Merchant Onboarding (business profile form)
- KYC Upload (PAN, Aadhaar, document — stored as separate fields per Sir's schema)
- Admin Verification (Approve/Reject -> activates merchant)
- QR Code Generation (Static + Dynamic modes)
- Payment Link Generation (amount, note, expiry, copy-to-share)
- Transaction Recording (auto-created on simulated QR scan / link payment)
- Settlement Tracking (auto-created pending, Admin can mark settled)
- Merchant Dashboard (KPIs, recent transactions, locked-state UI pre-approval)
- Admin Panel (Merchant management, KYC queue, transaction monitor, settlement management, KPI dashboard with 7-day volume chart)

- Services module (Merchant side): Loan, Insurance, SoundBox, POS Device — merchant fills a short IppoPay-style form and submits a request; button locks to "Requested" until Admin decides.
- Service Requests (Admin side): single queue to Approve/Reject any Loan, Insurance, SoundBox, or POS Device request, with full submitted details shown per row.

## Deferred to later phases (per Sir's scope call)
Agent, Agency, and Super Admin roles — not in this build. Loan/Insurance eligibility logic, EMI calculation, and real device dispatch are also out of scope — Phase 1 only sends the request to Admin.
