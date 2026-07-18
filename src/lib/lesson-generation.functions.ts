/**
 * lesson-generation.functions.ts
 *
 * Generates teachable classroom lessons from course materials and saves them as
 * DRAFTS, following the hierarchy:
 *   Course (+ materials, timeline, requested count) → Lessons → Sections → Teaching Items
 *
 * Each generated lesson is a full classroom experience: what appears on the
 * board, what the teacher reads, what the teacher explains, learner notes,
 * accessibility text, question checkpoints, practice, summary, and reflection.
 *
 * Uses the resilient AI provider chain (OpenAI / DeepSeek) when a provider key
 * is set; otherwise falls back to a deterministic generator so the flow still
 * works without AI.
 *
 * Auth: requires a signed-in staff user (RLS on lessons/lesson_sections/
 * teaching_items enforces owner/admin/teacher on insert).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createResilientModelCaller } from "./ai-gateway.server";
import { createImageSearchSession } from "./image-search.server";
import {
  buildFallbackVisualPlan,
  clampClassDuration,
  createDefaultPacingPlan,
  detectInstructionalDiscipline,
  detectToolingContext,
} from "./classroom-instructional-planning";

// ── AI output schema (one batch of lessons) ──────────────────────────────────

const TeachingItemSchema = z.object({
  type: z.enum([
    "heading",
    "bullet",
    "equation",
    "calculation",
    "image",
    "diagram",
    "question",
    "answer",
    "correction",
    "instruction",
    "concept",
  ]),
  boardText: z.string().describe("Short board text. Bullets 5–26 words. Never long paragraphs."),
  exactSpokenText: z.string().describe("Verbatim text the teacher reads after writing."),
  teacherExplanation: z.string().describe("Deeper explanation the teacher gives."),
  learnerNotes: z.string().describe("Cleaned note saved for revision."),
  accessibleDescription: z.string().describe("Screen-reader description."),
  whyThisMatters: z.string().nullable(),
  commonMistake: z.string().nullable(),
  visualKind: z
    .enum(["screenshot", "diagram", "formula", "chart", "table", "illustration", "workflow", "map", "text_reference"])
    .nullable()
    .optional(),
  visualTitle: z.string().nullable().optional(),
  visualCue: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  /** Not produced by the model — filled in server-side by the image-search enrichment pass. */
  imageUrl: z.string().nullable().optional(),
});

const SectionSchema = z.object({
  title: z.string(),
  type: z.enum([
    "welcome",
    "hook",
    "objective",
    "why_it_matters",
    "prerequisite_check",
    "concept",
    "worked_example",
    "question_checkpoint",
    "required_middle_question",
    "guided_practice",
    "second_example",
    "practice_together",
    "independent_practice",
    "question_session",
    "correction",
    "summary",
    "exit_reflection",
    "exit_ticket",
    "homework",
    "reflection",
  ]),
  estimatedMinutes: z.number().int().min(1).max(20),
  teachingItems: z.array(TeachingItemSchema).min(1).max(12),
});

