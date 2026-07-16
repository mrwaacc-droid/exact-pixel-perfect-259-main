import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Play, Video } from "lucide-react";
import { createTeacherSession } from "@/lib/live-sessions.functions";
import { cn } from "@/lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TeacherStartClassButtonProps = {
  lessonId: string;
  sessionId?: string;
  label?: string;
  compact?: boolean;
  className?: string;
  mode?: "human_teacher" | "hybrid";
};

export function TeacherStartClassButton({
  lessonId,
  sessionId,
  label = "Start live recording",
  compact = false,
  className,
  mode = "human_teacher",
}: TeacherStartClassButtonProps) {
  const router = useRouter();
  const createSession = useServerFn(createTeacherSession);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openTeacherSession = async (targetSessionId: string) => {
    await router.navigate({
      to: "/teacher/sessions/$sessionId",
      params: { sessionId: targetSessionId },
    });
  };

  const handleStart = async () => {
    setError(null);
    setIsStarting(true);

    try {
      if (sessionId) {
        await openTeacherSession(sessionId);
        return;
      }

      if (!UUID_RE.test(lessonId)) {
        await openTeacherSession(`demo-teacher-${lessonId}`);
        return;
      }

      const result = await createSession({
        data: {
          lesson_id: lessonId,
          mode,
          start_now: true,
        },
      });

      const nextSessionId = result.session?.id;
      if (!nextSessionId) throw new Error("The live session was not created.");
      await openTeacherSession(nextSessionId);
    } catch (err: any) {
      setError(err?.message ?? "Could not start the teacher recording room.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", compact ? "items-start" : "items-stretch")}>
      <button
        type="button"
        onClick={() => void handleStart()}
        disabled={isStarting}
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#7D2233] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--crimson-dark)] disabled:cursor-wait disabled:opacity-70",
          compact && "min-h-9 rounded-lg px-3 py-2 text-xs",
          className,
        )}
      >
        {isStarting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : compact ? (
          <Play className="h-4 w-4" />
        ) : (
          <Video className="h-4 w-4" />
        )}
        <span className="truncate">{isStarting ? "Opening studio..." : label}</span>
      </button>
      {error && <p className="max-w-[16rem] text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
