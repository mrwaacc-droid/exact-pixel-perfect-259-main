import { Link, useLocation } from "@tanstack/react-router";
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react";
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
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          item.readAt ? "bg-gray-100 text-gray-500" : "bg-crimson-soft text-crimson"
        }`}
      >
        <Bell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-bold leading-snug text-heading">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
            {formatDate(item.createdAt)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-bold capitalize text-[#3D3233]">
            {item.type.replace(/_/g, " ")}
          </span>
          {!item.readAt && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onRead(item.id);
              }}
              className="rounded-lg border border-[var(--crimson-soft)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--crimson-dark)] transition hover:bg-[var(--crimson-soft)]"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const className = `block rounded-xl border p-4 text-left transition ${
    item.readAt
      ? "border-[var(--border)] bg-white hover:border-[#D8CCC6]"
      : "border-[var(--crimson-soft)] bg-[#F8FFFF] hover:border-[var(--crimson)]"
  }`;

  if (item.targetUrl) {
    return (
      <Link to={item.targetUrl as any} className={className} onClick={() => onRead(item.id)}>
        {row}
      </Link>
    );
  }

  return (
    <article className={className}>
      {row}
    </article>
  );
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
    isMarkingRead,
  } = useNotifications();

  return (
    <DashboardShell config={config} activePath={location.pathname} title="Notifications">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-xl border border-[var(--border)] bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--crimson)]">
                Notification Center
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#191314]">
                Updates for your workspace
              </h1>
              <p className="mt-1 text-sm text-[#8A7478]">
                Lesson alerts, quiz feedback, session updates, and system notices.
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0 || isMarkingRead}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--crimson-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--crimson-dark)] transition hover:bg-[var(--crimson-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-white p-8 text-[#8A7478]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading notifications
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            Notifications could not be loaded. Please try again.
          </div>
        ) : notifications.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-xl border border-[var(--border)] bg-white p-8 text-center">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--beige-soft)] text-[#8A7478]">
                <Inbox className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#191314]">No notifications yet</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-[#8A7478]">
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
