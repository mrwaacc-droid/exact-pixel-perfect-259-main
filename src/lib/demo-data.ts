import type {
  DashboardData,
  Course,
  Lesson,
  ClassroomSession,
  LessonProgress,
  ChatMessage,
  ClassroomContext,
  StatCardData,
  CourseCardData,
  SessionCardData,
  Achievement,
  CalendarEvent,
  ProgressChartData,
  LearnerAccessProfile,
  QuickAction,
} from "./types";

export const DEMO_DASHBOARD_DATA: DashboardData = {
  studentName: "Alex Johnson",
  studentEmail: "alex.johnson@school.edu",
  stats: {
    classrooms: 5,
    completedLessons: 23,
    studyTime: "12h 35m",
    quizAverage: 87,
    streak: 7,
  },
  courses: [
    {
      id: "course-1",
      institutionId: "inst-1",
      title: "Algebra Fundamentals",
      subject: "Mathematics",
      level: "Intermediate",
      progressPercentage: 72,
      description: "Master algebraic equations, inequalities, and functions",
      totalLessons: 15,
      completedLessons: 11,
      color: "#7D2233",
      thumbnail: "📐",
    },
    {
      id: "course-2",
      institutionId: "inst-1",
      title: "World History: Ancient Civilizations",
      subject: "History",
      level: "Beginner",
      progressPercentage: 45,
      description: "Explore ancient Egypt, Greece, Rome, and more",
      totalLessons: 12,
      completedLessons: 5,
      color: "#7c3aed",
      thumbnail: "🏛️",
    },
    {
      id: "course-3",
      institutionId: "inst-2",
      title: "Introduction to Biology",
      subject: "Science",
      level: "Intermediate",
      progressPercentage: 60,
      description: "Learn about cells, genetics, and ecosystems",
      totalLessons: 20,
      completedLessons: 12,
      color: "#16a34a",
      thumbnail: "🧬",
    },
    {
      id: "course-4",
      institutionId: "inst-1",
      title: "Creative Writing Workshop",
      subject: "English",
      level: "Advanced",
      progressPercentage: 30,
      description: "Enhance your writing skills and creative expression",
      totalLessons: 10,
      completedLessons: 3,
      color: "#ea580c",
      thumbnail: "✍️",
    },
    {
      id: "course-5",
      institutionId: "inst-2",
      title: "Computer Science Basics",
      subject: "Technology",
      level: "Beginner",
      progressPercentage: 85,
      description: "Learn programming fundamentals and computational thinking",
      totalLessons: 8,
      completedLessons: 7,
      color: "#0891b2",
      thumbnail: "💻",
    },
  ],
  recentSessions: [
    {
      id: "session-1",
      title: "Quadratic Equations: Solving with Factoring",
      courseTitle: "Algebra Fundamentals",
      status: "completed",
      duration: "45 min",
      timestamp: "2 hours ago",
      subject: "Mathematics",
      thumbnail: "📐",
    },
    {
      id: "session-2",
      title: "The Rise of Ancient Egypt",
      courseTitle: "World History: Ancient Civilizations",
      status: "completed",
      duration: "38 min",
      timestamp: "5 hours ago",
      subject: "History",
      thumbnail: "🏛️",
    },
    {
      id: "session-3",
      title: "Cell Structure and Function",
      courseTitle: "Introduction to Biology",
      status: "completed",
      duration: "52 min",
      timestamp: "1 day ago",
      subject: "Science",
      thumbnail: "🧬",
    },
    {
      id: "session-4",
      title: "Variables and Data Types",
      courseTitle: "Computer Science Basics",
      status: "completed",
      duration: "35 min",
      timestamp: "2 days ago",
      subject: "Technology",
      thumbnail: "💻",
    },
    {
      id: "session-5",
      title: "Writing Effective Dialogue",
      courseTitle: "Creative Writing Workshop",
      status: "completed",
      duration: "40 min",
      timestamp: "3 days ago",
      subject: "English",
      thumbnail: "✍️",
    },
  ],
  upcomingSessions: [
    {
      id: "upcoming-1",
      title: "Quadratic Formula and Applications",
      courseTitle: "Algebra Fundamentals",
      time: "10:00 AM",
      date: "Today",
      type: "lesson",
    },
    {
      id: "upcoming-2",
      title: "Ancient Greece: Democracy and Philosophy",
      courseTitle: "World History: Ancient Civilizations",
      time: "2:30 PM",
      date: "Tomorrow",
      type: "lesson",
    },
    {
      id: "upcoming-3",
      title: "Genetics Quiz",
      courseTitle: "Introduction to Biology",
      time: "11:00 AM",
      date: "Wednesday",
      type: "quiz",
    },
  ],
};