const LessonSchema = z.object({
  title: z.string(),
  objective: z.string(),
  syllabusReference: z.string().nullable(),
  estimatedDurationMinutes: z.number().int().min(30).max(60),
  minimumDurationMinutes: z.number().int().optional(),
  disciplineType: z
    .enum(["mathematics", "science", "technical", "business_software", "humanities", "languages", "general"])
    .optional(),
  toolingContext: z.string().nullable().optional(),
  sections: z.array(SectionSchema).min(4).max(14),
  instructionalSegments: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        type: z.string(),
        estimatedMinutes: z.number().int(),
        visualRequired: z.boolean().optional(),
        visualCue: z.string().optional(),
      })
    )
    .optional(),
  visualPlan: z
    .array(
      z.object({
        id: z.string(),
        anchorId: z.string().optional(),
        kind: z.enum([
          "screenshot",
          "diagram",
          "formula",
          "chart",
          "table",
          "illustration",
          "workflow",
          "map",
          "text_reference",
        ]),
        source: z.enum(["uploaded_material", "ai_generated", "web_search", "whiteboard", "fallback"]),
        title: z.string(),
        description: z.string(),
        alt: z.string(),
        imageUrl: z.string().optional(),
        teacherCue: z.string(),
        labels: z.array(z.string()).optional(),
      })
    )
    .optional(),
  reteachMoments: z
    .array(
      z.object({
        concept: z.string(),
        recapPoints: z.array(z.string()),
        alternateExplanation: z.string(),
        visualCue: z.string().optional(),
      })
    )
    .optional(),
  guidedQuestions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correct: z.string(),
        explanation: z.string(),
      })
    )
    .optional(),
  practiceCycles: z
    .array(
      z.object({
        id: z.string(),
        topic: z.string(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        problems: z.array(
          z.object({
            equation: z.string(),
            question: z.string(),
            correctAnswer: z.string(),
            hints: z.array(z.string()),
            misconception: z
              .object({
                answer: z.string(),
                note: z.string(),
              })
              .optional(),
          })
        ),
      })
    )
    .optional(),
  adaptivePlan: z
    .object({
      supportPath: z.array(z.string()).describe("Reteach/scaffold actions for struggling learners."),
      corePath: z.array(z.string()).describe("Normal on-level teaching actions."),
      challengePath: z.array(z.string()).describe("Extension actions for fast or advanced learners."),
    })
    .optional(),
});

const BatchSchema = z.object({
  lessons: z.array(LessonSchema).min(1).max(20),
  note: z
    .string()
    .nullable()
    .describe("If content was too limited for the requested count, explain here."),
});

type GeneratedBatch = z.infer<typeof BatchSchema>;

// ── Input ─────────────────────────────────────────────────────────────────────

const InputSchema = z.object({
  course_id: z.string().uuid(),
  requested_count: z.number().int().min(1).max(20).default(6),
  level: z.string().max(80).optional(),
  timeline_weeks: z.number().int().min(1).max(52).optional(),
  strand: z.string().trim().max(160).optional(),
  sub_strand: z.string().trim().max(160).optional(),
  syllabus_reference: z.string().trim().max(255).optional(),
  source_book_reference: z.string().trim().max(255).optional(),
  /** Optional override; if omitted, the course's ready materials are concatenated. */
  material_text: z.string().max(60000).optional(),
  /** When true (default), look up a real photo for visuals the lesson flags as needing one. */
  include_images: z.boolean().default(true),
});

