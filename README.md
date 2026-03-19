# Fluent

Fluent is a Busha-powered payments workspace for freelancers, creators, and lean African businesses. It wraps Busha payment links, payment requests, customers, recipients, and webhook flows in a cleaner product experience.

## What it does

- Create payment links for invoices or project milestones
- Turn payer details into live Busha payment requests
- Show QR code, address, amount, and payment status polling on the public pay page
- Manage customers, recipients, settlements, and webhook activity from a single dashboard

## Submission angle

Fluent is positioned as the operational layer on top of Busha:

- `Fluent` owns the product experience, dashboard, and branded pay flow
- `Busha` powers the underlying payment links, payment requests, customer onboarding, and payout rails

This makes the demo easy to explain in a hackathon:

1. Create a payment link
2. Share it with a client
3. Client opens the pay page and starts checkout
4. Fluent creates a real Busha payment request
5. Busha returns live pay-in instructions and status

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod + React Hook Form
- Supabase
- Busha API

## Key routes

- `/` - product landing page
- `/register` - demo onboarding
- `/overview` - dashboard summary
- `/payment-links` - create and manage payment links
- `/pay/[slug]` - public payment flow backed by Busha payment requests
- `/customers` - Busha customer creation and verification
- `/recipients` - recipient management
- `/webhooks` - webhook visibility

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

Required values are documented in `.env.local.example`.

Important integration variables:

- `BUSHA_API_SECRET`
- `BUSHA_API_BASE_URL`
- `NEXT_PUBLIC_BUSHA_PUBLIC_API_KEY`
- `BUSHA_WEBHOOK_SIGNING_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Current integration status

- Payment links: live Busha API
- Payment requests: live Busha API
- Customers: Busha-backed, with sandbox limitations on some create flows
- Recipients: Busha-backed, depending on sandbox-supported requirements endpoints
- Webhooks: receiver and dashboard present

## Validation

```bash
npm run build
npm run lint
```
