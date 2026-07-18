import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { getAuthCallbackUrl, rememberPendingVerification } from "@/lib/auth-verification";
import { beginGoogleOAuth } from "@/lib/google-oauth.functions";
import { redirectAuthenticatedUsers } from "@/lib/route-guards";

export const Route = createFileRoute("/auth/signup")({
  beforeLoad: () => redirectAuthenticatedUsers(),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const supabaseReady = isSupabaseConfigured();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const googleOAuthFn = useServerFn(beginGoogleOAuth);
  const inviteToken =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("invite")
      : null;
  const signInHref = inviteToken ? `/auth/login?invite=${encodeURIComponent(inviteToken)}` : "/auth/login";

  const handleGoogleSignUp = async () => {
    if (!supabaseReady) {
      toast.error("Supabase is not configured. Use the main auth page demo mode instead.");
      return;
    }
    try {
      const result = await googleOAuthFn({
        data: { inviteToken: inviteToken ?? undefined },
      });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: result.redirectTo },
      });
      if (error) toast.error(error.message);
    } catch (err) {
      toast.error((err as Error).message || "Could not start Google sign-in. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabaseReady) {
      toast.error("Supabase is not configured. Use the main auth page demo mode instead.");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(inviteToken),
          data: { full_name: fullName.trim() },
        },
      });

      if (error) throw error;

      rememberPendingVerification(email, inviteToken);
      toast.success("Account created. Check your inbox to verify your email.");
      navigate({ to: "/auth/verify-email" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-tech-page flex min-h-screen items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="auth-tech-panel w-full max-w-md space-y-6 sm:space-y-8 p-5 sm:p-8">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign up with email, then verify your inbox before accessing Klassruum.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </Button>
        </form>

        {supabaseReady && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[var(--muted)]">or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--ink)] transition-all hover:bg-[var(--page-background)] hover:border-[var(--border-strong)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link to={signInHref} className="font-semibold text-crimson hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
