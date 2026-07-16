/**
 * classroom-ai.functions.ts
 *
 * The AI teacher's "brain" for answering learner questions DURING a live lesson.
 *
 * A real tutor does not blindly answer every question. They:
 *   1. Judge whether the question is clear, unclear, or off-topic.
 *   2. If UNCLEAR  → ask ONE clarifying question (with quick-pick options).
 *   3. If OFF-TOPIC → gently steer back, offer a short answer or to continue.
 *   4. If CLEAR    → answer in a careful teachable explanation using ONLY the lesson/course context,
 *                    adapt the style to the learner's academic level, decide if it
 *                    should also be shown on the board, whether to save it to notes,
 *                    and suggest a natural follow-up.
 *
 * Returns a structured `TeacherAnswer` (see types.ts). Stays backward-compatible:
 * the flat `answer` / `wordCount` / `source` fields are still present so existing
 * callers keep working.
 *
 * Uses the resilient AI provider chain (OpenAI / DeepSeek, structured
 * `generateObject`). Falls back to a deterministic, context-aware response
 * when no provider is available, so the class is never blocked.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createResilientModelCaller } from "./ai-gateway.server";
import type { AcademicLevel, TeacherAnswer } from "./types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertActorHasAnyRole } from "@/lib/server-authorization";

const ACADEMIC_LEVELS = ["elementary", "secondary", "college", "tertiary", "adult"] as const;

const ContextSchema = z.object({
  institution: z.string().optional(),
  programme: z.string().optional(),
  course: z.string().optional(),
  lessonTitle: z.string(),
  currentSection: z.string().optional(),
  currentBoardItem: z.string().optional(),
  teacherExplanation: z.string().optional(),
  learnerNotes: z.string().optional(),
  previousQuestions: z.array(z.string()).max(10).optional(),
  materialContext: z.string().max(6000).optional(),
  imageDescriptions: z.array(z.string()).max(10).optional(),
  learningMode: z.string().optional(),
  learnerLevel: z.string().optional(),
  academicLevel: z.enum(ACADEMIC_LEVELS).optional(),
  /** A prior clarifying question the teacher asked, if this is a follow-up turn. */
  priorClarification: z.string().optional(),
  /** Real-time sentiment analysis of the learner's input. */
  learnerSentiment: z
    .object({
      tone: z.string(),
      frustrationScore: z.number().min(0).max(1),
    })
    .optional(),
  /** Cross-lesson learner profile for personalization. */
  learnerProfile: z
    .object({
      weakTopics: z.array(z.string()),
      strongTopics: z.array(z.string()),
      preferredStyle: z.string(),
      lastEmotion: z.string(),
    })
    .optional(),
});

const InputSchema = z.object({
  context: ContextSchema,
  question: z.string().min(1).max(1000),
});

/** Structured output schema the model must satisfy. */
const TeacherAnswerSchema = z.object({
  clarity: z.enum(["clear", "unclear", "off_topic"]),
  clarificationQuestion: z.string().optional(),
  clarificationOptions: z.array(z.string()).max(4).optional(),
  answer: z.string().optional(),
  shouldShowOnBoard: z.boolean(),
  boardItems: z
    .array(z.object({ type: z.string(), text: z.string() }))
    .max(6)
    .optional(),
  saveToNotes: z.boolean(),
  suggestedFollowUp: z.string(),
});

/** Backward-compatible result shape: structured TeacherAnswer + flat fields. */
export type AnswerLearnerQuestionResult = TeacherAnswer & {
  /** Flat answer string (empty when clarity !== "clear"). Back-compat. */
  answer: string;
  wordCount: number;
};

const MIN_WORDS = 160;
const MAX_WORDS = 450;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function clampWords(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= MAX_WORDS) return text.trim();
  const truncated = words.slice(0, MAX_WORDS).join(" ");
  const lastStop = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?"),
  );
  return lastStop > truncated.length * 0.6 ? truncated.slice(0, lastStop + 1) : truncated + "…";
}

