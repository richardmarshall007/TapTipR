# TapTipR — Product Design

Digital tipping platform for hospitality and service workers when cash tip jars or card-terminal tipping are unavailable.

## Problem

Restaurant, café, and hospitality staff often miss tips because:

- No physical tip jar
- POS/card terminals are not configured for tipping
- Customers increasingly carry little or no cash

## Solution

TapTipR is a **stored-value wallet** platform. Employees share a QR code; customers scan, optionally rate service, load a wallet if needed, and send a digital tip instantly.

---

## User Roles

| Role | Description |
|------|-------------|
| **Employee** | Waitstaff, baristas, bartenders, hospitality workers who receive tips |
| **Customer** | Patron who scans QR and sends a tip |
| **Employer** | Optional verifier of employee participation (e.g. Starbucks manager) |
| **Merchant** | TapTipR partner where employees can spend wallet balance |

---

## Core Flows

### 1. Employee Onboarding

```
Download app / Visit website
  → Register (name, phone, workplace)
  → Receive Unique Employee Code + personal QR
  → Optional: employer verifies employee
  → Display QR to customers during service
```

**Employee QR** encodes a deep link: `https://taptipr.com/tip/e/{employeeCode}`

### 2. Business (Generic) QR

Participating businesses receive a **Generic Business Code** for shared use (counter, receipt, table tent).

```
Customer scans business QR
  → Select employee on shift (or skip)
  → Rate location/service (NPS 0–10) or skip
  → Enter tip amount
  → Pay from TapTipR wallet (top up if needed)
```

**Business QR** encodes: `https://taptipr.com/tip/b/{businessCode}`

### 3. Customer Tip Flow

```
Scan employee or business QR
  → [Business only] Pick employee on shift
  → NPS rating (optional)
  → Choose tip amount ($3 / $5 / $10 / custom)
  → If wallet balance insufficient → Top up wallet
      • Credit/debit card (Stripe Checkout)
      • Bank transfer (ACH / open banking)
  → Confirm tip → Instant credit to employee wallet
```

Customers may load **more than the tip** (e.g. $30 balance, $10 tip) for future use.

### 4. Employee Payout

```
Employee receives tip in TapTipR wallet
  → Spend at TapTipR merchant network, OR
  → Withdraw to linked bank account (Visa Direct / ACH)
```

---

## Ratings (NPS)

- **Scale:** 0–10 (Net Promoter Score)
- **Prompt:** "How likely are you to recommend [Employee / Location]?"
- **Optional:** Customer may skip and tip directly
- **Business value:** Aggregated scores for employers; individual scores for employees (with privacy controls)

---

## Wallet Model

TapTipR operates a **closed-loop stored-value wallet** per user:

| Wallet action | Direction | Settlement |
|---------------|-----------|--------------|
| Top-up | Customer → TapTipR float | Card/bank via payment processor |
| Tip | Customer → Employee | Internal ledger transfer |
| Spend | Employee → Merchant | Internal redemption |
| Withdraw | Employee → Bank | Visa Direct / ACH payout |

**Ledger principles:**

- Every movement is an immutable transaction record
- Customer balance = sum(credits) − sum(debits)
- Platform holds pooled funds in a regulated float account (production)

---

## Payment Architecture (Production)

### Recommended stack

| Capability | Provider | Notes |
|------------|----------|-------|
| Card top-ups | **Stripe Checkout Sessions** | Fastest path to production |
| Saved payment methods | **Stripe Setup Intents** | For repeat top-ups |
| Employee payouts | **Stripe Connect** or **Visa Direct** | Connect for marketplace; Visa Direct for push-to-card |
| Bank top-ups | **Stripe Financial Connections** or Plaid + ACH | Lower fees at scale |
| KYC / compliance | Stripe Identity, Connect onboarding | Required for payouts |

### Visa Direct integration

Visa Direct enables **push payments to debit cards** — ideal for instant employee withdrawals:

1. Employee links debit card during onboarding
2. Withdrawal request creates a Visa Direct OCT (Original Credit Transaction)
3. Funds arrive in minutes vs. 1–3 days for ACH

**Requirements:** Visa Direct acquirer partnership or processor (Stripe, Marqeta, Galileo).

### Stripe Connect (marketplace model)

```
Customer top-up → Platform balance
Tip transfer   → Employee Connect account (instant or daily payout)
Withdrawal     → Employee bank via Connect payouts
```

Use **Accounts v2** with controller properties for platform liability model.

---

## Data Model (Conceptual)

```
User
  id, phone, name, role (customer | employee | employer_admin)
  wallet_balance_cents
  stripe_customer_id | connect_account_id

EmployeeProfile
  user_id, workplace_id, employee_code, verified_at, verified_by

Workplace
  id, name, slug, business_code, logo_url, employer_id

Tip
  id, from_user_id, to_employee_id, amount_cents, nps_score?, workplace_id?, created_at

WalletTransaction
  id, user_id, type (top_up | tip_sent | tip_received | withdraw | spend)
  amount_cents, reference_id, created_at

Rating
  id, tip_id?, employee_id?, workplace_id?, nps_score, comment?
```

---

## QR Code Strategy

| Type | URL pattern | Use case |
|------|-------------|----------|
| Employee | `/tip/e/{code}` | Personal phone display, badge, lanyard |
| Business | `/tip/b/{code}` | Counter stand, receipt, table tent |

QR should be **SVG/PNG** with TapTipR branding and employee name overlay for personal codes.

---

## Employer Verification (Optional)

1. Employer registers workplace on TapTipR
2. Employee selects workplace during signup
3. Employer approves employee in admin portal
4. Verified badge shown to customers at tip time

Benefits: fraud reduction, payroll integration potential, aggregated analytics.

---

## Mobile App Strategy

**Phase 1 — PWA (included in web prototype)**

- Installable from browser
- Camera QR scan via `getUserMedia` / BarcodeDetector API
- Push notifications for received tips

**Phase 2 — Native (React Native / Expo)**

- Shared API with web
- Better camera UX, Apple/Google Pay for top-ups
- App Store / Play Store distribution

The app is **dual-purpose**: same account acts as tip sender or receiver based on context.

---

## Security & Compliance

- PCI DSS: card data never touches TapTipR servers (Stripe-hosted fields)
- KYC for employees receiving payouts above thresholds
- AML monitoring on large or suspicious transfers
- GDPR/CCPA: data export and deletion
- Tip income reporting tools for employees (1099-K coordination where applicable)

---

## Prototype Scope (This Repository)

The interactive prototype demonstrates:

- Landing page and role selection
- Employee registration and QR display
- Customer tip flow with NPS
- Mock wallet with top-up and tip send
- Transaction history

Production integrations (Stripe, Visa Direct, real auth) are documented but mocked in the prototype.

---

## Roadmap

| Phase | Deliverable |
|-------|-------------|
| **M0** | Prototype (this repo) — UX validation |
| **M1** | Auth (Clerk/phone OTP), Stripe top-ups, internal ledger |
| **M2** | Stripe Connect employee onboarding, bank withdrawals |
| **M3** | Employer portal, verification, analytics |
| **M4** | Visa Direct instant payout, merchant spend network |
| **M5** | Native apps, POS integrations |
