/**
 * classroom-lesson.functions.ts
 *
 * Loads a real, published lesson out of the database and shapes it into the
 * `ClassroomLessonContent` the AI video classroom teaches from — the bridge
 * between institution-generated lessons (lessons → lesson_sections →
 * teaching_items) and the polished teacher-first runtime.
 *
 * In demo mode (Supabase not configured), returns null so the caller falls
 * back to the demo lesson registry.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MathTeachingItem, MathTeachingItemType } from "./lesson-models";
import type { ClassroomLessonContent, ClassroomVisualAsset } from "./classroom-content";
import type { AcademicLevel } from "./types";
import {
  buildFallbackVisualPlan,
  createDefaultPacingPlan,
  detectInstructionalDiscipline,
  detectToolingContext,
} from "./classroom-instructional-planning";

/** Map a DB teaching-item type onto the board renderer's item type. */
function toBoardType(dbType: string): MathTeachingItemType {
  switch (dbType) {
    case "equation":
    case "calculation":
    case "instruction":
    case "concept":
    case "answer":
    case "question":
      return dbType;
    case "correction":
      return "answer";
    case "heading":
    case "bullet":
    case "image":
    case "diagram":
    default:
      return "concept";
  }
}

/** Map a DB academic/course level string onto the AI teacher's academic level. */
function toAcademicLevel(level: string | null | undefined): AcademicLevel {
  const l = (level ?? "").toLowerCase();
  if (/primary|elementary|grade [1-6]\b|kg|kindergarten/.test(l)) return "elementary";
  if (/secondary|high ?school|form|grade (7|8|9|1[0-2])|o-?level|a-?level/.test(l))
    return "secondary";
  if (/college|vocational|diploma|certificate/.test(l)) return "college";
  if (/university|tertiary|undergrad|degree|bachelor|master|phd/.test(l)) return "tertiary";
  if (/adult|professional|cpd|corporate/.test(l)) return "adult";
  return "secondary";
}

