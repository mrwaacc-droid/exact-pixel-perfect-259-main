import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Monitor,
  Plus,
  Radio,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyInstitutions } from "@/lib/institutions.functions";
import { listCalendarEvents } from "@/lib/calendar.functions";
import { listActiveSessions } from "@/lib/live-sessions.functions";
import { requireInstitutionAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/sessions")({
  beforeLoad: (ctx) => requireInstitutionAdmin(ctx.context),
  component: InstitutionSessionsPage,
});

type Tab = "live" | "scheduled" | "completed";

function InstitutionSessionsPage() {
  const [tab, setTab] = useState<Tab>("live");

  const myFn = useServerFn(getMyInstitutions);
  const my = useQuery({ queryKey: ["my-institutions"], queryFn: () => myFn() });
  const institutionId = my.data?.memberships?.[0]?.institution?.id;

  const liveFn = useServerFn(listActiveSessions);
  const liveQuery = useQuery({
    queryKey: ["institution-live-sessions", institutionId],
    queryFn: () => liveFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
    refetchInterval: 10000,
  });

  const calendarFn = useServerFn(listCalendarEvents);
  const calendarQuery = useQuery({
    queryKey: ["institution-calendar", institutionId],
    queryFn: () => calendarFn({ data: { institution_id: institutionId! } }),
    enabled: !!institutionId,
  });

  const liveSessions = liveQuery.data?.sessions ?? [];
  const allEvents = calendarQuery.data?.events ?? [];

  const scheduledEvents = useMemo(
    () => allEvents.filter((e: any) => e.status === "scheduled"),
    [allEvents],
  );
  const completedEvents = useMemo(
    () => allEvents.filter((e: any) => e.status === "completed" || e.status === "cancelled"),
    [allEvents],
  );

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: "live", label: "Live Now", count: liveSessions.length, icon: <Radio className="h-3.5 w-3.5" /> },
    { key: "scheduled", label: "Scheduled", count: scheduledEvents.length, icon: <Calendar className="h-3.5 w-3.5" /> },
    { key: "completed", label: "Completed", count: completedEvents.length, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <InstitutionShell
      title="Classroom Sessions"
      actions={
        institutionId ? (
          <Button asChild>
            <Link to="/institution/sessions/new">
              <Plus className="mr-2 h-4 w-4" /> New Session
            </Link>
          </Button>
        ) : undefined
      }
    >
      {/* Tab bar */}
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? "border-crimson bg-crimson-soft text-crimson"
                : "border-[var(--border)] bg-white text-[#8A7478] hover:bg-[#F8FBFD]"
            }`}
          >
            {t.icon}
            {t.label}
            <span
              className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                tab === t.key ? "bg-crimson text-white" : "bg-[var(--beige-soft)] text-[#8A7478]"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Live sessions */}
      {tab === "live" && (
        <div className="space-y-4">
          {liveSessions.length === 0 ? (
            <EmptyState
              icon={<Radio className="h-8 w-8 text-[#A89890]" />}
              title="No live sessions"
              description="When a teacher or AI starts a session, it will appear here in real-time."
            />
          ) : (
            liveSessions.map((s: any) => (
              <Card key={s.id} className="border-crimson/20">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-10 w-10 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-40" />
                      <Zap className="relative h-5 w-5 text-crimson" />
                    </div>
                    <div>
                      <p className="font-bold text-[#132033]">{s.lessonTitle}</p>
                      <p className="text-xs text-[#61758A]">
                        {s.courseTitle} · {s.mode.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#132033]">
                        <Users className="h-4 w-4 text-crimson" /> {s.participantCount}
                      </div>
                      <p className="text-[11px] text-[#61758A]">learners</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-crimson hover:bg-crimson-dark"
                      onClick={() => {
                        window.location.href = `/teacher/sessions/${s.id}`;
                      }}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Scheduled sessions */}
      {tab === "scheduled" && (
        <div className="space-y-4">
          {scheduledEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-8 w-8 text-[#A89890]" />}
              title="No scheduled sessions"
              description="Schedule a session from a course page to see it here."
            />
          ) : (
            scheduledEvents.map((e: any) => (
              <Card key={e.id}>
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-bold text-[#132033]">{e.title}</p>
                    <p className="text-xs text-[#61758A]">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {new Date(e.starts_at).toLocaleString()} · {e.timezone}
                    </p>
                  </div>
                  <Badge variant="secondary">Scheduled</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed sessions */}
      {tab === "completed" && (
        <div className="space-y-4">
          {completedEvents.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-8 w-8 text-[#A89890]" />}
              title="No completed sessions"
              description="Completed sessions and recordings will appear here."
            />
          ) : (
            completedEvents.map((e: any) => (
              <Card key={e.id}>
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-bold text-[#132033]">{e.title}</p>
                    <p className="text-xs text-[#61758A]">
                      {new Date(e.starts_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={e.status === "completed" ? "default" : "destructive"}>
                    {e.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </InstitutionShell>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D9E7EE] bg-[#FBFDFC] p-12 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--beige-soft)]">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#132033]">{title}</h3>
      <p className="mt-1 text-sm text-[#61758A]">{description}</p>
    </div>
  );
}
