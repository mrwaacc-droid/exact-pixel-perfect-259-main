import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import {
  parentLearners,
  parentMessages,
  parentReports,
  parentSessions,
} from "./parent-portal-data";

type ParentSection = "learners" | "progress" | "sessions" | "reports" | "messages" | "settings";

const config = dashboardConfigs.parent;

const sectionMeta: Record<
  ParentSection,
  {
    path: string;
    label: string;
    title: string;
    subtitle: string;
    icon: typeof Users;
  }
> = {
  learners: {
    path: "/parent/learners",
    label: "Family profiles",
    title: "Linked Learners",
    subtitle: "See every learner connected to your account and open their progress evidence.",
    icon: Users,
  },
  progress: {
    path: "/parent/progress",
    label: "Progress evidence",
    title: "Learner Progress",
    subtitle: "Track course progress, quiz averages, support needs, and recent learning activity.",
    icon: BarChart3,
  },
  sessions: {
    path: "/parent/sessions",
    label: "Classroom schedule",
    title: "Sessions",
    subtitle: "Review upcoming and completed classroom sessions for each linked learner.",
    icon: Calendar,
  },
  reports: {
    path: "/parent/reports",
    label: "Reports",
    title: "Learning Reports",
    subtitle: "Read progress summaries and evidence generated from classroom activity.",
    icon: FileText,
  },
  messages: {
    path: "/parent/messages",
    label: "Communication",
    title: "Messages",
    subtitle: "Read teacher feedback and support updates for your learners.",
    icon: MessageSquare,
  },
  settings: {
    path: "/parent/settings",
    label: "Preferences",
    title: "Parent Settings",
    subtitle: "Manage linked learners, notification preferences, and communication settings.",
    icon: Settings,
  },
};

function LearnerRows({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {parentLearners.map((learner) => (
        <article key={learner.id} className="dashboard-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-heading">{learner.name}</h2>
              <p className="mt-1 text-sm text-muted">{learner.level} - {learner.institution}</p>
            </div>
            <StatusBadge variant="info">{`${learner.progress}%`}</StatusBadge>
          </div>
          <p className="mt-4 text-sm font-bold text-heading">{learner.activeCourse}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-crimson-soft">
            <div className="h-full rounded-full bg-crimson" style={{ width: `${learner.progress}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Quiz avg</p>
              <p className="mt-1 text-lg font-extrabold text-heading">{learner.quizAverage}%</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Study time</p>
              <p className="mt-1 text-lg font-extrabold text-heading">{learner.studyTime}</p>
            </div>
          </div>
          {!compact && (
            <div className="mt-4 rounded-xl border border-border bg-page-background p-3 text-sm">
              <p>
                <span className="font-bold text-heading">Support focus: </span>
                <span className="text-muted">{learner.supportNeed}</span>
              </p>
              <p className="mt-2">
                <span className="font-bold text-heading">Next session: </span>
                <span className="text-muted">{learner.nextSession}</span>
              </p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function SessionRows() {
  return (
    <div className="space-y-4">
      {parentSessions.map((session) => (
        <article key={session.id} className="dashboard-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-heading">{session.title}</h2>
                <StatusBadge variant={session.status === "completed" ? "success" : "info"}>
                  {session.status.replace(/_/g, " ")}
                </StatusBadge>
              </div>
              <p className="mt-1 text-sm text-muted">{session.course}</p>
              <p className="mt-2 text-sm text-muted">{session.learner} - {session.time}</p>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted">{session.evidence}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReportRows() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {parentReports.map((report) => (
        <article key={report.id} className="dashboard-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-crimson">{report.period}</p>
          <h2 className="mt-2 text-lg font-extrabold text-heading">{report.title}</h2>
          <p className="mt-1 text-sm font-semibold text-muted">{report.learner}</p>
          <p className="mt-4 text-sm leading-6 text-muted">{report.summary}</p>
        </article>
      ))}
    </div>
  );
}

function MessageRows() {
  return (
    <div className="space-y-4">
      {parentMessages.map((message) => (
        <article key={message.id} className="dashboard-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-heading">{message.subject}</h2>
              <p className="mt-1 text-sm text-muted">{message.from} - {message.learner}</p>
            </div>
            {message.unread ? <StatusBadge variant="warning">Unread</StatusBadge> : <StatusBadge variant="success">Read</StatusBadge>}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">{message.preview}</p>
          <p className="mt-3 text-xs font-bold text-muted">{message.time}</p>
        </article>
      ))}
    </div>
  );
}

function SettingsRows() {
  const settings = [
    {
      icon: Users,
      title: "Linked learners",
      description: "Request or manage learner links and guardian access.",
      href: "/parent/learners",
    },
    {
      icon: Bell,
      title: "Notification preferences",
      description: "Choose progress, session, quiz, and teacher-message alerts.",
      href: "/parent/notifications",
    },
    {
      icon: MessageSquare,
      title: "Communication",
      description: "Manage teacher contact preferences and weekly summaries.",
      href: "/parent/messages",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {settings.map((item) => (
        <Link key={item.title} to={item.href} className="dashboard-card group p-5">
          <item.icon className="h-5 w-5 text-crimson" />
          <h2 className="mt-4 text-lg font-extrabold text-heading">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-crimson">
            Open
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ParentSectionPage({ section }: { section: ParentSection }) {
  const meta = sectionMeta[section];
  const Icon = meta.icon;

  return (
    <DashboardShell config={config} activePath={meta.path} title={meta.title}>
      <PageHeader
        label={meta.label}
        title={meta.title}
        subtitle={meta.subtitle}
        action={
          <Link to="/parent/dashboard" className="kr-command-button">
            Parent dashboard
          </Link>
        }
      />

      <section className="mb-6 rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-crimson-soft text-crimson">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-heading">Connected parent workflow</p>
            <p className="text-sm text-muted">
              This page is wired into the parent portal and shares the same learner evidence model.
            </p>
          </div>
        </div>
      </section>

      {section === "learners" && <LearnerRows />}
      {section === "progress" && <LearnerRows />}
      {section === "sessions" && <SessionRows />}
      {section === "reports" && <ReportRows />}
      {section === "messages" && <MessageRows />}
      {section === "settings" && <SettingsRows />}
    </DashboardShell>
  );
}