/** Map a DB section type onto the classroom's section-plan key. */
function toSectionKey(sectionType: string): string {
  switch (sectionType) {
    case "welcome":
    case "objective":
    case "why_it_matters":
    case "prerequisite_check":
      return "welcome";
    case "concept":
      return "concept";
    case "worked_example":
    case "question_checkpoint":
    case "required_middle_question":
      return "worked_example";
    case "guided_practice":
      return "guided_practice";
    case "independent_practice":
      return "independent_practice";
    case "summary":
    case "exit_reflection":
    case "homework":
      return "summary";
    default:
      return "concept";
  }
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

function isVisualAsset(value: unknown): value is ClassroomVisualAsset {
  const v = asRecord(value);
  return Boolean(v.id && v.kind && v.title && v.description && v.alt && v.teacherCue);
}

export const loadClassroomLesson = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ lesson_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }: any): Promise<{ content: ClassroomLessonContent | null }> => {
    const { supabase } = context;

    // Demo mode — no database available
    if (!supabase) {
      return { content: null };
    }

    // 1. Lesson + course/institution context.
    const { data: lessonRow, error: lErr } = await supabase
      .from("lessons")
      .select(
        "id, title, objective, course_id, institution_id, duration_minutes, estimated_duration_minutes, minimum_duration_minutes, lesson_data_json, " +
        "courses(title, subject, level, institutions(name))",
      )
      .eq("id", data.lesson_id)
      .single();
    if (lErr || !lessonRow) return { content: null };
    const lesson = lessonRow as any;

    const courseRel = lesson.courses;
    const course = (Array.isArray(courseRel) ? courseRel[0] : courseRel) as
      | {
        title?: string;
        subject?: string;
        level?: string;
        institutions?: { name?: string } | { name?: string }[];
      }
      | undefined;
    const instRel = course?.institutions;
    const institution = Array.isArray(instRel) ? instRel[0] : instRel;
    const title = lesson.title ?? "Lesson";
    const metadata = asRecord(lesson.lesson_data_json);
    const disciplineType =
      metadata.disciplineType ??
      detectInstructionalDiscipline({
        subject: course?.subject,
        course: course?.title,
        title,
      });
    const toolingContext =
      metadata.toolingContext ??
      detectToolingContext({
        subject: course?.subject,
        course: course?.title,
        title,
      });

    // 2. Sections (ordered) + their teaching items (ordered).
    const { data: sectionsRaw } = await supabase
      .from("lesson_sections")
      .select("id, title, type, order_index")
      .eq("lesson_id", data.lesson_id)
      .order("order_index", { ascending: true });

    const { data: itemsRaw } = await supabase
      .from("teaching_items")
      .select(
        "id, section_id, order_index, type, board_text, exact_spoken_text, " +
        "teacher_explanation, learner_notes, accessible_description, " +
        "why_this_matters, common_mistake, writing_speed, image_url, image_alt, source_material_id",
      )
      .eq("lesson_id", data.lesson_id)
      .order("order_index", { ascending: true });

    const sections = (sectionsRaw ?? []) as any[];
    const items = (itemsRaw ?? []) as any[];
    if (!sections.length || !items.length) return { content: null };

    // 3. Flatten sections → items into the ordered teaching sequence.
    const orderedSections = [...sections].sort((a, b) => a.order_index - b.order_index);

    const sequence: MathTeachingItem[] = [];
    const sectionGoals: Record<string, string> = {};
    const sectionStops: Array<{ key: string; startIndex: number }> = [];
    const learnerNotesParts: string[] = [];

    for (const section of orderedSections) {
      const sectionItems = items
        .filter((it) => it.section_id === section.id)
        .sort((a, b) => a.order_index - b.order_index);
      const key = toSectionKey(section.type);
      if (section.title && !sectionGoals[key]) sectionGoals[key] = section.title;

      let sectionStarted = false;
      for (const it of sectionItems) {
        const board = (it.board_text ?? it.exact_spoken_text ?? "").trim();
        if (!board) continue;
        if (!sectionStarted) {
          sectionStops.push({ key, startIndex: sequence.length });
          sectionStarted = true;
        }
        sequence.push({
          id: it.id,
          type: toBoardType(it.type),
          boardText: board,
          exactSpokenText: it.exact_spoken_text || board,
          teacherExplanation: it.teacher_explanation || "",
          whyThisStepMatters: it.why_this_matters || "",
          commonMistake: it.common_mistake || undefined,
          accessibleDescription: it.accessible_description || board,
          visualCue:
            it.image_url || it.image_alt
              ? {
                kind: disciplineType === "business_software" ? "screenshot" : "illustration",
                title: it.image_alt || board,
                description:
                  it.accessible_description ||
                  it.teacher_explanation ||
                  `Visual support for ${board}`,
                imageUrl: it.image_url || undefined,
                imageAlt: it.image_alt || it.accessible_description || board,
                teacherCue:
                  it.image_alt ||
                  "Pause on this visual and connect it to the current board item before continuing.",
              }
              : undefined,
          writingSpeed: (it.writing_speed as MathTeachingItem["writingSpeed"]) || "normal",
        });
        if (it.learner_notes) learnerNotesParts.push(it.learner_notes);
      }
    }

    if (!sequence.length) return { content: null };

    // 4. Material context for grounded (RAG) question answering.
    const { data: materials } = await supabase
      .from("course_materials")
      .select("extracted_text")
      .eq("course_id", lesson.course_id)
      .eq("processing_status", "ready");
    const materialContext = ((materials ?? []) as any[])
      .map((m) => m.extracted_text ?? "")
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 6000)
      .trim();

    const { data: materialImagesRaw } = await supabase
      .from("material_images")
      .select("id, image_url, caption, extracted_context, course_material_id, suggested_lesson_id")
      .eq("course_id", lesson.course_id)
      .limit(12);

    const materialVisuals: ClassroomVisualAsset[] = ((materialImagesRaw ?? []) as any[]).map(
      (img, index) => ({
        id: `material_${img.id}`,
        kind: disciplineType === "business_software" ? "screenshot" : "illustration",
        source: "uploaded_material",
        title: img.caption || `Course material visual ${index + 1}`,
        description:
          img.extracted_context ||
          img.caption ||
          "Uploaded institutional visual that supports the current lesson.",
        alt: img.caption || `Uploaded visual for ${title}`,
        imageUrl: img.image_url,
        teacherCue:
          img.extracted_context ||
          "Pause on this uploaded visual. Point out the labels, interface areas, or evidence before continuing.",
      }),
    );

    const generatedVisuals = Array.isArray(metadata.visualPlan)
      ? metadata.visualPlan.filter(isVisualAsset)
      : [];

    const fallbackVisuals = buildFallbackVisualPlan({
      lessonId: lesson.id,
      title,
      subject: course?.subject ?? "General",
      course: course?.title ?? "Course",
      disciplineType,
      toolingContext,
      sequence,
    });

    const visualPlan = [...materialVisuals, ...generatedVisuals, ...fallbackVisuals].slice(0, 8);

    const content: ClassroomLessonContent = {
      lessonId: lesson.id,
      title,
      equation: undefined,
      subject: course?.subject ?? "General",
      course: course?.title ?? "Course",
      courseLevel: course?.level ?? undefined,
      institution: institution?.name ?? "Klassruum",
      academicLevel: toAcademicLevel(course?.level),
      disciplineType,
      toolingContext,
      pacingPlan: metadata.pacingPlan ?? createDefaultPacingPlan(lesson.estimated_duration_minutes ?? lesson.duration_minutes),
      visualPlan,
      instructionalSegments: metadata.instructionalSegments ?? [],
      reteachMoments: metadata.reteachMoments ?? [],
      guidedQuestions: metadata.guidedQuestions ?? [],
      practiceCycles: metadata.practiceCycles ?? [],
      teacher: { name: "Ms. Ada", image: "/images/teachers/woman.png", voice: "female" },
      openingNarrative:
        lesson.objective ||
        `Welcome. Today's lesson is "${title}". I'll show you the idea clearly, then we'll work through it together step by step.`,
      lessonGoal: lesson.objective || `Understand and apply the key ideas in "${title}".`,
      whyItMatters:
        "Each step builds on the last, so don't worry about speed. Pay attention to why each move works, and stop me when something feels off.",
      prerequisiteReview: undefined,
      sequence,
      sectionGoals: { ...DEFAULT_SECTION_GOALS, ...sectionGoals },
      sectionStops: sectionStops.length ? sectionStops : [{ key: "concept", startIndex: 0 }],
      sectionRecaps: {},
      thinkingPauses: {},
      middleQuestion: undefined,
      confidenceOptions: DEFAULT_CONFIDENCE_OPTIONS,
      practiceProblems: [],
      exitTicket: undefined,
      exitReflection: {
        question: "Before we finish — what part should we review again next time?",
        options: ["The main idea", "The worked example", "The practice", "I understood everything"],
      },
      learnerNotes:
        learnerNotesParts.join("\n\n") || `Notes for "${title}" will appear as you learn.`,
      materialContext: materialContext || undefined,
    };

    return { content };
  });

/** Fallback per-section goal banners when a lesson section has no title. */
const DEFAULT_SECTION_GOALS: Record<string, string> = {
  welcome: "Get clear on what we're learning and what to watch for.",
  concept: "Understand the main idea before trying to use it.",
  worked_example: "Follow the method carefully and notice why each step works.",
  guided_practice: "Try the method with support while the idea is still fresh.",
  independent_practice: "Carry the method on your own without rushing.",
  summary: "Pull the lesson together and keep the main pattern in mind.",
  exit_ticket: "Show what you've understood with one final check.",
  complete: "Lesson complete — review the parts that still need practice.",
};

const DEFAULT_CONFIDENCE_OPTIONS: ClassroomLessonContent["confidenceOptions"] = [
  { label: "I understand", value: "understand", emoji: "😀" },
  { label: "Almost", value: "almost", emoji: "🙂" },
  { label: "Not yet", value: "not_yet", emoji: "😐" },
  { label: "Explain again", value: "explain_again", emoji: "🔁" },
];
