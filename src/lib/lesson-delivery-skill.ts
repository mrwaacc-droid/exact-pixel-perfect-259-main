export type LessonDeliverySkillStep = {
  id: string;
  title: string;
  purpose: string;
  teacherAction: string;
  classroomSignal: string;
  href: string;
  status: "ready" | "needs_attention" | "practice";
};

export type LessonDeliverySkillPlan = {
  readinessScore: number;
  statusLabel: string;
  summary: string;
  steps: LessonDeliverySkillStep[];
};

export type LessonDeliverySkillInput = {
  lessonsReady: number;
  pendingReview: number;
  sessionsToday: number;
  onlineStudents: number;
  upcomingSessionTitle?: string | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function buildLessonDeliverySkillPlan({
  lessonsReady,
  pendingReview,
  sessionsToday,
  onlineStudents,
  upcomingSessionTitle,
}: LessonDeliverySkillInput): LessonDeliverySkillPlan {
  const totalLessonSignals = Math.max(lessonsReady + pendingReview, 1);
  const reviewPenalty = pendingReview / totalLessonSignals;
  const readinessScore = clamp(
    Math.round(62 + lessonsReady * 4 + sessionsToday * 5 + onlineStudents * 2 - reviewPenalty * 28),
    35,
    96,
  );

  const statusLabel =
    readinessScore >= 82 ? "Ready to deliver" : readinessScore >= 64 ? "Prepare before class" : "Needs review";

  const summary =
    pendingReview > 0
      ? `${pendingReview} lesson${pendingReview === 1 ? "" : "s"} need review before delivery.`
      : upcomingSessionTitle
        ? `${upcomingSessionTitle} is ready for a structured classroom run.`
        : "Use the delivery skill to prepare the next teachable session.";

  return {
    readinessScore,
    statusLabel,
    summary,
    steps: [
      {
        id: "frame",
        title: "Frame the lesson",
        purpose: "Open with the goal, prerequisite check, and why the topic matters.",
        teacherAction: "State the objective, ask one readiness question, and name the support path.",
        classroomSignal: upcomingSessionTitle ? `Next: ${upcomingSessionTitle}` : "No session selected",
        href: "/teacher/sessions",
        status: sessionsToday > 0 || upcomingSessionTitle ? "ready" : "practice",
      },
      {
        id: "board",
        title: "Teach from the board",
        purpose: "Write less, explain more, and keep every board item readable.",
        teacherAction: "Use short board lines, read them exactly, then explain the meaning.",
        classroomSignal: `${lessonsReady} lesson${lessonsReady === 1 ? "" : "s"} ready`,
        href: "/teacher/lessons",
        status: lessonsReady > 0 ? "ready" : "needs_attention",
      },
      {
        id: "check",
        title: "Check understanding",
        purpose: "Stop passive delivery by requiring small learner responses.",
        teacherAction: "Ask one midpoint question and one confidence check before moving on.",
        classroomSignal:
          pendingReview > 0 ? "Review checkpoints before class" : "Checkpoints look current",
        href: "/teacher/lessons",
        status: pendingReview > 0 ? "needs_attention" : "ready",
      },
      {
        id: "intervene",
        title: "Intervene early",
        purpose: "Respond to confusion before the learner gives up.",
        teacherAction: "Slow down, reteach the smallest missed step, and offer a second example.",
        classroomSignal: `${onlineStudents} learner${onlineStudents === 1 ? "" : "s"} active now`,
        href: "/teacher/supervision",
        status: onlineStudents > 0 ? "ready" : "practice",
      },
      {
        id: "evidence",
        title: "Close with evidence",
        purpose: "End with transcript, notes, weak areas, and next action.",
        teacherAction: "Save the summary, assign review, and make progress visible to families.",
        classroomSignal: pendingReview > 0 ? "Evidence incomplete until review clears" : "Evidence path ready",
        href: "/teacher/analytics",
        status: pendingReview > 0 ? "needs_attention" : "ready",
      },
    ],
  };
}
