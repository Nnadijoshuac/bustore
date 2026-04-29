-- ============================================================
-- Fluent / BushaPay — Supabase Schema
-- Run this entire file in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
--    One row per auth.users entry. Created automatically via trigger.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL DEFAULT '',
  business_name   TEXT,
  country         TEXT NOT NULL DEFAULT 'NG',
  kyc_status      TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'business_name',
    COALESCE(NEW.raw_user_meta_data->>'country', 'NG')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- 2. PAYMENT LINKS
--    Local cache of Busha payment links, scoped per user.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_links (
  id                    TEXT PRIMARY KEY,                        -- Busha's ID
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id            TEXT NOT NULL DEFAULT '',
  title                 TEXT NOT NULL,
  description           TEXT,
  amount                NUMERIC,                                 -- NULL = customer-defined
  currency              TEXT NOT NULL DEFAULT 'USD',
  target_currency       TEXT NOT NULL DEFAULT 'USDT',
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  slug                  TEXT NOT NULL,
  hosted_url            TEXT,
  redirect_url          TEXT,
  one_time              BOOLEAN NOT NULL DEFAULT FALSE,
  allow_customer_amount BOOLEAN NOT NULL DEFAULT FALSE,
  total_collected       NUMERIC NOT NULL DEFAULT 0,
  payment_count         INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at            TIMESTAMPTZ,
  UNIQUE(user_id, slug)
);

DROP TRIGGER IF EXISTS payment_links_updated_at ON public.payment_links;

ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment links"
  ON public.payment_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment links"
  ON public.payment_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment links"
  ON public.payment_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment links"
  ON public.payment_links FOR DELETE
  USING (auth.uid() = user_id);

-- Allow service role to read/write all payment links (used by API routes)
CREATE POLICY "Service role has full access to payment links"
  ON public.payment_links
  USING (TRUE)
  WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- 3. CUSTOMERS
--    Busha customer records, scoped per user.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customers (
  id                              TEXT PRIMARY KEY,              -- Busha's customer ID
  user_id                         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id                     TEXT,
  email                           TEXT NOT NULL DEFAULT '',
  first_name                      TEXT NOT NULL DEFAULT '',
  middle_name                     TEXT,
  last_name                       TEXT NOT NULL DEFAULT '',
  phone                           TEXT NOT NULL DEFAULT '',
  type                            TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'business')),
  country_id                      TEXT NOT NULL DEFAULT '',
  birth_date                      TEXT,
  -- Address stored as JSONB for flexibility
  address                         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status                          TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'in_review', 'active', 'rejected')),
  level                           TEXT,
  display_currency                TEXT,
  deposit                         BOOLEAN,
  payout                          BOOLEAN,
  has_accepted_terms_of_service   BOOLEAN,
  -- KYC documents stored as JSONB array
  identifying_information         JSONB,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to customers"
  ON public.customers
  USING (TRUE)
  WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- 4. WEBHOOK DELIVERIES
--    Inbound Busha webhook events received at /api/webhooks/busha
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id            TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL = system-level / unknown
  event         TEXT NOT NULL,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature     TEXT
);

-- Keep only the last 200 deliveries per user (prevent unbounded growth)
CREATE OR REPLACE FUNCTION public.trim_webhook_deliveries()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.webhook_deliveries
  WHERE id IN (
    SELECT id FROM public.webhook_deliveries
    WHERE user_id = NEW.user_id
    ORDER BY received_at DESC
    OFFSET 200
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trim_webhook_deliveries_after_insert ON public.webhook_deliveries;
CREATE TRIGGER trim_webhook_deliveries_after_insert
  AFTER INSERT ON public.webhook_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.trim_webhook_deliveries();

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to webhook deliveries"
  ON public.webhook_deliveries
  USING (TRUE)
  WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- 5. SETTLEMENTS
--    Local record of payout transactions, scoped per user.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.settlements (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id      TEXT NOT NULL DEFAULT '',
  recipient_id    TEXT NOT NULL,
  -- Recipient snapshot stored as JSONB so it's preserved even if recipient is deleted
  recipient       JSONB,
  amount_usd      NUMERIC NOT NULL,
  amount_local    NUMERIC NOT NULL DEFAULT 0,
  local_currency  TEXT NOT NULL DEFAULT 'NGN',
  exchange_rate   NUMERIC NOT NULL DEFAULT 0,
  fee_usd         NUMERIC NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('pending', 'processing', 'settled', 'failed')),
  reference       TEXT NOT NULL DEFAULT '',
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settlements"
  ON public.settlements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settlements"
  ON public.settlements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role has full access to settlements"
  ON public.settlements
  USING (TRUE)
  WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- 6. USEFUL INDEXES
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_payment_links_user_id   ON public.payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_slug      ON public.payment_links(slug);
CREATE INDEX IF NOT EXISTS idx_customers_user_id       ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email         ON public.customers(user_id, email);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_user ON public.webhook_deliveries(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_user_id     ON public.settlements(user_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────
-- Tables created:
--   public.profiles              (1 per user, auto-created on signup)
--   public.payment_links         (Busha payment link cache, per user)
--   public.customers             (Busha customer records, per user)
--   public.webhook_deliveries    (inbound Busha events, per user)
--   public.settlements           (payout records, per user)
