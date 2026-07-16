import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shared/DashboardShell";
import { dashboardConfigs } from "@/lib/dashboard-config";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Star,
  MessageSquare,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { requireTeacher } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/analytics")({
  beforeLoad: (ctx) => requireTeacher(ctx.context),
  component: TeacherAnalytics,
});

const config = dashboardConfigs.teacher;

const quizScoreTrend = [
  { week: "Wk 1", Math: 72, Chemistry: 68, CS: 79 },
  { week: "Wk 2", Math: 76, Chemistry: 71, CS: 82 },
  { week: "Wk 3", Math: 80, Chemistry: 74, CS: 85 },
  { week: "Wk 4", Math: 78, Chemistry: 77, CS: 88 },
  { week: "Wk 5", Math: 84, Chemistry: 80, CS: 91 },
  { week: "Wk 6", Math: 87, Chemistry: 83, CS: 93 },
];

const completionData = [
  { course: "Math F2", completed: 65, incomplete: 35 },
  { course: "Chemistry", completed: 42, incomplete: 58 },
  { course: "CS Basics", completed: 78, incomplete: 22 },
];

const engagementData = [
  { name: "Questions Asked", value: 87, color: "var(--crimson)" },
  { name: "Notes Created", value: 243, color: "#22C55E" },
  { name: "Replays Watched", value: 56, color: "#A855F7" },
  { name: "Quizzes Taken", value: 312, color: "#F59E0B" },
];

const topPerformers = [
  { name: "Daniel Mwangi", course: "CS Basics", score: 95, trend: "+3" },
  { name: "Amara Diallo", course: "Math F2", score: 91, trend: "+5" },
  { name: "Halima Mussa", course: "CS Basics", score: 82, trend: "+2" },
  { name: "Fatima Bello", course: "Chemistry", score: 78, trend: "+4" },
];

const COLORS = ["var(--crimson)", "#22C55E", "#A855F7", "#F59E0B"];

const KPI_CONFIG = [
  {
    label: "Avg Quiz Score",
    value: "81%",
    change: "+3% this month",
    icon: Star,
    color: "text-[var(--crimson)]",
    iconBg: "linear-gradient(135deg, var(--crimson-soft), var(--crimson-soft))",
    borderAccent: "var(--crimson)",
  },
  {
    label: "Completion Rate",
    value: "62%",
    change: "+8% this month",
    icon: CheckCircle2,
    color: "text-green-600",
    iconBg: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
    borderAccent: "#22C55E",
  },
  {
    label: "Active Learners",
    value: "87",
    change: "+12 this week",
    icon: Users,
    color: "text-purple-600",
    iconBg: "linear-gradient(135deg, #f3e8ff, #e9d5ff)",
    borderAccent: "#A855F7",
  },
  {
    label: "Questions Answered",
    value: "87",
    change: "Last 30 days",
    icon: MessageSquare,
    color: "text-amber-600",
    iconBg: "linear-gradient(135deg, #fef9c3, #fde68a)",
    borderAccent: "#F59E0B",
  },
];

const RANK_COLORS = [
  "from-[#7D2233] to-[#521326]",
  "from-green-600 to-emerald-400",
  "from-purple-600 to-violet-400",
  "from-amber-600 to-yellow-400",
];

function TeacherAnalytics() {
  return (
    <DashboardShell config={config} activePath="/teacher/analytics">
      <PageHeader
        label="Performance insights"
        title="Teaching Analytics"
        subtitle="Track quiz scores, completion rates, and student engagement across all your courses."
      />

      {/* KPI Strip — 2-up on mobile, 4-up on desktop */}
      <div className="kr-stat-strip kr-stat-strip--4 mb-8">
        {KPI_CONFIG.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-[var(--border)] bg-white p-5 transition-all hover:shadow-md hover:border-[var(--crimson)]/20 relative overflow-hidden"
            style={{
              boxShadow: "0 1px 2px rgba(25, 19, 20,0.04), 0 8px 24px rgba(25, 19, 20,0.04)",
            }}
          >
            {/* Left accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: kpi.borderAccent }}
            />
            <div className="flex items-center justify-between pl-3">
              <p className="text-sm font-semibold text-[#8A7478]">{kpi.label}</p>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
                style={{ background: kpi.iconBg }}
              >
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <p className={`mt-2 pl-3 text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 pl-3 flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" /> {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quiz Score Trend */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F7E7EA] to-[#F7E7EA]">
                <BarChart2 className="h-4 w-4 text-[#7D2233]" />
              </div>
              <div>
                <h3 className="font-bold text-[#191314] leading-tight">Quiz Score Trends</h3>
                <p className="text-xs text-[#A89890]">6-week rolling average</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={quizScoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--beige-soft)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#A89890" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fontSize: 11, fill: "#A89890" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
              />
              <Line type="monotone" dataKey="Math" stroke="var(--crimson)" strokeWidth={2.5} dot={false} />
              <Line
                type="monotone"
                dataKey="Chemistry"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={false}
              />
              <Line type="monotone" dataKey="CS" stroke="#A855F7" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-4 text-xs">
            {[
              { label: "Math F2", color: "var(--crimson)" },
              { label: "Chemistry", color: "#22C55E" },
              { label: "CS Basics", color: "#A855F7" },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[#8A7478]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Lesson Completion */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0]">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#191314] leading-tight">Lesson Completion</h3>
              <p className="text-xs text-[#A89890]">By course, current cycle</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={completionData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--beige-soft)" vertical={false} />
              <XAxis
                dataKey="course"
                tick={{ fontSize: 11, fill: "#A89890" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#A89890" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="completed" name="Completed" fill="var(--crimson)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="incomplete" name="In Progress" fill="var(--border)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement + Top Performers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Engagement Breakdown */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#f3e8ff] to-[#e9d5ff]">
              <BarChart2 className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#191314] leading-tight">Engagement Breakdown</h3>
              <p className="text-xs text-[#A89890]">All courses, last 30 days</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <PieChart width={140} height={140}>
              <Pie
                data={engagementData}
                cx={65}
                cy={65}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-3">
              {engagementData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-[#8A7478]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: COLORS[idx] }}
                    />
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-[#191314]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#fef9c3] to-[#fde68a]">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#191314] leading-tight">Top Performers</h3>
                <p className="text-xs text-[#A89890]">This month</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {topPerformers.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-[var(--beige-soft)] bg-[#FAFCFC] px-3 py-2.5 transition-all hover:border-[var(--crimson)]/20 hover:shadow-sm"
              >
                {/* Gradient rank badge */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${RANK_COLORS[i % RANK_COLORS.length]} text-xs font-bold text-white shadow-sm`}
                >
                  #{i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#191314]">{p.name}</p>
                  <p className="text-xs text-[#A89890]">{p.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#191314]">{p.score}%</p>
                  <p className="flex items-center gap-0.5 justify-end text-xs font-semibold text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    {p.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