function generationSystemPrompt(args: {
  programme?: string;
  course: string;
  subject?: string;
  level?: string;
  country?: string;
  curriculumFamily?: string;
  grade?: number | null;
  strand?: string;
  subStrand?: string;
  syllabusReference?: string;
  sourceBookReferences?: string[];
  timelineWeeks?: number;
  requestedCount: number;
}): string {
  return `You generate structured Klassruum classroom lessons from institution-provided course materials.

PROGRAMME: ${args.programme ?? "—"}
COURSE: ${args.course} (subject: ${args.subject ?? "—"}, level: ${args.level ?? "school level"})
CURRICULUM: ${args.country ?? "—"} ${args.curriculumFamily ?? "—"}${args.grade ? ` Grade ${args.grade}` : ""}
STRAND: ${args.strand ?? "not specified"}
SUB-STRAND: ${args.subStrand ?? "not specified"}
SYLLABUS REFERENCE: ${args.syllabusReference ?? "not specified"}
SOURCE BOOK REFERENCES: ${args.sourceBookReferences?.length ? args.sourceBookReferences.join("; ") : "metadata not supplied"}
TIMELINE: ${args.timelineWeeks ? `${args.timelineWeeks} weeks` : "not specified"}
REQUESTED LESSONS: ${args.requestedCount}

Create exactly ${args.requestedCount} lessons unless the content is too limited. If content is limited, create the closest reasonable number and explain what is missing in "note".

Each lesson MUST follow this exact 16-step pedagogical pipeline (using these section types in order):
1. welcome (Welcome & greeting)
2. hook (Real-world Hook or engagement context)
3. objective (Learning Objectives & Success Criteria)
4. prerequisite_check (Activate Prior Knowledge / prerequisite retrieval check)
5. concept (Explain Concept on canvas)
6. worked_example (First worked example / guided explanation)
7. question_checkpoint (Check Understanding / Formative checkpoint question)
8. correction (Misconception clarification and corrective explanation)
9. second_example (Second worked example demonstrating transfer)
10. practice_together (Practice Together / interactive collaborative problem)
11. independent_practice (Independent Practice / self-guided graded problems)
12. question_session (Open Question Session / 5-minute checkpoint for student questions)
13. summary (Lesson Summary & key rules/common mistakes review)
14. exit_ticket (Final exit assessment check)
15. homework (Graded follow-up homework tasks)
16. reflection (Student confidence and metacognitive reflection)

Each lesson MUST be a real class, not a quick reading script:
- estimatedDurationMinutes MUST be 30–60 minutes.
- Build enough section minutes, examples, guided checks, recaps, and practice to justify the duration.
- The teacher must explain slowly: write/read/explain/check understanding; do not rush from item to item.
- The teacher must sound like a real human instructor in a live class: calm, observant, direct, and natural.
- Avoid robotic teacher jargon such as "let us synthesize", "relate this to our objectives", "as per the objective", or anything that sounds like generic AI tutoring copy.
- Prefer short, grounded teaching language like "Watch this part", "Don't rush this step", "Here's where learners usually slip", and "Check why this works".
- Match the education level exactly: choose vocabulary, step size, examples, and practice difficulty for ${args.level ?? "the supplied course level"}${args.grade ? ` / Grade ${args.grade}` : ""}. Do not teach below or above that level.
- Include three ability paths in the lesson_data metadata: support/reteach for struggling learners, core path for on-level learners, and challenge extension for fast learners.
- For SPSS, Excel, Power BI, statistics software, or other tools, include screenshot-style teaching cues: where to click, what field/output to inspect, and how to interpret it.
- For sciences/biology/anatomy, include diagram/illustration cues with labels and function explanations.
- For engineering/technical lessons, include workflow/component cues, e.g. force, signal, pressure, or material flow.
- For humanities/languages, include source/grammar/context visuals such as tables, passages, argument maps, or sentence breakdowns.

Whiteboard rules:
- Use SHORT board text: calculations, equations, short bullets, examples.
- Do NOT put long paragraphs on the board. Bullets should be 5–26 words.
- Every teaching item must have exactSpokenText, a detailed teacherExplanation, learnerNotes, and accessibleDescription.
- When a screenshot, formula, chart, diagram, or illustration would improve teaching, set visualKind, visualTitle, visualCue, and imageAlt. Uploaded institutional material will be preferred at runtime; AI/fallback visuals are used only when no upload exists.

Deep Teaching Metadata Rules:
- Populate visualPlan with syllabus-specific visuals: SPSS menu screenshots, biology cell diagrams, math formula cards, or grammar structure tables. Include clear title, description, and teacher focus cues.
- Populate instructionalSegments mapping each section type to estimated minutes and visual requirements.
- Populate reteachMoments detailing how the teacher should re-explain core concepts using analogies or alternate worked examples if student confusion is triggered.
- Populate guidedQuestions with step-by-step checks to gate the lesson. At least one must diagnose prerequisite readiness, one must check the main concept, and one must check transfer/application.
- Populate practiceCycles with beginner, intermediate, and advanced graded practice problems, each with hints and misconception feedback.
- Every reteachMoment must include a concrete alternate explanation and a visualCue that the classroom can point to.

Copyright and curriculum rules:
- Use only the supplied licensed or institution-provided material as source context.
- Do not reproduce textbook passages verbatim except for very short labels, terms, or syllabus references.
- Write original learner-facing explanations, examples, checkpoints, and practice tasks.
- Keep every lesson traceable to the curriculum metadata and source book references when supplied.

Do NOT create exams, grading, or certification. Focus on teaching, interaction, practice, notes, and reflection.
Return valid JSON matching the schema.`;
}

