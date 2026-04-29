# Busha Integration Notes

This document lists the Busha features that are currently integrated into the project, where they are implemented, why they were added, and how each integration works.

## 1. Payment Links

- Busha feature used: `GET /v1/payments/links`, `GET /v1/payments/links/{slug}`, `POST /v1/payments/links`
- Where:
  - `app/api/payment-links/route.ts`
  - `app/api/payment-links/[slug]/route.ts`
  - `lib/api/busha-normalizers.ts`
  - `app/(dashboard)/payment-links/page.tsx`
- Why:
  - Payment links are the core seller workflow in Fluent.
  - They allow sellers to create collection points quickly and share or embed them on external sites.
- How:
  - Server routes call Busha using the secret API key through `createBushaClient()`.
  - Responses are normalized with `normalizePaymentLink()` so the UI gets one stable internal shape.
  - The dashboard page lets sellers create a link, then copy the hosted link, checkout embed iframe, QR iframe, or pay button snippet.

## 2. Payment Requests

- Busha feature used: `POST /v1/payments/requests`, `GET /v1/payments/requests/{id}`
- Where:
  - `app/api/payment-requests/route.ts`
  - `app/api/payment-requests/[id]/route.ts`
  - `app/pay/[slug]/page.tsx`
- Why:
  - This is the live checkout engine behind each public pay page.
  - It gives QR instructions, wallet or bank details, status polling, and confirmation state.
- How:
  - The public pay page calls the local API route.
  - The local route uses Busha public-key payment request endpoints.
  - The response is normalized into the app's `PaymentRequest` shape and then polled from the pay page until it is no longer pending.
  - Demo fallback remains in place if Busha public-key configuration is missing or Busha returns a server-side failure.

## 3. Customers

- Busha feature used: `GET /v1/customers`, `POST /v1/customers`, `GET /v1/customers/{id}`, `POST /v1/customers/{id}/verify`
- Where:
  - `app/api/customers/route.ts`
  - `app/api/customers/[id]/route.ts`
  - `app/api/customers/[id]/verify/route.ts`
  - `lib/api/busha-normalizers.ts`
  - `app/(dashboard)/customers/page.tsx`
- Why:
  - Fluent already exposes a customer/KYC workflow, so it should read and write against Busha instead of staying local-only.
- How:
  - Customer create, list, detail, and verify routes proxy Busha endpoints from the server.
  - Customer data is normalized with `normalizeCustomer()`.
  - Local customer storage is kept as a fallback cache if Busha is temporarily unavailable.

## 4. Recipients

- Busha feature used: `GET /v1/recipients`, `POST /v1/recipients`, `GET /v1/recipient-requirements`
- Where:
  - `app/api/recipients/route.ts`
  - `app/api/recipients/requirements/route.ts`
  - `lib/api/busha-normalizers.ts`
  - `app/(dashboard)/recipients/page.tsx`
- Why:
  - Recipients are required for payout or settlement-style flows.
  - Busha requirement discovery is useful because required fields vary by country and currency.
- How:
  - Fluent fetches live recipient requirements from Busha before a recipient is created.
  - Recipient records and dynamic fields are normalized with `normalizeRecipient()` and `normalizeRecipientRequirement()`.

## 5. Transactions

- Busha feature used: `GET /v1/transactions`
- Where:
  - `app/api/transactions/route.ts`
  - `lib/api/busha-normalizers.ts`
  - `lib/api/service.ts`
  - `app/(dashboard)/transactions/page.tsx`
  - `app/(dashboard)/overview/page.tsx`
- Why:
  - Transactions are the cleanest documented source for account activity and historical ledger data.
  - They were previously fully demo-backed.
- How:
  - A local API route fetches Busha transactions from the server and normalizes them with `normalizeTransaction()`.
  - The normalizer maps Busha transaction direction into Fluent's simpler `incoming`, `outgoing`, and `settlement` view model.
  - The dashboard transactions page and overview recent-activity feed now use this route through `lib/api/service.ts`.
  - If Busha fails, the route falls back to demo data instead of hard-crashing the UI.

## 6. Dashboard Stats Derived From Busha Activity

- Busha feature used: Busha-backed transactions, customers, and payment links
- Where:
  - `lib/api/service.ts`
  - `app/(dashboard)/overview/page.tsx`
