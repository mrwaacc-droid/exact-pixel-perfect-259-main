/**
 * autonomous-teaching-engine.ts
 *
 * A production-ready autonomous AI teaching system that:
 * 1. Uses live LLM for dynamic explanations
 * 2. Tracks student cognitive state
 * 3. Adapts teaching in real-time
 * 4. Detects mastery vs. confusion
 * 5. Provides targeted remediation
 * 6. Supports handoff to human teachers
 *
 * This is the brain of an AI teacher that can be "hired" to deliver lessons.
 */

import { generateText, generateObject } from "ai";
import { z } from "zod";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StudentLevel = "beginner" | "intermediate" | "advanced";
export type EmotionState =
  | "confident"
  | "curious"
  | "confused"
  | "frustrated"
  | "engaged"
  | "bored";
export type TeachingStrategy =
  | "explain"
  | "demonstrate"
  | "practice"
  | "quiz"
  | "remediate"
  | "accelerate"
  | "encourage";
export type MasteryLevel = "novice" | "learning" | "practicing" | "proficient" | "mastered";

export type CognitiveState = {
  /** Current emotion detected from interactions */
  emotionState: EmotionState;
  /** Estimated understanding level 0-1 */
  understandingScore: number;
  /** Topics the student has mastered */
  masteredConcepts: string[];
  /** Topics the student is struggling with */
  weakConcepts: string[];
  /** Preferred learning style detected */
  preferredStyle: "visual" | "auditory" | "kinesthetic" | "reading";
  /** Optimal pace detected 0.5-2.0 */
  optimalPace: number;
  /** Number of consecutive correct answers */
  streakCount: number;
  /** Time since last interaction (seconds) */
  idleSeconds: number;
  /** Cognitive load estimate 0-1 */
  cognitiveLoad: number;
  // Ambient Learner Model properties
  attentionSpanSeconds?: number;
  readingLevel?: string;
  confidenceScore?: number;
  motivationProfile?: "intrinsic" | "extrinsic" | "achievement" | "social";
  academicGoal?: string;
  learningHistorySummary?: string;
};

export type TeachingContext = {
  lessonId: string;
  lessonTitle: string;
  lessonObjective: string;
  currentStep: string;
  stepIndex: number;
  totalSteps: number;
  boardContent: string[];
  topic: string;
  subject: string;
  grade?: string;
};

export type TeachingDecision = {
  strategy: TeachingStrategy;
  reasoning: string;
  spokenText: string;
  boardUpdate?: {
    action: "append" | "replace" | "highlight" | "clear";
    content: string[];
  };
  nextStepSuggested?: string;
  questionToAsk?: string;
  waitForStudentResponse: boolean;
  encouragementLevel: "low" | "medium" | "high";
  estimatedSeconds: number;
  shouldEscalateToHuman: boolean;
  escalateReason?: string;
};

export type StudentResponse = {
  type: "text" | "voice" | "multiple_choice" | "skip" | "hint_request" | "repeat_request";
  content: string;
  selectedOption?: number;
  isCorrect?: boolean;
  hesitationMs?: number;
  timestamp: Date;
};

// ─────────────────────────────────────────────────────────────────────────────
// Cognitive Model Schema (for AI decisions)
// ─────────────────────────────────────────────────────────────────────────────

const CognitiveAnalysisSchema = z.object({
  emotionState: z.enum(["confident", "curious", "confused", "frustrated", "engaged", "bored"]),
  understandingScore: z.number().min(0).max(1),
  masteredConcepts: z.array(z.string()),
  weakConcepts: z.array(z.string()),
  preferredStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]),
  optimalPace: z.number().min(0.5).max(2),
  cognitiveLoad: z.number().min(0).max(1),
  recommendedStrategy: z.enum([
    "explain",
    "demonstrate",
    "practice",
    "quiz",
    "remediate",
    "accelerate",
    "encourage",
  ]),
  reasoning: z.string(),
  // Learner Model parameters
  attentionSpanSeconds: z.number().optional(),
  readingLevel: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  motivationProfile: z.enum(["intrinsic", "extrinsic", "achievement", "social"]).optional(),
  academicGoal: z.string().optional(),
  learningHistorySummary: z.string().optional(),
});

