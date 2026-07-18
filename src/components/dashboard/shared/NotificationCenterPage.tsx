import { Link, useLocation } from "@tanstack/react-router";
import { Bell, CheckCheck, Inbox, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationRecord } from "@/lib/notifications.functions";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function NotificationRow({
  item,
  onRead,
}: {
  item: NotificationRecord;
  onRead: (id: string) => void;
}) {
  const row = (
    <div className="flex min-w-0 gap-4">
      <div
        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] ${item.readAt
            ? "bg-[var(--surface-soft)] text-[var(--muted)]"
            : "bg-[var(--crimson-soft)] text-[var(--crimson)]"
          }`}
      >
        <Bell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-bold leading-snug text-[var(--ink)]">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {formatDate(item.createdAt)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--border)] bg-[var(--page-background)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
            {item.type.replace(/_/g, " ")}
          </span>
          {!item.readAt && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onRead(item.id);
              }}
              className="rounded-full border border-[var(--crimson-soft)] bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--crimson-dark)] transition hover:bg-[var(--crimson-soft)]"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const className = `block rounded-[var(--radius-md)] border p-4 text-left transition ${item.readAt
      ? "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
      : "border-[var(--crimson-soft)] bg-[var(--crimson-soft)]/30 hover:border-[var(--crimson)]"
    }`;

  if (item.targetUrl) {
    return (
      <Link to={item.targetUrl as any} className={className} onClick={() => onRead(item.id)}>
        {row}
      </Link>
    );
  }

  return <article className={className}>{row}</article>;
}

export function NotificationCenterPage() {
  const config = useDashboardConfig();
  const location = useLocation();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markRead,
    markAllRead,
    refetch,
    isMarkingRead,
  } = useNotifications();

  return (
    <DashboardShell config={config} activePath={location.pathname} title="Notifications">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--crimson)]">
                Notification Center
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--ink)]">
                Updates for your workspace
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Lesson alerts, quiz feedback, session updates, and system notices.
                {unreadCount > 0 ? ` (${unreadCount} unread)` : null}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0 || isMarkingRead}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--crimson-soft)] bg-white px-4 text-sm font-bold text-[var(--crimson-dark)] transition hover:bg-[var(--crimson-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-[var(--muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading notifications
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--error)]/20 bg-[var(--error-light)] p-5 text-sm text-[var(--error)]">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Notifications could not be loaded.</p>
              <p className="mt-1 text-[13px] text-[var(--error)]/80">
                Please try again in a moment. If the problem continues, contact support.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch?.()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--error)]/30 bg-white px-3 py-1 text-[12px] font-semibold text-[var(--error)] hover:bg-[var(--error)]/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[var(--beige-soft)] text-[var(--muted)]">
                <Inbox className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[var(--ink)]">No notifications yet</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted)]">
                Automated updates will appear here when lessons are published, sessions finish,
                quizzes are graded, or your account needs attention.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <NotificationRow key={item.id} item={item} onRead={markRead} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
