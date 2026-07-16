import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { User, Bell, Shield, Accessibility, ChevronRight } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getProfile } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/settings")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentSettings,
});

function StudentSettings() {
  const fn = useServerFn(getProfile);
  const q = useQuery({ queryKey: ["student-profile"], queryFn: () => fn() });
  const p = q.data;

  return (
    <StudentShell title="Settings">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="kr-pcard flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-crimson-soft text-lg font-bold text-crimson">
            {(p?.fullName?.[0] ?? "S").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-[var(--gray-900)]">
              {p?.fullName || "Student"}
            </h2>
            <p className="truncate text-sm text-[var(--gray-500)]">{p?.email ?? ""}</p>
          </div>
        </div>

        <Link
          to="/student/settings/profile"
          className="kr-pcard flex items-center gap-3 p-4 hover:border-[var(--primary)]"
        >
          <User className="h-5 w-5 text-[var(--primary)]" />
          <div className="flex-1">
            <p className="font-semibold text-[var(--gray-900)]">Profile details</p>
            <p className="text-xs text-[var(--gray-500)]">Name, phone, and avatar</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--gray-400)]" />
        </Link>

        <Link
          to="/student/access"
          className="kr-pcard flex items-center gap-3 p-4 hover:border-[var(--primary)]"
        >
          <Accessibility className="h-5 w-5 text-[var(--primary)]" />
          <div className="flex-1">
            <p className="font-semibold text-[var(--gray-900)]">Learning access</p>
            <p className="text-xs text-[var(--gray-500)]">Captions, voice, pace, and focus mode</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--gray-400)]" />
        </Link>

        <Link
          to="/student/notifications"
          className="kr-pcard flex items-center gap-3 p-4 hover:border-[var(--primary)]"
        >
          <Bell className="h-5 w-5 text-[var(--primary)]" />
          <div className="flex-1">
            <p className="font-semibold text-[var(--gray-900)]">Notifications</p>
            <p className="text-xs text-[var(--gray-500)]">Manage your activity alerts</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--gray-400)]" />
        </Link>

        <div className="kr-pcard flex items-center gap-3 p-4 opacity-70">
          <Shield className="h-5 w-5 text-[var(--gray-400)]" />
          <div className="flex-1">
            <p className="font-semibold text-[var(--gray-900)]">Privacy & security</p>
            <p className="text-xs text-[var(--gray-500)]">Managed via your account authentication settings</p>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
