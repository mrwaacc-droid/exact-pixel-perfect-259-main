import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { getAuthCallbackUrl, rememberPendingVerification } from "@/lib/auth-verification";
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
  const inviteToken =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("invite")
      : null;
  const signInHref = inviteToken ? `/auth/login?invite=${encodeURIComponent(inviteToken)}` : "/auth/login";

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