export const DEMO_QUADRATIC_LESSON: Lesson = {
  id: "lesson-quadratic",
  courseId: "course-1",
  title: "Solving Quadratic Equations",
  difficulty: "Intermediate",
  durationMinutes: 45,
  description: "Learn to solve quadratic equations using factoring method",
  subject: "Mathematics",
  steps: [
    {
      key: "hook",
      title: "Hook - Real World Problem",
      spokenScript:
        "Hey Alex! Today we're going to learn how to solve quadratic equations. Let me show you why this is actually useful in real life. Have you ever wondered how engineers design bridges or how video game programmers create realistic physics? Quadratic equations are behind all of that!",
      captionText:
        "AI Teacher introduces quadratic equations with real-world examples like bridge engineering and video game physics.",
      whiteboardContent: [
        "Real-world applications:",
        "• Bridge design (parabolic arches)",
        "• Video game physics",
        "• Satellite trajectories",
        "• Profit optimization",
        "• Ballistic motion",
      ],
      whiteboardDescription:
        "A list showing practical applications of quadratic equations in various fields.",
      simpleExplanation:
        "Quadratic equations help us solve problems involving curves and optimization in real life.",
      focusGoal: "Generate interest by showing real-world relevance",
    },
    {
      key: "concept",
      title: "Concept - What is a Quadratic?",
      spokenScript:
        "A quadratic equation is any equation that can be written in the form ax² + bx + c = 0, where a, b, and c are numbers, and a cannot be zero. The key is that the highest power of x is 2. That's what makes it 'quadratic' - from the Latin word 'quadratus' meaning square!",
      captionText:
        "AI Teacher explains that quadratic equations have the form ax² + bx + c = 0 and the term 'quadratic' comes from Latin for 'square'.",
      whiteboardContent: [
        "Standard form: ax² + bx + c = 0",
        "Where a ≠ 0",
        "a, b, c are real numbers",
        "Highest power is 2 (x²)",
        "",
        "Example: 2x² + 5x - 3 = 0",
        "Here: a=2, b=5, c=-3",
      ],
      whiteboardDescription:
        "The standard form of a quadratic equation with an example showing the values of a, b, and c.",
      simpleExplanation:
        "A quadratic equation has x² as the highest power and looks like ax² + bx + c = 0.",
      focusGoal: "Understand the basic structure and definition of quadratic equations",
    },
    {
      key: "worked_example",
      title: "Worked Example - Solving by Factoring",
      spokenScript:
        "Let's solve this equation together: x² - 5x + 6 = 0. First, I need to find two numbers that multiply to give me 6 and add to give me -5. Think about it... What two numbers multiply to 6? 1 and 6, 2 and 3. Which of these add to -5? -2 and -3! So I can rewrite this as (x - 2)(x - 3) = 0, which means x = 2 or x = 3.",
      captionText:
        "AI Teacher demonstrates factoring a quadratic equation by finding two numbers that multiply to 6 and add to -5.",
      whiteboardContent: [
        "Solve: x² - 5x + 6 = 0",
        "",
        "Step 1: Find two numbers that:",
        "  • Multiply to give 6 (c)",
        "  • Add to give -5 (b)",
        "",
        "Pairs that multiply to 6:",
        "  1 × 6 = 6, 1 + 6 = 7  ❌",
        "  2 × 3 = 6, 2 + 3 = 5  ❌",
        "  -2 × -3 = 6, -2 + (-3) = -5  ✓",
        "",
        "Step 2: Rewrite as factors:",
        "(x - 2)(x - 3) = 0",
        "",
        "Step 3: Solve each factor:",
        "x - 2 = 0 → x = 2",
        "x - 3 = 0 → x = 3",
        "",
        "✓ Solution: x = 2 or x = 3",
      ],
      whiteboardDescription:
        "Step-by-step solution showing how to factor x² - 5x + 6 = 0 by finding the right number pair.",
      simpleExplanation:
        "We look for two numbers that multiply to the constant and add to the coefficient, then factor the equation.",
      focusGoal: "Master the factoring method step by step",
    },
    {
      key: "guided_practice",
      title: "Guided Practice - Try Together",
      spokenScript:
        "Now let's try one together. I'll guide you through it: x² + 7x + 12 = 0. What two numbers multiply to 12 and add to 7? Take your time... If you're thinking 3 and 4, you're absolutely right! So this factors as (x + 3)(x + 4) = 0, giving us x = -3 or x = -4.",
      captionText:
        "AI Teacher guides the student through solving x² + 7x + 12 = 0 by identifying that 3 and 4 are the correct numbers.",
      whiteboardContent: [
        "Practice together: x² + 7x + 12 = 0",
        "",
        "Think: What two numbers:",
        "  • Multiply to give +12?",
        "  • Add to give +7?",
        "",
        "Your turn: (take a moment to think)",
        "",
        "✓ The numbers are 3 and 4!",
        "  Because: 3 × 4 = 12 and 3 + 4 = 7",
        "",
        "Write as factors:",
        "(x + 3)(x + 4) = 0",
        "",
        "Solutions:",
        "x + 3 = 0 → x = -3",
        "x + 4 = 0 → x = -4",
      ],
      whiteboardDescription:
        "A guided practice problem showing the thinking process for factoring x² + 7x + 12 = 0.",
      simpleExplanation:
        "We follow the same steps: find the right pair of numbers, factor, and solve each part.",
      focusGoal: "Practice the factoring method with guidance",
    },
    {
      key: "independent_question",
      title: "Independent Practice",
      spokenScript:
        "Now it's your turn to try one on your own. Here's your problem: x² - 8x + 15 = 0. Remember, look for two numbers that multiply to 15 and add to -8. When you're ready, tell me your answer and show me your work!",
      captionText:
        "AI Teacher gives the student an independent practice problem: x² - 8x + 15 = 0.",
      whiteboardContent: [
        "Your turn: x² - 8x + 15 = 0",
        "",
        "Steps to follow:",
        "1. Find two numbers that multiply to 15",
        "2. Check which pair adds to -8",
        "3. Write as factors",
        "4. Solve for x",
        "",
        "Write your solution here:",
        "",
      ],
      whiteboardDescription:
        "An independent practice problem for the student to solve, with blank space for their work.",
      simpleExplanation: "Apply what you've learned to solve this new problem on your own.",
      focusGoal: "Apply factoring method independently",
    },
    {
      key: "correction",
      title: "Correction and Feedback",
      spokenScript:
        "Great work! I can see you found the right numbers. For x² - 8x + 15 = 0, you correctly identified that -3 and -5 multiply to 15 and add to -8. Your factoring (x - 3)(x - 5) = 0 is perfect, and your solutions x = 3 and x = 5 are exactly right. You're really getting the hang of this!",
      captionText:
        "AI Teacher provides positive feedback and confirms the student's solution is correct.",
      whiteboardContent: [
        "Your solution: x² - 8x + 15 = 0",
        "",
        "✓ Correct approach!",
        "",
        "Numbers found: -3 and -5",
        "  -3 × -5 = 15 ✓",
        "  -3 + (-5) = -8 ✓",
        "",
        "Factored form:",
        "(x - 3)(x - 5) = 0",
        "",
        "Solutions:",
        "x = 3 ✓   x = 5 ✓",
        "",
        "🎉 Perfect! Both solutions are correct!",
      ],
      whiteboardDescription:
        "Positive feedback showing the student's correct solution with checkmarks.",
      simpleExplanation:
        "You solved it perfectly! The right numbers are -3 and -5, giving solutions x = 3 and x = 5.",
      focusGoal: "Reinforce correct method and build confidence",
    },
    {
      key: "quiz",
      title: "Quiz - Test Your Knowledge",
      spokenScript:
        "Let's see how well you've mastered this. Here's a quick quiz question: What are the solutions to x² - 9x + 20 = 0? Think carefully about which two numbers multiply to 20 and add to -9. Choose your answer when you're ready!",
      captionText: "AI Teacher presents a quiz question to test the student's understanding.",
      whiteboardContent: [
        "📝 Quiz Question:",
        "",
        "Solve: x² - 9x + 20 = 0",
        "",
        "A) x = 2 and x = 10",
        "B) x = 4 and x = 5",
        "C) x = -4 and x = -5",
        "D) x = -2 and x = -10",
        "",
        "Think carefully:",
        "• What numbers multiply to 20?",
        "• What numbers add to -9?",
      ],
      whiteboardDescription: "A multiple choice quiz question testing factoring skills.",
      simpleExplanation:
        "Find two numbers that multiply to 20 and add to -9, then match with the correct answer choice.",
      focusGoal: "Test mastery of factoring quadratic equations",
    },
    {
      key: "summary",
      title: "Summary - What We Learned",
      spokenScript:
        "Excellent work today, Alex! You've learned how to solve quadratic equations by factoring. Remember the key steps: first, make sure the equation is in standard form ax² + bx + c = 0; then, find two numbers that multiply to 'a × c' and add to 'b'; finally, rewrite as factors and solve. Keep practicing, and you'll become a quadratic equation master!",
      captionText:
        "AI Teacher summarizes the lesson and the key steps for solving quadratic equations by factoring.",
      whiteboardContent: [
        "📚 Lesson Summary",
        "",
        "Today we learned to solve",
        "quadratic equations by factoring!",
        "",
        "Key Steps:",
        "1. Write in standard form: ax² + bx + c = 0",
        "2. Find two numbers that:",
        "   • Multiply to a × c",
        "   • Add to b",
        "3. Rewrite as factors",
        "4. Set each factor = 0",
        "5. Solve for x",
        "",
        "🎯 Practice problems:",
        "• x² + 5x + 6 = 0  →  x = -2, -3",
        "• x² - 7x + 12 = 0  →  x = 3, 4",
        "• x² + 8x + 15 = 0  →  x = -3, -5",
        "",
        "Great job today! 🌟",
      ],
      whiteboardDescription:
        "A comprehensive summary of the lesson with key steps and additional practice problems.",
      simpleExplanation:
        "To solve quadratic equations by factoring: write in standard form, find the right number pair, factor, and solve.",
      focusGoal: "Reinforce learning and provide practice material",
    },
  ],
};

