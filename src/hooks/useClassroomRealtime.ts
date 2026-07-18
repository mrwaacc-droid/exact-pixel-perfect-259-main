/**
 * useClassroomRealtime.ts
 *
 * Supabase Realtime hook that syncs live classroom events across all connected
 * participants: chat messages, participant join/leave, hand raises, and
 * shared board state. Works for both teacher-led and AI-led group sessions.
 *
 * Falls back to polling (query refetch) when Supabase is not configured
 * so the demo mode keeps working.
 *
 * The realtime channel is ref-counted via a module-level registry so that:
 *   - multiple components subscribing to the same session share one channel
 *   - React StrictMode double-mounts cannot race the async `removeChannel`
 *     cleanup (the original cause of
 *     "cannot add postgres_changes callbacks ... after subscribe()")
 *   - postgres_changes listeners are ALWAYS attached before `.subscribe()`
 */

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ClassroomRealtimeEvent =
  | "chat_message"
  | "participant_joined"
  | "participant_left"
  | "hand_raised"
  | "board_update"
  | "session_status_changed";

export interface RealtimeCallbacks {
  /** Fires when a new chat message arrives. */
  onChatMessage?: (msg: {
    id: string;
    session_id: string;
    user_id: string | null;
    sender: string;
    message: string;
    message_type: string;
    created_at: string;
  }) => void;
  /** Fires when a participant joins or leaves. */
  onParticipantChange?: (p: {
    id: string;
    session_id: string;
    user_id: string;
    role: string;
    status: string;
  }) => void;
  /** Fires when shared board state updates. */
  onBoardUpdate?: (board: {
    id: string;
    session_id: string;
    board_items: any[];
    current_index: number;
    section_key?: string | null;
    teacher_note?: string | null;
    updated_by: string;
    updated_at: string;
  }) => void;
  /** Fires when session status changes (e.g. scheduled → live → completed). */
  onSessionStatusChange?: (session: {
    id: string;
    status: string;
  }) => void;
}

// ---------------------------------------------------------------------------
// Module-level session registry
// ---------------------------------------------------------------------------

type ChannelHandle = ReturnType<typeof supabase.channel>;

type RegistryEntry = {
  channel: ChannelHandle;
  refCount: number;
  pendingUnsubscribe: boolean;
  /**
   * Set of callback-handle ids. Each hook instance registers one. When the
   * underlying channel fires, we look up the latest callbacks via a module
   * map keyed by handle id.
   */
  handleIds: Set<number>;
};

type HandleRecord = {
  sessionId: string;
  callbacks: RealtimeCallbacks;
  queryClient: ReturnType<typeof useQueryClient>;
};

const channelRegistry = new Map<string, RegistryEntry>();
const handleRecords = new Map<number, HandleRecord>();
let nextHandleId = 1;

function fanOutToHandles(
  entry: RegistryEntry,
  eventName: keyof RealtimeCallbacks,
  payload: unknown,
) {
  for (const id of entry.handleIds) {
    const rec = handleRecords.get(id);
    if (!rec) continue;
    const cb = rec.callbacks[eventName] as ((p: any) => void) | undefined;
    if (cb) {
      try {
        cb(payload as any);
      } catch (err) {
        console.warn(`[classroom-realtime] ${eventName} listener threw:`, err);
      }
    }
  }
}

function invalidateForAll(entry: RegistryEntry, queryKey: unknown[]) {
  for (const id of entry.handleIds) {
    const rec = handleRecords.get(id);
    if (rec) {
      try {
        rec.queryClient.invalidateQueries({ queryKey: queryKey as any });
      } catch (err) {
        console.warn("[classroom-realtime] invalidate threw:", err);
      }
    }
  }
}