// ── Deterministic fallback (no AI key) ────────────────────────────────────────

function fallbackBatch(
  materialText: string,
  requestedCount: number,
  courseTitle: string,
): GeneratedBatch {
  const clean = materialText.replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s: any) => s.length > 12);
  const chunkSize = Math.max(1, Math.ceil(sentences.length / requestedCount));
  const lessons: GeneratedBatch["lessons"] = [];

  for (let i = 0; i < requestedCount; i++) {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    const topic = chunk[0]?.split(" ").slice(0, 6).join(" ") || `${courseTitle} — part ${i + 1}`;
    const concepts = (chunk.length ? chunk : [`Key ideas for ${courseTitle}.`]).slice(0, 5);
    lessons.push({
      title: `Lesson ${i + 1}: ${topic}`,
      objective: `By the end of this lesson, you should understand: ${topic}.`,
      syllabusReference: null,
      estimatedDurationMinutes: 30,
      minimumDurationMinutes: 30,
      instructionalSegments: [
        { id: `seg_${i}_1`, title: "Welcome", type: "welcome", estimatedMinutes: 4 },
        { id: `seg_${i}_2`, title: "Concept Explanation", type: "concept", estimatedMinutes: 12, visualRequired: true }
      ],
      visualPlan: [
        {
          id: `vis_${i}_1`,
          kind: "illustration",
          source: "fallback",
          title: topic,
          description: `Overview visual for ${topic}`,
          alt: `Visual support for ${topic}`,
          teacherCue: "Focus on the main ideas on the board."
        }
      ],
      reteachMoments: [
        {
          concept: topic,
          recapPoints: ["Understand the goal", "Apply step-by-step"],
          alternateExplanation: "Think of this as building a house: first lay the foundation, then build the walls."
        }
      ],
      guidedQuestions: [
        {
          question: `Which of the following describes the goal of ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct: "Option A",
          explanation: "Option A is correct because it directly addresses the core objective."
        }
      ],
      practiceCycles: [],
      adaptivePlan: {
        supportPath: [
          "Slow the pace and repeat the goal in simpler words.",
          "Use the visual overview before asking another question.",
          "Give one worked example with the learner choosing the next step.",
        ],
        corePath: [
          "Teach the concept, model one example, then ask a guided check.",
          "Move to independent practice after the learner answers the checkpoint.",
        ],
        challengePath: [
          "Ask the learner to explain the idea in their own words.",
          "Offer a harder transfer example after the core practice.",
        ],
      },
      sections: [
        {
          title: "Welcome and lesson goal",
          type: "welcome",
          estimatedMinutes: 4,
          teachingItems: [
            {
              type: "heading",
              boardText: `Lesson goal: ${topic}`,
              exactSpokenText: `Lesson goal: ${topic}.`,
              teacherExplanation: `Today we're working on ${topic}. I'll show it clearly first, then we'll try it together so you can see how it works.`,
              learnerNotes: `This lesson covers ${topic}.`,
              accessibleDescription: `Heading on the board: lesson goal, ${topic}.`,
              whyThisMatters: "Knowing the goal helps you focus on what success looks like.",
              commonMistake: null,
            },
          ],
        },
        {
          title: "Concept",
          type: "concept",
          estimatedMinutes: 12,
          teachingItems: concepts.map((c: any) => ({
            type: "bullet" as const,
            boardText: c.split(" ").slice(0, 18).join(" "),
            exactSpokenText: c,
            teacherExplanation: `${c} Don't rush this part. First, notice the main idea. Then check what it means in a real example. This is usually the point where learners move too fast, so I want us to make it solid before we continue.`,
            learnerNotes: c,
            accessibleDescription: c,
            whyThisMatters: null,
            commonMistake: null,
          })),
        },
        {
          title: "Guided practice",
          type: "guided_practice",
          estimatedMinutes: 9,
          teachingItems: [
            {
              type: "question",
              boardText: "Try together: apply today's idea to an example.",
              exactSpokenText: "Let's try one together.",
              teacherExplanation: "We'll do this one together. I'll take the first move, then I'll pause and let you spot the next step before I carry on. That's how you know the method is starting to stick.",
              learnerNotes: "Practice the method with teacher guidance.",
              accessibleDescription: "Guided practice prompt on the board.",
              whyThisMatters: null,
              commonMistake: null,
            },
          ],
        },
        {
          title: "Summary and reflection",
          type: "summary",
          estimatedMinutes: 5,
          teachingItems: [
            {
              type: "bullet",
              boardText: `Today you learned: ${topic}.`,
              exactSpokenText: `Today you learned about ${topic}.`,
              teacherExplanation: `That's the main idea for today: ${topic}. Go back over your notes, and if one step still feels shaky, that's the bit to ask about or practise again.`,
              learnerNotes: `Summary: ${topic}.`,
              accessibleDescription: `Summary bullet on the board about ${topic}.`,
              whyThisMatters: null,
              commonMistake: null,
            },
          ],
        },
      ],
    });
  }

  return {
    lessons,
    note:
      sentences.length < requestedCount
        ? `Course material was limited; generated ${requestedCount} lessons by dividing available content evenly.`
        : null,
  };
}

