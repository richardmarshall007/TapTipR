# TapTipR

Digital tipping platform for hospitality and service workers — when there is no tip jar or card terminal tipping.

## Prototype

Interactive Next.js prototype demonstrating:

- Employee onboarding and personal QR codes
- Business (generic) QR with employee selection
- NPS rating flow (optional)
- Stored-value wallet top-up and tipping
- Employee withdrawal flow (demo)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo flows

| Flow | URL |
|------|-----|
| Home | `/` |
| Employee signup | `/register?role=employee` |
| Employee QR dashboard | `/employee/dashboard` |
| Tip Maria (employee QR) | `/tip/e/MARIA-7K2P` |
| Tip Starbucks (business QR) | `/tip/b/SBUX-DEMO` |
| Wallet | `/wallet` |

## Product design

See [docs/PRODUCT_DESIGN.md](docs/PRODUCT_DESIGN.md) for architecture, payment strategy (Stripe + Visa Direct), data model, and roadmap.

## Production path

| Phase | Integration |
|-------|-------------|
| Auth | Phone OTP (Clerk / Twilio Verify) |
| Top-ups | Stripe Checkout Sessions |
| Payouts | Stripe Connect or Visa Direct |
| Mobile | PWA now → React Native / Expo later |

## Tech stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- Client-side demo session (localStorage)

Payments and auth are mocked in this prototype.