function acquireChannel(sessionId: string, queryClient: ReturnType<typeof useQueryClient>, handleId: number): RegistryEntry {
  const existing = channelRegistry.get(sessionId);
  if (existing) {
    existing.refCount += 1;
    existing.handleIds.add(handleId);
    // Make sure this handle has a current record so fan-out can find it.
    handleRecords.set(handleId, {
      sessionId,
      callbacks: handleRecords.get(handleId)?.callbacks ?? {},
      queryClient,
    });
    return existing;
  }

  const handleIds = new Set<number>([handleId]);
  const entry: RegistryEntry = {
    channel: undefined as unknown as ChannelHandle,
    refCount: 1,
    pendingUnsubscribe: false,
    handleIds,
  };

  // CRITICAL: register every `postgres_changes` listener BEFORE `.subscribe()`.
  // Doing it after subscribe() throws "cannot add postgres_changes callbacks
  // ... after subscribe()" from the Supabase realtime client.
  const channel = supabase
    .channel(`classroom:${sessionId}`)
    // ---- chat_messages INSERT ----
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload: { new: Record<string, any> }) => {
        const msg = payload.new as any;
        fanOutToHandles(entry, "onChatMessage", msg);
        invalidateForAll(entry, ["classroom-context", sessionId]);
      },
    )
    // ---- session_participants INSERT / UPDATE ----
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "session_participants",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload: { new: Record<string, any> }) => {
        const row = payload.new as any;
        fanOutToHandles(entry, "onParticipantChange", row);
        invalidateForAll(entry, ["classroom-context", sessionId]);
      },
    )
    // ---- session_board_state UPSERT (shared whiteboard) ----
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "session_board_state",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload: { new: Record<string, any> }) => {
        const row = payload.new as any;
        if (row) fanOutToHandles(entry, "onBoardUpdate", row);
      },
    )
    // ---- classroom_sessions UPDATE (status changes) ----
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "classroom_sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload: { new: Record<string, any> }) => {
        const row = payload.new as any;
        fanOutToHandles(entry, "onSessionStatusChange", {
          id: row.id,
          status: row.status,
        });
        invalidateForAll(entry, ["classroom-context", sessionId]);
      },
    )
    .subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        /* ready */
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        if (!entry.pendingUnsubscribe) {
          console.warn(`[classroom-realtime] channel ${String(status).toLowerCase()}`);
        }
      }
    });

  entry.channel = channel;
  channelRegistry.set(sessionId, entry);
  return entry;
}

function releaseChannel(sessionId: string, handleId: number) {
  const entry = channelRegistry.get(sessionId);
  if (!entry) return;
  entry.refCount -= 1;
  entry.handleIds.delete(handleId);
  handleRecords.delete(handleId);
  if (entry.refCount > 0) return;
  entry.pendingUnsubscribe = true;
  try {
    const result = supabase.removeChannel(entry.channel);
    if (result && typeof (result as Promise<unknown>).catch === "function") {
      (result as Promise<unknown>).catch(() => { /* already gone */ });
    }
  } catch (err) {
    console.warn("[classroom-realtime] removeChannel failed:", err);
  } finally {
    channelRegistry.delete(sessionId);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Subscribe to Realtime changes for a classroom session.
 *
 * Usage:
 * ```tsx
 * useClassroomRealtime(sessionId, {
 *   onChatMessage: (msg) => setMessages(prev => [...prev, msg]),
 *   onParticipantChange: () => queryClient.invalidateQueries(["participants", sessionId]),
 *   onBoardUpdate: (board) => setBoardState(board),
 *   onSessionStatusChange: (s) => { if (s.status === "completed") navigateAway(); },
 * });
 * ```
 */
export function useClassroomRealtime(
  sessionId: string | undefined,
  callbacks: RealtimeCallbacks = {},
) {
  const queryClient = useQueryClient();

  // Stable per-hook handle id so each useClassroomRealtime instance gets its
  // own slot in the registry. This survives StrictMode double-mounts because
  // refs are preserved across the double-invocation.
  const handleIdRef = useRef<number>(-1);
  if (handleIdRef.current === -1) {
    handleIdRef.current = nextHandleId++;
  }
  const handleId = handleIdRef.current;

  // Track active channel so we can broadcast cursor/highlight via Presence.
  const channelRef = useRef<ChannelHandle | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Keep the registry's view of our callbacks fresh without resubscribing.
  useEffect(() => {
    if (handleId === -1) return;
    const rec = handleRecords.get(handleId);
    if (rec) rec.callbacks = callbacks;
  });

  useEffect(() => {
    if (!sessionId || !isSupabaseConfigured()) return;

    // Make sure our handle record is initialised before we attach.
    handleRecords.set(handleId, {
      sessionId,
      callbacks: callbacksRef.current,
      queryClient,
    });

    const entry = acquireChannel(sessionId, queryClient, handleId);
    channelRef.current = entry.channel;

    return () => {
      channelRef.current = null;
      releaseChannel(sessionId, handleId);
    };
  }, [sessionId, queryClient, handleId]);

  // Broadcast cursor/highlight via Presence (non-critical, best-effort)
  const broadcastPresence = useCallback(
    (data: { userId: string; role: string; boardIndex?: number }) => {
      if (!sessionId || !isSupabaseConfigured() || !channelRef.current) return;
      channelRef.current.send({
        type: "broadcast",
        event: "cursor",
        payload: data,
      });
    },
    [sessionId],
  );

  return { broadcastPresence };
}

// ---------------------------------------------------------------------------
// Polling fallback for demo mode
// ---------------------------------------------------------------------------

/**
 * When Supabase is not configured, poll the query cache to simulate updates.
 * Call this at the top of any classroom page that uses useClassroomRealtime.
 */
export function useClassroomPolling(
  sessionId: string | undefined,
  intervalMs = 8000,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId || isSupabaseConfigured()) return;

    const timer = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["classroom-context", sessionId] });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [sessionId, intervalMs, queryClient]);
}
