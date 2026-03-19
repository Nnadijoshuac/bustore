# BushaPay

> Modern global payment platform for freelancers, creators, and small businesses in Africa and beyond.

![BushaPay](https://img.shields.io/badge/BushaPay-MVP-00C896?style=flat-square)

## Overview

BushaPay lets you:
- **Receive global payments** via shareable payment links
- **Track incoming payments** in a clean transaction dashboard
- **Manage your USD balance**
- **Settle funds locally** to any Nigerian, Ghanaian, Kenyan, or South African bank account

> Crypto is completely abstracted. Users interact with a Stripe/Paystack-style experience.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | Custom + Radix primitives |
| Data fetching | TanStack Query |
| State | Zustand |
| Validation | Zod + react-hook-form |
| Auth/DB | Supabase |
| Charts | Recharts |
| Animation | Framer Motion |

---

## Getting Started

```bash
git clone https://github.com/Nnadijoshuac/BushaHackAthoN
cd BushaHackAthoN
npm install
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it runs in demo mode by default.

---

## Project Structure

```
bushapay/
├── app/
│   ├── (auth)/         # Login, Register
│   ├── (dashboard)/    # All authenticated pages
│   │   ├── overview/
│   │   ├── transactions/
│   │   ├── payment-links/
│   │   ├── recipients/
│   │   ├── settlements/
│   │   ├── webhooks/
│   │   └── settings/
│   └── pay/[slug]/     # Public payment page
├── components/
│   ├── ui/             # Base UI primitives
│   └── shared/         # Sidebar, Topbar, Providers
├── lib/
│   ├── api/            # Service layer + demo data
│   ├── store/          # Zustand stores
│   ├── utils/          # cn, formatCurrency, etc.
│   └── validations/    # Zod schemas
└── types/              # Core TypeScript types
```

---

## Feature Branches (Git History)

| Branch | Feature |
|---|---|
| `chore/setup` | Next.js init, configs, types, utils, store |
| `feature/dashboard` | Overview, charts, stats |
| `feature/transactions` | Transaction list with filters |
| `feature/payment-links` | Payment link management + creation |
| `feature/public-payment-page` | Public /pay/[slug] page |
| `feature/recipients` | Recipient management |
| `feature/settlements` | Settlement flow with rate preview |
| `feature/webhooks` | Webhook endpoint management |
| `chore/demo-mode` | Demo data + demo banner |

---

## API Integration (TODO)

All Busha API calls are isolated in `lib/api/service.ts`.
Each function has a `// TODO: confirm Busha API` comment.
Replace mock implementations with real Busha API calls once credentials are confirmed.

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# TODO: Busha API credentials
BUSHA_API_KEY=
BUSHA_API_SECRET=
BUSHA_API_BASE_URL=
```

---

Built at **Busha Hackathon** 2024

# bustore
