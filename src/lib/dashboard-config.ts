import {
  Accessibility,
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  Clipboard,
  CreditCard,
  DoorOpen,
  Eye,
  FileText,
  Folder,
  GraduationCap,
  HelpCircle,
  Home,
  Layers,
  LifeBuoy,
  MessageSquare,
  Monitor,
  Notebook,
  Palette,
  Phone,
  Search,
  Server,
  Settings,
  Shield,
  Sparkles,
  type LucideIcon,
  FileCheck,
  FolderUp,
  Radio,
  School,
  ScrollText,
  UserPlus,
  Users,
  Video,
  Zap,
} from "lucide-react";
import type { LearnerType, TeacherType, UserPersona, UserRole } from "./types";

export type DashboardRole =
  | "learner"
  | "teacher"
  | "institution"
  | "platform_admin"
  | "parent"
  | "private_teacher"
  | "institution_teacher"
  | "kingpin_teacher"
  | "institution_learner"
  | "private_learner"
  | "teacher_enrolled_learner";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
};

export type DashboardConfig = {
  role: DashboardRole;
  title: string;
  subtitle: string;
  primaryAction: {
    label: string;
    href: string;
  };
  sidebar: SidebarItem[];
  sidebarGroups?: SidebarGroup[];
  searchPlaceholder: string;
  settingsHref: string;
  roleLabel: string;
  persona?: UserPersona;
  teacherType?: TeacherType;
  learnerType?: LearnerType;
};

const LAUNCH_NAV_ALLOWLIST: Partial<Record<DashboardRole, string[]>> = {
  learner: [
    "/student/dashboard",
    "/student/classrooms",
    "/student/courses",
    "/student/lessons",
    "/student/calendar",
    "/student/resources",
    "/student/notes",
    "/student/transcripts",
    "/student/progress",
    "/student/assignments",
    "/student/quizzes",
    "/student/messages",
    "/student/access",
    "/student/search",
    "/student/notifications",
    "/student/settings",
  ],
  institution_learner: [
    "/student/dashboard",
    "/student/classrooms",
    "/student/courses",
    "/student/lessons",
    "/student/calendar",
    "/student/resources",
    "/student/notes",
    "/student/transcripts",
    "/student/progress",
    "/student/assignments",
    "/student/quizzes",
    "/student/messages",
    "/student/access",
    "/student/notifications",
    "/student/settings",
  ],
  private_learner: [
    "/student/dashboard",
    "/student/courses",
    "/student/lessons",
    "/student/classrooms",
    "/student/calendar",
    "/student/resources",
    "/student/notes",
    "/student/transcripts",
    "/student/progress",
    "/student/messages",
    "/student/notifications",
    "/student/settings",
  ],
  teacher_enrolled_learner: [
    "/student/dashboard",
    "/student/classrooms",
    "/student/courses",
    "/student/lessons",
    "/student/resources",
    "/student/notes",
    "/student/transcripts",
    "/student/progress",
    "/student/messages",
    "/student/notifications",
    "/student/settings",
  ],
  teacher: [
    "/teacher/dashboard",
    "/teacher/courses",
    "/teacher/lessons",
    "/teacher/sessions",
    "/teacher/rentals",
    "/teacher/students",
    "/teacher/resources",
    "/teacher/messages",
    "/teacher/supervision",
    "/teacher/analytics",
    "/teacher/notifications",
    "/teacher/settings",
  ],
  private_teacher: [
    "/teacher/dashboard",
    "/teacher/courses",
    "/teacher/lessons",
    "/teacher/students",
    "/teacher/sessions",
    "/teacher/rentals",
    "/teacher/resources",
    "/teacher/messages",
    "/teacher/analytics",
    "/teacher/notifications",
    "/teacher/settings",
  ],
  institution_teacher: [
    "/teacher/dashboard",
    "/teacher/courses",
    "/teacher/lessons",
    "/teacher/sessions",
    "/teacher/students",
    "/teacher/resources",
    "/teacher/messages",
    "/teacher/supervision",
    "/teacher/analytics",
    "/teacher/notifications",
    "/teacher/settings",
  ],
  kingpin_teacher: [
    "/teacher/dashboard",
    "/teacher/courses",
    "/teacher/lessons",
    "/teacher/sessions",
    "/teacher/students",
    "/teacher/resources",
    "/teacher/messages",
    "/teacher/supervision",
    "/teacher/analytics",
    "/teacher/notifications",
    "/teacher/settings",
  ],
  institution: [
    "/institution/dashboard",
    "/institution/programmes",
    "/institution/courses",
    "/institution/lesson-generation",
    "/institution/sessions",
    "/institution/resources",
    "/institution/teachers",
    "/institution/students",
    "/institution/enrollments",
    "/institution/analytics",
    "/institution/activity",
    "/institution/rentals",
    "/institution/billing",
    "/institution/notifications",
    "/institution/settings",
  ],
  platform_admin: [
    "/admin/dashboard",
    "/admin/users",
    "/admin/institutions",
    "/admin/programmes",
    "/admin/courses",
    "/admin/lessons",
    "/admin/materials",
    "/admin/lesson-generation",
    "/admin/realtime",
    "/admin/ai-settings",
    "/admin/plans",
    "/admin/usage",
    "/admin/support",
    "/admin/activity",
    "/admin/audit-logs",
    "/admin/health",
    "/admin/notifications",
    "/admin/settings",
  ],
  parent: [
    "/parent/dashboard",
    "/parent/learners",
    "/parent/progress",
    "/parent/sessions",
    "/parent/reports",
    "/parent/messages",
    "/parent/notifications",
    "/parent/settings",
  ],
};

