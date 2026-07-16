import { ArrowLeft, ArrowRight, CheckCircle2, Compass, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs, type DashboardConfig } from "@/lib/dashboard-config";

type RouteItem = {
  label: string;
  href?: string;
  to?: string;
  description?: string;
};

type RouteWorkspacePageProps = {
  title: string;
  description: string;
  role: string;
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
  items?: RouteItem[];
};

function configForRole(role: string): DashboardConfig | null {
  const r = role.toLowerCase();
  if (r.includes("teacher-enrolled learner")) return dashboardConfigs.teacher_enrolled_learner;
  if (r.includes("institution learner")) return dashboardConfigs.institution_learner;
  if (r.includes("private learner")) return dashboardConfigs.private_learner;
  if (r.includes("private teacher")) return dashboardConfigs.private_teacher;
  if (r.includes("institution teacher")) return dashboardConfigs.institution_teacher;
  if (r.includes("kingpin teacher")) return dashboardConfigs.kingpin_teacher;
  if (r.includes("student") || r.includes("learner")) return dashboardConfigs.institution_learner;
  if (r.includes("teacher")) return dashboardConfigs.institution_teacher;
  if (r.includes("institution")) return dashboardConfigs.institution;
  if (r.includes("platform") || r.includes("admin")) return dashboardConfigs.platform_admin;
  if (r.includes("parent")) return dashboardConfigs.parent;
  return null;
}

function dashboardHrefForRole(role: string) {
  const r = role.toLowerCase();
  if (r.includes("platform") || r.includes("admin")) return "/admin/dashboard";
  if (r.includes("institution")) return "/institution/dashboard";
  if (r.includes("teacher")) return "/teacher/dashboard";
  if (r.includes("parent")) return "/parent/dashboard";
  if (r.includes("student") || r.includes("learner")) return "/student/dashboard";
  return "/";
}

function RouteAction({
  action,
  variant,
}: {
  action: { label: string; to: string };
  variant: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";
  return (
    <Link
      to={action.to}
      className={
        isPrimary
          ? "inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]"
          : "inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--gray-200)] bg-white px-4 text-sm font-bold text-[var(--gray-700)] transition hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
      }
    >
      {action.label}
      {isPrimary ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}

function WorkspaceBody({
  title,
  description,
  role,
  primary,
  secondary,
  items = [],
}: RouteWorkspacePageProps) {
  const workflowItems =
    items.length > 0
      ? items
      : [
          {
            label: "Dashboard overview",
            to: dashboardHrefForRole(role),
            description: "Return to the role dashboard for the next operational step.",
          },
        ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">
            {role} workspace
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--gray-900)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--gray-600)]">{description}</p>
        </div>
        {(primary || secondary) && (
          <div className="flex flex-wrap gap-3">
            {secondary ? <RouteAction action={secondary} variant="secondary" /> : null}
            {primary ? <RouteAction action={primary} variant="primary" /> : null}
          </div>
        )}
      </div>

      <section className="dashboard-card overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Compass className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-black tracking-tight text-[var(--gray-900)]">
              Ready for role-based work
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--gray-600)]">
              This workspace is connected to the dashboard shell, permission model, and
              navigation for its role. Use the workflow links to continue through the
              operational path without leaving the current dashboard experience.
            </p>
          </div>
          <div className="border-t border-[var(--gray-200)] bg-[var(--gray-50)] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="grid gap-3">
              {[
                ["Access", "Role-aware route protection"],
                ["Navigation", "Persistent dashboard chrome"],
                ["Workflow", "Linked next actions"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--gray-200)] bg-white px-4 py-3"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--gray-500)]">
                    {label}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--gray-800)]">
                    <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--gray-900)]">
          <LayoutDashboard className="h-4 w-4 text-[var(--primary)]" />
          Workflow links
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workflowItems.map((item) => {
            const target = item.href ?? item.to ?? dashboardHrefForRole(role);
            return (
              <Link
                key={target + item.label}
                to={target}
                className="group block rounded-2xl border border-[var(--gray-200)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)]/35 hover:shadow-md"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--gray-400)]">
                  {role}
                </p>
                <h3 className="mt-2 text-base font-black text-[var(--gray-900)]">{item.label}</h3>
                {item.description ? (
                  <p className="mt-2 text-sm leading-6 text-[var(--gray-600)]">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[var(--primary)]">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function RouteWorkspacePage(props: RouteWorkspacePageProps) {
  const config = configForRole(props.role);
  const location = useLocation();

  if (config) {
    return (
      <DashboardShell config={config} activePath={location.pathname} title={props.title}>
        <WorkspaceBody {...props} />
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gray-50)]">
      <header className="border-b border-[var(--gray-200)] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="."
            onClick={(event) => {
              event.preventDefault();
              window.history.back();
            }}
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--gray-600)] hover:text-[var(--gray-900)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="rounded-full bg-[var(--gray-100)] px-3 py-1 text-xs font-bold text-[var(--gray-600)]">
            {props.role}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <WorkspaceBody {...props} />
      </main>
    </div>
  );
}
