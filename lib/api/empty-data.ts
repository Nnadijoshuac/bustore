import type { Account, User } from "@/types";

export const EMPTY_USER: User = {
  id: "",
  email: "",
  full_name: "Workspace User",
  business_name: "",
  avatar_url: undefined,
  country: "",
  created_at: "",
  kyc_status: "pending",
};

export const EMPTY_ACCOUNT: Account = {
  id: "",
  user_id: "",
  balance_usd: 0,
  balance_local: 0,
  local_currency: "NGN",
  is_demo: false,
};
