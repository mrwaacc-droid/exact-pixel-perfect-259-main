/**
 * AIBroadcastClassroom.tsx
 *
 * Group AI classroom: one AI teacher serves multiple learners simultaneously.
 *
 * HOST mode (teacher/institution admin):
 *   - Runs the full AI teaching engine (speech, whiteboard, questions)
 *   - Syncs board state to the database in real-time
 *   - Sees learner roster, questions, and can intervene
 *
 * LEARNER mode (student):
 *   - Subscribes to board state via Supabase Realtime
 *   - Sees the synced whiteboard and hears TTS narration locally
 *   - Can ask questions, raise hand, mark confidence
 *   - Each learner gets their own local TTS so pacing feels natural
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  Hand,
  Loader2,
  MessageSquare,
  Monitor,
  PlayCircle,
  Radio,
  Send,
  Users,
  Volume2,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeacherVoice } from "@/hooks/useTeacherVoice";
import {
  useClassroomRealtime,
  useClassroomPolling,
  type RealtimeCallbacks,
} from "@/hooks/useClassroomRealtime";
import { upsertBoardState, getBoardState } from "@/lib/classroom-board-sync.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  speak,
  stopSpeech,
} from "@/lib/speech";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BoardItem {
  id: string;
  text: string;
  type: "write" | "read" | "explain" | "highlight";
  sectionKey?: string;
}

interface BroadcastBoardState {
  board_items: BoardItem[];
  current_index: number;
  section_key: string | null;
  teacher_note: string | null;
  updated_at: string | null;
}

interface Props {
  sessionId: string;
  content: any; // ClassroomLessonContent
  classroomContext: any;
  mode: "host" | "learner";
  onLeave: () => void;
  onAskQuestion?: (message: string) => Promise<void>;
  onBroadcast?: (message: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIBroadcastClassroom({
  sessionId,
  content,
  classroomContext,
  mode,
  onLeave,
  onAskQuestion,
  onBroadcast,
}: Props) {
  const queryClient = useQueryClient();
  const lesson = content;
  const sequence = lesson?.sequence ?? [];
  const teacherName = lesson?.teacher?.name ?? "AI Teacher";
  const teacherVoice = lesson?.teacher?.voice ?? "female";

  // ---- Board state (shared) ----
  const [boardState, setBoardState] = useState<BroadcastBoardState>({
    board_items: [],
    current_index: 0,
    section_key: null,
    teacher_note: null,
    updated_at: null,
  });

  // ---- Local UI state ----
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState("");
  const [handRaised, setHandRaised] = useState(false);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [hostStepIndex, setHostStepIndex] = useState(0);

  // ---- Realtime sync ----
  const realtimeCallbacks: RealtimeCallbacks = useMemo(
    () => ({
      onBoardUpdate: (board) => {
        setBoardState({
          board_items: board.board_items ?? [],
          current_index: board.current_index ?? 0,
          section_key: board.section_key ?? null,
          teacher_note: board.teacher_note ?? null,
          updated_at: board.updated_at ?? null,
        });
      },
      onChatMessage: (msg) => {
        // Refresh context to pick up new messages
        queryClient.invalidateQueries({ queryKey: ["classroom-context", sessionId] });
      },
    }),
    [sessionId, queryClient],
  );

  useClassroomRealtime(sessionId, realtimeCallbacks);
  useClassroomPolling(sessionId);

  // ---- Load initial board state ----
  const getBoardFn = useServerFn(getBoardState);
  useEffect(() => {
    if (mode !== "learner") return;
    getBoardFn({ data: { session_id: sessionId } }).then((res) => {
      if (res.board) {
        setBoardState({
          board_items: res.board.board_items ?? [],
          current_index: res.board.current_index ?? 0,
          section_key: res.board.section_key ?? null,
          teacher_note: res.board.teacher_note ?? null,
          updated_at: res.board.updated_at ?? null,
        });
      }
    }).catch(() => {});
  }, [sessionId, mode]);

  // ---- Host: sync board state to database ----
  const upsertBoardFn = useServerFn(upsertBoardState);

  const syncBoardToDb = useCallback(
    (items: BoardItem[], index: number, sectionKey?: string, note?: string) => {
      if (mode !== "host") return;
      upsertBoardFn({
        data: {
          session_id: sessionId,
          board_items: items,
          current_index: index,
          section_key: sectionKey,
          teacher_note: note,
        },
      }).catch(() => {});
    },
    [sessionId, mode],
  );

  // ---- Host: advance to next step ----
  const advanceStep = useCallback(() => {
    if (mode !== "host") return;
    const nextIndex = Math.min(hostStepIndex + 1, sequence.length - 1);
    setHostStepIndex(nextIndex);

    const step = sequence[nextIndex];
    if (step) {
      const items: BoardItem[] = (step.boardItems ?? step.board_items ?? []).map(
        (item: any, i: number) => ({
          id: `${nextIndex}-${i}`,
          text: item.text ?? item.content ?? "",
          type: item.type ?? "write",
          sectionKey: step.key ?? step.sectionKey,
        }),
      );
      syncBoardToDb(items, nextIndex, step.key ?? step.sectionKey, step.note ?? step.teacherNote);
    }
  }, [mode, hostStepIndex, sequence, syncBoardToDb]);

  // ---- Learner: TTS for current board item ----
  useEffect(() => {
    if (mode !== "learner" || !isPlaying) return;
    const current = boardState.board_items[boardState.current_index];
    if (current?.text) {
      speak(
        current.text,
        undefined,
        undefined,
        teacherVoice === "male" ? "male" : "female",
      );
    }
  }, [mode, isPlaying, boardState.current_index, boardState.board_items, teacherVoice]);

  // ---- Host: auto-advance with speech ----
  useEffect(() => {
    if (mode !== "host" || !isPlaying) return;
    const step = sequence[hostStepIndex];
    if (!step) return;

    const items: BoardItem[] = (step.boardItems ?? step.board_items ?? []).map(
      (item: any, i: number) => ({
        id: `${hostStepIndex}-${i}`,
        text: item.text ?? item.content ?? "",
        type: item.type ?? "write",
        sectionKey: step.key ?? step.sectionKey,
      }),
    );

    // Sync the board state
    syncBoardToDb(items, 0, step.key ?? step.sectionKey, step.note ?? step.teacherNote);

    // Speak the step narration
    const narration = step.narration ?? step.speech ?? step.note ?? "";
    if (narration) {
      speak(
        narration,
        () => {
          // Auto-advance after speech completes
          setTimeout(() => {
            setHostStepIndex((prev) => Math.min(prev + 1, sequence.length - 1));
          }, 1500);
        },
        undefined,
        teacherVoice === "male" ? "male" : "female",
      );
    }
  }, [mode, isPlaying, hostStepIndex, sequence, teacherVoice, syncBoardToDb]);

  // ---- Participants ----
  const participants = classroomContext?.participants ?? [];
  const messages = classroomContext?.messages ?? [];
  const activeLearners = participants.filter((p: any) => p.status !== "left");
  const questions = messages.filter((m: any) => m.sender === "student");

  // ---- Confidence check ----
  const confidenceOptions = [
    { level: "confident", label: "I understand", color: "bg-green-100 text-green-700 border-green-200" },
    { level: "okay", label: "Getting there", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { level: "confused", label: "I'm confused", color: "bg-red-100 text-red-700 border-red-200" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FB]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#D9E7EE] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onLeave}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E7EE] bg-white text-[#365978] transition hover:bg-[#F8FBFD]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                {mode === "host" ? "Broadcasting" : "Live AI Classroom"}
              </p>
              <h1 className="truncate text-lg font-black text-[#132033]">
                {lesson?.title ?? "AI Group Lesson"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mode === "host" && (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF8F7] px-3 py-1.5 text-xs font-semibold text-[#7D2233]">
                <Radio className="h-3.5 w-3.5" />
                Broadcasting to {activeLearners.length} learner{activeLearners.length !== 1 ? "s" : ""}
              </div>
            )}
            <div className="rounded-full border border-[#D9E7EE] bg-[#F8FBFD] px-3 py-1.5 text-xs font-semibold text-[#476277]">
              <Users className="mr-1 inline h-3.5 w-3.5" />
              {activeLearners.length} in class
            </div>
            <Button variant="outline" className="border-[#D9E7EE] text-[#27465F]" onClick={onLeave}>
              {mode === "host" ? "End Class" : "Leave Class"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 xl:grid-cols-[1.5fr_.9fr] lg:px-6">
        {/* Left: Whiteboard / teaching area */}
        <section className="space-y-6">
          {/* Play controls */}
          {!isPlaying && (
            <div className="rounded-[28px] border border-[#D9E7EE] bg-white p-6 text-center shadow-[0_16px_60px_rgba(25, 19, 20,0.08)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF8F7]">
                <WandSparkles className="h-7 w-7 text-[#7D2233]" />
              </div>
              <h2 className="text-xl font-black text-[#132033]">
                {mode === "host" ? "Ready to teach" : "Waiting for the lesson to begin"}
              </h2>
              <p className="mt-2 text-sm text-[#61758A]">
                {mode === "host"
                  ? "Press start to begin the AI broadcast. The lesson will be delivered to all connected learners."
                  : "The teacher will start the lesson shortly. You'll see the whiteboard and hear the AI teacher automatically."}
              </p>
              {mode === "host" && (
                <Button
                  className="mt-5 bg-[#7D2233] hover:bg-[var(--crimson-dark)]"
                  onClick={() => setIsPlaying(true)}
                >
                  <PlayCircle className="mr-2 h-4 w-4" /> Start AI Broadcast
                </Button>
              )}
            </div>
          )}

          {/* Whiteboard area */}
          <div className="rounded-[28px] border border-[#D9E7EE] bg-white p-6 shadow-[0_16px_60px_rgba(25, 19, 20,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                  Shared Lesson Board
                </p>
                <h2 className="mt-2 text-xl font-black text-[#132033]">
                  {boardState.section_key
                    ? boardState.section_key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "Lesson Board"}
                </h2>
              </div>
              {isPlaying && mode === "host" && (
                <Button variant="outline" onClick={advanceStep}>
                  Next Step <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Board items */}
            <div className="min-h-[300px] rounded-[20px] border border-[#E2EBF2] bg-[#FAFCFE] p-6">
              {boardState.board_items.length === 0 ? (
                <div className="flex min-h-[250px] items-center justify-center text-center">
                  <div>
                    <Monitor className="mx-auto h-10 w-10 text-[#A89890]" />
                    <p className="mt-3 text-sm text-[#61758A]">
                      {isPlaying
                        ? "Board content will appear here as the lesson progresses."
                        : "Start the lesson to see content on the shared board."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {boardState.board_items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 text-sm leading-7 transition-all duration-500 ${
                        index === boardState.current_index
                          ? "border-[#7D2233]/30 bg-[#EAF8F7] text-[#132033]"
                          : index < boardState.current_index
                            ? "border-[#E2EBF2] bg-white text-[#52687C]"
                            : "border-transparent bg-transparent text-[#A89890]"
                      }`}
                    >
                      <span className="mr-2 text-[10px] font-bold uppercase text-[#7B8EA2]">
                        {item.type}
                      </span>
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher note */}
            {boardState.teacher_note && (
              <div className="mt-4 rounded-xl border border-[#7D2233]/20 bg-[#EAF8F7] p-4 text-sm text-[#132033]">
                <span className="text-xs font-bold uppercase text-[#7D2233]">Teacher note: </span>
                {boardState.teacher_note}
              </div>
            )}
          </div>

          {/* Confidence check (learner) */}
          {mode === "learner" && isPlaying && (
            <div className="rounded-[28px] border border-[#D9E7EE] bg-white p-6 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                How are you feeling?
              </p>
              <div className="flex flex-wrap gap-3">
                {confidenceOptions.map((opt) => (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => {
                      setConfidence(opt.level);
                      onAskQuestion?.(`Confidence: ${opt.label}`);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      confidence === opt.level
                        ? opt.color
                        : "border-[#DCE7EE] bg-[#F8FBFD] text-[#35546F] hover:border-[#7D2233]/35"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* Live captions */}
          <div className="rounded-[28px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
              <Eye className="h-4 w-4 text-[#7D2233]" /> Live Captions
            </div>
            <p className="mt-4 rounded-[22px] border border-[#E2EBF2] bg-[#F8FBFD] p-4 text-sm leading-7 text-[#29455D]">
              {boardState.board_items[boardState.current_index]?.text ??
                (isPlaying
                  ? `${teacherName} is explaining...`
                  : "Captions will appear here during the lesson.")}
            </p>
          </div>

          {/* Participant roster (host) / Question panel (learner) */}
          {mode === "host" ? (
            <div className="rounded-[28px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                    Learner Roster
                  </p>
                  <h2 className="mt-2 text-lg font-black text-[#132033]">
                    {activeLearners.length} Connected
                  </h2>
                </div>
                <Users className="h-5 w-5 text-[#7D2233]" />
              </div>
              <div className="mt-4 max-h-[300px] space-y-2 overflow-y-auto">
                {activeLearners.length === 0 ? (
                  <p className="text-sm text-[#61758A]">No learners yet. Share the session link.</p>
                ) : (
                  activeLearners.map((p: any, i: number) => (
                    <div
                      key={p.user_id ?? i}
                      className="flex items-center justify-between rounded-xl border border-[#E4ECF3] bg-[#FAFCFE] p-3"
                    >
                      <p className="text-sm font-semibold text-[#132033]">
                        Learner {i + 1}
                      </p>
                      <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#15803D]">
                        Connected
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                    Ask a Question
                  </p>
                  <h2 className="mt-2 text-lg font-black text-[#132033]">Question Panel</h2>
                </div>
                <MessageSquare className="h-5 w-5 text-[#7D2233]" />
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type a question..."
                  className="h-11 flex-1 rounded-xl border border-[#D9E7EE] bg-white px-4 text-sm outline-none focus:border-[#7D2233]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && question.trim()) {
                      onAskQuestion?.(question);
                      setQuestion("");
                    }
                  }}
                />
                <Button
                  className="h-11 bg-[#7D2233] hover:bg-[var(--crimson-dark)]"
                  onClick={() => {
                    if (question.trim()) {
                      onAskQuestion?.(question);
                      setQuestion("");
                    }
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHandRaised((prev) => !prev);
                  onAskQuestion?.(handRaised ? "Lowered hand." : "Raised hand for help.");
                }}
                className={`mt-3 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  handRaised
                    ? "border-[#7D2233] bg-[#7D2233] text-white"
                    : "border-[#DCE7EE] bg-[#F8FBFD] text-[#35546F] hover:border-[#7D2233]/35"
                }`}
              >
                <Hand className="mr-2 inline h-4 w-4" />
                {handRaised ? "Hand Raised" : "Raise Hand"}
              </button>
            </div>
          )}

          {/* Quick signals (learner) */}
          {mode === "learner" && (
            <div className="rounded-[28px] border border-[#D9E7EE] bg-white p-5 shadow-[0_12px_40px_rgba(25, 19, 20,0.07)]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#7B8EA2]">
                Quick Signals
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Please repeat that.",
                  "I understand.",
                  "Slow down.",
                  "I need help.",
                ].map((signal) => (
                  <button
                    key={signal}
                    type="button"
                    onClick={() => onAskQuestion?.(signal)}
                    className="rounded-full border border-[#DCE7EE] bg-[#F8FBFD] px-3 py-1.5 text-xs font-semibold text-[#35546F] transition hover:border-[#7D2233]/35 hover:bg-[#F3FBFA]"
                  >
                    {signal}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
