import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { KpiCard } from "@/components/dashboard/shared/KpiCard";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import {
  parentLearners,
  parentMessages,
  parentReports,
  parentSessions,
} from "./parent-portal-data";

const config = dashboardConfigs.parent;

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function sessionVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "needs_review") return "warning" as const;
  return "info" as const;
}

export function ParentDashboard() {
  const averageProgress = average(parentLearners.map((learner) => learner.progress));
  const averageQuiz = average(parentLearners.map((learner) => learner.quizAverage));
  const upcomingCount = parentSessions.filter((session) => session.status === "upcoming").length;
  const unreadMessages = parentMessages.filter((message) => message.unread).length;

  return (
    <DashboardShell config={config} activePath="/parent/dashboard">
      <PageHeader
        label="Family learning view"
        title="Parent Dashboard"
        subtitle="Monitor linked learners, upcoming sessions, teacher feedback, and progress evidence from one calm workspace."
        action={
          <Link to="/parent/messages" className="kr-command-button kr-command-button--primary">
            Message teachers
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="kr-dashboard-kpi-grid mb-8">
        <KpiCard
          title="Linked learners"
          value={parentLearners.length}
          subtitle="Active family profiles"
          href="/parent/learners"
          icon={Users}
        />
        <KpiCard
          title="Average progress"
          value={`${averageProgress}%`}
          subtitle="Across active courses"
          href="/parent/progress"
          icon={TrendingUp}
          trend="+8%"
        />
        <KpiCard
          title="Quiz average"
          value={`${averageQuiz}%`}
          subtitle="Latest checkpoints"
          href="/parent/reports"
          icon={BarChart3}
        />
        <KpiCard
          title="Upcoming sessions"
          value={upcomingCount}
          subtitle="Next learning events"
          href="/parent/sessions"
          icon={Calendar}
        />
        <KpiCard
          title="Teacher updates"
          value={unreadMessages}
          subtitle="Unread messages"
          href="/parent/messages"
          icon={MessageSquare}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="dashboard-card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="kr-section-kicker">Learners</p>
                <h2 className="text-xl font-extrabold text-heading">Linked learner progress</h2>
              </div>
              <Link to="/parent/learners" className="text-sm font-bold text-crimson">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {parentLearners.map((learner) => (
                <Link
                  key={learner.id}
                  to="/parent/progress"
                  className="block rounded-2xl border border-border bg-white p-4 transition hover:border-crimson/30 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-heading">{learner.name}</h3>
                        <StatusBadge variant="info">{learner.level}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-muted">{learner.institution}</p>
                      <p className="mt-3 text-sm font-semibold text-heading">
                        {learner.activeCourse}
                      </p>
                      <p className="mt-1 text-sm text-muted">{learner.lastActivity}</p>
                    </div>

                    <div className="min-w-[220px]">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted">
                        <span>Progress</span>
                        <span>{learner.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-crimson-soft">
                        <div
                          className="h-full rounded-full bg-crimson"
                          style={{ width: `${learner.progress}%` }}
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <span className="rounded-xl border border-border bg-page-background p-2">
                          Quiz avg: <strong>{learner.quizAverage}%</strong>
                        </span>
                        <span className="rounded-xl border border-border bg-page-background p-2">
                          Streak: <strong>{learner.streak} days</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-page-background p-3 text-sm">
                    <span className="font-bold text-heading">Support focus: </span>
                    <span className="text-muted">{learner.supportNeed}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="kr-section-kicker">Evidence</p>
                <h2 className="text-xl font-extrabold text-heading">Recent reports</h2>
              </div>
              <Link to="/parent/reports" className="text-sm font-bold text-crimson">
                Open reports
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {parentReports.map((report) => (
                <Link
                  key={report.id}
                  to={report.href}
                  className="rounded-2xl border border-border bg-white p-4 transition hover:border-crimson/30"
                >
                  <FileText className="h-5 w-5 text-crimson" />
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    {report.learner} - {report.period}
                  </p>
                  <h3 className="mt-1 text-base font-extrabold text-heading">{report.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{report.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="dashboard-card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="kr-section-kicker">Schedule</p>
                <h2 className="text-xl font-extrabold text-heading">Learning sessions</h2>
              </div>
              <Link to="/parent/sessions" className="text-sm font-bold text-crimson">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {parentSessions.map((session) => (
                <Link
                  key={session.id}
                  to="/parent/sessions"
                  className="block rounded-2xl border border-border bg-white p-4 transition hover:border-crimson/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-heading">{session.title}</h3>
                      <p className="mt-1 text-xs text-muted">{session.learner}</p>
                    </div>
                    <StatusBadge variant={sessionVariant(session.status)}>
                      {session.status.replace(/_/g, " ")}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm text-muted">{session.course}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    {session.time}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted">{session.evidence}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="kr-section-kicker">Communication</p>
                <h2 className="text-xl font-extrabold text-heading">Teacher updates</h2>
              </div>
              <Link to="/parent/messages" className="text-sm font-bold text-crimson">
                Inbox
              </Link>
            </div>

            <div className="space-y-3">
              {parentMessages.map((message) => (
                <Link
                  key={message.id}
                  to="/parent/messages"
                  className="block rounded-2xl border border-border bg-white p-4 transition hover:border-crimson/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-heading">{message.subject}</h3>
                      <p className="mt-1 text-xs text-muted">
                        {message.from} - {message.learner}
                      </p>
                    </div>
                    {message.unread && <span className="h-2 w-2 rounded-full bg-crimson" />}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{message.preview}</p>
                  <p className="mt-2 text-xs font-bold text-muted">{message.time}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
