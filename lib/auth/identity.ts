import { APP_USER_EMAIL_COOKIE, APP_USER_NAME_COOKIE } from "@/lib/auth/session";

const LOGIN_IDENTITY_STORAGE_KEY = "fluent_login_identity";

export function deriveFullName(email: string) {
  const localPart = email.split("@")[0] || "workspace-user";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getStoredLoginIdentity() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(LOGIN_IDENTITY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { email?: string; full_name?: string };
      if (parsed.email || parsed.full_name) {
        return {
          email: parsed.email ?? "",
          full_name: parsed.full_name ?? deriveFullName(parsed.email ?? ""),
        };
      }
    }
  } catch {
    // Ignore malformed storage and fall back to cookies.
  }

  const cookies = document.cookie.split(";").map((entry) => entry.trim());
  const getCookieValue = (name: string) =>
    cookies.find((entry) => entry.startsWith(`${name}=`))?.split("=").slice(1).join("=") ?? "";

  const email = decodeURIComponent(getCookieValue(APP_USER_EMAIL_COOKIE));
  const fullName = decodeURIComponent(getCookieValue(APP_USER_NAME_COOKIE));

  if (!email && !fullName) {
    return null;
  }

  return {
    email,
    full_name: fullName || deriveFullName(email),
  };
}

export function storeLoginIdentity(identity: { email: string; full_name: string }) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOGIN_IDENTITY_STORAGE_KEY, JSON.stringify(identity));
}

export function resolveDisplayIdentity(
  currentUser: { email?: string | null; full_name?: string | null; business_name?: string | null } | null | undefined,
  storedIdentity: { email?: string; full_name?: string } | null | undefined
) {
  const email = currentUser?.email || storedIdentity?.email || "";
  const fullName = currentUser?.full_name || storedIdentity?.full_name || deriveFullName(email);
  const businessName = currentUser?.business_name || "";

  if (!email && !fullName) {
    return null;
  }

  return {
    email,
    full_name: fullName,
    business_name: businessName,
  };
}
