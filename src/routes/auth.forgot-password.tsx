import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth-verification";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured()) {
      toast.error("Supabase is not configured in this environment.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getAuthCallbackUrl(),
      });

      if (error) throw error;
      toast.success("Password reset link sent. Check your inbox.");
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
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Reset your password</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Enter your account email and we’ll send you a secure reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <div className="text-center text-sm text-[var(--muted)]">
          Remembered your password?{" "}
          <Link to="/auth/login" className="font-semibold text-crimson hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