/** Teaching-style guidance injected into the prompt for each academic level. */
function levelStyle(level: AcademicLevel | undefined): string {
  switch (level) {
    case "elementary":
      return "Learner is an ELEMENTARY/PRIMARY child. Use very simple words and short sentences. Go slowly, one idea at a time. Be warm and encouraging ('Great effort!'). Use a concrete everyday example. Avoid jargon entirely. Pause to check understanding before moving on.";
    case "secondary":
      return "Learner is a SECONDARY/HIGH-SCHOOL student. Explain step by step with a worked example. Name the one common mistake to avoid. Keep it clear and exam-aware but not intimidating. Do not rush: explain the reason behind each step.";
    case "college":
      return "Learner is a COLLEGE/VOCATIONAL student. Use correct technical vocabulary, give an applied example, and explain the reasoning. Demonstrate procedures carefully, including what to observe in outputs or diagrams.";
    case "tertiary":
      return "Learner is a UNIVERSITY/TERTIARY student. Give deeper reasoning, precise terminology, and the 'why it is valid'. Reference where the concept applies. Include interpretation, assumptions, and a check for understanding rather than merely stating facts.";
    case "adult":
      return "Learner is an ADULT/PROFESSIONAL. Be practical but thorough. Lead with the reliable method, explain why it works, connect to a real-world application, and offer a deeper dive or practice step.";
    default:
      return "Learner is at school level. Explain clearly, step by step, with an example, a supportive tone, and a short check for understanding.";
  }
}

function buildSystemPrompt(ctx: z.infer<typeof ContextSchema>): string {
  return `You are the AI teacher inside Klassruum, answering a learner's question DURING a live lesson. You behave like a real, caring tutor — not a search engine.

CONTEXT (the ONLY source of truth — answer from this):
- Institution: ${ctx.institution ?? "—"}
- Programme: ${ctx.programme ?? "—"}
- Course: ${ctx.course ?? "—"}
- Lesson: ${ctx.lessonTitle}
- Current section: ${ctx.currentSection ?? "—"}
- Current board item: ${ctx.currentBoardItem ?? "—"}
- Teacher's current explanation: ${ctx.teacherExplanation ?? "—"}
- Learner notes so far: ${ctx.learnerNotes ?? "—"}
${ctx.imageDescriptions?.length ? `- Images on the board: ${ctx.imageDescriptions.join("; ")}` : ""}
${ctx.previousQuestions?.length ? `- Earlier questions: ${ctx.previousQuestions.join(" | ")}` : ""}
${ctx.materialContext ? `- Course material excerpt:\n${ctx.materialContext}` : ""}
${ctx.priorClarification ? `- You already asked the learner to clarify: "${ctx.priorClarification}". Treat their message as the clarification and answer directly now.` : ""}
${ctx.learnerSentiment ? `- LEARNER SENTIMENT: The learner appears ${ctx.learnerSentiment.tone} (frustration: ${Math.round((ctx.learnerSentiment.frustrationScore ?? 0) * 100)}%). Adjust tone accordingly — be warmer if frustrated, reinforce if engaged.` : ""}
${ctx.learnerProfile ? `- LEARNER HISTORY: Weak areas: ${ctx.learnerProfile.weakTopics.join(", ") || "none"}. Strong areas: ${ctx.learnerProfile.strongTopics.join(", ") || "none"}. Preferred learning style: ${ctx.learnerProfile.preferredStyle}. Prior emotional state: ${ctx.learnerProfile.lastEmotion}. Use this to tailor your response — avoid assuming knowledge in weak areas and build on strong areas.` : ""}
- Learning mode: ${ctx.learningMode ?? "standard"}

TEACHING STYLE:
${levelStyle(ctx.academicLevel)}

DECIDE clarity:
- "unclear": the question is too short/vague, has an ambiguous reference ("this", "why this?", "I don't get it"), or could mean several parts of the lesson. Do NOT guess. Set clarity="unclear" and provide ONE short clarificationQuestion plus 2–4 clarificationOptions naming the likely parts of the CURRENT board/section. Leave answer empty.
- "off_topic": the question is unrelated to this lesson or needs future content. Set clarity="off_topic", briefly acknowledge in 'answer' (2–3 sentences), and steer back with suggestedFollowUp.
- "clear": answer it.

WHEN CLEAR — fill 'answer' with plain spoken prose (NO markdown/lists/headings), 160–450 words, warm and supportive, using ONLY the lesson context. Use this teaching structure naturally: acknowledge the question, explain the idea step by step, connect it to the current board/material, give or reference a small example/visual if useful, state a common mistake, then ask one check-for-understanding question. Do not rush.
- For SPSS/Excel/Power BI/software: describe the screen/menu/field/output interpretation when relevant. Explicitly direct the learner's attention to the visual by saying things like "look at this screenshot" or "as you see in the visuals pane...".
- For formulas/statistics/math: explain each symbol, why the operation is valid, and say "notice this formula here".
- For science/biology/anatomy: name the labelled parts, their function, their connection to the system, and say "focus on this part of the diagram".
- For technical/mechanical topics: explain component roles, flow of force/pressure/signal/material, and say "focus on this workflow chart".
- For humanities/languages: explain context, meaning, grammar details, invite learner response, and refer to text passages/tables.
- shouldShowOnBoard: true if a worked line, formula, diagram label, screenshot cue, or summary table would help; if so add 1–4 boardItems (type like "calculation"/"equation"/"bullet"/"diagram"/"screenshot").
- saveToNotes: true if the answer contains a reusable idea, rule, or correction worth revising later.
- suggestedFollowUp: one short offer, e.g. "Want me to show this on the board?" or "Shall I give another example?".

The 'answer' will be READ ALOUD by the teacher and shown as CAPTIONS, so keep it speakable.`;
}