export const DEMO_CLASSROOM_CONTEXT: ClassroomContext = {
  institution: {
    id: "inst-1",
    name: "Springfield Academy",
    slug: "springfield-academy",
    type: "K-12 School",
  },
  course: DEMO_DASHBOARD_DATA.courses[0],
  lesson: DEMO_QUADRATIC_LESSON,
  session: {
    id: "session-demo",
    institutionId: "inst-1",
    courseId: "course-1",
    lessonId: "lesson-quadratic",
    mode: "ai_teacher",
    status: "live",
    startTime: new Date().toISOString(),
  },
  progress: {
    currentStep: "hook",
    progressPercentage: 0,
    confusionScore: 0,
    studentLevel: "intermediate",
    teacherState: "idle",
    timeSpentMinutes: 0,
  },
  learnerAccessProfile: {
    captionsEnabled: true,
    transcriptEnabled: true,
    audioEnabled: true,
    boardDescriptionsEnabled: true,
    screenReaderOptimized: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardShortcutsEnabled: true,
    voiceInputEnabled: true,
    speechRate: 1.0,
    fontScale: 1.0,
    lessonPace: "normal",
    explanationStyle: "standard",
  },
  messages: [],
};

export const DEMO_QUICK_ACTIONS: QuickAction[] = [
  {
    label: "I don't understand",
    message: "I don't understand. Can you explain it differently?",
    icon: "❓",
    category: "understanding",
  },
  {
    label: "Repeat",
    message: "Can you repeat that please?",
    icon: "🔁",
    category: "understanding",
  },
  {
    label: "Give example",
    message: "Give me a real-world example.",
    icon: "💡",
    category: "understanding",
  },
  {
    label: "Slow down",
    message: "Please slow down and break it into smaller steps.",
    icon: "🐢",
    category: "pace",
  },
  {
    label: "Speed up",
    message: "I understand this, can we move a bit faster?",
    icon: "⚡",
    category: "pace",
  },
  {
    label: "Test me",
    message: "I'm ready — test me with a question.",
    icon: "🎯",
    category: "testing",
  },
  {
    label: "Give me a hint",
    message: "Can you give me a hint without telling me the answer?",
    icon: "🔍",
    category: "practice",
  },
  {
    label: "Why is this important?",
    message: "Why is this important? How will I use this in real life?",
    icon: "❓",
    category: "understanding",
  },
];

