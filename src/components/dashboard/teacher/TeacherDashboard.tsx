import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BookOpen, CheckCircle2, Eye, Gauge, Play, Users, Video } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { DashboardLoadingState } from "@/components/dashboard/shared/DashboardLoadingState";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { type DashboardConfig } from "@/lib/dashboard-config";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { getTeacherDashboardOverview } from "@/lib/reporting.functions";
import { TeacherDeliverySkillPanel } from "./TeacherDeliverySkillPanel";

function getTeacherDashboardCopy(role: DashboardConfig["role"]) {
  switch (role) {
    case "private_teacher":
      return {
        headerLabel: "Private teaching workspace",
        headerTitle: "Run your independent teaching business",
        headerSubtitle:
          "Track verification, manage your own courses, and support private learners across live and AI-assisted sessions.",
        alertTitle: "Verification and lesson items need your attention",
        alertDescription:
          "Complete your profile checks and review pending lesson updates before your next private teaching session.",
        courseSectionTitle: "My private courses",
        courseSectionSubtitle: "Courses you own and deliver",
        scheduleTitle: "Upcoming private sessions",
      };
    case "kingpin_teacher":
      return {
        headerLabel: "KingPin teaching workspace",
        headerTitle: "Deliver official KingPin learning experiences",
        headerSubtitle:
          "Manage assigned delivery queues, refine official lessons, and maintain quality across learner groups.",
        alertTitle: "Lesson review queue needs attention",
        alertDescription:
          "Review pending lesson quality, caption, and classroom readiness updates before release.",
        courseSectionTitle: "KingPin course assignments",
        courseSectionSubtitle: "Official courses you are assigned to deliver",
        scheduleTitle: "Delivery queue",
      };
    case "institution_teacher":
      return {
        headerLabel: "Institution teaching workspace",
        headerTitle: "Prepare, teach, and support assigned classes",
        headerSubtitle:
          "Manage your institution courses, review lessons, and monitor learner progress across assigned classes.",
        alertTitle: "Lesson review queue needs attention",
        alertDescription:
          "Review pending lesson caption, quiz, and classroom readiness updates.",
        courseSectionTitle: "Assigned courses",
        courseSectionSubtitle: "Courses you are responsible for",
        scheduleTitle: "Today's schedule",
      };
    default:
      return {
        headerLabel: "Teaching workspace",
        headerTitle: "Prepare, teach, and support learners",
        headerSubtitle:
          "Manage your courses, review lessons, and monitor student progress across all assigned classes.",
        alertTitle: "Lesson review queue needs attention",
        alertDescription:
          "Review pending lesson caption, quiz, and classroom readiness updates.",
        courseSectionTitle: "My courses",
        courseSectionSubtitle: "Courses you are responsible for",
        scheduleTitle: "Today's schedule",
      };
  }
}

function formatScheduleTime(iso: string | null | undefined): string {
  if (!iso) return "Time not scheduled";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Time not scheduled";

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
    date,
  );

  if (date.toDateString() === now.toDateString()) return `Today at ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${time}`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "Live data";
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "Live data";
  const mins = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

function lessonBadgeVariant(status: string | null | undefined) {
  const normalized = (status ?? "").toLowerCase();
  if (["approved", "published", "ready"].includes(normalized)) return "success" as const;
  if (["draft", "generated", "needs_review"].includes(normalized)) return "warning" as const;
  return "neutral" as const;
}

type TeacherDashboardCourse = {
  id: string;
  title: string;
  institution: string;
  stats: Array<{ label: string; value: string }>;
  progress: number;
};

type TeacherDashboardLesson = {
  id: string;
  title: string;
  course: string;
  description: string;
  status: string;
};

type TeacherDashboardSession = {
  id: string;
  title: string;
  course: string;
  time: string | null;
  participantCount: number;
};