const TeachingDecisionSchema = z.object({
  strategy: z.enum([
    "explain",
    "demonstrate",
    "practice",
    "quiz",
    "remediate",
    "accelerate",
    "encourage",
  ]),
  reasoning: z.string(),
  spokenText: z.string().max(500),
  boardAction: z.enum(["append", "replace", "highlight", "clear"]).optional(),
  boardContent: z.array(z.string()).max(6).optional(),
  questionToAsk: z.string().optional(),
  waitForStudent: z.boolean(),
  encouragementLevel: z.enum(["low", "medium", "high"]),
  shouldEscalate: z.boolean(),
  escalateReason: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Autonomous Teaching Engine Class
// ─────────────────────────────────────────────────────────────────────────────

export class AutonomousTeachingEngine {
  private model: ReturnType<typeof createOpenAICompatible> | null = null;
  /** Allowed OpenAI models only: gpt-4o-mini, gpt-5-nano, gpt-4.1-nano; DeepSeek always uses deepseek-v4-flash. */
  private modelId = "gpt-4o-mini";
  private initialized = false;

  constructor() {
    this.initializeModel();
  }

  private initializeModel() {
    const openaiKey = process.env.OPENAI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    if (openaiKey) {
      this.model = createOpenAICompatible({
        name: "openai",
        baseURL: "https://api.openai.com/v1",
        apiKey: openaiKey,
      });
      this.modelId = "gpt-4o-mini";
    } else if (deepseekKey) {
      this.model = createOpenAICompatible({
        name: "deepseek",
        baseURL: "https://api.deepseek.com/v1",
        apiKey: deepseekKey,
      });
      this.modelId = "deepseek-v4-flash";
    }
    this.initialized = true;
  }

  // ─────────────────────────────────────────────────────────────────────
  // Core Teaching Decision Engine
  // ─────────────────────────────────────────────────────────────────────

  async analyzeStudentState(
    context: TeachingContext,
    currentCognitive: CognitiveState,
    recentInteractions: Array<{ role: "student" | "teacher"; content: string; timestamp: Date }>,
  ): Promise<CognitiveState> {
    if (!this.model) {
      return this.fallbackCognitiveAnalysis(currentCognitive, recentInteractions);
    }

    const interactionHistory = recentInteractions
      .slice(-10)
      .map((i) => `${i.role}: ${i.content}`)
      .join("\n");

    try {
      const { object } = await generateObject({
        model: this.model(this.modelId),
        schema: CognitiveAnalysisSchema,
        system: `You are an expert educational psychologist analyzing a student's cognitive and emotional state during an AI-taught lesson.

Context:
- Lesson: ${context.lessonTitle}
- Topic: ${context.topic}
- Current step: ${context.currentStep}
- Subject: ${context.subject}

Analyze the student's state based on their recent interactions. Consider:
- Signs of confusion vs understanding
- Engagement level (questions, speed)
- Frustration indicators
- Mastery indicators

Return your analysis as structured JSON.`,

        prompt: `Recent interactions:
${interactionHistory}

Current state estimate:
- Emotion: ${currentCognitive.emotionState}
- Understanding: ${currentCognitive.understandingScore}
- Weak concepts: ${currentCognitive.weakConcepts.join(", ") || "none"}
- Streak: ${currentCognitive.streakCount}

Analyze and update this student's cognitive state.`,
      });

      return {
        emotionState: object.emotionState,
        understandingScore: object.understandingScore,
        masteredConcepts: object.masteredConcepts,
        weakConcepts: object.weakConcepts,
        preferredStyle: object.preferredStyle,
        optimalPace: object.optimalPace,
        streakCount: currentCognitive.streakCount,
        idleSeconds: currentCognitive.idleSeconds,
        cognitiveLoad: object.cognitiveLoad,
        // Map Learner Model fields
        attentionSpanSeconds: object.attentionSpanSeconds,
        readingLevel: object.readingLevel,
        confidenceScore: object.confidenceScore,
        motivationProfile: object.motivationProfile,
        academicGoal: object.academicGoal,
        learningHistorySummary: object.learningHistorySummary,
      };
    } catch (error) {
      return this.fallbackCognitiveAnalysis(currentCognitive, recentInteractions);
    }
  }

  async decideNextAction(
    context: TeachingContext,
    cognitive: CognitiveState,
    recentInteractions: Array<{ role: "student" | "teacher"; content: string; timestamp: Date }>,
  ): Promise<TeachingDecision> {
    if (!this.model) {
      return this.fallbackTeachingDecision(context, cognitive);
    }

    const interactionHistory = recentInteractions
      .slice(-6)
      .map((i) => `${i.role}: ${i.content}`)
      .join("\n");

    try {
      const { object } = await generateObject({
        model: this.model(this.modelId),
        schema: TeachingDecisionSchema,
        system: `You are an expert AI teacher executing a pedagogically structured lesson under the Klassruum Classroom Intelligence Engine. Your job is to decide what to do next by using the AI Teacher Mind reasoning pipeline.

LESSON CONTEXT:
- Title: ${context.lessonTitle}
- Objective: ${context.lessonObjective}
- Subject: ${context.subject}
- Topic: ${context.topic}
- Grade Level: ${context.grade || "middle school"}
- Current Step: ${context.currentStep} (${context.stepIndex + 1}/${context.totalSteps})
- Board Content: ${context.boardContent.join(" | ")}

STUDENT COGNITIVE STATE:
- Emotion: ${cognitive.emotionState}
- Understanding: ${Math.round(cognitive.understandingScore * 100)}%
- Learning Style: ${cognitive.preferredStyle}
- Pace Preference: ${cognitive.optimalPace}x
- Cognitive Load: ${Math.round(cognitive.cognitiveLoad * 100)}%
- Weak Concepts: ${cognitive.weakConcepts.join(", ") || "none detected"}
- Mastery: ${cognitive.streakCount} correct in a row

AI TEACHER MIND REASONING PROCESS:
Before deciding, reason step-by-step through these three stages:
1. BEFORE TEACHING (Planning): What is the pedagogical intent of the current step? How complex is it? What mistakes usually happen here?
2. DURING TEACHING (Instruction): Is the student paying attention? Did they answer correctly? Should I explain, demonstrate on the whiteboard, repeat, or pause?
3. AFTER TEACHING (Assessment): Did the objectives get achieved? What misconceptions remain?

TEACHING RULES:
1. If emotion is "confused" or "frustrated", slow down the Human Teaching Voice, simplify explanations, and use alternate visual plans or analogies.
2. If understanding > 80% and streak > 3, accelerate, pose advanced practice, or quiz.
3. If cognitive load > 70%, pause, summarize, or reduce whiteboard clutter.
4. If weak concepts exist, remediate on the Intelligent Teaching Canvas before moving on.
5. Always sound like an experienced, warm, and calm human educator—never robotic.
6. Keep whiteboard content SHORT: calculations, key terms, examples.
7. Speech (spokenText) must be highly conversational, natural, and encouraging.

ESCALATION: If student seems completely lost after 3+ remediation attempts, set shouldEscalate=true.

Decide the next teaching action and return JSON.`,

        prompt: `Recent conversation:
${interactionHistory}

What should the AI teacher do next?`,
      });

      return {
        strategy: object.strategy,
        reasoning: object.reasoning,
        spokenText: object.spokenText,
        boardUpdate: object.boardContent
          ? {
              action:
                (object.boardAction as "append" | "replace" | "highlight" | "clear") || "append",
              content: object.boardContent,
            }
          : undefined,
        questionToAsk: object.questionToAsk,
        waitForStudentResponse: object.waitForStudent,
        encouragementLevel: object.encouragementLevel,
        estimatedSeconds: object.spokenText.length / 15 + 2, // ~15 chars/second speech rate
        shouldEscalateToHuman: object.shouldEscalate,
        escalateReason: object.escalateReason,
      };
    } catch (error) {
      return this.fallbackTeachingDecision(context, cognitive);
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Specialized Teaching Actions
  // ─────────────────────────────────────────────────────────────────────

  async generateAlternativeExplanation(
    context: TeachingContext,
    cognitive: CognitiveState,
    originalConcept: string,
  ): Promise<string> {
    if (!this.model) {
      return `Let me explain this differently. Think of it this way: ${originalConcept} means...`;
    }

    const { text } = await generateText({
      model: this.model(this.modelId),
      system: `You are an expert teacher providing an alternative explanation for a confused student.
The student learns best through ${cognitive.preferredStyle} methods.
Keep the explanation under 150 words and conversational.`,
      prompt: `Original concept: ${originalConcept}
Topic: ${context.topic}
Student says they don't understand.

Explain it in a completely different way that might click better.`,
    });

    return text;
  }

  async generatePracticeProblem(
    context: TeachingContext,
    cognitive: CognitiveState,
    difficulty: "easy" | "medium" | "hard",
  ): Promise<{ problem: string; expectedAnswer: string; hints: string[] }> {
    if (!this.model) {
      return {
        problem: `Practice: Apply what you learned about ${context.topic}.`,
        expectedAnswer: "Varies",
        hints: ["Think about the steps we discussed", "Check your work"],
      };
    }

    const PracticeSchema = z.object({
      problem: z.string(),
      expectedAnswer: z.string(),
      hints: z.array(z.string()).length(3),
    });

    const { object } = await generateObject({
      model: this.model(this.modelId),
      schema: PracticeSchema,
      system: `Generate a ${difficulty} practice problem for a student learning ${context.topic}.
Subject: ${context.subject}
Grade: ${context.grade || "middle school"}

The problem should:
- Be directly related to the lesson objective
- Be solvable with what was taught
- Have a clear expected answer
- Include 3 progressive hints`,
      prompt: `Generate a ${difficulty} practice problem about ${context.topic}.`,
    });

    return object;
  }

  async evaluateStudentAnswer(
    context: TeachingContext,
    problem: string,
    expectedAnswer: string,
    studentAnswer: string,
    cognitive: CognitiveState,
  ): Promise<{ isCorrect: boolean; feedback: string; misconception?: string }> {
    if (!this.model) {
      const isCorrect = studentAnswer.toLowerCase().includes(expectedAnswer.toLowerCase());
      return {
        isCorrect,
        feedback: isCorrect
          ? "Correct! Well done."
          : `Not quite. The expected answer was ${expectedAnswer}. Let's review this concept.`,
      };
    }

    const EvaluationSchema = z.object({
      isCorrect: z.boolean(),
      partialCredit: z.number().min(0).max(1),
      feedback: z.string(),
      misconception: z.string().optional(),
      needsRemediation: z.boolean(),
    });

    const { object } = await generateObject({
      model: this.model(this.modelId),
      schema: EvaluationSchema,
      system: `Evaluate a student's answer in the context of learning.

Problem: ${problem}
Expected answer: ${expectedAnswer}
Student's answer: ${studentAnswer}

Student's current state:
- Understanding: ${Math.round(cognitive.understandingScore * 100)}%
- Emotion: ${cognitive.emotionState}
- Weak concepts: ${cognitive.weakConcepts.join(", ") || "none"}

Evaluate fairly. Give partial credit for partially correct answers.
Identify any misconceptions that need addressing.
Keep feedback constructive and encouraging.`,
      prompt: `Evaluate this answer and provide feedback.`,
    });

    return {
      isCorrect: object.isCorrect,
      feedback: object.feedback,
      misconception: object.misconception,
    };
  }

  async generateLessonSummary(
    context: TeachingContext,
    cognitive: CognitiveState,
    keyPoints: string[],
  ): Promise<string> {
    if (!this.model) {
      return `Today we learned about ${context.topic}. Key points: ${keyPoints.join(", ")}. ${
        cognitive.weakConcepts.length > 0
          ? `You might want to review: ${cognitive.weakConcepts.join(", ")}.`
          : "Great work today!"
      }`;
    }

    const { text } = await generateText({
      model: this.model(this.modelId),
      system: `Generate a summary of what was learned in this lesson.
Student's mastery level: ${Math.round(cognitive.understandingScore * 100)}%
Areas of strength: ${cognitive.masteredConcepts.join(", ") || "general concepts"}
Areas to review: ${cognitive.weakConcepts.join(", ") || "none"}

Keep it encouraging and forward-looking.`,
      prompt: `Summarize this lesson on ${context.topic}.
Key points covered: ${keyPoints.join(", ")}

Write a 2-3 sentence summary suitable for the student's notes.`,
    });

    return text;
  }

  // ─────────────────────────────────────────────────────────────────────
  // Fallback Methods (when AI is unavailable)
  // ─────────────────────────────────────────────────────────────────────

  private fallbackCognitiveAnalysis(
    current: CognitiveState,
    interactions: Array<{ role: "student" | "teacher"; content: string; timestamp: Date }>,
  ): CognitiveState {
    const recentStudent = interactions
      .filter((i) => i.role === "student")
      .slice(-3)
      .map((i) => i.content.toLowerCase());

    let emotionState = current.emotionState;
    let understandingScore = current.understandingScore;

    // Simple sentiment analysis
    for (const msg of recentStudent) {
      if (msg.includes("confused") || msg.includes("don't understand") || msg.includes("stuck")) {
        emotionState = "confused";
        understandingScore = Math.max(0, understandingScore - 0.15);
      } else if (msg.includes("got it") || msg.includes("understand") || msg.includes("easy")) {
        emotionState = "confident";
        understandingScore = Math.min(1, understandingScore + 0.1);
      } else if (msg.includes("frustrated") || msg.includes("hard") || msg.includes("can't")) {
        emotionState = "frustrated";
        understandingScore = Math.max(0, understandingScore - 0.1);
      }
    }

    return { ...current, emotionState, understandingScore };
  }

  private fallbackTeachingDecision(
    context: TeachingContext,
    cognitive: CognitiveState,
  ): TeachingDecision {
    // Rule-based decision tree
    if (cognitive.emotionState === "confused" || cognitive.emotionState === "frustrated") {
      return {
        strategy: "remediate",
        reasoning: "Student appears confused or frustrated, slowing down",
        spokenText:
          "Let me try explaining this in a different way. Sometimes seeing it from a new angle helps.",
        waitForStudentResponse: false,
        encouragementLevel: "high",
        estimatedSeconds: 15,
        shouldEscalateToHuman: cognitive.understandingScore < 0.2,
        escalateReason:
          cognitive.understandingScore < 0.2
            ? "Student very confused, may need human intervention"
            : undefined,
      };
    }

    if (cognitive.understandingScore > 0.8 && cognitive.streakCount > 3) {
      return {
        strategy: "accelerate",
        reasoning: "Student is doing well, progressing faster",
        spokenText: "You're doing great! Let's move on to the next concept.",
        waitForStudentResponse: false,
        encouragementLevel: "high",
        estimatedSeconds: 5,
        shouldEscalateToHuman: false,
      };
    }

    if (cognitive.streakCount === 0 && cognitive.emotionState === "engaged") {
      return {
        strategy: "practice",
        reasoning: "Good engagement, testing understanding",
        spokenText: "Let's check your understanding with a quick question.",
        questionToAsk: "Let's check your understanding with a quick question.",
        waitForStudentResponse: true,
        encouragementLevel: "medium",
        estimatedSeconds: 20,
        shouldEscalateToHuman: false,
      };
    }

    // Default: continue teaching
    return {
      strategy: "explain",
      reasoning: "Continuing with planned lesson content",
      spokenText: `Let's continue. ${context.topic}.`,
      waitForStudentResponse: false,
      encouragementLevel: "medium",
      estimatedSeconds: 25,
      shouldEscalateToHuman: false,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────────────────────

let engineInstance: AutonomousTeachingEngine | null = null;

export function getAutonomousTeachingEngine(): AutonomousTeachingEngine {
  if (!engineInstance) {
    engineInstance = new AutonomousTeachingEngine();
  }
  return engineInstance;
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial Cognitive State Factory
// ─────────────────────────────────────────────────────────────────────────────

export function createInitialCognitiveState(): CognitiveState {
  return {
    emotionState: "curious",
    understandingScore: 0.5,
    masteredConcepts: [],
    weakConcepts: [],
    preferredStyle: "visual",
    optimalPace: 1.0,
    streakCount: 0,
    idleSeconds: 0,
    cognitiveLoad: 0.3,
  };
}
