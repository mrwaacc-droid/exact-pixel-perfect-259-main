export type ParentLearner = {
  id: string;
  name: string;
  level: string;
  institution: string;
  activeCourse: string;
  progress: number;
  quizAverage: number;
  studyTime: string;
  streak: number;
  supportNeed: string;
  nextSession: string;
  lastActivity: string;
};

export type ParentSession = {
  id: string;
  learner: string;
  title: string;
  course: string;
  time: string;
  status: "upcoming" | "completed" | "needs_review";
  evidence: string;
};

export type ParentMessage = {
  id: string;
  from: string;
  learner: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
};

export type ParentReport = {
  id: string;
  learner: string;
  title: string;
  period: string;
  summary: string;
  href: string;
};

export const parentLearners: ParentLearner[] = [
  {
    id: "amara",
    name: "Amara Otieno",
    level: "Form 2",
    institution: "Klassruum Demo Academy",
    activeCourse: "Mathematics Form 2",
    progress: 72,
    quizAverage: 84,
    studyTime: "6h 20m",
    streak: 5,
    supportNeed: "Factoring word problems",
    nextSession: "Today, 2:00 PM",
    lastActivity: "Completed Quadratic Equations checkpoint",
  },
  {
    id: "brian",
    name: "Brian Mwangi",
    level: "Grade 8",
    institution: "Klassruum Demo Academy",
    activeCourse: "English Grammar",
    progress: 58,
    quizAverage: 76,
    studyTime: "4h 05m",
    streak: 3,
    supportNeed: "Sentence structure practice",
    nextSession: "Tomorrow, 10:30 AM",
    lastActivity: "Asked for help with parts of speech",
  },
];

export const parentSessions: ParentSession[] = [
  {
    id: "session-1",
    learner: "Amara Otieno",
    title: "Chemical Bonding",
    course: "KCSE Chemistry Revision",
    time: "Today, 2:00 PM",
    status: "upcoming",
    evidence: "Teacher-reviewed lesson, captions ready",
  },
  {
    id: "session-2",
    learner: "Brian Mwangi",
    title: "Parts of Speech",
    course: "English Grammar",
    time: "Tomorrow, 10:30 AM",
    status: "upcoming",
    evidence: "Extra support mode recommended",
  },
  {
    id: "session-3",
    learner: "Amara Otieno",
    title: "Quadratic Equations",
    course: "Mathematics Form 2",
    time: "Yesterday, 4:10 PM",
    status: "completed",
    evidence: "84% checkpoint score, transcript saved",
  },
];

export const parentMessages: ParentMessage[] = [
  {
    id: "message-1",
    from: "Ms. Njeri",
    learner: "Amara Otieno",
    subject: "Strong progress in algebra",
    preview: "Amara is solving factoring steps independently. The next support area is word problems.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: "message-2",
    from: "Learning Support",
    learner: "Brian Mwangi",
    subject: "Practice recommendation",
    preview: "Brian may benefit from slower-paced grammar examples before the next checkpoint.",
    time: "Yesterday",
  },
];

export const parentReports: ParentReport[] = [
  {
    id: "report-1",
    learner: "Amara Otieno",
    title: "Weekly mathematics progress",
    period: "This week",
    summary: "Improved accuracy in factoring from 68% to 84%; one weak area remains.",
    href: "/parent/reports",
  },
  {
    id: "report-2",
    learner: "Brian Mwangi",
    title: "English learning summary",
    period: "Last 7 days",
    summary: "Completed two grammar lessons and used extra-support prompts three times.",
    href: "/parent/reports",
  },
];
