import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate({ to: "/auth" });
      return;
    }

    async function loadSession() {
      const url = new URL(window.location.href);
      const hasCode = Boolean(url.searchParams.get("code"));
      const hasHashTokens = /access_token=|refresh_token=|type=recovery/.test(window.location.hash);

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          toast.error(error.message);
          navigate({ to: "/auth/forgot-password" });
          return;
        }
      }

      if (!hasCode && !hasHashTokens) {
        toast.error("Invalid or expired password reset link.");
        navigate({ to: "/auth/forgot-password" });
        return;
      }

      setReady(true);
    }

    loadSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated successfully. Please sign in.");
      await supabase.auth.signOut();
      navigate({ to: "/auth/login" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--gray-50)]">
        <div className="text-center space-y-4">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-crimson border-t-transparent" />
          <p className="text-sm text-[var(--muted)]">Preparing your secure password reset…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-tech-page flex min-h-screen items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="auth-tech-panel w-full max-w-md space-y-6 sm:space-y-8 p-5 sm:p-8">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Choose a new password</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Set a new password for your Klassruum account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              minLength={8}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              minLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
