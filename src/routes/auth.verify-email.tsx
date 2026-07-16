import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  getAuthCallbackUrl,
  getPendingVerificationEmail,
  getPendingVerificationInviteToken,
} from "@/lib/auth-verification";

export const Route = createFileRoute("/auth/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const supabaseReady = isSupabaseConfigured();
  const [busy, setBusy] = useState(false);
  const email = getPendingVerificationEmail();
  const inviteToken = getPendingVerificationInviteToken();

  const handleResend = async () => {
    if (!supabaseReady) {
      toast.error("Supabase is not configured in this environment.");
      return;
    }

    if (!email) {
      toast.error("We could not determine which email to resend to. Please sign up again.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(inviteToken),
        },
      });

      if (error) throw error;

      toast.success("Verification email sent. Please check your inbox again.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-tech-page flex min-h-screen items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="auth-tech-panel w-full max-w-md space-y-6 p-5 sm:p-8 text-center">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
        </div>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 6 12 13 2 6" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Verify your email</h1>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            We sent a verification link to
            {email ? <span className="font-semibold text-[var(--ink)]"> {email}</span> : " your email address"}.
            Open the message and confirm your account before accessing protected areas of Klassruum.
          </p>
        </div>

        <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] p-4 text-left text-sm text-[#166534]">
          <p className="font-semibold">What happens next?</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Open the verification email from Supabase.</li>
            <li>Click the confirmation link to activate your account.</li>
            <li>After verification, you’ll be redirected to finish setup or continue to your dashboard.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button type="button" className="w-full" size="lg" onClick={handleResend} disabled={busy || !email}>
            {busy ? "Sending…" : "Resend verification email"}
          </Button>
          <Link
            to="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--page-background)]"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
