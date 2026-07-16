import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { requireClientAuthRoute, roleDashboardPath } from "@/lib/route-guards";
import { clearPendingVerification, requiresEmailVerification } from "@/lib/auth-verification";
import { completeAuthProfile } from "@/lib/auth-profile.functions";
import type { UserRole } from "@/lib/types";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, School, Users } from "lucide-react";

export const Route = createFileRoute("/auth/complete-profile")({
  beforeLoad: () => requireClientAuthRoute(),
  component: CompleteProfilePage,
});

const ROLE_OPTIONS: Array<{
  role: UserRole;
  label: string;
  description: string;
  icon: typeof GraduationCap;
}> = [
    {
      role: "student",
      label: "Student",
      description: "Take lessons, track progress, earn achievements",
      icon: GraduationCap,
    },
    {
      role: "teacher",
      label: "Teacher",
      description: "Create courses, manage classrooms, monitor learners",
      icon: School,
    },
    {
      role: "parent",
      label: "Parent",
      description: "Monitor learner progress, sessions, and reports",
      icon: Users,
    },
  ];

function CompleteProfilePage() {
  const navigate = useNavigate();
  const completeProfileFn = useServerFn(completeAuthProfile);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate({ to: "/auth" });
      return;
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        navigate({ to: "/auth" });
        return;
      }

      const user = data.session.user;

      if (requiresEmailVerification(user)) {
        navigate({ to: "/auth/verify-email" });
        return;
      }

      clearPendingVerification();
      setUserId(user.id);

      // Pre-fill name from OAuth metadata
      const metaName =
        (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || "";
      setFullName(metaName);

      // Check if user already has a profile — if so, redirect away
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile) {
        const role = (existingProfile.role as UserRole) ?? null;
        navigate({ to: roleDashboardPath(role) });
        return;
      }

      setLoading(false);
    }

    loadSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!fullName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error("Session expired. Please sign in again.");

      const result = await completeProfileFn({
        data: {
          fullName: fullName.trim(),
          role: selectedRole,
        },
      });

      localStorage.setItem("klassruum_demo_role", selectedRole);

      toast.success(
        result.studentNumber
          ? `Profile completed. Your student ID is ${result.studentNumber}.`
          : result.teacherNumber
            ? `Profile completed. Your teacher ID is ${result.teacherNumber}.`
            : result.institutionCode
              ? `Profile completed. Your institution ID is ${result.institutionCode}.`
              : "Profile completed! Welcome to Klassruum.",
      );
      navigate({ to: roleDashboardPath(selectedRole) });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--gray-50)]">
        <div className="text-center space-y-4">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-crimson border-t-transparent" />
          <p className="text-sm text-[var(--muted)]">Loading your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-tech-page flex min-h-screen items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center">
            <Logo size={34} />
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            Complete your profile
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Tell us a bit about yourself to personalise your experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>I am a…</Label>
            <div className="grid gap-2">
              {ROLE_OPTIONS.map(({ role, label, description, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${selectedRole === role
                      ? "border-crimson bg-[#F0FDFA] ring-1 ring-crimson/20"
                      : "border-[var(--border)] bg-white hover:border-crimson-soft hover:bg-[#F0FDFA]"
                    }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selectedRole === role
                        ? "bg-crimson text-white"
                        : "bg-[var(--beige-soft)] text-[var(--muted)]"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--ink)]">{label}</p>
                    <p className="truncate text-xs text-[var(--muted)]">{description}</p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${selectedRole === role ? "border-crimson bg-crimson" : "border-[var(--border)]"
                      }`}
                  >
                    {selectedRole === role && (
                      <svg viewBox="0 0 16 16" fill="white" className="h-full w-full p-0.5">
                        <path d="M6.5 11.5L3.5 8.5l1-1 2 2 4.5-4.5 1 1z" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Setting up…" : "Continue to Klassruum"}
          </Button>
        </form>
      </div>
    </div>
  );
}