// ── Image enrichment (course-content images first, web search fallback) ──────

type MaterialImageRow = {
  id: string;
  image_url: string;
  caption: string | null;
  extracted_context: string | null;
};

const IMAGE_MATCH_STOPWORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "into", "your", "have",
  "are", "was", "were", "its", "using", "use", "how", "what", "when", "where",
  "which", "will", "would", "could", "should", "also", "than", "then", "them",
  "they", "these", "those", "about", "after", "before", "over", "under",
  "between", "each", "such", "more", "most", "some", "only", "very", "just", "like",
]);

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !IMAGE_MATCH_STOPWORDS.has(w)),
  );
}

/** Finds an uploaded material image whose caption/context shares enough keywords with the query to be a real match — not just the first unused image. */
function findMatchingMaterialImage(
  query: string,
  images: MaterialImageRow[],
  used: Set<string>,
): MaterialImageRow | null {
  const queryWords = significantWords(query);
  if (!queryWords.size) return null;

  let best: { row: MaterialImageRow; score: number } | null = null;
  for (const row of images) {
    if (used.has(row.id)) continue;
    const haystackWords = significantWords(`${row.caption ?? ""} ${row.extracted_context ?? ""}`);
    if (!haystackWords.size) continue;
    let score = 0;
    for (const w of queryWords) if (haystackWords.has(w)) score++;
    if (score >= 2 && (!best || score > best.score)) best = { row, score };
  }
  return best?.row ?? null;
}

/**
 * The model can flag that a teaching item or visual-plan entry needs an
 * illustration (visualKind/visualTitle/visualCue) but has no way to fetch or
 * produce a real image. This pass fills every flagged visual that doesn't
 * already have an imageUrl: first by matching it against real images
 * extracted from the institution's own uploaded materials, then — only when
 * no relevant material image exists — via a Pexels web search. Mutates the
 * batch in place. No-ops entirely when PEXELS_API_KEY is unset and no
 * material images exist.
 */
