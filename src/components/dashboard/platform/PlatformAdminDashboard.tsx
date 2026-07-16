import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { KpiCard } from "@/components/dashboard/shared/KpiCard";
import { DashboardLoadingState } from "@/components/dashboard/shared/DashboardLoadingState";
import { getPlatformAdminDashboard } from "@/lib/reporting.functions";
import {
  Building2,
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";

function formatCount(value: number | null | undefined): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value ?? 0);
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "Live data";
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "Live data";
  const mins = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

export function PlatformAdminDashboard() {
  const config = dashboardConfigs.platform_admin;
  const dashboardFn = useServerFn(getPlatformAdminDashboard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-admin-dashboard"],
    queryFn: () => dashboardFn(),
    staleTime: 20000,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <DashboardShell config={config} activePath="/admin/dashboard">
        <DashboardLoadingState type="skeleton" />
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell config={config} activePath="/admin/dashboard">
        <DashboardLoadingState
          type="error"
          message={(error as Error)?.message || "Failed to load dashboard data"}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell config={config} activePath="/admin/dashboard">
      {/* Dashboard Header */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            Platform Overview
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--gray-900)] lg:text-4xl">
          Platform Administration
        </h1>
        <p className="mt-2 text-sm text-[var(--gray-500)]">
          Manage institutions, monitor platform health, and oversee system operations
        </p>
      </section>

      {/* Featured hero — live platform status */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-[var(--primary)]/20 bg-gradient-to-br from-white via-[var(--primary-light)] to-white p-7 shadow-lg">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              All systems operational
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--gray-900)] lg:text-3xl">
              Live platform activity
            </h2>
            <p className="mt-1 text-sm text-[var(--gray-500)]">
              Real-time view across all institutions and classrooms
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-[var(--gray-400)]">Users Online</p>
                <p className="text-2xl font-extrabold text-[var(--primary)]">
                  {formatCount(data.live.usersOnline)}
                </p>
              </div>
              <div className="h-8 w-px bg-[var(--gray-200)]" />
              <div>
                <p className="text-xs text-[var(--gray-400)]">Active Classrooms</p>
                <p className="font-bold text-[var(--gray-900)]">
                  {formatCount(data.live.activeClassrooms)}
                </p>
              </div>
              <div className="h-8 w-px bg-[var(--gray-200)]" />
              <div>
                <p className="text-xs text-[var(--gray-400)]">Institutions Live</p>
                <p className="font-bold text-[var(--gray-900)]">
                  {formatCount(data.live.institutionsLive)}
                </p>
              </div>
              <div className="h-8 w-px bg-[var(--gray-200)]" />
              <div>
                <p className="text-xs text-[var(--gray-400)]">Lessons Generating</p>
                <p className="font-bold text-[var(--gray-900)]">
                  {formatCount(data.live.lessonsGenerating)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <Link
              to="/admin/institutions"
              className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--primary)] px-6 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/25 transition-all hover:bg-[var(--primary-dark)] lg:w-auto"
            >
              <Building2 className="h-4 w-4" />
              Manage Institutions
            </Link>
            <Link
              to="/admin/usage"
              className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[var(--primary)]/20 bg-white px-6 text-sm font-bold text-[var(--primary)] transition-all hover:bg-[var(--primary-light)] lg:w-auto"
            >
              <Activity className="h-4 w-4" />
              View Usage
            </Link>
          </div>
        </div>
      </section>

      {/* Platform KPI Cards */}
      <section className="kr-dashboard-kpi-grid mb-6">
        <KpiCard
          title="Institutions"
          value={formatCount(data.stats.institutions)}
          subtitle="Active organizations"
          href="/admin/institutions"
          icon={Building2}
          trend="+12%"
        />
        <KpiCard
          title="Total Users"
          value={formatCount(data.stats.users)}
          subtitle="Across all roles"
          href="/admin/users"
          icon={Users}
          trend="+8%"
        />
        <KpiCard
          title="Active Sessions"
          value={formatCount(data.stats.activeSessions)}
          subtitle="Live classrooms"
          href="/admin/usage"
          icon={Activity}
          trend="+23%"
        />
        <KpiCard
          title="Subscriptions"
          value={formatCount(data.stats.activeSubscriptions)}
          subtitle="Active or trialing"
          href="/admin/plans"
          icon={CreditCard}
          trend="+15%"
        />
        <KpiCard
          title="Platform Health"
          value="99.9%"
          subtitle="Uptime this month"
          href="/admin/health"
          icon={CheckCircle2}
        />
        <KpiCard
          title="Support Tickets"
          value={formatCount(data.stats.supportTickets)}
          subtitle="Open issues"
          href="/admin/support"
          icon={AlertTriangle}
        />
      </section>

      {/* Dashboard Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Institution Growth Chart */}
        <div className="dashboard-card lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[var(--gray-900)]">Institution Growth</h2>
              <p className="text-sm text-[var(--gray-500)]">New institutions over time</p>
            </div>
            <div className="flex min-w-0 gap-2">
              <span className="flex min-w-0 items-center gap-1 text-sm font-medium leading-snug text-green-600">
                <TrendingUp className="h-4 w-4" />
                +18% vs last month
              </span>
            </div>
          </div>

          {/* Mock Chart */}
          <div className="h-64 rounded-lg bg-gradient-to-br from-[var(--gray-50)] to-white p-4">
            <div className="flex h-full items-end justify-between gap-2">
              {[45, 62, 55, 78, 82, 91, 85, 95, 88, 102, 97, 110].map((value, index) => (
                <div
                  key={index}
                  className="w-full rounded-t bg-[var(--primary)] opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-[var(--gray-400)]">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div className="dashboard-card">
          <h2 className="text-xl font-bold text-[var(--gray-900)]">System Health</h2>
          <p className="mb-4 text-sm text-[var(--gray-500)]">Platform performance metrics</p>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--gray-900)]">API Services</p>
                  <p className="text-xs text-[var(--gray-500)]">All systems operational</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-green-600">99.9%</span>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--gray-900)]">Database</p>
                  <p className="text-xs text-[var(--gray-500)]">Healthy connection</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-green-600">99.8%</span>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--gray-900)]">Video Services</p>
                  <p className="text-xs text-[var(--gray-500)]">High load detected</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-yellow-600">98.5%</span>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--gray-900)]">Storage</p>
                  <p className="text-xs text-[var(--gray-500)]">42% capacity used</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-green-600">OK</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <h2 className="text-xl font-bold text-[var(--gray-900)]">Recent Activity</h2>
          <p className="mb-4 text-sm text-[var(--gray-500)]">Latest platform events</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-crimson-soft">
                <Building2 className="h-3 w-3 text-crimson" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--gray-900)]">
                  New institution registered
                </p>
                <p className="text-xs text-[var(--gray-500)]">St. Mary's High School · 2 min ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <CreditCard className="h-3 w-3 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--gray-900)]">Plan upgrade completed</p>
                <p className="text-xs text-[var(--gray-500)]">
                  Klassruum Demo Academy · 15 min ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-3 w-3 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--gray-900)]">Bulk user import</p>
                <p className="text-xs text-[var(--gray-500)]">
                  1,247 students imported · 1 hour ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-3 w-3 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--gray-900)]">Payment failed</p>
                <p className="text-xs text-[var(--gray-500)]">
                  Nairobi International School · 3 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="dashboard-card">
          <h2 className="text-xl font-bold text-[var(--gray-900)]">Support Tickets</h2>
          <p className="mb-4 text-sm text-[var(--gray-500)]">Active support requests</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-3 w-3 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--gray-900)]">
                    Critical: Video lagging
                  </p>
                  <span className="text-xs font-medium text-red-600">High</span>
                </div>
                <p className="text-xs text-[var(--gray-500)]">Technical Issue · 45 min ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--gray-900)]">Feature request</p>
                  <span className="text-xs font-medium text-yellow-600">Medium</span>
                </div>
                <p className="text-xs text-[var(--gray-500)]">Enhancement · 2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[var(--gray-100)] bg-[var(--gray-50)] p-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-crimson-soft">
                <AlertTriangle className="h-3 w-3 text-crimson" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--gray-900)]">Billing inquiry</p>
                  <span className="text-xs font-medium text-crimson">Low</span>
                </div>
                <p className="text-xs text-[var(--gray-500)]">Question · 5 hours ago</p>
              </div>
            </div>
          </div>

          <Link
            to="/admin/support"
            className="mt-4 block w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-2 text-center text-sm font-medium text-[var(--primary)] hover:bg-[var(--gray-50)]"
          >
            View All Tickets
          </Link>
        </div>

        {/* Usage Overview */}
        <div className="dashboard-card">
          <h2 className="text-xl font-bold text-[var(--gray-900)]">Usage Overview</h2>
          <p className="mb-4 text-sm text-[var(--gray-500)]">Platform resource consumption</p>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--gray-900)]">Storage Usage</span>
                <span className="text-xs text-[var(--gray-500)]">42% of 2TB</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--gray-200)]">
                <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--gray-900)]">Video Bandwidth</span>
                <span className="text-xs text-[var(--gray-500)]">78% of 10TB</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--gray-200)]">
                <div className="h-2 rounded-full bg-[var(--warning)]" style={{ width: "78%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--gray-900)]">API Calls</span>
                <span className="text-xs text-[var(--gray-500)]">65% of limit</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--gray-200)]">
                <div className="h-2 rounded-full bg-[var(--success)]" style={{ width: "65%" }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--gray-900)]">Active Sessions</span>
                <span className="text-xs text-[var(--gray-500)]">1,847 concurrent</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--gray-200)]">
                <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: "37%" }} />
              </div>
            </div>
          </div>

          <Link
            to="/admin/usage"
            className="mt-4 block w-full rounded-lg border border-[var(--gray-200)] bg-white px-4 py-2 text-center text-sm font-medium text-[var(--primary)] hover:bg-[var(--gray-50)]"
          >
            View Detailed Usage
          </Link>
        </div>
      </section>

      {/* Primary Actions */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/institutions"
          className="flex items-center gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-4 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--gray-900)]">Manage Institutions</p>
            <p className="text-xs text-[var(--gray-500)]">View and edit organizations</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--gray-400)]" />
        </Link>

        <Link
          to="/admin/users"
          className="flex items-center gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-4 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--gray-900)]">View Users</p>
            <p className="text-xs text-[var(--gray-500)]">Manage platform users</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--gray-400)]" />
        </Link>

        <Link
          to="/admin/plans"
          className="flex items-center gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-4 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--gray-900)]">Manage Plans</p>
            <p className="text-xs text-[var(--gray-500)]">Subscription tiers</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--gray-400)]" />
        </Link>

        <Link
          to="/admin/health"
          className="flex items-center gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-4 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--gray-900)]">System Health</p>
            <p className="text-xs text-[var(--gray-500)]">Monitor performance</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--gray-400)]" />
        </Link>
      </section>
    </DashboardShell>
  );
}
