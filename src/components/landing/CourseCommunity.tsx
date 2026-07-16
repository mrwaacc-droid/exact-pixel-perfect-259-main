import { BookOpen, Bell, FileText, MessageCircleQuestion, BarChart3, CheckCircle2, Clock, Users } from "lucide-react";

const activityFeed = [
  { icon: BookOpen, text: "New lesson published: Chemical Bonding", time: "2 hours ago", color: "text-learning-blue" },
  { icon: FileText, text: "Assignment available: Factoring Practice", time: "4 hours ago", color: "text-education-green" },
  { icon: Bell, text: "Teacher announcement: Review session Friday", time: "Yesterday", color: "text-achievement-orange" },
  { icon: CheckCircle2, text: "AI lesson completed: Photosynthesis", time: "Yesterday", color: "text-education-green" },
  { icon: MessageCircleQuestion, text: "Question answered: Why do atoms bond?", time: "2 days ago", color: "text-learning-blue" },
];

const courseNav = [
  { icon: BookOpen, label: "Continue learning", active: true },
  { icon: FileText, label: "Lessons", count: 12 },
  { icon: Clock, label: "Assignments", count: 3 },
  { icon: Users, label: "Resources", count: 8 },
  { icon: BarChart3, label: "Progress" },
];

export function CourseCommunity() {
  return (
    <section className="py-20 lg:py-28 bg-white" id="course-community">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Mockup */}
          <div className="mockup-window overflow-hidden order-2 lg:order-1">
            <div className="h-8 border-b border-border bg-page-background-alt flex items-center px-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red" />
                <span className="w-2 h-2 rounded-full bg-achievement-orange" />
                <span className="w-2 h-2 rounded-full bg-education-green" />
                <span className="text-[9px] text-muted ml-2 font-medium">Form 3 Chemistry — Course Home</span>
              </div>
            </div>

            <div className="flex min-h-[380px]">
              {/* Sidebar nav */}
              <div className="w-48 border-r border-border bg-page-background-alt p-3 hidden sm:block">
                <div className="space-y-1">
                  {courseNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          item.active
                            ? "bg-learning-blue text-white"
                            : "text-body hover:bg-white"
                        }`}
                      >
                        <Icon size={14} />
                        <span className="flex-1">{item.label}</span>
                        {"count" in item && item.count && (
                          <span className={`text-[10px] font-bold ${item.active ? "text-white/70" : "text-muted"}`}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-heading mb-1">Course Activity</h4>
                  <p className="text-[10px] text-muted">Recent updates from your course</p>
                </div>

                <div className="space-y-3">
                  {activityFeed.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-page-background border border-border hover:shadow-sm transition-shadow">
                        <div className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                          <Icon size={12} className={item.color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-heading truncate">{item.text}</p>
                          <p className="text-[10px] text-muted mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold text-learning-blue uppercase tracking-widest mb-3">
              Course community
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-heading leading-tight mb-5">
              A course that stays alive between lessons
            </h2>
            <p className="text-body leading-relaxed mb-8 text-base">
              Every course has a home — a place where announcements, lessons, assignments, resources, and questions come together. Learners always know what is next.
            </p>

            <div className="space-y-4">
              {[
                "New lesson published and ready to start",
                "Assignment available with due date and estimated time",
                "Teacher announcement with important updates",
                "AI lesson completed with progress recorded",
                "Question answered by the AI or escalated to teacher",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-education-green shrink-0" />
                  <p className="text-sm font-medium text-body">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