export default function TeacherDashboard() {
  const config = useDashboardConfig();
  const copy = getTeacherDashboardCopy(config.role);
  const dashboardFn = useServerFn(getTeacherDashboardOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["teacher-dashboard-overview"],
    queryFn: () => dashboardFn(),
    staleTime: 20000,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <DashboardShell config={config} activePath="/teacher/dashboard">
        <DashboardLoadingState type="skeleton" />
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell config={config} activePath="/teacher/dashboard">
        <DashboardLoadingState
          type="error"
          message={(error as Error)?.message || "Failed to load dashboard data"}
        />
      </DashboardShell>
    );
  }

  const teacherMetrics = [
    {
      label: "Assigned courses",
      value: String(data.metrics.assignedCourses),
      meta: "Active courses",
      href: "/teacher/courses",
      icon: BookOpen,
    },
    {
      label: "Total students",
      value: String(data.metrics.totalStudents),
      meta: "Across all courses",
      href: "/teacher/students",
      icon: Users,
    },
    {
      label: "Lessons ready",
      value: String(data.metrics.lessonsReady),
      meta: "Approved lessons",
      href: "/teacher/lessons",
      icon: CheckCircle2,
    },
    {
      label: "Pending review",
      value: String(data.metrics.pendingReview),
      meta: "Needs your action",
      href: "/teacher/lessons",
      icon: Eye,
    },
    {
      label: "Sessions today",
      value: String(data.metrics.sessionsToday),
      meta: "Teaching sessions",
      href: "/teacher/sessions",
      icon: Video,
    },
  ];
  const nextSession = data.upcomingSession;

  return (
    <DashboardShell config={config} activePath="/teacher/dashboard">
      <div className="kr-teacher-flow">
        <section className="kr-teacher-hero kr-reveal">
          <div className="kr-hero-copy">
            <p className="kr-section-kicker">{copy.headerLabel}</p>
            <h1>{copy.headerTitle}</h1>
            <p>{copy.headerSubtitle}</p>
          </div>

          <div className="kr-session-stage" aria-label="Next teaching session">
            <div className="kr-session-orbit" aria-hidden="true" />
            <div className="kr-session-main">
              <div className="kr-session-label">
                <span className="kr-live-dot" />
                Next session
              </div>
              <h2>{nextSession?.title ?? "No session scheduled"}</h2>
              <p>
                {nextSession
                  ? `${nextSession.course} - ${formatScheduleTime(nextSession.time)}`
                  : "Create or start a teaching session when your lesson is ready."}
              </p>
            </div>
            <dl className="kr-session-facts">
              <div>
                <dt>Mode</dt>
                <dd>{nextSession?.mode ?? "Not set"}</dd>
              </div>
              <div>
                <dt>Students</dt>
                <dd>{nextSession?.expectedStudents ?? 0}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>Captions on</dd>
              </div>
            </dl>
            <div className="kr-action-row">
              <Link to="/teacher/sessions" className="kr-command-button kr-command-button--primary">
                <Play className="h-4 w-4" />
                Open teaching sessions
              </Link>
              <Link to="/teacher/lessons" className="kr-command-button">
                Review lessons
              </Link>
              <Link to="/teacher/students" className="kr-command-button">
                Students
              </Link>
            </div>
          </div>
        </section>

        <section className="kr-attention-rail kr-reveal" aria-label="Needs attention">
          <div>
            <span>Attention</span>
            <strong>{data.attention.title || copy.alertTitle}</strong>
            <p>{data.attention.description || copy.alertDescription}</p>
          </div>
          <Link to="/teacher/lessons">
            Review queue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <TeacherDeliverySkillPanel
          input={{
            lessonsReady: data.metrics.lessonsReady,
            pendingReview: data.metrics.pendingReview,
            sessionsToday: data.metrics.sessionsToday,
            onlineStudents: data.live.onlineStudents,
            upcomingSessionTitle: nextSession?.title ?? null,
          }}
        />

        <section className="kr-metric-strip kr-reveal" aria-label="Teaching metrics">
          {teacherMetrics.map((metric) => (
            <Link key={metric.label} to={metric.href} className="kr-metric-item">
              <metric.icon className="h-4 w-4" />
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.meta}</small>
            </Link>
          ))}
        </section>

        <section className="kr-open-grid">
          <div className="kr-open-column kr-open-column--wide gap-6">
            {/* Courses Card */}
            <div className="kr-card kr-reveal">
              <div className="kr-card-header flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-red-700">Courses</span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">{copy.courseSectionTitle}</h2>
                  <p className="text-xs text-gray-500 mt-1">{copy.courseSectionSubtitle}</p>
                </div>
                <Link to="/teacher/courses" className="text-sm font-semibold text-red-700 hover:text-red-900">View all</Link>
              </div>

              <div className="kr-course-ledger">
                {data.courses.length === 0 ? (
                  <div className="kr-ledger-row">
                    <div className="kr-ledger-title">
                      <BookOpen className="h-4 w-4" />
                      <div>
                        <strong>No courses assigned</strong>
                        <span>Your courses will appear here once assigned.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  data.courses.map((course: TeacherDashboardCourse) => (
                    <Link
                      key={course.id}
                      to="/teacher/courses/$courseId"
                      params={{ courseId: course.id }}
                      className="kr-ledger-row"
                    >
                      <div className="kr-ledger-title">
                        <BookOpen className="h-4 w-4" />
                        <div>
                          <strong>{course.title}</strong>
                          <span>{course.institution}</span>
                        </div>
                      </div>
                      <div className="kr-ledger-stats">
                        {course.stats.map((stat) => (
                          <span key={stat.label}>
                            <small>{stat.label}</small>
                            {stat.value}
                          </span>
                        ))}
                      </div>
                      <div className="kr-progress-line" aria-label={`${course.progress}% complete`}>
                        <span style={{ width: `${course.progress}%` }} />
                      </div>
                      <ArrowRight className="kr-row-arrow h-4 w-4" />
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Quality / Review Queue Card */}
            <div className="kr-card kr-reveal">
              <div className="kr-card-header flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-red-700">Quality</span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">Lesson review queue</h2>
                  <p className="text-xs text-gray-500 mt-1">Lessons awaiting your approval</p>
                </div>
                <Link to="/teacher/lessons" className="text-sm font-semibold text-red-700 hover:text-red-900">View all</Link>
              </div>

              <div className="kr-review-list">
                {data.lessonReview.length === 0 ? (
                  <div className="kr-review-row">
                    <div>
                      <strong>No lessons waiting</strong>
                      <span>Your lesson review queue is clear.</span>
                    </div>
                    <StatusBadge variant="success">Clear</StatusBadge>
                    <small>Live data</small>
                    <Eye className="h-4 w-4" />
                  </div>
                ) : (
                  data.lessonReview.map((lesson: TeacherDashboardLesson) => (
                    <Link
                      key={lesson.id}
                      to="/teacher/lessons/$lessonId"
                      params={{ lessonId: lesson.id }}
                      className="kr-review-row"
                    >
                      <div>
                        <strong>{lesson.title}</strong>
                        <span>{lesson.course}</span>
                      </div>
                      <StatusBadge variant={lessonBadgeVariant(lesson.status)}>
                        {lesson.description}
                      </StatusBadge>
                      <small>{lesson.description}</small>
                      <Eye className="h-4 w-4" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="kr-open-column gap-6">
            {/* Schedule Card */}
            <div className="kr-card kr-reveal">
              <div className="kr-card-header flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-red-700">Schedule</span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">{copy.scheduleTitle}</h2>
                </div>
                <Link to="/teacher/sessions" className="text-sm font-semibold text-red-700 hover:text-red-900">View all</Link>
              </div>

              <div className="kr-timeline">
                {data.upcomingSessions.length === 0 ? (
                  <div className="py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-600">Nothing scheduled</p>
                    <p className="text-xs text-gray-500 mt-1">No upcoming sessions. Start one from your lessons or sessions page.</p>
                  </div>
                ) : (
                  data.upcomingSessions.map((session: TeacherDashboardSession) => (
                    <Link
                      key={session.id}
                      to="/teacher/sessions/$sessionId"
                      params={{ sessionId: session.id }}
                      className="kr-timeline-row flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="kr-timeline-pin shrink-0" />
                        <div>
                          <small className="text-xs text-red-700 font-extrabold">{formatScheduleTime(session.time)}</small>
                          <strong className="block text-sm font-bold text-gray-900">{session.title}</strong>
                          <span className="text-xs text-gray-500">{session.course}</span>
                        </div>
                      </div>
                      <em className="text-xs font-black bg-gray-100 px-2 py-1 rounded text-gray-700">{session.participantCount}</em>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Live Card */}
            <div className="kr-card kr-reveal">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-red-700">Live now</span>
                  <strong className="block text-4xl font-extrabold text-gray-900 mt-2">{data.live.onlineStudents}</strong>
                  <p className="text-xs text-gray-600 mt-1">Students online in your courses</p>
                </div>
                <div className="kr-live-gauge bg-red-50 p-3 rounded-xl border border-red-100 flex flex-col items-center justify-center">
                  <Gauge className="h-6 w-6 text-red-700" />
                  <span className="text-[10px] font-black text-red-700 mt-1">+{data.live.activeThisHour} this hour</span>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="kr-card kr-reveal">
              <div className="kr-card-header flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-red-700">Activity</span>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">Recent movement</h2>
                </div>
              </div>

              <div className="kr-activity-stream">
                {data.activity.length === 0 ? (
                  <div className="py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-600">No recent activity</p>
                    <p className="text-xs text-gray-500 mt-1">Learner questions and classroom events will appear here.</p>
                    <small className="block text-[10px] text-gray-400 mt-3 uppercase tracking-wider font-extrabold">Live data</small>
                  </div>
                ) : (
                  data.activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-red-700 mt-0.5 shrink-0" />
                      <div>
                        <strong className="block text-sm font-bold text-gray-900">{item.action}</strong>
                        <span className="text-xs text-gray-600">{item.description}</span>
                        <small className="block text-[10px] text-gray-400 mt-1">{timeAgo(item.timestamp)}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </DashboardShell>
  );
}
