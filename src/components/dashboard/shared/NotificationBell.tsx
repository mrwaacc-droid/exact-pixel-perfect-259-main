import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type DashboardConfig, isLearnerDashboardRole, isTeacherDashboardRole } from "@/lib/dashboard-config";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationRecord } from "@/lib/notifications.functions";

type Props = {
  config: DashboardConfig;
};

export function notificationCenterHref(config: DashboardConfig): string | null {
  if (config.role === "platform_admin") return "/admin/notifications";
  if (config.role === "institution") return "/institution/notifications";
  if (config.role === "parent") return "/parent/notifications";
  if (isTeacherDashboardRole(config.role)) return "/teacher/notifications";
  if (isLearnerDashboardRole(config.role)) return "/student/notifications";
  return "/student/notifications";
}

function timeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

function NotificationItem({
  item,
  onOpen,
}: {
  item: NotificationRecord;
  onOpen: (item: NotificationRecord) => void;
}) {
  const content = (
    <>
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? "bg-gray-300" : "bg-success"}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold leading-snug text-heading">{item.title}</p>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {timeAgo(item.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
        </div>
      </div>
    </>
  );

  if (item.targetUrl) {
    return (
      <Link
        to={item.targetUrl as any}
        onClick={() => onOpen(item)}
        className="block rounded-lg border border-border bg-white p-3 text-left transition hover:border-heading/20 hover:bg-accent"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="block w-full rounded-lg border border-border bg-white p-3 text-left transition hover:border-heading/20 hover:bg-accent"
    >
      {content}
    </button>
  );
}

export function NotificationBell({ config }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markRead,
    markAllRead,
    isMarkingRead,
  } = useNotifications();
  const href = notificationCenterHref(config);
  const showNotificationCenter = href !== null;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const visible = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-white shadow-xl"
          role="menu"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <p className="text-sm font-bold text-heading">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0 || isMarkingRead}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Read all
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading notifications
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-600">
                Notifications could not be loaded. Try again in a moment.
              </div>
            ) : visible.length === 0 ? (
              <div className="grid place-items-center gap-2 p-8 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-heading">No notifications yet</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Lesson updates, quiz results, and reminders will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visible.map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    onOpen={(notification) => {
                      if (!notification.readAt) markRead(notification.id);
                      if (notification.targetUrl) setOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {showNotificationCenter && (
            <div className="border-t border-border p-2">
              <Link
                to={href as any}
                onClick={() => setOpen(false)}
                className="flex min-h-10 items-center justify-center rounded-lg text-sm font-bold text-heading transition hover:bg-accent"
              >
                Open notification center
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
