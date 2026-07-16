import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { StudentShell } from "@/components/student/StudentShell";
import { ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
import { getStudentSessions } from "@/lib/student.functions";

export const Route = createFileRoute("/_authenticated/student/calendar")({
  beforeLoad: (ctx) => requireStudent(ctx.context),
  component: StudentCalendar,
});

type CalStatus = "live" | "upcoming" | "completed";

const STATUS_META: Record<CalStatus, { label: string; dot: string; bg: string; fg: string }> = {
  live: { label: "Live", dot: "#7D2233", bg: "#F7E7EA", fg: "#521326" },
  upcoming: { label: "Upcoming", dot: "var(--muted)", bg: "#F4ECE4", fg: "var(--muted)" },
  completed: { label: "Completed", dot: "#22c55e", bg: "#dcfce7", fg: "#15803d" },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function toCal(db: "live" | "completed" | "scheduled"): CalStatus {
  if (db === "live") return "live";
  if (db === "completed") return "completed";
  return "upcoming";
}

function StudentCalendar() {
  const fn = useServerFn(getStudentSessions);
  const q = useQuery({ queryKey: ["student-sessions"], queryFn: () => fn() });
  const sessions = q.data?.sessions ?? [];

  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<number | null>(today.getDate());

  const entries = useMemo(
    () =>
      sessions
        .filter((s: any) => s.startedAt)
        .map((s: any) => {
          const d = new Date(s.startedAt);
          return {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getDate(),
            time: d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            title: s.lessonTitle,
            course: s.courseTitle,
            status: toCal(s.status as any),
            id: s.id,
          };
        }),
    [sessions],
  );

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const sessionsForDay = (day: number) =>
    entries.filter((e) => e.year === view.year && e.month === view.month && e.day === day);
  const daySessions = selected ? sessionsForDay(selected) : [];

  const move = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
    setSelected(null);
  };

  return (
    <StudentShell title="Calendar">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="kr-pcard p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--gray-900)]">
              {MONTHS[view.month]} {view.year}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => move(-1)} className="kr-cal-nav" aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => move(1)} className="kr-cal-nav" aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-[11px] font-bold uppercase tracking-wide text-[var(--gray-400)]">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const items = sessionsForDay(day);
              const isSelected = day === selected;
              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  className={`kr-cal-cell ${isSelected ? "kr-cal-cell-selected" : ""}`}
                >
                  <span className="kr-cal-num">{day}</span>
                  <span className="kr-cal-dots">
                    {items.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="kr-cal-dot" style={{ background: STATUS_META[s.status].dot }} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--gray-100)] pt-4 text-xs text-[var(--gray-600)]">
            {Object.entries(STATUS_META).map(([k, m]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.dot }} />
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="kr-pcard p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--gray-500)]">
            {selected ? `${MONTHS[view.month]} ${selected}` : "Select a day"}
          </h3>
          <div className="mt-4 space-y-3">
            {daySessions.length === 0 ? (
              <p className="text-sm text-[var(--gray-500)]">No sessions scheduled for this day.</p>
            ) : (
              daySessions.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--gray-200)] p-4 transition hover:border-[var(--primary)] hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: STATUS_META[s.status].bg, color: STATUS_META[s.status].fg }}
                    >
                      {STATUS_META[s.status].label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--gray-500)]">
                      <Clock className="h-3.5 w-3.5" /> {s.time}
                    </span>
                  </div>
                  <h4 className="mt-2 font-semibold text-[var(--gray-900)]">{s.title}</h4>
                  <p className="text-xs text-[var(--gray-500)]">{s.course}</p>
                  <div className="mt-3 flex gap-2">
                    {s.status === "live" ? (
                      <Link
                        to="/student/classrooms"
                        className="kr-btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <Video className="h-3.5 w-3.5" /> Join now
                      </Link>
                    ) : s.status === "completed" ? (
                      <Link
                        to="/student/sessions/$sessionId/summary"
                        params={{ sessionId: s.id }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gray-200)] px-3 py-1.5 text-xs font-semibold text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                      >
                        Review
                      </Link>
                    ) : (
                      <Link
                        to="/student/classrooms"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gray-200)] px-3 py-1.5 text-xs font-semibold text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
