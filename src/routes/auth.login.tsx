import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthBrandRail } from "@/components/auth/AuthBrandRail";
import { Logo } from "@/components/brand/Logo";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { acceptInstitutionInvite } from "@/lib/institution-invites.functions";
import { redirectAuthenticatedUsers, roleDashboardPath } from "@/lib/route-guards";
import { resolvePostAuthPath } from "@/lib/auth-redirects";
import {
  clearPendingVerification,
  getAuthCallbackUrl,
  rememberPendingVerification,
  requiresEmailVerification,
} from "@/lib/auth-verification";
import { beginGoogleOAuth } from "@/lib/google-oauth.functions";
import type { UserRole } from "@/lib/types";

const SITE_URL = "https://klassruum.com";

export const Route = createFileRoute("/auth/login")({
  beforeLoad: () => redirectAuthenticatedUsers(),
  head: () => ({
    meta: [
      { title: "Sign In — Klassruum AI Virtual Classrooms" },
      {
        name: "description",
        content:
          "Sign in to your Klassruum account. Access AI-powered virtual classrooms, manage courses, track learner progress, and deliver structured lessons.",
      },
      {
        name: "keywords",
        content: "Klassruum login, sign in, AI classroom access, institution login",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Sign In — Klassruum" },
      { property: "og:description", content: "Access your AI-powered virtual classroom." },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/auth` }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const supabaseReady = isSupabaseConfigured();
  const acceptInviteFn = useServerFn(acceptInstitutionInvite);
  const googleOAuthFn = useServerFn(beginGoogleOAuth);
  const inviteToken =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("invite")
      : null;
  const signupHref = inviteToken
    ? `/auth/signup?invite=${encodeURIComponent(inviteToken)}`
    : "/auth/signup";

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) {
      toast.error("Supabase is not configured. Use demo mode on the main auth page.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (requiresEmailVerification(data.user)) {
        rememberPendingVerification(data.user.email ?? email, inviteToken);
        await supabase.auth.signOut();
        toast.error("Please verify your email before signing in.");
        navigate({ to: "/auth/verify-email" });
        return;
      }

      if (inviteToken) {
        const acceptedInvite = await acceptInviteFn({ data: { token: inviteToken } });
        clearPendingVerification();
        toast.success("Institution invite accepted.");
        navigate({ to: roleDashboardPath(acceptedInvite.profile_role as UserRole) });
        return;
      }

      clearPendingVerification();
      toast.success("Welcome to Klassruum");
      navigate({ to: await resolvePostAuthPath(data.user.id) });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabaseReady) {
      toast.error("Supabase is not configured. Use demo mode on the main auth page.");
      return;
    }

    const result = await googleOAuthFn({
      data: { inviteToken: inviteToken ?? undefined },
    });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: result.redirectTo,
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="auth-tech-page flex min-h-screen">
      <AuthBrandRail
        eyebrow="Secure classroom access"
        title="Resume teaching with the room already set."
        body="Return to live lessons, learner progress, transcripts, notes, and institution controls without losing the teaching thread."
        stats={[
          { label: "Lesson evidence", value: "Live" },
          { label: "Access modes", value: "10+" },
          { label: "Setup", value: "0 min" },
        ]}
      />
      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="auth-tech-panel w-full max-w-[430px] space-y-6 sm:space-y-8 p-5 sm:p-8">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={34} />
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">Sign in</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Enter your credentials to access your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleEmailSignIn}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--ink)]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-crimson focus:ring-2 focus:ring-crimson/10"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--ink)]">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-medium text-crimson hover:text-crimson-dark"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-crimson focus:ring-2 focus:ring-crimson/10"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-crimson px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-crimson/25 transition-all hover:bg-crimson-dark hover:shadow-xl hover:shadow-crimson/30 focus:outline-none focus:ring-2 focus:ring-crimson focus:ring-offset-2 disabled:opacity-60"
            >
              {busy ? "Please wait…" : "Sign in"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[var(--muted)]">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--ink)] transition-all hover:bg-[var(--page-background)] hover:border-[var(--border-strong)]"
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
              Google
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--ink)] transition-all hover:bg-[var(--page-background)] hover:border-[var(--border-strong)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
          </div>

          <p className="text-center text-sm text-[var(--muted)]">
            Don't have an account?{" "}
            <Link to={signupHref} className="font-semibold text-crimson hover:text-crimson-dark">
              Create an account
            </Link>
          </p>
          <p className="text-center text-sm text-[var(--muted)]">
            Running an institution?{" "}
            <Link
              to="/institutions/register"
              className="font-semibold text-crimson hover:text-crimson-dark"
            >
              Register your institution
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