- Why:
  - The overview page should reflect live operational data where possible.
  - Previously the stats grid and chart were mostly demo-driven.
- How:
  - `getDashboardStats()` now derives:
    - total received
    - 30-day change
    - pending outbound value
    - active payment links
    - transaction count in the last 30 days
    - average transaction size
    - customer count
  - `getChartData()` now builds a 30-day activity chart from Busha-backed transactions.
  - Demo fallback remains for resilience.

## 7. Balance Summary

- Busha feature used: `GET /v1/balances`
- Where:
  - `app/api/account/route.ts`
  - `lib/api/busha-normalizers.ts`
  - `lib/api/service.ts`
  - `app/(dashboard)/overview/page.tsx`
  - `app/(dashboard)/settlements/page.tsx`
  - `app/(dashboard)/settings/page.tsx`
- Why:
  - The highest-visibility balance cards were still hard-coded to the demo account even when Busha was configured.
- How:
  - A local account route fetches Busha balances on the server.
  - The balances response is collapsed into one UI-friendly account summary with USD balance plus a preferred local fiat balance.
  - Overview, settlements, and settings now read from this summary and fall back to demo data only when the Busha request fails.

## 8. Quote Preview For Settlements

- Busha feature used: `POST /v1/quotes`
- Where:
  - `app/api/quotes/route.ts`
  - `lib/api/busha-normalizers.ts`
  - `lib/api/service.ts`
  - `app/(dashboard)/settlements/page.tsx`
- Why:
  - The settlements screen was showing a fixed demo exchange rate.
  - Busha quotes are the documented way to get live conversion terms and fees before executing a payout flow.
- How:
  - A local quote route proxies `POST /v1/quotes`.
  - The normalizer converts Busha quote responses into the local `Quote` type.
  - The settlements drawer now requests a live quote when the user chooses a recipient and amount.
  - The UI shows target amount, quote rate, fees, and expiry when available.

## 9. Live Settlement Execution

- Busha feature used: `POST /v1/quotes`, `POST /v1/transfers`, optional `GET /v1/transfers`
- Where:
  - `app/api/settlements/route.ts`
  - `lib/api/busha-normalizers.ts`
  - `lib/api/service.ts`
  - `lib/api/settlement-store.ts`
  - `app/(dashboard)/settlements/page.tsx`
- Why:
  - The settlements screen previously stopped at quote preview and then pretended to create a payout with demo data.
  - That is fine for a mock, but not for an integration dashboard.
- How:
  - The server now creates a Busha quote for the selected recipient and amount, then finalizes it with `POST /v1/transfers` using the returned `quote_id`.
  - Transfer responses are normalized into the app's `Settlement` shape.
  - The client now treats settlement creation as a real Busha call and surfaces API failures instead of faking a successful payout.
  - A lightweight in-memory store keeps newly created settlements visible immediately in the UI, while `GET /v1/transfers` is used when available.

## 10. Hosted Checkout / Embedded Surfaces

- Busha feature used: hosted checkout and payment links, plus Busha widget-style embed patterns
- Where:
  - `app/(dashboard)/payment-links/page.tsx`
  - `app/pay/[slug]/page.tsx`
- Why:
  - Fluent's product direction includes allowing merchants to embed payment collection into their own website or landing page.
- How:
  - Payment links now expose:
    - embedded checkout iframe
    - embedded QR iframe
    - pay button HTML
  - The public pay route supports `?embed=card` and `?embed=qr` so merchants can drop a Busha-backed Fluent payment surface into external pages.

## 11. What Is Still Demo-Backed

- `app/api/settlements/route.ts`
  - if `GET /v1/transfers` is unavailable in the current Busha environment, settlement history falls back to the local in-memory cache or demo history
- `lib/api/settlement-store.ts`
  - recently created settlements are cached in memory for immediate UX feedback, not durable storage

## Why These Parts Are Still Partly Demo

- The Busha documentation provided here clearly supports:
  - payment links
  - payment requests
  - customers
  - recipients
  - quotes
  - transactions
  - balances
  - transfers
- The remaining compromise is history durability, not transfer execution itself. The app can now create live Busha transfers, but it still needs either a guaranteed transfer-list endpoint in the active environment or durable application storage to make settlement history fully authoritative across refreshes and deployments.

## Validation Performed

- `npm run lint`
- `npm run build`