const LAUNCH_PRIMARY_ACTION_OVERRIDES: Partial<
  Record<DashboardRole, DashboardConfig["primaryAction"]>
> = {
  institution: { label: "Manage Courses", href: "/institution/courses" },
  platform_admin: { label: "View Institutions", href: "/admin/institutions" },
  parent: { label: "Parent dashboard", href: "/parent/dashboard" },
};

export function applyLaunchVisibility(config: DashboardConfig): DashboardConfig {
  const allowed = LAUNCH_NAV_ALLOWLIST[config.role];
  if (!allowed?.length) {
    return {
      ...config,
      sidebar: [],
      primaryAction: LAUNCH_PRIMARY_ACTION_OVERRIDES[config.role] ?? config.primaryAction,
    };
  }

  const allowedSet = new Set(allowed);
  const sidebar = config.sidebar.filter((item) => allowedSet.has(item.href));
  const primaryAction = LAUNCH_PRIMARY_ACTION_OVERRIDES[config.role] ?? config.primaryAction;

  if (sidebar === config.sidebar && primaryAction === config.primaryAction) {
    return config;
  }

  return {
    ...config,
    sidebar,
    primaryAction,
  };
}

export const dashboardConfigs: Record<DashboardRole, DashboardConfig> = {
  learner: {
    role: "learner",
    title: "Learner Dashboard",
    subtitle: "Continue learning, enter classrooms, and track your progress.",
    primaryAction: { label: "Enter Classroom", href: "/student/classrooms" },
    searchPlaceholder: "Search lessons, notes, resources...",
    settingsHref: "/student/settings",
    roleLabel: "Learner",
    sidebar: [
      { label: "Dashboard", href: "/student/dashboard", icon: Home },
      { label: "My Classrooms", href: "/student/classrooms", icon: Monitor },
      { label: "My Courses", href: "/student/courses", icon: BookOpen },
      { label: "Lessons", href: "/student/lessons", icon: FileText },
      { label: "Calendar", href: "/student/calendar", icon: Calendar },
      { label: "Resources", href: "/student/resources", icon: Folder },
      { label: "Notes", href: "/student/notes", icon: Notebook },
      { label: "Transcripts", href: "/student/transcripts", icon: ScrollText },
      { label: "Progress", href: "/student/progress", icon: Activity },
      { label: "Assignments", href: "/student/assignments", icon: Clipboard },
      { label: "Quizzes", href: "/student/quizzes", icon: HelpCircle },
      { label: "Messages", href: "/student/messages", icon: MessageSquare },
      { label: "Learning Access", href: "/student/access", icon: Accessibility },
      { label: "Search", href: "/student/search", icon: Search },
      { label: "Notifications", href: "/student/notifications", icon: Bell },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ],
  },
  institution_learner: {
    role: "institution_learner",
    persona: "institution_learner",
    learnerType: "institution",
    title: "Institution Learner Dashboard",
    subtitle: "Track institution courses, class context, and scheduled learning sessions.",
    primaryAction: { label: "Enter Classroom", href: "/student/classrooms" },
    searchPlaceholder: "Search lessons, class resources, notes...",
    settingsHref: "/student/settings",
    roleLabel: "Institution Learner",
    sidebar: [
      { label: "Dashboard", href: "/student/dashboard", icon: Home },
      { label: "My Classrooms", href: "/student/classrooms", icon: Monitor },
      { label: "Institution Courses", href: "/student/courses", icon: BookOpen },
      { label: "Lessons", href: "/student/lessons", icon: FileText },
      { label: "Calendar", href: "/student/calendar", icon: Calendar },
      { label: "Resources", href: "/student/resources", icon: Folder },
      { label: "Notes", href: "/student/notes", icon: Notebook },
      { label: "Transcripts", href: "/student/transcripts", icon: ScrollText },
      { label: "Progress", href: "/student/progress", icon: Activity },
      { label: "Assignments", href: "/student/assignments", icon: Clipboard },
      { label: "Quizzes", href: "/student/quizzes", icon: HelpCircle },
      { label: "Messages", href: "/student/messages", icon: MessageSquare },
      { label: "Learning Access", href: "/student/access", icon: Accessibility },
      { label: "Notifications", href: "/student/notifications", icon: Bell },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ],
  },
  private_learner: {
    role: "private_learner",
    persona: "private_learner",
    learnerType: "private",
    title: "Private Learner Dashboard",
    subtitle: "Access your personal courses, sessions, and progress outside institution workflows.",
    primaryAction: { label: "Continue Learning", href: "/student/courses" },
    searchPlaceholder: "Search lessons, personal notes, resources...",
    settingsHref: "/student/settings",
    roleLabel: "Private Learner",
    sidebar: [
      { label: "Dashboard", href: "/student/dashboard", icon: Home },
      { label: "My Courses", href: "/student/courses", icon: BookOpen },
      { label: "Lessons", href: "/student/lessons", icon: FileText },
      { label: "Sessions", href: "/student/classrooms", icon: Video },
      { label: "Calendar", href: "/student/calendar", icon: Calendar },
      { label: "Resources", href: "/student/resources", icon: Folder },
      { label: "Notes", href: "/student/notes", icon: Notebook },
      { label: "Progress", href: "/student/progress", icon: Activity },
      { label: "Messages", href: "/student/messages", icon: MessageSquare },
      { label: "Notifications", href: "/student/notifications", icon: Bell },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ],
  },
  teacher_enrolled_learner: {
    role: "teacher_enrolled_learner",
    persona: "teacher_enrolled_learner",
    learnerType: "teacher_enrolled",
    title: "Teacher-Enrolled Learner Dashboard",
    subtitle: "Follow the courses, sessions, and support channels provided by your teacher.",
    primaryAction: { label: "Join Session", href: "/student/classrooms" },
    searchPlaceholder: "Search teacher lessons, notes, resources...",
    settingsHref: "/student/settings",
    roleLabel: "Teacher-Enrolled Learner",
    sidebar: [
      { label: "Dashboard", href: "/student/dashboard", icon: Home },
      { label: "Teacher Sessions", href: "/student/classrooms", icon: Monitor },
      { label: "My Courses", href: "/student/courses", icon: BookOpen },
      { label: "Lessons", href: "/student/lessons", icon: FileText },
      { label: "Resources", href: "/student/resources", icon: Folder },
      { label: "Notes", href: "/student/notes", icon: Notebook },
      { label: "Progress", href: "/student/progress", icon: Activity },
      { label: "Messages", href: "/student/messages", icon: MessageSquare },
      { label: "Notifications", href: "/student/notifications", icon: Bell },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ],
  },

  /* ─── Teacher ──────────────────────────────────────────────────── */
  teacher: {
    role: "teacher",
    title: "Teacher Dashboard",
    subtitle: "Prepare lessons, start classes, and support learners.",
    primaryAction: { label: "Start Class", href: "/teacher/sessions" },
    searchPlaceholder: "Search courses, lessons, students...",
    settingsHref: "/teacher/settings",
    roleLabel: "Teacher",
    sidebar: [
      { label: "Dashboard", href: "/teacher/dashboard", icon: Home },
      { label: "My Courses", href: "/teacher/courses", icon: BookOpen },
      { label: "Lessons", href: "/teacher/lessons", icon: FileText },
      { label: "Sessions", href: "/teacher/sessions", icon: Video },
      { label: "Rentals", href: "/teacher/rentals", icon: DoorOpen },
      { label: "Resources", href: "/teacher/resources", icon: Folder },
      { label: "Students", href: "/teacher/students", icon: Users },
      { label: "Supervision", href: "/teacher/supervision", icon: Monitor },
      { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
      { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
      { label: "Notifications", href: "/teacher/notifications", icon: Bell },
      { label: "Settings", href: "/teacher/settings", icon: Settings },
    ],
  },
  private_teacher: {
    role: "private_teacher",
    persona: "private_teacher",
    teacherType: "private",
    title: "Private Teacher Dashboard",
    subtitle: "Manage your verification status, courses, learners, and private teaching sessions.",
    primaryAction: { label: "Create Course", href: "/teacher/courses" },
    searchPlaceholder: "Search own courses, learners, sessions...",
    settingsHref: "/teacher/settings",
    roleLabel: "Private Teacher",
    sidebar: [
      { label: "Dashboard", href: "/teacher/dashboard", icon: Home },
      { label: "Verification", href: "/teacher/settings", icon: FileCheck },
      { label: "My Courses", href: "/teacher/courses", icon: BookOpen },
      { label: "Lessons", href: "/teacher/lessons", icon: FileText },
      { label: "Learners", href: "/teacher/students", icon: Users },
      { label: "Sessions", href: "/teacher/sessions", icon: Video },
      { label: "Rentals", href: "/teacher/rentals", icon: DoorOpen },
      { label: "Resources", href: "/teacher/resources", icon: FolderUp },
      { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
      { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
      { label: "Notifications", href: "/teacher/notifications", icon: Bell },
      { label: "Settings", href: "/teacher/settings", icon: Settings },
    ],
  },
  institution_teacher: {
    role: "institution_teacher",
    persona: "institution_teacher",
    teacherType: "institution",
    title: "Institution Teacher Dashboard",
    subtitle: "Deliver assigned institution courses, classes, and supervised learning sessions.",
    primaryAction: { label: "View Assignments", href: "/teacher/courses" },
    searchPlaceholder: "Search assigned classes, lessons, learners...",
    settingsHref: "/teacher/settings",
    roleLabel: "Institution Teacher",
    sidebar: [
      { label: "Dashboard", href: "/teacher/dashboard", icon: Home },
      { label: "Assigned Courses", href: "/teacher/courses", icon: BookOpen },
      { label: "Lessons", href: "/teacher/lessons", icon: FileText },
      { label: "Classes & Sessions", href: "/teacher/sessions", icon: Video },
      { label: "Resources", href: "/teacher/resources", icon: Folder },
      { label: "Assigned Learners", href: "/teacher/students", icon: Users },
      { label: "Supervision", href: "/teacher/supervision", icon: Monitor },
      { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
      { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
      { label: "Notifications", href: "/teacher/notifications", icon: Bell },
      { label: "Settings", href: "/teacher/settings", icon: Settings },
    ],
  },
  kingpin_teacher: {
    role: "kingpin_teacher",
    persona: "kingpin_teacher",
    teacherType: "kingpin",
    title: "KingPin Teacher Dashboard",
    subtitle: "Deliver KingPin-owned courses and maintain quality across assigned learner groups.",
    primaryAction: { label: "Open Delivery Queue", href: "/teacher/sessions" },
    searchPlaceholder: "Search KingPin courses, groups, sessions...",
    settingsHref: "/teacher/settings",
    roleLabel: "KingPin Teacher",
    sidebar: [
      { label: "Dashboard", href: "/teacher/dashboard", icon: Home },
      { label: "KingPin Courses", href: "/teacher/courses", icon: School },
      { label: "Lessons", href: "/teacher/lessons", icon: FileText },
      { label: "Delivery Queue", href: "/teacher/sessions", icon: Video },
      { label: "Learner Groups", href: "/teacher/students", icon: Users },
      { label: "Quality & Supervision", href: "/teacher/supervision", icon: Shield },
      { label: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
      { label: "Messages", href: "/teacher/messages", icon: MessageSquare },
      { label: "Notifications", href: "/teacher/notifications", icon: Bell },
      { label: "Settings", href: "/teacher/settings", icon: Settings },
    ],
  },

  /* ─── Institution Admin ────────────────────────────────────────── */
  institution: {
    role: "institution",
    title: "Institution Dashboard",
    subtitle: "Manage programmes, courses, teachers, students, and learning materials.",
    primaryAction: { label: "Create Programme", href: "/institution/programmes/new" },
    searchPlaceholder: "Search students, teachers, courses, programmes...",
    settingsHref: "/institution/settings",
    roleLabel: "Institution Admin",
    sidebar: [
      { label: "Dashboard", href: "/institution/dashboard", icon: Home },
      { label: "Programmes", href: "/institution/programmes", icon: Layers },
      { label: "Courses", href: "/institution/courses", icon: BookOpen },
      { label: "Lesson Generation", href: "/institution/lesson-generation", icon: Sparkles },
      { label: "Classrooms / Sessions", href: "/institution/sessions", icon: Video },
      { label: "Resources", href: "/institution/resources", icon: Folder },
      { label: "Teachers", href: "/institution/teachers", icon: GraduationCap },
      { label: "Students", href: "/institution/students", icon: Users },
      { label: "Enrollments", href: "/institution/enrollments", icon: UserPlus },
      { label: "Progress", href: "/institution/analytics", icon: Activity },
      { label: "Activity", href: "/institution/activity", icon: Radio },
      { label: "Rentals", href: "/institution/rentals", icon: DoorOpen },
      { label: "Billing", href: "/institution/billing", icon: CreditCard },
      { label: "Notifications", href: "/institution/notifications", icon: Bell },
      { label: "Settings", href: "/institution/settings", icon: Settings },
    ],
  },

  /* ─── Platform Admin ───────────────────────────────────────────── */
  platform_admin: {
    role: "platform_admin",
    title: "Platform Admin",
    subtitle: "Manage institutions, KingPin courses, AI settings, and platform health.",
    primaryAction: { label: "View Institutions", href: "/admin/institutions" },
    searchPlaceholder: "Search institutions, users, courses, jobs...",
    settingsHref: "/admin/settings",
    roleLabel: "Platform Admin",
    sidebar: [
      { label: "Dashboard", href: "/admin/dashboard", icon: Home },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Institutions", href: "/admin/institutions", icon: Building2 },
      { label: "KingPin Courses", href: "/admin/kingpin-courses", icon: School },
      { label: "Programmes", href: "/admin/programmes", icon: Layers },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Lessons", href: "/admin/lessons", icon: FileText },
      { label: "Materials", href: "/admin/materials", icon: Folder },
      { label: "Lesson Generation", href: "/admin/lesson-generation", icon: Sparkles },
      { label: "Realtime", href: "/admin/realtime", icon: Radio },
      { label: "AI Settings", href: "/admin/ai-settings", icon: Brain },
      { label: "Plans", href: "/admin/plans", icon: CreditCard },
      { label: "Usage", href: "/admin/usage", icon: BarChart3 },
      { label: "Support", href: "/admin/support", icon: LifeBuoy },
      { label: "Activity", href: "/admin/activity", icon: Activity },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { label: "System Health", href: "/admin/health", icon: Server },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },

  /* ─── Parent ───────────────────────────────────────────────────── */
  parent: {
    role: "parent",
    title: "Parent Dashboard",
    subtitle: "Monitor learner progress, sessions, reports, and feedback.",
    primaryAction: { label: "View Report", href: "/parent/reports" },
    searchPlaceholder: "Search reports, learners, sessions...",
    settingsHref: "/parent/settings",
    roleLabel: "Parent",
    sidebar: [
      { label: "Dashboard", href: "/parent/dashboard", icon: Home },
      { label: "Learners", href: "/parent/learners", icon: Users },
      { label: "Progress", href: "/parent/progress", icon: BarChart3 },
      { label: "Sessions", href: "/parent/sessions", icon: Video },
      { label: "Reports", href: "/parent/reports", icon: FileText },
      { label: "Messages", href: "/parent/messages", icon: MessageSquare },
      { label: "Notifications", href: "/parent/notifications", icon: Bell },
      { label: "Settings", href: "/parent/settings", icon: Settings },
    ],
  },
};

export type DashboardPersonaInput = {
  role: UserRole;
  persona?: UserPersona | null;
  teacherType?: TeacherType | null;
  learnerType?: LearnerType | null;
};

export function resolveDashboardRole({
  role,
  persona,
  teacherType,
  learnerType,
}: DashboardPersonaInput): DashboardRole {
  if (persona && persona in dashboardConfigs) {
    return persona as DashboardRole;
  }

  switch (role) {
    case "platform_admin":
      return "platform_admin";
    case "institution_admin":
    case "owner":
      return "institution";
    case "teacher":
      switch (teacherType) {
        case "private":
          return "private_teacher";
        case "kingpin":
          return "kingpin_teacher";
        case "institution":
          return "institution_teacher";
        default:
          return "teacher";
      }
    case "student":
      switch (learnerType) {
        case "private":
          return "private_learner";
        case "teacher_enrolled":
          return "teacher_enrolled_learner";
        case "institution":
          return "institution_learner";
        default:
          return "learner";
      }
    case "parent":
      return "parent";
    default:
      return "learner";
  }
}

export function isTeacherDashboardRole(role: DashboardRole): boolean {
  return (
    role === "teacher" ||
    role === "private_teacher" ||
    role === "institution_teacher" ||
    role === "kingpin_teacher"
  );
}

export function isLearnerDashboardRole(role: DashboardRole): boolean {
  return (
    role === "learner" ||
    role === "institution_learner" ||
    role === "private_learner" ||
    role === "teacher_enrolled_learner"
  );
}
