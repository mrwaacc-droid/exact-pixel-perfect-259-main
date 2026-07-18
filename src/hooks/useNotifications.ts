import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuthContext } from "@/hooks/useUserRole";
import {
  ensureAutomatedNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRecord,
} from "@/lib/notifications.functions";

export type NotificationsResult = {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  refetch: () => void;
  isMarkingRead: boolean;
};

type NotificationsQueryData = {
  notifications: NotificationRecord[];
  unreadCount: number;
};

// ---------------------------------------------------------------------------
// Module-level channel registry
// ---------------------------------------------------------------------------
// We keep a single Supabase realtime channel per user id across the entire app
// so that multiple <NotificationBell/> instances, StrictMode double-mounts, and
// route transitions all share the same subscription. A naive `supabase.channel(
// `notifications:${user.id}`)` on every effect run races with the *async*
// `removeChannel` cleanup: the realtime client can hand back the still-subscribed
// previous channel object, and any subsequent `.on("postgres_changes", ...)`
// throws `cannot add postgres_changes callbacks ... after subscribe()`.
//
// By centralising the channel here we guarantee:
//   1. At most one channel per user at any time.
//   2. Postgres-changes listeners are attached *before* `subscribe()`.
//   3. Cleanup is idempotent — repeated `unsubscribe()` calls are safe.
//   4. Demo users (and un-configured Supabase) never touch the realtime API.

type ChannelHandle = ReturnType<typeof supabase.channel>;

type RegistryEntry = {
  channel: ChannelHandle;
  refCount: number;
  listeners: Set<(payload: unknown) => void>;
  subscribed: boolean;
  pendingUnsubscribe: boolean;
};

const channelRegistry = new Map<string, RegistryEntry>();

function detachFromRegistry(userId: string, entry: RegistryEntry) {
  entry.refCount -= 1;
  if (entry.refCount > 0) return;
  entry.pendingUnsubscribe = true;
  try {
    const result = supabase.removeChannel(entry.channel);
    // removeChannel returns a promise in newer SDKs; we don't need to await it
    // because we only care about decrementing our local ref-count synchronously.
    if (result && typeof (result as Promise<unknown>).catch === "function") {
      (result as Promise<unknown>).catch(() => {
        /* swallow — channel is already gone in error cases */
      });
    }
  } catch (err) {
    // Defensive: never let a Supabase cleanup error bubble up and break the app.
    console.warn("[notifications] removeChannel failed:", err);
  } finally {
    channelRegistry.delete(userId);
  }
}

function attachToRegistry(
  userId: string,
  onChange: (payload: unknown) => void,
): RegistryEntry {
  const existing = channelRegistry.get(userId);
  if (existing) {
    existing.refCount += 1;
    existing.listeners.add(onChange);
    return existing;
  }

  const listeners = new Set<(payload: unknown) => void>();
  listeners.add(onChange);

  const entry: RegistryEntry = {
    // Placeholder — replaced immediately after creation.
    channel: undefined as unknown as ChannelHandle,
    refCount: 1,
    listeners,
    subscribed: false,
    pendingUnsubscribe: false,
  };

  // IMPORTANT: register the .on("postgres_changes", ...) listener BEFORE
  // calling .subscribe(). Doing it the other way around is exactly the bug
  // we are fixing — Supabase throws "cannot add postgres_changes callbacks
  // ... after subscribe()".
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload: unknown) => {
        // Fan out to every active hook instance.
        for (const listener of listeners) {
          try {
            listener(payload);
          } catch (err) {
            console.warn("[notifications] listener threw:", err);
          }
        }
      },
    )
    .subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        entry.subscribed = true;
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        entry.subscribed = false;
        if (!entry.pendingUnsubscribe) {
          console.warn(`[notifications] channel ${String(status).toLowerCase()}`);
        }
      }
    });

  entry.channel = channel;
  channelRegistry.set(userId, entry);
  return entry;
}

export function useNotifications(): NotificationsResult {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const listFn = useServerFn(listNotifications);
  const ensureFn = useServerFn(ensureAutomatedNotifications);
  const markReadFn = useServerFn(markNotificationRead);
  const markAllFn = useServerFn(markAllNotificationsRead);

  const queryKey = useMemo(() => ["notifications", user?.id ?? "demo"], [user?.id]);
  const shouldRefetchAfterMutation = Boolean(user?.id && !user.id.startsWith("demo-"));

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      await ensureFn();
      return listFn();
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  // Keep our local invalidator in a ref so the listener we hand to the
  // registry always sees the current queryKey without re-subscribing.
  const invalidateRef = useRef<() => void>(() => { });
  useEffect(() => {
    invalidateRef.current = () => {
      queryClient.invalidateQueries({ queryKey });
    };
  }, [queryClient, queryKey]);

  // Stable refetch handle — used by the notification center's "Retry" action
  // when the query errors out. Pulled from the underlying react-query refetch
  // so we always go through the same cache and staleness rules.
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId || userId.startsWith("demo-")) return;
    if (!isSupabaseConfigured()) return;

    const onChange = () => {
      try {
        invalidateRef.current();
      } catch (err) {
        console.warn("[notifications] invalidate failed:", err);
      }
    };

    const entry = attachToRegistry(userId, onChange);

    return () => {
      entry.listeners.delete(onChange);
      detachFromRegistry(userId, entry);
    };
  }, [user?.id]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markReadFn({ data: { notification_id: notificationId } }),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationsQueryData>(queryKey);
      const readAt = new Date().toISOString();

      queryClient.setQueryData<NotificationsQueryData>(queryKey, (current) => {
        if (!current) return current;
        const notifications = current.notifications.map((notification) =>
          notification.id === notificationId && !notification.readAt
            ? { ...notification, readAt }
            : notification,
        );
        return {
          notifications,
          unreadCount: notifications.filter((notification) => !notification.readAt).length,
        };
      });

      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      if (shouldRefetchAfterMutation) queryClient.invalidateQueries({ queryKey });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllFn(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationsQueryData>(queryKey);
      const readAt = new Date().toISOString();

      queryClient.setQueryData<NotificationsQueryData>(queryKey, (current) => {
        if (!current) return current;
        return {
          notifications: current.notifications.map((notification) => ({
            ...notification,
            readAt: notification.readAt ?? readAt,
          })),
          unreadCount: 0,
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      if (shouldRefetchAfterMutation) queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    markRead: (notificationId: string) => markReadMutation.mutate(notificationId),
    markAllRead: () => markAllMutation.mutate(),
    refetch,
    isMarkingRead: markReadMutation.isPending || markAllMutation.isPending,
  };
}
