const DEFAULT_BUSHA_API_BASE_URL = "https://api.sandbox.busha.so";
const TRANSIENT_STATUS_CODES = new Set([502, 503, 504]);

type BushaErrorPayload = {
  message?: string;
  error?: string | { name?: string; message?: string };
};

export class BushaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BushaApiError";
    this.status = status;
  }
}

function getBushaConfig() {
  const secret = process.env.BUSHA_API_SECRET;

  if (!secret) {
    throw new Error("BUSHA_API_SECRET is not configured.");
  }

  return {
    baseUrl: process.env.BUSHA_API_BASE_URL || DEFAULT_BUSHA_API_BASE_URL,
    secret,
  };
}

export function getBushaCheckoutUrl(linkValue: string) {
  if (!linkValue) {
    return "";
  }

  if (linkValue.startsWith("http://") || linkValue.startsWith("https://")) {
    return linkValue;
  }

  return `https://pay.busha.io/charges/${linkValue}`;
}

async function parseBushaResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T & BushaErrorPayload) : ({} as T & BushaErrorPayload);

  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : payload.error?.message || payload.message || `Busha request failed with status ${response.status}.`;
    throw new BushaApiError(message, response.status);
  }

  return payload;
}

async function requestBusha<T>(path: string, init?: RequestInit, retries = 1): Promise<T> {
  const { baseUrl, secret } = getBushaConfig();
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
        cache: "no-store",
      });

      return await parseBushaResponse<T>(response);
    } catch (error) {
      lastError = error;

      if (!(error instanceof BushaApiError) || !TRANSIENT_STATUS_CODES.has(error.status) || attempt === retries) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Busha request failed.");
}

export function createBushaClient() {
  return {
    get<T>(path: string) {
      return requestBusha<T>(path, { method: "GET" });
    },
    post<T>(path: string, body?: unknown) {
      return requestBusha<T>(path, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    put<T>(path: string, body?: unknown) {
      return requestBusha<T>(path, {
        method: "PUT",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    patch<T>(path: string, body?: unknown) {
      return requestBusha<T>(path, {
        method: "PATCH",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
  };
}
