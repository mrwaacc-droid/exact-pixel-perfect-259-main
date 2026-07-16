import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { acceptInstitutionInvite } from "@/lib/institution-invites.functions";
import { roleDashboardPath } from "@/lib/route-guards";
import { resolvePostAuthPath } from "@/lib/auth-redirects";
import { clearPendingVerification, requiresEmailVerification } from "@/lib/auth-verification";
import type { UserRole } from "@/lib/types";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error" | "redirecting">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const acceptInviteFn = useServerFn(acceptInstitutionInvite);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate({ to: "/auth" });
      return;
    }

    let cancelled = false;
    const inviteToken =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("invite")
        : null;

    async function handleCallback() {
      try {
        const currentUrl =
          typeof window !== "undefined" ? new URL(window.location.href) : null;
        const hasCode = Boolean(currentUrl?.searchParams.get("code"));
        const hasHashTokens =
          typeof window !== "undefined" &&
          /access_token=|refresh_token=|error=/.test(window.location.hash);

        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            throw new Error(error.message);
          }
        }

        if (!hasCode && !hasHashTokens) {
          throw new Error("No authentication response was returned by Google. Please try again.");
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message);
        }

        if (!data.session?.user) {
          throw new Error(
            "No session found. The link may have expired. Please try signing in again.",
          );
        }

        const user = data.session.user;

        if (requiresEmailVerification(user)) {
          if (cancelled) return;
          navigate({ to: "/auth/verify-email" });
          return;
        }

        clearPendingVerification();

        if (inviteToken) {
          const acceptedInvite = await acceptInviteFn({ data: { token: inviteToken } });
          if (cancelled) return;
          setStatus("redirecting");
          navigate({ to: roleDashboardPath(acceptedInvite.profile_role as UserRole) });
          return;
        }

        if (cancelled) return;
        setStatus("redirecting");
        navigate({ to: await resolvePostAuthPath(user.id) });
      } catch (err) {
        if (cancelled) return;
        const message = (err as Error).message || "Authentication failed.";
        setErrorMsg(message);
        setStatus("error");
        // Auto-redirect to auth page after 5 seconds
        setTimeout(() => {
          if (!cancelled) navigate({ to: "/auth" });
        }, 5000);
      }
    }

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [acceptInviteFn, navigate]);

  return (
    <div className="auth-tech-page flex min-h-screen items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <Logo size={34} />
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-crimson border-t-transparent" />
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Signing you in…</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Finalising your sign-in and preparing your account.
              </p>
            </div>
          </div>
        )}

        {status === "redirecting" && (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-crimson border-t-transparent" />
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Redirecting…</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Taking you to your dashboard.</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">Authentication failed</h2>
              <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
              <p className="mt-3 text-xs text-[var(--muted)]">
                Redirecting to sign-in page in a few seconds…
              </p>
            </div>
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="mt-2 rounded-xl bg-crimson px-6 py-2.5 text-sm font-semibold text-white hover:bg-crimson-dark"
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