async function enrichBatchWithImages(
  batch: GeneratedBatch,
  courseTitle: string,
  subject: string | undefined,
  materialImages: MaterialImageRow[],
): Promise<void> {
  const lookup = createImageSearchSession();
  const usedMaterialImages = new Set<string>();

  const resolve = async (query: string): Promise<{ url: string; alt: string; source: "uploaded_material" | "web_search" } | null> => {
    const material = findMatchingMaterialImage(query, materialImages, usedMaterialImages);
    if (material) {
      usedMaterialImages.add(material.id);
      return { url: material.image_url, alt: material.caption || query, source: "uploaded_material" };
    }
    const found = await lookup(query);
    if (found) return { url: found.url, alt: found.alt, source: "web_search" };
    return null;
  };

  for (const lesson of batch.lessons) {
    if (lesson.visualPlan) {
      for (const visual of lesson.visualPlan) {
        if (visual.imageUrl) continue;
        const query = [visual.title, subject].filter(Boolean).join(" ") || courseTitle;
        const resolved = await resolve(query);
        if (resolved) {
          visual.imageUrl = resolved.url;
          visual.alt = visual.alt || resolved.alt;
          visual.source = resolved.source;
        }
      }
    }

    for (const section of lesson.sections) {
      for (const item of section.teachingItems) {
        if (!item.visualKind || item.imageUrl) continue;
        const query =
          [item.visualTitle, item.visualCue].filter(Boolean).join(" ") ||
          [subject, item.boardText].filter(Boolean).join(" ");
        const resolved = await resolve(query);
        if (resolved) {
          item.imageUrl = resolved.url;
          item.imageAlt = item.imageAlt || resolved.alt;
        }
      }
    }
  }
}

// ── Server function ───────────────────────────────────────────────────────────