export const DEMO_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    earned: true,
    earnedDate: "2024-01-15",
    rarity: "common",
  },
  {
    id: "ach-2",
    title: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    earned: true,
    earnedDate: "2024-01-20",
    rarity: "rare",
  },
  {
    id: "ach-3",
    title: "Perfect Score",
    description: "Score 100% on a quiz",
    icon: "💯",
    earned: false,
    rarity: "epic",
  },
  {
    id: "ach-4",
    title: "Quiz Master",
    description: "Complete 10 quizzes",
    icon: "🏆",
    earned: false,
    rarity: "epic",
  },
  {
    id: "ach-5",
    title: "Math Whiz",
    description: "Complete all algebra lessons",
    icon: "🧮",
    earned: false,
    rarity: "legendary",
  },
  {
    id: "ach-6",
    title: "Quick Learner",
    description: "Complete 5 lessons in one day",
    icon: "⚡",
    earned: false,
    rarity: "rare",
  },
];

export const DEMO_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "Quadratic Equations Quiz",
    course: "Algebra Fundamentals",
    date: "2024-01-25",
    time: "10:00 AM",
    type: "quiz",
  },
  {
    id: "cal-2",
    title: "History Project Due",
    course: "World History",
    date: "2024-01-28",
    time: "11:59 PM",
    type: "other",
  },
  {
    id: "cal-3",
    title: "Biology Lab Report",
    course: "Introduction to Biology",
    date: "2024-01-30",
    time: "3:00 PM",
    type: "lesson",
  },
];

export const DEMO_PROGRESS_CHART: ProgressChartData[] = [
  { subject: "Mathematics", percentage: 72, color: "#7D2233" },
  { subject: "Science", percentage: 60, color: "#16a34a" },
  { subject: "History", percentage: 45, color: "#7c3aed" },
  { subject: "English", percentage: 30, color: "#ea580c" },
  { subject: "Technology", percentage: 85, color: "#0891b2" },
];

export const getDemoLessonById = (lessonId: string): Lesson | null => {
  if (lessonId === "quadratic" || lessonId === "lesson-quadratic") {
    return DEMO_QUADRATIC_LESSON;
  }
  return null;
};

export const getDemoCourseById = (courseId: string): Course | null => {
  return DEMO_DASHBOARD_DATA.courses.find((c) => c.id === courseId) || null;
};

export const getDemoSessionById = (sessionId: string): ClassroomSession | null => {
  return DEMO_DASHBOARD_DATA.recentSessions.find((s) => s.id === sessionId)
    ? {
        id: sessionId,
        institutionId: "inst-1",
        courseId: "course-1",
        lessonId: "lesson-1",
        mode: "ai_teacher",
        status: "completed",
      }
    : null;
};
