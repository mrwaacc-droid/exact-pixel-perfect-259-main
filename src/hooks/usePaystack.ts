import { useCallback, useEffect, useState } from "react";

const SCRIPT_URL = "https://js.paystack.co/v1/inline.js";

type PaystackHandler = {
  openIframe: () => void;
};

type PaystackInline = {
  setup: (options: Record<string, unknown>) => PaystackHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackInline;
  }
}

export type PaystackCheckoutOptions = {
  reference: string;
  email: string;
  amount: number;
  currency?: string;
  publicKey?: string;
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
};

function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected Paystack error.";
}

export function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.PaystackPop) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack script")));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}

export function openPaystackCheckout(options: PaystackCheckoutOptions): void {
  if (typeof window === "undefined" || !window.PaystackPop) {
    throw new Error("Paystack script is not ready.");
  }

  const key = options.publicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || undefined;
  const handler = window.PaystackPop.setup({
    key,
    email: options.email,
    amount: options.amount,
    currency: options.currency ?? "NGN",
    ref: options.reference,
    onClose: () => {
      options.onCancel?.();
    },
    callback: (response: { reference?: string }) => {
      options.onSuccess?.(response.reference ?? options.reference);
    },
  });

  handler.openIframe();
}

export function usePaystack() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadPaystackScript()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((scriptError: unknown) => {
        if (!cancelled) {
          setError(parseErrorMessage(scriptError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openCheckout = useCallback((options: PaystackCheckoutOptions) => {
    try {
      openPaystackCheckout(options);
    } catch (checkoutError: unknown) {
      setError(parseErrorMessage(checkoutError));
    }
  }, []);

  return { ready, loading, error, openCheckout } as const;
}