/** Heuristic clarity check used by the deterministic fallback. */
function looksUnclear(question: string): boolean {
  const q = question.trim().toLowerCase();
  if (wordCount(q) <= 3) return true;
  const vague = [
    "i don't get it",
    "i dont get it",
    "why this",
    "what",
    "huh",
    "this?",
    "i'm lost",
    "im lost",
    "explain",
    "i don't understand",
    "i dont understand",
    "confused",
    "?",
    "this one",
  ];
  return vague.some((v) => q === v || q === v + "?" || (q.length <= 14 && q.includes(v)));
}

function snippet(value: string | undefined, fallback: string, max = 180): string {
  const cleaned = (value ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;
  return cleaned.length > max ? `${cleaned.slice(0, max).trim()}...` : cleaned;
}

function firstSentence(value: string | undefined, fallback: string): string {
  const cleaned = snippet(value, fallback, 320);
  const match = cleaned.match(/^(.+?[.!?])\s/);
  return match?.[1] ?? cleaned;
}

function sectionLabel(value: string | undefined): string {
  return (value ?? "this step").replace(/_/g, " ");
}

function buildClarificationOptions(ctx: z.infer<typeof ContextSchema>): string[] {
  const options = new Set<string>();
  if (ctx.currentBoardItem) options.add(`The board line: ${snippet(ctx.currentBoardItem, "", 48)}`);
  if (ctx.currentSection) options.add(`The ${sectionLabel(ctx.currentSection)} part`);
  if (ctx.teacherExplanation) options.add("The teacher's explanation");
  if (ctx.learnerNotes) options.add("The notes so far");
  options.add("Ask another way");
  return Array.from(options).slice(0, 4);
}

function fallbackTeacherAnswer(
  ctx: z.infer<typeof ContextSchema>,
  question: string,
): TeacherAnswer {
  // Unclear (and not already a clarification round) → ask to clarify.
  if (looksUnclear(question) && !ctx.priorClarification) {
    const section = sectionLabel(ctx.currentSection);
    return {
      clarity: "unclear",
      clarificationQuestion: `I want to answer clearly. Which part of ${section} do you mean?`,
      clarificationOptions: buildClarificationOptions(ctx),
      shouldShowOnBoard: false,
      saveToNotes: false,
      suggestedFollowUp: "Pick the part that's confusing and I'll explain just that.",
      source: "fallback",
    };
  }

  const board = ctx.currentBoardItem
    ? `Looking at the board where we have "${ctx.currentBoardItem}", `
    : "";
  const explain = ctx.teacherExplanation
    ? ctx.teacherExplanation
    : `let's connect your question back to what we are doing in "${ctx.lessonTitle}".`;
  let out = `Good question. ${board}${explain} Remember the key idea of this section: ${
    ctx.currentSection ?? "the current step"
  } builds directly on what we just covered. Take it one step at a time, and check each part against the example on the board. If it still feels unclear, raise your hand and we can work through another example together. You are doing well by asking — that is exactly how strong learners think.`;
  if (wordCount(out) < MIN_WORDS) {
    out += ` In short, focus on what the question is really asking, relate it to "${question.slice(0, 80)}", and move carefully through each line we wrote on the board before drawing your conclusion.`;
  }
  out = clampWords(out);
  return {
    clarity: "clear",
    answer: out,
      shouldShowOnBoard: true,
      boardItems: [
        {
          type: "bullet",
          text: `Focus: ${ctx.currentSection ?? "current step"} → example → check understanding`,
        },
      ],
    saveToNotes: true,
    suggestedFollowUp: "Does that help, or should I show another example?",
    source: "fallback",
  };
}

function groundedFallbackTeacherAnswer(
  ctx: z.infer<typeof ContextSchema>,
  question: string,
): TeacherAnswer {
  if (looksUnclear(question) && !ctx.priorClarification) {
    const section = sectionLabel(ctx.currentSection);
    return {
      clarity: "unclear",
      clarificationQuestion: `I want to answer clearly. Which part of ${section} do you mean?`,
      clarificationOptions: buildClarificationOptions(ctx),
      shouldShowOnBoard: false,
      saveToNotes: false,
      suggestedFollowUp: "Pick the part that is confusing and I will explain just that.",
      source: "fallback",
    };
  }

  const boardLine = snippet(ctx.currentBoardItem, "the current board line");
  const section = sectionLabel(ctx.currentSection);
  const explanation = firstSentence(
    ctx.teacherExplanation,
    `this part connects directly to the lesson goal in ${ctx.lessonTitle}.`,
  );
  const notes = firstSentence(
    ctx.learnerNotes,
    "the useful note is to slow down, identify what is given, and check each step against the board.",
  );
  const learnerNeed =
    ctx.learnerSentiment?.tone === "frustrated" || ctx.learnerProfile?.lastEmotion === "frustrated"
      ? "I can hear that this may feel frustrating, so I am going to slow it down."
      : "Let us slow it down and make the reasoning visible.";

  const out = clampWords(
    `Good question. ${learnerNeed} You are asking about "${snippet(question, "this question", 120)}", so I want you to look back at ${boardLine}. The first job is not to rush to an answer. First, name what the board is showing. In this section, ${section}, the key idea is this: ${explanation} Now connect that to your question. Ask yourself, what changed from the previous step, and what stayed the same? That tells you which rule or idea is being used. ${notes} A common mistake is to copy the next line without knowing why it follows from the last one. Instead, check the reason for each move before you accept it. If this is a calculation, explain each symbol before operating on it. If it is a diagram or language example, point to the exact part that proves the answer. Now try this check: can you say, in one sentence, why the current board line is true? If you can, you understand the step; if not, that is the exact part we should repeat together.`,
  );

  return {
    clarity: "clear",
    answer: out,
    shouldShowOnBoard: true,
    boardItems: [
      {
        type: "bullet",
        text: `Focus on ${section}: what changed, what stayed the same, and why the step follows.`,
      },
      {
        type: "bullet",
        text: `Board line: ${snippet(ctx.currentBoardItem, "current board line", 90)}`,
      },
      {
        type: "question",
        text: "Can you say why this board line is true in one sentence?",
      },
    ],
    saveToNotes: true,
    suggestedFollowUp: "Should I repeat this with a smaller example?",
    source: "fallback",
  };
}

/** Normalise a structured TeacherAnswer into the back-compat result shape. */
function toResult(a: TeacherAnswer): AnswerLearnerQuestionResult {
  const flat =
    a.clarity === "clear" ? (a.answer ?? "") : (a.clarificationQuestion ?? a.answer ?? "");
  return { ...a, answer: flat, wordCount: wordCount(flat) };
}

export const answerLearnerQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }: any): Promise<AnswerLearnerQuestionResult> => {
    await assertActorHasAnyRole(context, [
      "platform_admin",
      "institution_admin",
      "owner",
      "teacher",
      "student",
      "parent",
    ]);

    const resilientCaller = createResilientModelCaller("teacher_answer");
    if (!resilientCaller) {
      return toResult(groundedFallbackTeacherAnswer(data.context, data.question));
    }

    try {
      const result = await resilientCaller.call(
        TeacherAnswerSchema,
        buildSystemPrompt(data.context),
        `The learner asks: "${data.question}"\n\nReturn the structured teacher response now. If clear, the 'answer' must be ${MIN_WORDS}–${MAX_WORDS} words of plain spoken prose.`,
      );

      if (!result) {
        return toResult(groundedFallbackTeacherAnswer(data.context, data.question));
      }

      const { object } = result;

      // Clamp an over-long answer and enforce the back-compat shape.
      const normalised: TeacherAnswer = {
        clarity: object.clarity,
        clarificationQuestion: object.clarificationQuestion,
        clarificationOptions: object.clarificationOptions,
        answer: object.answer ? clampWords(object.answer) : undefined,
        shouldShowOnBoard: object.shouldShowOnBoard,
        boardItems: object.boardItems,
        saveToNotes: object.saveToNotes,
        suggestedFollowUp: object.suggestedFollowUp,
        source: "ai",
      };
      return toResult(normalised);
    } catch {
      return toResult(groundedFallbackTeacherAnswer(data.context, data.question));
    }
  });
