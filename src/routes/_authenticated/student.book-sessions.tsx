import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Monitor,
  Radio,
  Search,
  Users,
  WandSparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  listAllBookableSessionsForStudent,
  joinSession,
} from "@/lib/teacher-availability.functions";
import { requireClientAuthRoute } from "@/lib/route-guards";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/student/book-sessions")({
  beforeLoad: () => requireClientAuthRoute(),
  component: StudentBookSessionsPage,
});

function StudentBookSessionsPage() {
  const listFn = useServerFn(listAllBookableSessionsForStudent);
  const joinFn = useServerFn(joinSession);
  const [search, setSearch] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["bookable-sessions-all"],
    queryFn: () => listFn({ data: {} }),
  });

  const sessions = useMemo(() => {
    const rows = query.data?.sessions ?? [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r: any) =>
        (r.lesson_title ?? "").toLowerCase().includes(q) ||
        (r.course_title ?? "").toLowerCase().includes(q) ||
        (r.teacher_name ?? "").toLowerCase().includes(q),
    );
  }, [query.data, search]);

  const handleJoin = async (sessionId: string) => {
    setJoiningId(sessionId);
    try {
      await joinFn({ data: { session_id: sessionId } });
      toast.success("You're in! Redirecting to classroom...");
      window.location.href = `/classroom/session/${sessionId}`;
    } catch (err: any) {
      toast.error(err.message ?? "Could not join session");
      setJoiningId(null);
    }
  };

  const now = Date.now();

  return (
    <DashboardShell
      config={dashboardConfigs.learner}
      activePath="/student/book-sessions"
      title="Book a Session"
      subtitle="Browse upcoming live classes and AI lessons. Join when they go live."
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A89890]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by lesson, course, or teacher..."
            className="pl-9"
          />
        </div>

        {/* Loading */}
        {query.isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-crimson" />
          </div>
        )}

        {/* Empty state */}
        {!query.isLoading && sessions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-crimson-soft">
                <Calendar className="h-7 w-7 text-crimson" />
              </div>
              <h3 className="text-lg font-black text-[#132033]">No sessions available</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[#61758A]">
                {search
                  ? "No sessions match your search. Try different keywords."
                  : "There are no upcoming sessions yet. Check back soon or ask your institution to schedule one."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Session list */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session: any) => {
            const startTime = new Date(session.scheduled_start_at).getTime();
            const isLive = session.status === "live" || startTime <= now;
            const isUpcoming = startTime > now;
            const modeIcon =
              session.mode === "ai_teacher" ? (
                <WandSparkles className="h-4 w-4" />
              ) : session.mode === "hybrid" ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              );

            return (
              <Card key={session.id} className="overflow-hidden">
                <CardContent className="p-5">
                  {/* Status badge */}
                  <div className="mb-3 flex items-center justify-between">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                        <Radio className="h-3 w-3" /> LIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson-soft px-2.5 py-1 text-[10px] font-bold text-crimson">
                        <Clock className="h-3 w-3" /> UPCOMING
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold capitalize text-[#476277]">
                      {modeIcon} {session.mode?.replace("_", " ") ?? "session"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-black text-[#132033]">
                    {session.lesson_title ?? "Untitled Lesson"}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#61758A]">
                    {session.course_title ?? "General Course"}
                  </p>

                  {/* Teacher */}
                  {session.teacher_name && (
                    <p className="mt-2 text-xs font-semibold text-[#476277]">
                      👤 {session.teacher_name}
                    </p>
                  )}

                  {/* Time */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#61758A]">
                    <Calendar className="h-3.5 w-3.5" />
                    {isUpcoming
                      ? new Date(session.scheduled_start_at).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Started"}
                  </div>

                  {/* Capacity */}
                  {typeof session.enrolled_count === "number" &&
                    typeof session.capacity === "number" && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#61758A]">
                        <Users className="h-3.5 w-3.5" />
                        {session.enrolled_count}/{session.capacity} enrolled
                      </div>
                    )}

                  {/* Action */}
                  <Button
                    className="mt-4 w-full bg-crimson hover:bg-crimson-dark"
                    disabled={joiningId === session.id}
                    onClick={() => handleJoin(session.id)}
                  >
                    {joiningId === session.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
                      </>
                    ) : isLive ? (
                      <>
                        <Radio className="mr-2 h-4 w-4" /> Join Now
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Reserve Spot
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}