export const generateLessonsForCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }: any) => {
    // Load course (RLS-scoped to the caller)
    const { data: course, error: cErr } = await context.supabase
      .from("courses")
      .select(
        "id, title, subject, level, institution_id, programme_id, country, curriculum_family, grade, curriculum_subject, curriculum_subject_slug, curriculum_metadata",
      )
      .eq("id", data.course_id)
      .single();
    if (cErr) throw new Error(cErr.message);

    let programmeTitle: string | undefined;
    if (course.programme_id) {
      const { data: programme } = await context.supabase
        .from("programmes")
        .select("title")
        .eq("id", course.programme_id)
        .maybeSingle();
      programmeTitle = programme?.title ?? undefined;
    }

    // Gather material text
    let materialText = data.material_text ?? "";
    let sourceMaterialIds: string[] = [];
    let sourceBookReferences: string[] = data.source_book_reference
      ? [data.source_book_reference]
      : [];
    if (!materialText) {
      const { data: materials } = await context.supabase
        .from("course_materials")
        .select(
          "id, title, extracted_text, syllabus_reference, material_role, book_title, publisher, edition_year, material_rights_status, curriculum_metadata",
        )
        .eq("course_id", data.course_id)
        .eq("processing_status", "ready");
      if (materials?.length) {
        sourceMaterialIds = materials.map((m: any) => m.id);
        sourceBookReferences = [
          ...sourceBookReferences,
          ...materials
            .map((m: any) => {
              if (!m.book_title) return null;
              const publisher = m.publisher ? `, ${m.publisher}` : "";
              const year = m.edition_year ? `, ${m.edition_year}` : "";
              const role = m.material_role ? ` (${m.material_role})` : "";
              return `${m.book_title}${publisher}${year}${role}`;
            })
            .filter((ref: string | null): ref is string => Boolean(ref)),
        ];
        materialText = materials
          .map((m: any) => {
            const header = [
              `Material: ${m.title}`,
              m.material_role ? `role: ${m.material_role}` : null,
              m.book_title ? `book: ${m.book_title}` : null,
              m.publisher ? `publisher: ${m.publisher}` : null,
              m.edition_year ? `edition/year: ${m.edition_year}` : null,
              m.syllabus_reference ? `syllabus: ${m.syllabus_reference}` : null,
              m.material_rights_status ? `rights: ${m.material_rights_status}` : null,
            ]
              .filter(Boolean)
              .join(" | ");
            return `${header}\n${m.extracted_text ?? ""}`;
          })
          .join("\n\n")
          .trim();
      }
    }
    if (!materialText) {
      materialText = `Course: ${course.title}. Subject: ${course.curriculum_subject ?? course.subject ?? ""
        }. Generate foundational lessons for this course.`;
    }

    // Generate (AI when available, otherwise deterministic fallback)
    let batch: GeneratedBatch;
    let usedAI = false;
    const resilientCaller = createResilientModelCaller("lesson_gen");
    if (resilientCaller) {
      try {
        const result = await resilientCaller.call(
          BatchSchema,
          generationSystemPrompt({
            programme: programmeTitle,
            course: course.title,
            subject: course.curriculum_subject ?? course.subject ?? undefined,
            level: data.level ?? course.level ?? undefined,
            country: course.country ?? undefined,
            curriculumFamily: course.curriculum_family ?? undefined,
            grade: course.grade ?? null,
            strand: data.strand,
            subStrand: data.sub_strand,
            syllabusReference: data.syllabus_reference,
            sourceBookReferences: Array.from(new Set(sourceBookReferences)),
            timelineWeeks: data.timeline_weeks,
            requestedCount: data.requested_count,
          }),
          `COURSE MATERIALS:\n${materialText.slice(0, 24000)}\n\nGenerate the lessons now as JSON.`,
        );
        if (result) {
          batch = result.object;
          usedAI = true;
        } else {
          batch = fallbackBatch(materialText, data.requested_count, course.title);
        }
      } catch {
        batch = fallbackBatch(materialText, data.requested_count, course.title);
      }
    } else {
      batch = fallbackBatch(materialText, data.requested_count, course.title);
    }

    batch.lessons = batch.lessons.map((lesson) => ({
      ...lesson,
      estimatedDurationMinutes: clampClassDuration(lesson.estimatedDurationMinutes, 45),
      disciplineType:
        lesson.disciplineType ??
        detectInstructionalDiscipline({
          subject: course.curriculum_subject ?? course.subject,
          course: course.title,
          title: lesson.title,
          material: materialText,
        }),
      toolingContext:
        lesson.toolingContext ??
        detectToolingContext({
          subject: course.curriculum_subject ?? course.subject,
          course: course.title,
          title: lesson.title,
          material: materialText,
        }) ??
        null,
    }));

    if (data.include_images) {
      const { data: materialImages } = await context.supabase
        .from("material_images")
        .select("id, image_url, caption, extracted_context")
        .eq("course_id", data.course_id)
        .limit(100);
      await enrichBatchWithImages(
        batch,
        course.title,
        course.curriculum_subject ?? course.subject ?? undefined,
        (materialImages ?? []) as MaterialImageRow[],
      );
    }

    // Find current lesson count for ordering
    const { count: existing } = await context.supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("course_id", data.course_id);

    // Persist as drafts: lessons → sections → teaching items
    const created: { lessonId: string; title: string; sections: number; items: number }[] = [];
    let order = existing ?? 0;

    for (const lesson of batch.lessons) {
      const pacingPlan = createDefaultPacingPlan(lesson.estimatedDurationMinutes);
      const visualPlan = buildFallbackVisualPlan({
        lessonId: "pending",
        title: lesson.title,
        subject: course.curriculum_subject ?? course.subject ?? "General",
        course: course.title,
        disciplineType: lesson.disciplineType,
        toolingContext: lesson.toolingContext ?? undefined,
      });
      const { data: lessonRow, error: lErr } = await context.supabase
        .from("lessons")
        .insert({
          institution_id: course.institution_id,
          course_id: course.id,
          programme_id: course.programme_id,
          title: lesson.title,
          objective: lesson.objective,
          syllabus_reference: lesson.syllabusReference ?? data.syllabus_reference ?? null,
          order_index: order++,
          minimum_duration_minutes: 30,
          estimated_duration_minutes: lesson.estimatedDurationMinutes,
          duration_minutes: lesson.estimatedDurationMinutes,
          source_material_ids: sourceMaterialIds,
          generation_mode: "auto",
          status: "draft",
          created_by: context.userId,
          lesson_data_json: {
            disciplineType: lesson.disciplineType,
            toolingContext: lesson.toolingContext ?? null,
            curriculum: {
              country: course.country ?? null,
              curriculumFamily: course.curriculum_family ?? null,
              grade: course.grade ?? null,
              subject: course.curriculum_subject ?? course.subject ?? null,
              subjectSlug: course.curriculum_subject_slug ?? null,
              strand: data.strand ?? null,
              subStrand: data.sub_strand ?? null,
              syllabusReference: lesson.syllabusReference ?? data.syllabus_reference ?? null,
              sourceBookReferences: Array.from(new Set(sourceBookReferences)),
            },
            pacingPlan: {
              ...pacingPlan,
              minimumDurationMinutes: lesson.minimumDurationMinutes ?? pacingPlan.minimumDurationMinutes,
              targetDurationMinutes: lesson.estimatedDurationMinutes ?? pacingPlan.targetDurationMinutes,
            },
            visualPlan: lesson.visualPlan ?? visualPlan,
            instructionalSegments: lesson.instructionalSegments ?? [],
            reteachMoments: lesson.reteachMoments ?? [],
            guidedQuestions: lesson.guidedQuestions ?? [],
            practiceCycles: lesson.practiceCycles ?? [],
            adaptivePlan: lesson.adaptivePlan ?? {
              supportPath: [],
              corePath: [],
              challengePath: [],
            },
            generatedFor: "long_form_adaptive_ai_teacher",
          },
        })
        .select("id")
        .single();
      if (lErr) throw new Error(lErr.message);

      let sectionOrder = 0;
      let itemTotal = 0;
      for (const section of lesson.sections) {
        const { data: sectionRow, error: sErr } = await context.supabase
          .from("lesson_sections")
          .insert({
            institution_id: course.institution_id,
            course_id: course.id,
            lesson_id: lessonRow.id,
            title: section.title,
            type: section.type,
            order_index: sectionOrder++,
            estimated_minutes: section.estimatedMinutes,
          })
          .select("id")
          .single();
        if (sErr) throw new Error(sErr.message);

        const itemRows = section.teachingItems.map((item, idx) => ({
          institution_id: course.institution_id,
          course_id: course.id,
          lesson_id: lessonRow.id,
          section_id: sectionRow.id,
          order_index: idx,
          type: item.type,
          board_text: item.boardText,
          exact_spoken_text: item.exactSpokenText,
          teacher_explanation: item.teacherExplanation,
          learner_notes: item.learnerNotes,
          accessible_description: item.accessibleDescription,
          why_this_matters: item.whyThisMatters,
          common_mistake: item.commonMistake,
          image_url: item.imageUrl ?? null,
          image_alt: item.imageAlt ?? item.visualTitle ?? null,
          estimated_seconds: Math.max(
            90,
            Math.min(
              420,
              Math.round(
                ((item.exactSpokenText.split(/\s+/).length +
                  item.teacherExplanation.split(/\s+/).length) /
                  115) *
                60,
              ),
            ),
          ),
        }));
        const { error: iErr } = await context.supabase.from("teaching_items").insert(itemRows);
        if (iErr) throw new Error(iErr.message);
        itemTotal += itemRows.length;
      }

      created.push({
        lessonId: lessonRow.id,
        title: lesson.title,
        sections: lesson.sections.length,
        items: itemTotal,
      });
    }

    return {
      usedAI,
      note: batch.note ?? null,
      requestedCount: data.requested_count,
      createdCount: created.length,
      created,
    };
  });
