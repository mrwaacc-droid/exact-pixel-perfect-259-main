import { Heart, BookOpen, Clock, BarChart3, Calendar, MessageSquare, CheckCircle2, TrendingUp } from "lucide-react";

const learnerOverview = {
  name: "Amara Ochieng",
  currentCourses: [
    { title: "Chemistry Form 3", progress: 78, color: "bg-crimson" },
    { title: "Mathematics Form 2", progress: 92, color: "bg-[#22c55e]" },
    { title: "English Form 3", progress: 65, color: "bg-[#D97706]" },
  ],
  stats: [
    { label: "Lessons completed", value: "24", icon: BookOpen },
    { label: "Time this week", value: "3h 45m", icon: Clock },
    { label: "Questions asked", value: "12", icon: MessageSquare },
  ],
};

const supportiveMessages = [
  { text: "Making steady progress in Chemistry", icon: TrendingUp, color: "text-education-green" },
  { text: "Revisited covalent bonds during the lesson", icon: BookOpen, color: "text-learning-blue" },
  { text: "Requested an additional example for quadratics", icon: MessageSquare, color: "text-achievement-orange" },
];

export function FamilyView() {
  return (
    <section className="py-20 lg:py-28 bg-white" id="family">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Mockup */}
          <div className="mockup-window overflow-hidden">
            <div className="h-8 border-b border-border bg-page-background-alt flex items-center px-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red" />
                <span className="w-2 h-2 rounded-full bg-achievement-orange" />
                <span className="w-2 h-2 rounded-full bg-education-green" />
                <span className="text-[9px] text-muted ml-2 font-medium">Family View — {learnerOverview.name}</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Learner header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-soft-blue flex items-center justify-center text-learning-blue font-bold text-lg">
                  {learnerOverview.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-heading">{learnerOverview.name}</h4>
                  <p className="text-xs text-muted">3 active courses</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {learnerOverview.stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-page-background rounded-xl border border-border p-3 text-center">
                      <Icon size={14} className="text-learning-blue mx-auto mb-1.5" />
                      <p className="text-lg font-bold text-heading">{stat.value}</p>
                      <p className="text-[9px] text-muted mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Course progress */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Current courses</p>
                {learnerOverview.currentCourses.map((course) => (
                  <div key={course.title} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-heading truncate">{course.title}</span>
                        <span className="text-xs font-bold text-heading">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div className={`h-full ${course.color} rounded-full`} style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supportive messages */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Learning updates</p>
                {supportiveMessages.map((msg) => {
                  const Icon = msg.icon;
                  return (
                    <div key={msg.text} className="flex items-center gap-2 p-2.5 bg-page-background rounded-lg border border-border">
                      <Icon size={12} className={msg.color} />
                      <span className="text-xs text-body">{msg.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <p className="text-xs font-bold text-learning-blue uppercase tracking-widest mb-3">
              Family view
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-heading leading-tight mb-5">
              Parents stay informed, not overwhelmed
            </h2>
            <p className="text-body leading-relaxed mb-8 text-base">
              The Family View gives parents a clear picture of their child's learning — courses, progress, time spent, and supportive updates. No surveillance, just involvement.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Current courses and progress percentages",
                "Lessons completed and time spent learning",
                "Upcoming lessons and assignments due",
                "Supportive learning updates — not scores or rankings",
                "Teacher feedback and announcements",
                "Weekly learning summaries",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-education-green shrink-0" />
                  <p className="text-sm font-medium text-body">{item}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-soft-green rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={14} className="text-education-green" />
                <span className="text-xs font-bold text-education-green uppercase tracking-wider">Supportive language</span>
              </div>
              <p className="text-sm text-body">
                "Making steady progress" and "Needs another review" — not "attention score" or "weak student."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
