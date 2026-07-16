import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/pages/LandingPage";
import {
  createSeoHead,
  faqSchema,
  organizationSchema,
  softwareApplicationSchema,
  breadcrumbSchema,
  itemListSchema,
  SITE_URL,
} from "@/lib/seo";

/* SEO FAQ data mirrored for JSON-LD structured data (FAQPage). */
const FAQ_ITEMS = [
  {
    question: "What is Klassruum and how does it work?",
    answer:
      "Klassruum is an AI-powered virtual classroom platform that turns institution-approved course materials into structured, taught lessons. An AI teacher delivers each lesson with voice narration, whiteboard work, live captions, comprehension questions, and saved progress — giving every learner a consistent, high-quality classroom experience.",
  },
  {
    question: "How does the AI teacher deliver lessons?",
    answer:
      "The AI teacher follows a pre-developed lesson plan step by step: it introduces the topic, writes key points on the whiteboard, explains concepts aloud, asks checkpoint questions, and adapts its pacing when a learner shows signs of confusion. It uses only the institution's approved materials — not the open web.",
  },
  {
    question: "Is Klassruum just a chatbot or AI tutor?",
    answer:
      "No. Klassruum delivers a complete, structured lesson from start to finish inside a virtual classroom — not a chat window. The AI teacher speaks, writes on the board, asks questions, detects difficulty, and produces learning evidence. The classroom is the product.",
  },
  {
    question: "Can parents track their child's learning progress?",
    answer:
      "Yes. The Family View gives parents a clear picture of their child's learning: courses enrolled, progress percentages, lessons completed, time spent, and supportive updates like 'Making steady progress'. Parents see encouraging, transparent information rather than surveillance-style metrics.",
  },
  {
    question: "What is the difference between AI-led, human-led, and hybrid classrooms?",
    answer:
      "In AI-led mode, the AI teacher delivers the full lesson autonomously. In human-led mode, a teacher controls the session while the AI provides board work and suggested questions. In hybrid mode, the AI handles routine instruction while the human teacher focuses on individual support and complex questions.",
  },
  {
    question: "How does Klassruum handle assignments and homework?",
    answer:
      "Assignments are linked to specific lessons with clear due dates, estimated completion times, and attached resources. Learners see their work organised by status: To do, In progress, Submitted, Feedback received, and Completed.",
  },
  {
    question: "What learning evidence does Klassruum generate?",
    answer:
      "Every session automatically produces a transcript, completion rate, time spent record, questions asked log, saved notes, and areas needing review. Evidence can be exported as PDF transcripts, CSV progress reports, or weekly summaries.",
  },
  {
    question: "How does Klassruum protect learner data and privacy?",
    answer:
      "Klassruum uses role-based access control, institution-controlled content, private learner records, and strict AI-data boundaries. Data retention is configurable per institution, full audit history is maintained, and data export and deletion are supported. The platform is designed for GDPR compliance.",
  },
  {
    question: "Can institutions upload and teach from their own course content?",
    answer:
      "Yes. Upload PDFs, slides, documents, syllabi, and images, and Klassruum generates structured lesson plans for a teacher or admin to review and publish. Nothing is taught without institutional approval.",
  },
  {
    question: "How accessible is Klassruum for learners with disabilities?",
    answer:
      "Accessibility is built into every layer: live captions, full transcripts, keyboard navigation, screen reader support, high contrast mode, large text, reduced motion, focus mode, adjustable speech speed, and text-first or voice-first question modes. Klassruum is designed to meet WCAG 2.2 accessibility standards.",
  },
  {
    question: "Does Klassruum support multiple languages?",
    answer:
      "Yes. Klassruum supports separate interface and teaching languages. A learner may use Swahili for the interface while learning in English with English captions and Swahili glossary support.",
  },
  {
    question: "What types of institutions use Klassruum?",
    answer:
      "Klassruum is built for schools, universities, training organisations, tutoring centres, NGOs, and online academies. There are separate dashboard experiences for learners, teachers, institution administrators, and parents.",
  },
];

const SOLUTIONS_ITEMS = [
  { name: "Schools", url: `${SITE_URL}/solutions/schools`, description: "AI classroom delivery for K-12 schools" },
  { name: "Universities", url: `${SITE_URL}/solutions/universities`, description: "Scalable AI teaching for higher education" },
  { name: "Training Providers", url: `${SITE_URL}/solutions/training-providers`, description: "Workplace learning and compliance training" },
  { name: "Tutoring Centres", url: `${SITE_URL}/solutions/tutoring-centers`, description: "AI-assisted one-to-one and small group tutoring" },
  { name: "NGOs", url: `${SITE_URL}/solutions/ngos`, description: "Accessible teaching for underserved communities" },
  { name: "Online Academies", url: `${SITE_URL}/solutions/online-academies`, description: "Teacher-led digital classroom experiences" },
];

export const Route = createFileRoute("/")({
  head: () =>
    createSeoHead({
      title: "Klassruum | AI Classroom Platform for Learners, Teachers, and Institutions",
      description:
        "Klassruum turns curriculum materials into structured, accessible, AI-led classrooms. The complete learning platform with role-based access for learners, teachers, institutions, and parents. GDPR-compliant and WCAG 2.2 ready. Used by schools, universities, training organisations, and online academies worldwide.",
      path: "/",
      keywords:
        "AI virtual classroom platform, AI teacher, accessible online learning platform, LMS alternative for schools, AI tutor for institutions, course materials to lessons, AI whiteboard, learner progress tracking, GDPR compliant learning, WCAG 2.2 virtual classroom, parent progress tracking, hybrid classroom, learning evidence, assignments and homework, structured lesson delivery, institution course management",
      jsonLd: [
        softwareApplicationSchema(),
        organizationSchema(),
        faqSchema(FAQ_ITEMS),
        breadcrumbSchema([{ name: "Home", url: SITE_URL }]),
        itemListSchema("Klassruum Solutions", SOLUTIONS_ITEMS),
      ],
    }),
  component: LandingPage,
});
