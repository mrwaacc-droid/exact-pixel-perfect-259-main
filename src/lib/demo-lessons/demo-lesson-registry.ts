/**
 * demo-lesson-registry.ts
 *
 * Central registry of all demo lessons. Maps demo lesson IDs to their
 * content builders so the classroom route and demo selector can look them up.
 *
 * Demo IDs are non-UUID strings (e.g. "demo_math", "demo_chemistry") so they
 * are easy to distinguish from real database lesson UUIDs.
 */

import { buildDemoLessonContent } from "../classroom-content.demo";
import {
  buildChemistryLessonContent,
  CHEMISTRY_LESSON_ID,
  CHEMISTRY_LESSON_TITLE,
} from "./chemistry-bonding";
import {
  buildEnglishLessonContent,
  ENGLISH_LESSON_ID,
  ENGLISH_LESSON_TITLE,
} from "./english-parts-of-speech";
import type { ClassroomLessonContent } from "../classroom-content";

export interface DemoLessonMeta {
  id: string;
  title: string;
  subject: string;
  course: string;
  teacher: string;
  duration: string;
  icon: string;
  color: string;
  description: string;
}

/** Metadata for the demo lesson selector page. */
export const DEMO_LESSON_LIST: DemoLessonMeta[] = [
  {
    id: "demo",
    title: "Solving Quadratic Equations by Factoring",
    subject: "Mathematics",
    course: "Mathematics Form 2",
    teacher: "Mr. Klass",
    duration: "~15 min",
    icon: "📐",
    color: "bg-[#9A3247]",
    description:
      "Learn to factor quadratic equations step by step — from identifying the equation to finding solutions.",
  },
  {
    id: CHEMISTRY_LESSON_ID,
    title: CHEMISTRY_LESSON_TITLE,
    subject: "Chemistry",
    course: "Science Form 3",
    teacher: "Dr. Amara",
    duration: "~15 min",
    icon: "🔬",
    color: "bg-[#7C3AED]",
    description:
      "Explore how atoms bond through electron transfer (ionic) and electron sharing (covalent) with real-world examples.",
  },
  {
    id: ENGLISH_LESSON_ID,
    title: ENGLISH_LESSON_TITLE,
    subject: "English Language",
    course: "English Form 2",
    teacher: "Ms. Wanjiku",
    duration: "~12 min",
    icon: "📖",
    color: "bg-[#059669]",
    description:
      "Master the three core parts of speech — nouns, verbs, and adjectives — with clear examples and practice.",
  },
];

/** Content builders keyed by demo lesson ID. */
const builders: Record<string, () => ClassroomLessonContent> = {
  demo: buildDemoLessonContent,
  [CHEMISTRY_LESSON_ID]: buildChemistryLessonContent,
  [ENGLISH_LESSON_ID]: buildEnglishLessonContent,
};

/**
 * Look up a demo lesson by its ID. Returns null if the ID is not in the
 * registry (meaning it might be a real UUID lesson that should be loaded
 * from the database instead).
 */
export function getDemoLessonContent(lessonId: string): ClassroomLessonContent | null {
  const builder = builders[lessonId];
  return builder ? builder() : null;
}

/**
 * Whether a lesson ID refers to a demo lesson (non-UUID).
 * Real lesson IDs are UUIDs; demo IDs are short strings like "demo_math".
 */
export function isDemoLessonId(lessonId: string): boolean {
  return lessonId in builders;
}
