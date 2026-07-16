/**
 * Session Replay Page
 *
 * Reconstructs a full classroom session from the event stream,
 * showing chronological transcript, board snapshots, teacher states,
 * quiz moments, and progress changes.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useSessionReplay } from "@/hooks/useSessionReview";
import {
  ArrowLeft,
  Play,
  MessageSquare,
  Brain,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { requireStudent } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/student/sessions/$sessionId/replay")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: SessionReplayPage,
});

function SessionReplayPage() {
  const { sessionId } = Route.useParams();
  const { replay, isLoading, error } = useSessionReplay(sessionId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play through timeline
  useEffect(() => {
    if (isPlaying && replay) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          if (prev >= replay.timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, replay]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--crimson)] mx-auto mb-4" />
            <p className="text-gray-500">Loading replay...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !replay) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Replay Unavailable</h2>
          <p className="text-gray-500 mb-4">{error ?? "Could not load session replay."}</p>
          <Link to="/student/sessions" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Sessions
          </Link>
        </div>
      </AppShell>
    );
  }

  const currentItem = replay.timeline[activeIndex];
  const visibleTimeline = replay.timeline.slice(0, activeIndex + 1);

  return (
    <AppShell>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/student/sessions" className="btn btn-ghost btn-sm">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="page-title">Session Replay</h1>
              <p className="page-subtitle">
                {replay.eventCount} events · {replay.messageCount} messages ·{" "}
                {replay.boardSnapshotCount} board snapshots
              </p>
            </div>
          </div>
          <button
            className={`btn ${isPlaying ? "btn-ghost" : "btn-primary"}`}
            onClick={() => {
              if (activeIndex >= replay.timeline.length - 1) setActiveIndex(0);
              setIsPlaying(!isPlaying);
            }}
          >
            <Play size={16} />
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Replay Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current Item Display */}
            {currentItem && (
              <div className="card p-6">
                <TimelineItemDisplay item={currentItem} />
              </div>
            )}

            {/* Progress Bar */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {activeIndex + 1} / {replay.timeline.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((activeIndex + 1) / replay.timeline.length) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(replay.timeline.length - 1, 0)}
                value={activeIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setActiveIndex(parseInt(e.target.value));
                }}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* Timeline Sidebar */}
          <div className="card p-4">
            <h3 className="section-title mb-3">Timeline</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {visibleTimeline.map((item, idx) => (
                <button
                  key={item.id}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    idx === activeIndex
                      ? "bg-[var(--crimson-soft)] border border-[var(--crimson-soft)]"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveIndex(idx);
                  }}
                >
                  <TimelineItemLabel item={item} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TimelineItemDisplay({ item }: { item: any }) {
  if (item.type === "message") {
    const isTeacher = item.sender === "ai_teacher" || item.sender === "teacher";
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className={isTeacher ? "text-[var(--crimson)]" : "text-green-600"} />
          <span className="font-medium">{isTeacher ? "AI Teacher" : "Student"}</span>
          <span className="text-sm text-gray-400">
            {new Date(item.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div
          className={`p-4 rounded-lg ${isTeacher ? "bg-[var(--crimson-soft)] border-l-4 border-[var(--crimson)]" : "bg-green-50 border-l-4 border-green-400"}`}
        >
          <p>{item.message}</p>
        </div>
      </div>
    );
  }

  if (item.type === "board_snapshot") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-purple-600" />
          <span className="font-medium">Board: {item.title}</span>
          <span className="text-sm text-gray-400">
            {new Date(item.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          {item.lines?.map((line: string, i: number) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    );
  }

  // Generic event
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <EventIcon eventType={item.eventType} />
        <span className="font-medium capitalize">{item.eventType.replace(/_/g, " ")}</span>
        <span className="text-sm text-gray-400">
          {new Date(item.timestamp).toLocaleTimeString()}
        </span>
      </div>
      {item.payload && Object.keys(item.payload).length > 0 && (
        <div className="bg-gray-50 p-3 rounded text-sm">
          <pre className="whitespace-pre-wrap">{JSON.stringify(item.payload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function TimelineItemLabel({ item }: { item: any }) {
  if (item.type === "message") {
    const isTeacher = item.sender === "ai_teacher" || item.sender === "teacher";
    return (
      <div className="flex items-center gap-2">
        <MessageSquare size={12} className={isTeacher ? "text-[var(--crimson)]" : "text-green-500"} />
        <span className="text-sm truncate">
          {isTeacher ? "Teacher: " : "You: "}
          {item.message.slice(0, 50)}
        </span>
      </div>
    );
  }
  if (item.type === "board_snapshot") {
    return (
      <div className="flex items-center gap-2">
        <BookOpen size={12} className="text-purple-500" />
        <span className="text-sm truncate">{item.title}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <EventIcon eventType={item.eventType} size={12} />
      <span className="text-sm capitalize">{item.eventType.replace(/_/g, " ")}</span>
    </div>
  );
}

function EventIcon({ eventType, size = 16 }: { eventType: string; size?: number }) {
  switch (eventType) {
    case "session_started":
    case "session_ended":
      return <Clock size={size} className="text-gray-500" />;
    case "step_changed":
      return <ChevronRight size={size} className="text-[var(--crimson)]" />;
    case "quiz_started":
    case "quiz_answered":
      return <CheckCircle size={size} className="text-orange-500" />;
    case "quick_action":
      return <AlertTriangle size={size} className="text-yellow-500" />;
    default:
      return <Brain size={size} className="text-gray-400" />;
  }
}
