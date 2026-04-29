# Busha Developer Documentation — Complete Scrape
> Source: https://docs.busha.io  
> Scraped: April 29, 2026  
> Pages: 42 pages — Overview, Guides, Examples, API Reference, Changelog, Reference

---

## Table of Contents

### Overview (Core Concepts)
1. [Homepage — Build with Busha](#1-homepage--build-with-busha)
2. [Quotes](#2-quotes)
3. [Transfers](#3-transfers)
4. [Customers](#4-customers)
5. [Multi-Currency Accounts](#5-multi-currency-accounts)
6. [Transactions](#6-transactions)
7. [Fees](#7-fees)
8. [On-Ramp Widget](#8-on-ramp-widget)
9. [Off-Ramp Widget](#9-off-ramp-widget)
10. [Compliance](#10-compliance)

### Guides — Getting Started
11. [Quick Start](#11-quick-start)
12. [Choose Your Integration Path](#12-choose-your-integration-path)
13. [Setting up a Sandbox](#13-setting-up-a-sandbox)
14. [Generate API Keys](#14-generate-api-keys)
15. [Making Your First Request](#15-making-your-first-request)

### Guides — Accept Payments (API)
16. [Create Your First Payment Request](#16-create-your-first-payment-request)
17. [Retrieve Payment Request](#17-retrieve-payment-request)
18. [Process Fiat Deposits](#18-process-fiat-deposits)
19. [Process Deposits with Quote Currency](#19-process-deposits-with-quote-currency)

### Guides — Accept Payments (SDK & Widgets)
20. [Accept Stablecoin with SDK Integration](#20-accept-stablecoin-with-sdk-integration)
21. [Accept Stablecoin with Payment Links](#21-accept-stablecoin-with-payment-links)
22. [Integrate On-Ramp Widget](#22-integrate-on-ramp-widget)
23. [Integrate Off-Ramp Widget](#23-integrate-off-ramp-widget)

### Guides — On/Off Ramp (API)
24. [Create Your First Quote](#24-create-your-first-quote)
25. [Retrieve a Quote](#25-retrieve-a-quote)
26. [Process Crypto Deposits](#26-process-crypto-deposits)
27. [Process Payouts](#27-process-payouts)
28. [Process Crypto Payouts](#28-process-crypto-payouts)

### Guides — Customer Onboarding (B2B2C)
29. [Create an Individual Customer](#29-create-an-individual-customer)
30. [Create a Business Customer](#30-create-a-business-customer)
31. [Retrieve Customers](#31-retrieve-customers)
32. [Verify Customer Identity](#32-verify-customer-identity)
33. [Initiate Transactions on Behalf of Customers](#33-initiate-transactions-on-behalf-of-customers)

### Guides — Balance, Recipients, Webhooks, Misc
34. [Manage Balance Accounts](#34-manage-balance-accounts)
35. [Convert Between Balances](#35-convert-between-balances)
36. [Create and Manage Recipients](#36-create-and-manage-recipients)
37. [Token Sharing](#37-token-sharing)
38. [Request IDs](#38-request-ids)
39. [Set Up Webhooks](#39-set-up-webhooks)
40. [Webhook Events](#40-webhook-events)

### Reference
41. [Addresses, Banks, and Mobile Money](#41-addresses-banks-and-mobile-money)
42. [Currency Pairs](#42-currency-pairs)
43. [Recipients Reference](#43-recipients-reference)
44. [Supported Payment Channels](#44-supported-payment-channels)
45. [Supported Currencies](#45-supported-currencies)
46. [Supported Countries](#46-supported-countries)
47. [Supported Transfer Types](#47-supported-transfer-types)
48. [Supported Industries](#48-supported-industries)
49. [Test Addresses For Off-Ramp Operations](#49-test-addresses-for-off-ramp-operations)
50. [Transfer Status](#50-transfer-status)

### API Reference & Changelog
51. [API Reference Introduction](#51-api-reference-introduction)
52. [Changelog](#52-changelog)

---

## 1. Homepage — Build with Busha

**URL:** https://docs.busha.io/

Build modern financial products with Busha — from payment collection and stablecoin flows to on/off-ramp APIs and customer onboarding for B2B2C experiences.

**What you can build:**
- Accept payments via API — server-to-server, webhooks, full control
- Accept payments via SDK / widgets — hosted checkout and payment links
- On-ramp and off-ramp via API — fiat-to-crypto and crypto-to-fiat with quote + transfer APIs
- Customer onboarding for B2B2C — create and verify customers, transact on their behalf

**Recommended implementation sequence:**
1. Complete Quick Start, then Generate API key
2. Make your first request to validate authentication
3. Follow "Choose Integration Path" and ship one full flow before expanding

---

## 2. Quotes

**URL:** https://docs.busha.io/overview/quotes

A **Quote** is the fundamental building block for nearly every financial operation. It precisely describes a proposed asset transfer between a **source** and **destination**, ensuring transparency before any funds move.

### Core parameters

- `source_currency` — currency being sent (e.g., BTC, NGN)
- `target_currency` — currency being received (e.g., NGN, USD)
- `source_amount` — amount of source currency to send
- `target_amount` — amount of target currency to receive
- `quote_currency` — fiat reference currency (e.g., NGN, KES) — user thinks in this currency
- `quote_amount` — amount of `quote_currency` to transact

Specify either `source_amount` **or** `target_amount`, **never both**.

### `pay_in` object options

```json
// Balance
{ "type": "balance" }

// Cryptocurrency
{ "type": "address", "network": "BTC" }

// Bank transfer (Nigeria)
{ "type": "temporary_bank_account" }

// Mobile money (Kenya)
{ "type": "mobile_money", "phone": "+254 702288461" }
```

### `pay_out` object options

```json
// Cryptocurrency
{ "type": "address", "address": "tb1q...", "network": "BTC", "memo": "" }

// Bank transfer
{ "type": "bank_transfer", "recipient_id": "677bbf9c7cf061f23784555a" }

// Mobile money
{ "type": "mobile_money", "recipient_id": "677bbf9c7cf061f23784555a" }
```

If `pay_in` or `pay_out` are omitted, Busha assumes the operation uses the account balance.

### Rate object
Includes `pair` (e.g., `BTCNGN`), `rate`, `side` (`buy`/`sell`), and `type` (`FIXED`).

### Quote expiration
All Quotes include `expires_at`. If a Quote expires before you execute a transfer, the transaction is executed at the current market price.

### Example Quote response

```json
{
  "status": "success",
  "data": {
    "id": "QUO_uNiw1CDqGrdIlK15N0bu1",
    "source_currency": "BTC",
    "target_currency": "NGN",
    "source_amount": "0.00007051",
    "target_amount": "10050.58",
    "rate": { "product": "BTCNGN", "rate": "142541279.55", "side": "sell", "type": "FIXED" },
    "fees": [],
    "status": "pending",
    "expires_at": "2025-02-20T06:57:05.059512+01:00"
  }
}
```

### Why Quotes are fundamental
Every asset transfer must begin with a Quote. This ensures price certainty, fee transparency, user confirmation, and pre-validation of the transaction.

---

## 3. Transfers

**URL:** https://docs.busha.io/overview/transfers

A **Transfer** is the execution of a previously created Quote. Transfers are the core mechanism for all asset movements — deposits, conversions, and payouts.

### Workflow
1. Create a Quote to lock in rates and terms
2. Present Quote details to user for confirmation
3. Create a Transfer using the Quote ID
4. Monitor the Transfer status to track completion

### Transfer Status Lifecycle

| Status | Code | Description | Final for |
|---|---|---|---|
| Pending | `pending` | Initiated, waiting for assets | — |
| Processing | `processing` | Funds received, being handled | — |
| Cancelled | `cancelled` | Cancelled, will not proceed | — |
| Completed | `completed` | Fully processed | — |
| Funds Received | `funds_received` | Deposit received successfully | Deposits |
| Funds Converted | `funds_converted` | Currency conversion completed | Conversions |
| Outgoing Payment Sent | `outgoing_payment_sent` | Payment sent, awaiting confirmation | — |
| Funds Delivered | `funds_delivered` | Funds reached destination | Payouts |
| Funds Refunded | `funds_refunded` | Funds returned after failed transfer | — |

### Transfer completion flows
- **Deposits:** `pending → processing → funds_received`
- **Conversions:** `pending → processing → funds_converted`
- **Payouts:** `pending → processing → outgoing_payment_sent → funds_delivered`
- **On-Ramp (Fiat→Crypto):** `pending → processing → funds_received → funds_converted`

### Best practices
1. Always create a Quote first
2. Check `expires_at` before executing
3. Monitor via webhooks (recommended) or polling
4. Store Transfer IDs for reconciliation

---

## 4. Customers

**URL:** https://docs.busha.io/overview/customers

Busha Business allows you to manage and execute transactions on behalf of end-customers. Each customer has dedicated balances and all operations are accurately attributed to them.

### Using customer context in API requests

Include `X-BU-PROFILE-ID` header with the customer ID:

```bash
curl -X POST https://api.busha.co/v1/transfers \
  -H "Authorization: Bearer YOUR_SECRET_API_KEY" \
  -H "X-BU-PROFILE-ID: CUS_abc123xyz789" \
  -H "Content-Type: application/json" \
  -d '{ "source_currency": "BTC", "target_currency": "NGN", "source_amount": "0.001" }'
```

### Benefits
- Unified API with varying customer context
- Busha handles KYC, KYB, KYT, and Travel Rule compliance
- Separate balance accounts per customer
- Precise transaction attribution

---

## 5. Multi-Currency Accounts

**URL:** https://docs.busha.io/overview/multi-currency-accounts

MCAs allow businesses to hold, receive, and send funds in different currencies from a single unified platform.

**Features:** Flexible account creation (USD, EUR, GHS, NGN, BTC, ETH), real-time balances, seamless currency conversion, comprehensive reporting.

---

## 6. Transactions

**URL:** https://docs.busha.io/overview/transactions

Transactions are ledger entries recording all balance changes. Unlike Transfers (which track progress), Transactions are always completed records.

### Transaction Types
- **Deposit** — incoming from external sources
- **Buy** — crypto purchased with fiat
- **Sell** — crypto converted to fiat
- **Convert** — currency conversion within Busha balances
- **Withdrawal** — outgoing to external accounts
- **Fee** — fee transactions

### Key fields
- `amount`, `currency`, `rate`, `is_fiat`, `is_credit`
- `total_balance`, `available_balance`, `pending_balance`
- Crypto extras: `address`, `blockchain_url`, `confirmations`
- Conversion extras: `credit`, `debit`, `rate`, `fiat_value`

---

## 7. Fees

**URL:** https://docs.busha.io/overview/fees

### Fiat Fees

**Nigeria:** Deposit = NGN 150 | Withdrawal = NGN 107.50 (7.5% VAT inclusive)

**Kenya:** Deposit = 1% margin on volume | Withdrawal = KES 330

### Crypto Withdrawal Fees

| Asset | Network | Fee |
|---|---|---|
| BTC | BTC | 0.00005 BTC |
| ETH | ETH-BASE / ETH | 0.0005 ETH |
| USDT | BSC | 1 USDT |
| USDT | ETH / TRX | 3 USDT |
| USDT | Plasma | 1 USDT |
| USDC | BASE | 0.1 USDC |
| USDC | ETH | 3 USDC |
| USDC | POL / SOL / XLM | 0.5–1 USDC |
| SOL | SOL | 0.015 SOL |
| XRP | XRP | 0.25 XRP |
| XLM | XLM | 1 XLM |
| TRX | TRX | 3 TRX |
| BNB | BSC | 0.001 BNB |
| LTC | LTC | 0.000025 LTC |
| MATIC | BSC | 0.15 MATIC |
| SHIB | ETH | 700,000 SHIB |
| SHIB | BSC | 15,000 SHIB |
| DOGE | DOGE | 3 DOGE |
| ADA | ADA | 1.6 ADA |

---

## 8. On-Ramp Widget

**URL:** https://docs.busha.io/overview/on-ramp-widget

Enables users to convert fiat (NGN, KES) to crypto directly in your app. Handles KYC/AML and payment processing.

**Flow:** Identify available pairs → Generate On-Ramp URL → User authenticates (Busha handles KYC) → User pays → Webhook notifications sent.

**Components:** Busha API (min/max, buy quote, history), Webhooks, On-Ramp URL (`buy.busha.io`).

---

## 9. Off-Ramp Widget

**URL:** https://docs.busha.io/overview/off-ramp-widget

Enables users to convert crypto back to fiat. Users configure their payout method on Busha's interface, then are redirected back to your app to complete the crypto transfer.

**Components:** Busha API (min/max, sell quote, history), Webhooks, Off-Ramp URL (`buy.busha.io`).

---

## 10. Compliance

**URL:** https://docs.busha.io/overview/compliance

Regulatory pillars: AML, KYC, CTF, and local financial regulations (Nigeria and Kenya).

### KYC — Individual Customers

**Nigeria:** NIN slip or national passport + selfie  
**Kenya:** National ID card + selfie

**Technical:** Files must be PDF/JPG/JPEG/PNG via dashboard, or Base64 via API. Max 4MB per file.

### KYB — Business Customers

**Tier 1 (Basic):** Certificate of Incorporation + Corporate Registry Extract

| Business Type | Daily Limit | Monthly Limit |
|---|---|---|
| Business Names/Sole Proprietorship | $100,000 | $3,000,000 |
| LLC | $1,000,000 | $20,000,000 |

**Tier 2 (Unlimited, LLC only):** Additional docs — Memorandum of Association, Corporate Structure Chart, Board Resolution, AML Policy, Regulatory Licenses, Proof of Wealth, Proof of Address. → Unlimited limits.

### Required Documents by Entity Type

| Entity | Required Documents |
|---|---|
| Sole Proprietorship | Business License, Trade Name Registration (DBA), Tax registration |
| General Partnership | Partnership Agreement, Business License (all partners) |
| Limited Partnership | Certificate of LP, LP Agreement, Registration |
| LLP | Certificate of LLP, LLP Agreement, Registration |
| Corporation | Articles of Incorporation, Certificate of Incorporation, Bylaws, Shareholder Agreements |
| LLC | Articles of Organization, Operating Agreement, Membership Certificates, Registration |
| Nonprofit | Articles/Certificate of Incorporation, Tax-exempt status, Bylaws |
| Foundation | Articles/Certificate, Foundation Charter/Trust Deed, Board Resolutions |
| Trust | Trust Deed, Certificate of Trust, Notarized Trustee's Affidavit, Registration |

---

## 11. Quick Start

**URL:** https://docs.busha.io/guides/getting-started/quick-start

### Step 1: Open a Business Account

- **From existing personal account:** Log in → Avatar dropdown → "Open a business account"
- **New account:** Visit https://dash.busha.io/business/signup

### Step 2: Complete KYB

Click "Verify Now" → Submit required documents → Wait for email approval (required for live API access).

### Step 3: Enable 2FA

Avatar dropdown → Personal account → Settings → Security → Two Factor Authentication → Set up with Google Authenticator or similar.

### Step 4: Generate API Keys

Settings → Developer tools → API Tokens → "Add New Token" → Name it, select permissions → Enter 6-digit 2FA code → **Copy the key immediately — it's shown only once.**

> ⚠️ Never commit API keys to Git. Never use Secret Keys in client-side code.

### Key types
- **Public Key** — safe for frontend, widget integrations, cannot modify account
- **Secret Key** — server-side only, full API access, keep confidential

---

## 12. Choose Your Integration Path

**URL:** https://docs.busha.io/guides/getting-started/integration-paths

### Path 1: Accept Payments via API
1. Create payment request
2. Retrieve payment status
3. Use webhooks for automation

### Path 2: Accept Payments via SDK / Widgets
- Accept stablecoin with Payment Widget
- Create shareable payment links
- Integrate on-ramp widget
- Integrate off-ramp widget

### Path 3: Build On-Ramp/Off-Ramp via API
1. Create quote
2. Process fiat or crypto deposits
3. Complete payouts

### Path 4: Onboard Customers for B2B2C
- Create individual / business customer
- Verify customer identity
- Transact on behalf of customers

**Recommended first run (10 min):** Quick Start → Generate API key → Make first request → Implement one path end-to-end.

---

## 13. Setting up a Sandbox

**URL:** https://docs.busha.io/guides/getting-started/setup-sandbox

**Create sandbox account:** https://sandbox.dash.busha.io/business/signup  
Sandbox personal accounts require 2FA; business accounts are auto-verified.

**Sandbox base URL:** `https://api.sandbox.busha.so`  
**Production base URL:** `https://api.busha.co`

Use the same API key from Quick Start. Test with:

```bash
curl -X GET "https://api.sandbox.busha.so/v1/balances" \
  -H "Authorization: Bearer {YOUR_SECRET_API_KEY}" \
  -H "Content-Type: application/json"
```

**Important notes:** No real funds move. Rate limits apply. High feature parity with production. Great for error simulation.

---

## 14. Generate API Keys

**URL:** https://docs.busha.io/guides/getting-started/generate-api-key

Navigate to Settings → Developer Tools → API Tokens → "Add New Token" → name, permissions, 2FA code → copy key immediately.

Busha generates a **public key** automatically on sign-up. **Secret keys** must be generated manually.

---

## 15. Making Your First Request

**URL:** https://docs.busha.io/guides/getting-started/make-first-request

```bash
curl -X GET "YOUR_BASE_URL/v1/balances" \
  -H "Authorization: Bearer {YOUR_SECRET_API_KEY}" \
  -H "Content-Type: application/json"
```

Successful response returns `"status": "success"` with an array of wallet balances (GHS, KES, NGN, USD, BTC, ETH, USDC, USDT).

**Errors:** 401 = bad API key | 404 = wrong base URL or endpoint path | No response = check internet/curl.

---

## 16. Create Your First Payment Request

**URL:** https://docs.busha.io/guides/payment-requests/create-first-payment

Payment Requests are **fiat-first**: you specify the fiat amount to collect, Busha calculates the crypto equivalent.

> ⚠️ Payment Requests use your **Public API Key**, not your Secret Key.

### Parameters

| Parameter | Required | Description |
|---|---|---|
| `quote_currency` | Yes | Fiat currency (e.g., NGN) |
| `quote_amount` | Yes | Fiat amount to collect |
| `source_currency` | Yes | Crypto the customer will pay |
| `target_currency` | Yes | Crypto you'll receive |
| `pay_in` | Yes | How the customer pays (type + network) |
| `additional_info` | Yes | Customer email/phone |
| `dry_run` | No | If true, calculates amounts but doesn't create retrievable request |

### Example

```bash
curl -X POST "YOUR_BASE_URL/v1/payments" \
  -H "X-BU-PUBLIC-KEY: {YOUR_PUBLIC_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "additional_info": { "email": "john@busha.so", "phone_number": "+234 8123456789" },
    "dry_run": false,
    "quote_amount": "50000",
    "quote_currency": "NGN",
    "source_currency": "USDT",
    "target_currency": "USDT",
    "pay_in": { "type": "address", "network": "TRX" },
    "reference": "order-2025-001"
  }'
```

**Response key fields:** `id` (payment request ID), `pay_in.address` (crypto address for customer to pay), `source_amount` (exact crypto amount), `expires_at`, `timeline`.

---

## 17. Retrieve Payment Request

**URL:** https://docs.busha.io/guides/payment-requests/retrieve-payment

```bash
curl --request GET \
  --url YOUR_BASE_URL/v1/payments/{id} \
  --header 'X-BU-PUBLIC-KEY: {YOUR_PUBLIC_KEY}'
```

> **Note:** Only payment requests created with `dry_run: false` can be retrieved.

Track `timeline.current_step` to monitor payment progress. Use webhooks for real-time updates.

---

## 18. Process Fiat Deposits

**URL:** https://docs.busha.io/guides/deposits/process-fiat-deposits

Fiat deposits use temporary bank accounts. Two-step process: Quote → Transfer.

### Step 1: Create Quote

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/quotes \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "source_currency": "NGN",
    "target_currency": "NGN",
    "source_amount": "10000",
    "pay_in": { "type": "temporary_bank_account" }
  }'
```

### Step 2: Create Transfer (generates temporary bank account)

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/transfers \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  -d '{ "quote_id": "QUO_vxcF2svmjMbxDp4T5dcD8" }'
```

The transfer response includes `data.pay_in.recipient_details` with `account_name`, `account_number`, `bank_name`. Display these to your user.

**Expected statuses:** `pending` → `processing` → `funds_received` (or `cancelled`).

---

## 19. Process Deposits with Quote Currency

**URL:** https://docs.busha.io/guides/deposits/process-with-quote-currency

Use `quote_currency` + `quote_amount` when you want the customer to pay in a fiat-equivalent value:

```bash
curl -i -X POST https://BASE_URL/v1/quotes \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "quote_currency": "NGN",
    "quote_amount": "50000",
    "source_currency": "USDT",
    "target_currency": "USDT",
    "pay_in": { "type": "address", "network": "TRX" },
    "pay_out": { "type": "balance" }
  }'
```

Busha calculates `source_amount` (exact crypto needed). Then create a transfer with the quote ID to get the `pay_in.address` where the customer sends crypto.

> Note the `expires_at` on the address — ensure the customer pays before it expires.

---

## 20. Accept Stablecoin with SDK Integration

**URL:** https://docs.busha.io/guides/accepting-stablecoin-payments/payment-widget

Install: `npm i @busha/commerce-js` or CDN: `https://cdn.jsdelivr.net/npm/@busha/commerce-js@1.0.17/dist/index.min.js`

### Basic usage

```html
Pay with Crypto

  document.getElementById('payButton').addEventListener('click', function() {
    BushaCommerce({
      public_key: 'pub_your_public_key_here',
      quote_amount: '10000',
      quote_currency: 'NGN',
      target_currency: 'NGN',
      source_currency: 'USDT',
      devMode: true,
      meta: { name: 'Kemi Stores', email: 'orders@kemistore.com' },
      onSuccess: (data) => { console.log('Payment successful!', data) },
      onClose: () => { console.log('Payment cancelled') }
    })
  })

```

### Configuration reference

**Required:** `public_key`, `quote_amount`, `quote_currency`, `source_currency`, `target_currency`, `onSuccess`, `onClose`

**Optional:** `meta.name`, `meta.email`, `devMode` (set `true` for sandbox), `reference`, `callback_url`, `source`, `source_id`

Find your public key: Settings → Developer Tools → copy key starting with `pub_`.

---

## 21. Accept Stablecoin with Payment Links

**URL:** https://docs.busha.io/guides/accepting-stablecoin-payments/payment-links

Create payment links from the dashboard — no code required.

1. Log in → **Commerce** → **Payment Links** → **Create Payment Link**
2. Enter product/payment details
3. Copy the generated URL and share it anywhere (WhatsApp, Instagram, email, SMS)

Customer experience: hosted checkout page → choose payment method (Busha account or external wallet) → payment confirmation.

Sample checkout URL: `https://staging.dash.busha.io/checkout/Q4Yfew3cT8F5`

---

## 22. Integrate On-Ramp Widget

**URL:** https://docs.busha.io/guides/widgets/integrate-on-ramp

### Quick integration

```html

  Buy Crypto with Busha

```

> Recommended: build the URL server-side to keep the public key out of client-side code.

### URL parameters

| Parameter | Required | Description |
|---|---|---|
| `publicKey` | Yes | Your business public key |
| `side` | Yes | `buy` or `sell` |
| `cryptoAsset` | No | Lock to specific crypto (e.g., BTC) |
| `network` | No | Lock to specific network |
| `address` | No | Pre-fill destination wallet address (makes `cryptoAsset` required) |
| `fiatCurrency` | No | Lock to specific fiat |
| `cryptoAmount` | No | Pre-fill crypto amount |
| `fiatAmount` | No | Pre-fill fiat amount (overrides `cryptoAmount`) |
| `redirectUrl` | No | URL to redirect after transaction |

**Example configured URL:**
```
https://sandbox.buy.busha.io/?publicKey=pk_test_YOUR_KEY&cryptoAsset=BTC&fiatCurrency=NGN&fiatAmount=50000&redirectUrl=https://your-app.com/callback&address=bc1q...
```

After transaction, Busha appends status parameters to your `redirectUrl`. Parse these to update your UI.

---

## 23. Integrate Off-Ramp Widget

**URL:** https://docs.busha.io/guides/widgets/integrate-off-ramp

```html

  Sell with Busha

```

### URL parameters

| Parameter | Required | Description |
|---|---|---|
| `publicKey` | Yes | Your business public key |
| `side` | Yes | `buy` or `sell` |
| `redirectUrl` | Yes | URL to redirect after user completes setup |
| `cryptoAsset` | No | Lock to specific crypto |
| `network` | No | Lock to specific network |
| `fiatCurrency` | No | Lock to specific fiat |
| `cryptoAmount` | No | Pre-fill crypto amount |
| `fiatAmount` | No | Pre-fill fiat amount (overrides `cryptoAmount`) |

### Redirect URL parameters (returned by Busha)

| Parameter | Description |
|---|---|
| `transferId` | The transfer that was just completed |
| `depositWalletAddress` | Address to send the crypto to |
| `cryptoAsset` | Asset to deposit |
| `network` | Network for the asset |
| `cryptoAmount` | Amount to deposit |
| `fiatCurrency` | Fiat currency of the transfer |
| `fiatAmount` | Fiat amount to be credited |

Your app receives these and must execute the crypto transfer to `depositWalletAddress`.

---

## 24. Create Your First Quote

**URL:** https://docs.busha.io/guides/quotes/create-first-quote

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `source_currency` | string | Yes | Currency you're sending |
| `target_currency` | string | Yes | Currency you're receiving |
| `source_amount` | string | No | Amount to send (either this or target_amount) |
| `target_amount` | string | No | Amount to receive (either this or source_amount) |
| `pay_in` | object | No | Incoming payment method details |
| `pay_out` | object | No | Outgoing payment method details |

### Basic quote (conversion)

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/quotes \
  -H 'Authorization: Bearer {YOUR_SECRET_KEY}' \
  -H 'Content-Type: application/json' \
  -d '{
    "source_currency": "NGN",
    "target_currency": "BTC",
    "source_amount": "200000"
  }'
```

**Response:** `id` (use for transfer), `target_amount`, `rate`, `fees`, `expires_at`.

### Quote with `pay_in` (for crypto deposits)

```bash
-d '{
  "source_currency": "BTC",
  "target_currency": "NGN",
  "target_amount": "50000",
  "pay_in": { "type": "address", "network": "BTC" }
}'
```

### Quote with `pay_out` (for payouts)

```bash
-d '{
  "source_currency": "BTC",
  "target_currency": "BTC",
  "target_amount": "0.0001",
  "pay_out": { "type": "address", "network": "BTC", "address": "tb1q..." }
}'
```

### KES quote (mobile money)

```bash
-d '{
  "source_currency": "KES",
  "target_currency": "BTC",
  "source_amount": "50000",
  "pay_in": { "type": "mobile_money", "phone": "+254712345678" }
}'
```

**For customer requests:** include `X-BU-PROFILE-ID: {customer_id}` header.

---

## 25. Retrieve a Quote

**URL:** https://docs.busha.io/guides/quotes/get-quote

```bash
curl -X GET https://api.sandbox.busha.so/v1/quotes/QUO_AEv8vGiT4jvB \
  -H 'Authorization: Bearer {YOUR_SECRET_API_KEY}'
```

Use to check `expires_at`, confirm amounts/rate/fees, or retrieve `pay_in`/`pay_out` instructions.

**Errors:** 404 = bad quote ID | 401 = bad API key | Expired quote = create a new one.

---

## 26. Process Crypto Deposits

**URL:** https://docs.busha.io/guides/deposits/process-crypto-deposits

Two-step process: Quote → Transfer (which generates the deposit address).

### Step 1: Create Quote

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/quotes \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "source_currency": "BTC",
    "target_currency": "BTC",
    "source_amount": "0.0001",
    "pay_in": { "type": "address", "network": "BTC" }
  }'
```

### Step 2: Create Transfer (generates wallet address)

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/transfers \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  -d '{ "quote_id": "QUO_nEnsWPZ8KErY598DCj9Pk" }'
```

Response includes `data.pay_in.address` — the unique wallet address for the user to send crypto to.

> ⚠️ Instruct users to send the exact amount to the correct address on the specified network. Check `pay_in.expires_at`.

---

## 27. Process Payouts

**URL:** https://docs.busha.io/guides/payouts/process-payouts

Payouts (crypto-to-fiat or crypto-to-bank) require a pre-created recipient.

### Step 1: Ensure you have a `recipient_id`

See [Create and Manage Recipients](#36-create-and-manage-recipients).

### Step 2: Create Quote

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/quotes \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "source_currency": "USDT",
    "target_currency": "NGN",
    "target_amount": "100",
    "pay_out": { "type": "bank_transfer", "recipient_id": "677bbf9c7cf061f23784555a" }
  }'
```

Quote response includes `pay_out.recipient_details` confirming the destination account.

### Step 3: Create Transfer

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/transfers \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{ "quote_id": "QUO_mprvCPMCfm3K2qSnzbWj7" }'
```

**Expected statuses:** `pending` → `processing` → `funds_delivered` (or `cancelled`).

---

## 28. Process Crypto Payouts

**URL:** https://docs.busha.io/guides/payouts/process-crypto-payouts

### Step 1: Prepare `pay_out` object

```json
{
  "pay_out": {
    "type": "address",
    "address": "tb1qzw4ynldc55lpkx3vcsk03susv9nwzj6qp78qsq",
    "network": "BTC"
  }
}
```

> Network must be **uppercase**: BTC, ETH, TRX, etc.

### Step 2: Create Quote

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/quotes \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "source_currency": "BTC",
    "target_currency": "BTC",
    "target_amount": "0.0001",
    "pay_out": { "type": "address", "address": "tb1q...", "network": "BTC" }
  }'
```

### Step 3: Create Transfer

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/transfers \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -d '{ "quote_id": "QUO_mZrlSnIFzGkA" }'
```

---

## 29. Create an Individual Customer

**URL:** https://docs.busha.io/guides/customers/create-individual

### Required parameters

`email`, `has_accepted_terms` (bool), `type` ("individual"), `country_id`, `phone`, `birth_date` (DD-MM-YYYY), `first_name`, `last_name`, `address` object, optionally `identifying_information` array.

### Create without KYC (status = `inactive` until verified)

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/customers \
  -H 'Authorization: Bearer {YOUR_SECRET_KEY}' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "customer@gmail.com",
    "has_accepted_terms": true,
    "type": "individual",
    "country_id": "NG",
    "phone": "+234 8012345678",
    "birth_date": "24-12-2000",
    "address": { "city": "Lagos", "state": "Lagos", "country_id": "NG", "address_line_1": "10 Allen Avenue", "postal_code": "100001" },
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Create with KYC (Passport + Selfie)

Include `identifying_information` array:

```json
"identifying_information": [
  { "type": "passport", "number": "passport-number", "country": "NG", "image_front": "{{base64}}" },
  { "type": "selfie", "image_front": "{{base64}}", "number": "", "country": "NG" }
]
```

**Option 2 — National ID + Selfie:**
```json
"identifying_information": [
  { "type": "national-id", "number": "id-number", "country": "NG", "image_front": "{{base64}}", "image_back": "{{base64}}" },
  { "type": "selfie", "image_front": "{{base64}}", "number": "", "country": "NG" }
]
```

> Files must be Base64, max 4MB.

### Verify the customer

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/customers/CUS_xxx/verify \
  -H 'Authorization: Bearer {YOUR_SECRET_KEY}'
```

**Customer status flow:** `inactive` → `in_review` → `active` (or `rejected`)

---

## 30. Create a Business Customer

**URL:** https://docs.busha.io/guides/customers/create-business

### Required parameters

`email`, `has_accepted_terms`, `type` ("business"), `country_id`, `phone`, `birth_date`, `address`, `business_name`, `business_industry` (ID from supported industries), `business_incorporation_date`.

### KYB sections (for full verification)

**Documents:**
```json
"documents": [{ "purposes": ["certificate_of_incorporation"], "file": "{{base64}}" }]
```

**Business Owners:**
```json
"business_owners": [{ "first_name": "John", "last_name": "Doe", "role": ["director"], "percentage_ownership": 100, "is_pep": false, "nationality": "NG", "bvn": "12345678901" }]
```

**Business Transaction:**
```json
"business_transaction": {
  "purpose": "international trade",
  "monthly_transaction_value": "above_1m_usd",
  "monthly_transaction_count": "100_to_200",
  "client_transaction_status": "self-owned",
  "api_access_needed": true,
  "api_integration_url": "https://yourbusiness.com"
}
```

**Business Registration:**
```json
"business_registration": {
  "business_type": "type_registered_company",
  "business_structure": "limited_liability_company",
  "business_regulation_status": "regulated",
  "registration_number": "RC1234567",
  "tax_identification_number": "TIN1234567",
  "corporate_group_status": "standalone_company",
  "exchange_listing_status": "not_listed_on_exchange",
  "license_number": "LIC123456"
}
```

Then call `POST /v1/customers/{id}/verify`. Common errors: `missing_section (Owners)`, `missing_section (Transaction)`, `missing_documents`.

---

## 31. Retrieve Customers

**URL:** https://docs.busha.io/guides/customers/retrieve-customers

**Single customer:**
```bash
curl -X GET "https://YOUR_BASE_URL/v1/customers/{id}" \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN'
```

**All customers:**
```bash
curl -X GET 'https://YOUR_BASE_URL/v1/customers' \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN'
```

Response includes `status`, `type`, `level`, contact details, and address.

---

## 32. Verify Customer Identity

**URL:** https://docs.busha.io/guides/customers/verify-identity

**Step 1:** Update customer with KYC/KYB documents via `PUT /v1/customers/{id}` (same structure as create).

**Step 2:** Submit for verification:
```bash
curl -i -X POST "https://YOUR_BASE_URL/v1/customers/{customer_id}/verify" \
  -H 'Authorization: Bearer {YOUR_SECRET_KEY}'
```

**Step 3:** Check status via `GET /v1/customers/{id}`:
- `inactive` → not yet verified
- `in_review` → under review
- `active` → verified and can transact
- `rejected` → failed verification

**Step 4:** Set up webhooks for real-time status: `customer.verification.in_review`, `customer.verification.active`, `customer.verification.rejected`, `customer.verification.inactive`.

**Common errors:**
- Individual: `profile_kyc_verification` — missing selfie image in `identifying_information`
- Business: `missing_section (Owners/Transaction)` — ensure all three sections complete before verify

---

## 33. Initiate Transactions on Behalf of Customers

**URL:** https://docs.busha.io/guides/customers/transactions-on-behalf

Any transaction you can do for yourself, you can do for a customer by adding `X-BU-PROFILE-ID: {customer_id}` to the request header.

**Example — Fiat deposit for a customer:**

```bash
# Step 1: Create Quote
curl -i -X POST https://YOUR_BASE_URL/v1/quotes \
  -H 'X-BU-PROFILE-ID: {customer_id}' \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -d '{ "source_currency": "NGN", "target_currency": "NGN", "source_amount": "10000", "pay_in": { "type": "temporary_bank_account" } }'

# Step 2: Create Transfer
curl -i -X POST https://YOUR_BASE_URL/v1/transfers \
  -H 'X-BU-PROFILE-ID: {customer_id}' \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -d '{ "quote_id": "QUO_vxcF2svmjMbxDp4T5dcD8" }'
```

The transfer response has `profile_id` set to the customer's ID, not your business ID.

---

## 34. Manage Balance Accounts

**URL:** https://docs.busha.io/guides/balance/manage-balance-accounts

Retrieve all balances:

```bash
curl --request GET \
  --url YOUR_BASE_URL/v1/balances \
  --header 'Authorization: Bearer {YOUR_SECRET_API_KEY}'
```

Returns all currency accounts (fiat and crypto) with `available`, `pending`, and `total` amounts.

---

## 35. Convert Between Balances

**URL:** https://docs.busha.io/guides/balance/convert-balance-to-balance

All conversions use the Quote → Transfer flow.

### Step 1: Create conversion quote

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/quotes \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -H 'X-BU-PROFILE-ID: BUS_xxx' \
  -d '{ "source_currency": "USDT", "target_currency": "BTC", "source_amount": "20" }'
```

### Step 2: Create transfer

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/transfers \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -d '{ "quote_id": "QUO_Nm2EBRxmuHGdTyGnVNDUt" }'
```

Conversions are typically processed immediately. Verify via `GET /v1/transfers/{id}`.

> A **trade** is a conversion where one side is fiat (e.g., NGN↔BTC). Works identically.

---

## 36. Create and Manage Recipients

**URL:** https://docs.busha.io/guides/recipients/create-and-manage

Recipients are pre-defined payout destinations. The `id` returned is used as `recipient_id` in payout quotes.

### Supported recipient types

| Type | Category | Required Fields |
|---|---|---|
| `ngn_bank` | bank | `bank_name`, `bank_code`, `account_number`, `account_name` |
| `usd_bank` (ACH) | bank | `entity_type`, `transfer_type: "ach"`, `account_name`, `bank_name`, `routing_number`, `account_number` |
| `usd_bank` (Wire) | bank | + `swift_code` |
| `usd_bank` (SWIFT) | bank | `entity_type`, `transfer_type: "swift"`, `iban`, `swift_code`, `bank_name`, `recipient_address`, intermediary fields |
| `gbp_bank` | bank | `entity_type`, `account_name`, `bank_name`, `sort_code`, `account_number` |
| `mpesa_mobile_money` | mobile_money | `phone_number`, `account_name` |
| `mtn_mobile_money` | mobile_money | `phone_number`, `account_name` |
| `crypto` | crypto | `network`, `address`, `account_name`, optional `memo` |

### Get bank codes (Nigeria)
```bash
curl -X GET https://api.sandbox.busha.so/v1/banks
```

### Create Nigerian bank recipient

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/recipients \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -d '{
    "currency": "NGN", "country_code": "NG", "type": "ngn_bank",
    "bank_name": "OPAY", "bank_code": "100004",
    "account_number": "9000000000", "account_name": "BUSHA DIGITAL TECHNOLOGY"
  }'
```

### Create M-Pesa recipient

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/recipients \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -d '{ "type": "mpesa_mobile_money", "account_name": "Samuel Kiprotich", "phone_number": "+254712345678" }'
```

### Create crypto recipient (BTC)

```bash
curl -i -X POST https://YOUR_BASE_URL/v1/recipients \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  -d '{ "type": "crypto", "account_name": "Coco", "network": "BTC", "address": "bc1q..." }'
```

### List all recipients
```bash
curl -X GET 'https://YOUR_BASE_URL/v1/recipients' \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN'
```

### Retrieve specific recipient
```bash
curl -X GET 'https://YOUR_BASE_URL/v1/recipients/{id}' \
  -H 'Authorization: Bearer YOUR_SECRET_TOKEN'
```

---

## 37. Token Sharing

**URL:** https://docs.busha.io/guides/token-sharing/token-sharing

Import pre-verified KYC data from partner platforms (Sumsub) to avoid duplicate verification.

**Prerequisites:** Active Sumsub account with Reusable KYC feature enabled, Busha's Client ID (get from eng@busha.co).

**Flow:**
1. Add Busha as a recipient in Sumsub (Reusable Identity → Partners)
2. Generate Sumsub share token via their API
3. Create a customer in Busha
4. Share the Sumsub token with Busha via `POST /v1/customers/{id}/token-share`

```bash
# Step 1: Generate Sumsub share token
curl -X POST https://api.sumsub.com/resources/accessTokens/shareToken \
  -d '{ "applicantId": "63e092c51b7b4030f2e01154", "forClientId": "BushaClientId", "ttlInSecs": 600 }'

# Step 2: Share with Busha
curl -X POST https://api.sandbox.busha.so/v1/customers/CUS_abc123xyz/token-share \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -d '{ "token": "eyJhbGciOiJub25lIn0..." }'
```

> Tokens expire per `ttlInSecs`. One-time use only.

---

## 38. Request IDs

**URL:** https://docs.busha.io/guides/request-id/request-id

Every API response includes `X-Request-Id` header (e.g., `req_JfPBXEC5rLHc`). Valid for 21 days.

Use `-i` flag with curl to see response headers. Always include the request ID when contacting Busha support.

```javascript
const requestId = response.headers['x-request-id'];
```

---

## 39. Set Up Webhooks

**URL:** https://docs.busha.io/guides/webhooks/setup

Webhooks are POST endpoints that receive real-time transfer updates. Must return `200 OK`.

### Step 1: Create webhook URL
- **Production:** A publicly accessible HTTPS endpoint at your backend
- **Testing:** Use [webhook.site](https://webhook.site) for a temporary URL

### Step 2: Register in Dashboard
Settings → Developer Tools → Webhooks → "Create a new Webhook" → enter name, URL, select events → copy your **Webhook Secret Key**.

### Step 3: Verify webhook signatures

```go
func ValidateHMACChecksum(body []byte, checksum string) (bool, error) {
    mac := hmac.New(sha256.New, []byte(hmacSecret))
    mac.Write(body)
    expectedMAC := mac.Sum(nil)
    actualMAC, _ := base64.StdEncoding.DecodeString(checksum)
    return hmac.Equal(actualMAC, expectedMAC), nil
}
```

### Webhook events

| Event | Description |
|---|---|
| `transfer.pending` | New transfer initiated |
| `transfer.processing` | Transfer is processing |
| `transfer.cancelled` | Transfer cancelled |
| `transfer.funds_received` | Deposit received |
| `transfer.funds_converted` | Internal conversion completed |
| `transfer.outgoing_payment_sent` | Payout sent, awaiting confirmation |
| `transfer.funds_delivered` | Payout delivered |
| `transfer.funds_refunded` | Funds refunded after failed transfer |

### Transfer status flows (for webhook anticipation)

```
Conversions:  pending → processing → funds_converted
Payouts:      pending → processing → outgoing_payment_sent → funds_delivered
Deposits:     pending → processing → funds_received
On-Ramp:      pending → processing → funds_received → funds_converted
```

### Sample webhook payload

```json
{
  "business_id": "BUS_tg6yujbZ1nMu5BLQkPGGO",
  "event": "transfer.funds_converted",
  "data": {
    "id": "TRF_BaAUvCTlZCt3hu3OO4u8P",
    "source_currency": "NGN",
    "target_currency": "USDT",
    "source_amount": "10000",
    "target_amount": "5.728032",
    "status": "completed"
  }
}
```

---

## 40. Webhook Events

**URL:** https://docs.busha.io/guides/webhooks/webhook-events

### Customer Events

| Event | Trigger |
|---|---|
| `customer.created` | New customer account created |
| `customer.updated` | Customer information updated |
| `customer.verification.in_review` | Verification docs submitted, under review |
| `customer.verification.active` | Verification approved — account now active |
| `customer.verification.rejected` | Verification failed (check `rejection_reason`) |
| `customer.verification.inactive` | Verification reverted (compliance/suspension) |

### Transfer Events

| Event | Trigger |
|---|---|
| `transfer.pending` | Transfer created, awaiting funds |
| `transfer.processing` | Funds received, being processed |
| `transfer.funds_received` | Funds received into Busha account |
| `transfer.funds_converted` | Conversion completed (final for conversions) |
| `transfer.completed` | Transfer fully completed |
| `transfer.failed` | Transfer failed (check `error` field) |
| `transfer.cancelled` | Transfer cancelled |
| `transfer.funds_not_delivered` | Received but couldn't be delivered |
| `transfer.funds_refunded` | Funds returned after failure |

### Payment Request Events

| Event | Trigger |
|---|---|
| `payment_request.pending` | Awaiting customer payment |
| `payment_request.processing` | Payment received, being processed |
| `payment_request.completed` | Customer successfully completed payment |
| `payment_request.expired` | Payment link expired without completion |
| `payment_request.failed` | Payment request failed |
| `payment_request.cancelled` | Manually cancelled |

### Ramp Events

| Event | Trigger |
|---|---|
| `ramp.transfer.pending` | Ramp transfer initiated |
| `ramp.transfer.completed` | Ramp transfer completed |
| `ramp.transfer.failed` | Ramp transfer failed |

### New: `deposit.success` event (March 2026)

Fires when a deposit is made to your static bank account. Use it to auto-convert fiat to stablecoin.

```json
{
  "business_id": "bus_1a2b...",
  "event": "deposit.success",
  "data": {
    "id": "289bb2c1-...",
    "profile_id": "CUS_9z8y...",
    "amount": "5900.00",
    "fee": "100.00",
    "total": "6000.00",
    "currency": "NGN",
    "channel": "bank_transfer",
    "status": "COMPLETED",
    "source_account_name": "Test Oluwatoni",
    "source_bank_name": "Bank of World"
  }
}
```

> To receive this event, delete and re-create your webhook in the dashboard.

---

## 41. Addresses, Banks, and Mobile Money

**URL:** https://docs.busha.io/guides/reference/addresses-banks-mobile

### Get all banks (Nigeria)
```bash
curl https://api.busha.co/v1/banks
```

### Verify a bank account before payout
```bash
curl https://api.busha.co/v1/recipients/resolve-bank-account \
  --request POST \
  -d '{
    "currency_id": "NGN", "country_id": "NG",
    "channel": "mobile_money", "bank_code": "000013", "account_number": "0123456789"
  }'
```

### Validate a crypto address
```bash
curl https://api.busha.co/v1/validate \
  --request POST \
  -d '{
    "type": "address",
    "address": "tb1qj4263506wyu8khr22dwce0agk8lhyjgy269rxr",
    "currency": "BTC", "network": "BTC", "memo": "memo"
  }'
```

---

## 42. Currency Pairs

**URL:** https://docs.busha.io/guides/reference/pairs

Pairs represent exchange rates between two currencies (Fiat-to-Fiat, Fiat-to-Crypto, Crypto-to-Crypto).

### List all pairs
```bash
curl https://api.busha.co/v1/pairs
```

### Filter by type (`fiat`, `crypto`, `stablecoins`)
```bash
curl https://api.busha.co/v1/pairs?type=crypto
```

### Filter by currency
```bash
curl https://api.busha.co/v1/pairs?currency=NGN
```

### Filter by type and currency
```bash
curl https://api.busha.co/v1/pairs?currency=NGN&type=fiat
```

**Pair object fields:** `id`, `base`, `counter`, `type`, `buy_price`, `sell_price`, `is_buy_supported`, `is_sell_supported`, `min_buy_amount`.

---

## 43. Recipients Reference

**URL:** https://docs.busha.io/guides/reference/recipients

The Recipient object has a unified structure. Unused fields return `null`.

**Key fields:** `id`, `profile_id`, `active`, `owned_by_customer`, `created_at`, `updated_at`, `currency_id`, `country_id`, `type`, `category` (bank/mobile_money/crypto), `entity_type`, `transfer_type`, `account_name`, `bank_name`, `bank_code`, `sort_code`, `routing_number`, `swift_code`, `account_number`, `iban`, `phone_number`, `network`, `crypto_address`, `memo`, `recipient_address`, `intermediary_bank_name`, `intermediary_bank_address`, `intermediary_swift_code`.

---

## 44. Supported Payment Channels

**URL:** https://docs.busha.io/guides/reference/supported-channels

### Deposit channels
- Fiat → Bank Account (NGN)
- Fiat → Mobile Money (KES)
- Crypto → Crypto Address

### Payout channels
- Fiat → Bank Transfer (NGN)
- Fiat → Mobile Money (KES)
- Crypto → Crypto Address

### Supported payout flows

| Source | Destination | Supported |
|---|---|---|
| Busha Fiat Balance | External Bank Account | Yes |
| Busha Crypto Wallet | External Crypto Wallet | Yes |
| Busha Crypto Wallet | External Bank Account | Yes |
| Busha Fiat Balance | External Crypto Wallet | **No** |

---

## 45. Supported Currencies

**URL:** https://docs.busha.io/guides/reference/supported-currencies

### Fiat Currencies

| Code | Name | Deposit | Withdrawal | Ramp Buy | Ramp Sell |
|---|---|---|---|---|---|
| GHS | Cedi | Yes | Yes | No | No |
| KES | Shilling | Yes | Yes | Yes | Yes |
| NGN | Naira | Yes | Yes | Yes | Yes |
| USD | US Dollar | Yes | Yes | No | No |

### Cryptocurrencies (key ones with full support)

| Code | Name | Deposit | Withdrawal | Networks | Ramp Buy | Ramp Sell |
|---|---|---|---|---|---|---|
| BTC | Bitcoin | Yes | Yes | BTC | Yes | Yes |
| ETH | Ethereum | Yes | Yes | ETH-BASE, ETH | No | No |
| USDT | USD Token | Yes | Yes | BSC, ETH, TRX, Plasma | Yes | Yes |
| USDC | USD Coin | Yes | Yes | BASE, ETH, TRX, XLM | No | No |
| SOL | Solana | Yes | Yes | SOL | No | No |
| TON | Toncoin | Yes | Yes | TON | Yes | Yes |
| BNB | Binance | Yes | Yes | BSC | No | No |
| TRX | Tron | Yes | Yes | TRX | No | No |
| XLM | Stellar | Yes | Yes | XLM | No | No |
| XRP | Ripple | Yes | Yes | XRP | No | No |
| LTC | Litecoin | Yes | Yes | LTC | No | No |
| SHIB | Shiba Inu | Yes | Yes | ETH | No | No |
| POL | Pol | Yes | Yes | MATIC | No | No |
| MC | MC Token | Yes | Yes | ETH | No | No |

Many other assets (ADA, DOGE, LUNA, MATIC, NGNT, etc.) are listed but have deposit/withdrawal = No.

---

## 46. Supported Countries

**URL:** https://docs.busha.io/guides/reference/supported-countries

Busha Business is available in **65 countries**. Nigeria, Kenya, and the USA have full fiat support. All others support crypto transactions.

**Retrieve programmatically:** `GET /v1/countries`

**Nigeria:** NGN | Deposits: Virtual Bank, Direct Debit, Bank Transfer | Payouts: Bank Transfer

**Kenya:** KES | Deposits: Mobile Money | Payouts: Mobile Money

**United States:** USD | Deposits: USDT/USDC to USD | Payouts: ACH, SWIFT, Wire Transfer

**Other supported countries (crypto only):** Andorra, Argentina, Australia, Austria, Belgium, Benin, Brazil, Bulgaria, Canada, Chile, China, Colombia, Costa Rica, Croatia, Czech Republic, Denmark, Estonia, Finland, France, Germany, Ghana, Greece, Hong Kong, Hungary, Iceland, India, Indonesia, Ireland, Israel, Italy, Japan, Luxembourg, Madagascar, Malta, Mauritius, Mexico, Mozambique, Namibia, Netherlands, New Zealand, Norway, Philippines, Poland, Portugal, Qatar, Romania, Rwanda, Saudi Arabia, Singapore, Slovakia, Slovenia, South Africa, Spain, Sweden, Switzerland, Tanzania, UAE, UK, Vietnam, Zambia.

---

## 47. Supported Transfer Types

**URL:** https://docs.busha.io/guides/reference/supported-transfers

| Source | Destination | Transaction Type |
|---|---|---|
| External Bank Account | Busha Fiat Balance | Deposit |
| External Crypto Address | Busha Fiat Balance | Deposit |
| External Crypto Address | Busha Crypto Wallet | Deposit |
| External Bank Account | Busha Crypto Wallet | Buy (On-Ramp) |
| Busha Crypto Wallet | External Bank Account | Payout |
| Busha Crypto Wallet | External Wallet Address | Payout |
| Busha Crypto Wallet | Busha Crypto Wallet (diff currency) | Conversion |
| Busha Fiat Balance | Busha Crypto Wallet | Buy Trade |
| Busha Crypto Wallet | Busha Fiat Balance | Sell Trade |

---

## 48. Supported Industries

**URL:** https://docs.busha.io/guides/reference/supported-industries

Used for `business_industry` field when creating business customers.

| ID | Name |
|---|---|
| `BIN_Z1HpNXB9Q8jcHx4LzVp` | Technology |
| `BIN_A2StLXR3K2gjRj7JnqR` | Healthcare |
| `BIN_C4UvTYR5V8jsOx5LmwQ` | Education |
| `BIN_D5QsUYH7M8hrTx6KxyZ` | Manufacturing |
| `BIN_G8TvXYL0Q2jyIz9LwxN` | Transportation |
| `BIN_V1StGXR8Z5jdHi6BmyT` | Other |
| `BIN_B3QtRYL6J9ksKs2MbtK` | Financial services |
| `BIN_H9UvZYL1R3kzJx0LuvO` | Construction and Engineering |
| `BIN_F7SuWXJ9P1jxHz8LyzM` | Hospitality and Tourism |
| `BIN_E6RtVZH8O9iuQy7LzuL` | Retail and eCommerce |
| `BIN_E1IxOSA9J9jcHx4LzVs` | Entertainment |
| `BIN_B3TuLXR3S2gjRj8JnsX` | Government and Public Sector |
| `BIN_A3AtWYL6J9ssLs4AcxL` | Creatives and Designs |
| `BIN_C2HpWZT9L8tqXq7KjA8L` | Real Estate and Property Management |

---

## 49. Test Addresses For Off-Ramp Operations

**URL:** https://docs.busha.io/guides/reference/test-addresses

Test crypto sources for sandbox off-ramp testing:

| Blockchain | Test Asset | Source |
|---|---|---|
| Ethereum | Test USDC | [Circle Faucet](https://faucet.circle.com/) |
| Binance Smart Chain | Test USDT | [Binance Faucet](https://www.bnbchain.org/en/testnet-faucet) |
| Polygon | Test USDC | Circle Faucet |
| Base | Test USDC | Circle Faucet |
| Tron | Test USDT | [Nileex](https://nileex.io/join/getJoinPage) |
| Solana | Test USDC | Circle Faucet |
| Optimism | Test USDC | Circle Faucet |
| Arbitrum | Test USDC | Circle Faucet |
| Celo | Test USDC | Circle Faucet |

---

## 50. Transfer Status

**URL:** https://docs.busha.io/guides/reference/transfer-status

### Core statuses
- **Pending** — initiated, funds not yet received
- **Processing** — funds received, being actively handled
- **Cancelled** — will not proceed

### Specific statuses
- **Funds Received** (`funds_received`) — deposit successfully received (final for simple deposits)
- **Funds Converted** (`funds_converted`) — conversion completed (final for conversions)
- **Outgoing Payment Sent** (`outgoing_payment_sent`) — payment initiated outward
- **Funds Delivered** (`funds_delivered`) — final status for payouts; funds at destination

### Visual flow summary
- **Deposits:** → `funds_received`
- **Conversions:** → `funds_converted`
- **Payouts:** → `outgoing_payment_sent` → `funds_delivered`

---

## 51. API Reference Introduction

**URL:** https://docs.busha.io/api-reference/introduction

### Authentication

```
Authorization: Bearer {base64_encoded_api_key}
```

### Error codes

| Code | HTTP Status | Description |
|---|---|---|
| `bad_request` | 400 | Invalid input or malformed request |
| `unauthorized` | 401 | Invalid or missing authentication |
| `not_found` | 404 | Resource not found |
| `service_unavailable` | 503 | Server error |

### Pagination (cursor-based)

```json
{
  "current_entries_size": 10,
  "next_cursor": "base64_cursor_value",
  "previous_cursor": "base64_previous_cursor_value"
}
```

Pass `cursor` as a query parameter for subsequent pages.

### Rate limiting

Default: **100 req/min** (returned in `x-rate-limit` header). Exceeding returns `429 Too Many Requests`.

### Common parameters

| Parameter | Location | Description |
|---|---|---|
| `X-BU-PROFILE-ID` | Header | Customer profile identifier |
| `id` | Path | Unique NanoID identifier |
| `cursor` | Query | Pagination cursor |

### API endpoint sections
Balances, Bill, Currencies, Customers, Files, Miscellaneous, Pairs, PaymentLinks, PaymentRequests, Quotes, Recipients, Transactions, Transfers.

---

## 52. Changelog

**URL:** https://docs.busha.io/changelog

### March 2026

**2026/03/27 — New: `kyc_status` in customer endpoints**

`GET /customers` and `GET /customers/{id}` now return `kyc_status` field. Values: `pending`, `in_review`, `verified`, `rejected`.

**2026/03/06 — New: `deposit.success` webhook event**

Fires when a deposit hits your static bank account. Enables automatic fiat-to-stablecoin conversion flows. Requires re-registering your webhook to receive.

**2026/03/04 — KYC: selfie image (not video) now required**

`identifying_information` now requires a selfie image (`type: "selfie"` with `image_front`). Required combinations: Passport + selfie, or National ID (front + back) + selfie.

### February 2026

**2026/02/27 — API Request Logs**

New view in Settings → Developer Tools → Request Logs. See status, method, endpoint, request ID, timestamp per request. Supports search, filter, pagination, auto-refresh.

**2026/02/24 — `reversal_policy` in Quotes**

New optional field. Set `"conversion_only"` to refund the original source currency if a transfer fails.

**2026/02/23 — Webhook Event History & Replay**

View and replay webhook events from the last 21 days in the dashboard. Settings → Developer Tools → Webhooks → click a webhook.

**2026/02/18 — Request IDs**

All endpoints return `X-Request-Id` (e.g., `req_JfPBXEC5rLHc`) in response headers. Retained 21 days. Use when contacting support.

**2026/02/10 — Obsolete recipient code snippets removed**

Legacy examples and deprecated `X-BU-VERSION` header removed from recipient guides.

**2026/02/04 — `transfer.funds_refunded` webhook event**

Fires when funds are returned after a failed transfer. Use to reconcile balances or trigger retry logic.

**2026/02/04 — Token Sharing for Customer KYC**

New endpoint `POST /v1/customers/{id}/token-share` to import pre-verified Sumsub KYC data. Individual customers only.

### January 2026

**2026/01/30 — Sandbox Setup Guide Update**

Updated sandbox registration link and onboarding steps.

**2026/01/28 — Delegated Transactions Guide Update**

Updated code samples for on-behalf-of flows to reflect current required headers.

**2026/01/27 — Comprehensive Customer Docs Update**

Complete rewrites of Create Business, Create Individual, and Verify Identity guides with current payloads and field names.

**2026/01/27 — Four new customer verification webhook events**

`customer.verification.in_review`, `customer.verification.active`, `customer.verification.rejected`, `customer.verification.inactive` — all with full sample payloads.

---

*End of Busha Developer Documentation*  
*Total pages: 52 sections across Overview, Guides, Examples, API Reference, Reference, and Changelog*  
*Source: https://docs.busha.io*