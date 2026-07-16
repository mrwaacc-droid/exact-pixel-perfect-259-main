import type { LessonState, TeacherResponse, LessonStepKey, ChatTurn, QuizQuestion } from "./types";

const QUICK_ACTION_RESPONSES: Record<string, Partial<TeacherResponse>> = {
  "I don't understand. Can you explain it differently?": {
    speak:
      "Of course. Let me explain it another way. Think of factoring as working backwards from multiplication. We already have the finished expression, and we're trying to recover the two brackets that made it.",
    simpleExplanation:
      "Factoring is working backwards from multiplication to find what numbers were multiplied together.",
    encouragementLevel: "medium",
  },
  "Can you repeat that please?": {
    speak:
      "Sure. I'll say it again more clearly. We need two numbers that multiply to the constant term and add to the coefficient of x. Once we have them, we write the brackets and solve from there.",
    simpleExplanation:
      "We need two special numbers - when multiplied they give one result, when added they give another.",
    encouragementLevel: "low",
  },
  "Give me a real-world example.": {
    speak:
      "Good question. Imagine you're designing a rectangular garden. If the area is 24 square metres and the perimeter is fixed, a quadratic can help you work out the side lengths. That's one of the reasons this topic matters outside the classroom.",
    simpleExplanation:
      "Garden designers use quadratic equations to find the right dimensions when they know the area and perimeter.",
    encouragementLevel: "medium",
  },
  "Please slow down and break it into smaller steps.": {
    speak:
      "No problem. We'll shrink it right down. First, decide what two numbers you're hunting for. Next, check what those numbers must do: multiply to one value and add to another. Then test possible pairs. Once the pair works, write the factors and solve each bracket.",
    simpleExplanation:
      "Let's break it down: find the right numbers, test them, write as factors, then solve.",
    encouragementLevel: "high",
  },
  "I understand this, can we move a bit faster?": {
    speak:
      "Good. Since you've got the idea, I'll stop overexplaining and move a bit faster. Let's focus on the pattern and try something a little harder.",
    simpleExplanation: "Great! We'll focus on the main ideas and try harder problems.",
    encouragementLevel: "high",
  },
  "I'm ready — test me with a question.": {
    speak:
      "Alright, let's test it. What are the solutions to x² - 7x + 10 = 0? Keep your eye on the two numbers that multiply to 10 and add to negative 7.",
    quiz: {
      question: "What are the solutions to x² - 7x + 10 = 0?",
      options: ["x = 1 and x = 10", "x = 2 and x = 5", "x = -2 and x = -5", "x = -1 and x = -10"],
      correctIndex: 1,
      explanation: "The numbers are -2 and -5 because -2 × -5 = 10 and -2 + (-5) = -7",
    },
    encouragementLevel: "medium",
  },
  "Can you give me a hint without telling me the answer?": {
    speak:
      "Here's your hint: list the number pairs that multiply to the constant term, then test which pair adds to the coefficient. And don't forget to check the signs.",
    simpleExplanation:
      "List all number pairs that multiply correctly, then check which pair also adds correctly.",
    encouragementLevel: "low",
  },
  "Why is this important? How will I use this in real life?": {
    speak:
      "That's a fair question. Quadratic equations turn up whenever people need to model curves, distances, heights, areas, or best possible values. Engineers, scientists, economists, and even game developers use them because real problems rarely move in straight lines.",
    simpleExplanation:
      "Quadratic equations help engineers, scientists, and economists solve real problems about curves and finding the best solutions.",
    encouragementLevel: "medium",
  },
};

const STEP_TRANSITIONS: Record<LessonStepKey, LessonStepKey> = {
  hook: "concept",
  concept: "worked_example",
  worked_example: "guided_practice",
  guided_practice: "independent_question",
  independent_question: "correction",
  correction: "quiz",
  quiz: "summary",
  summary: "summary",
};

const CORRECT_RESPONSES = [
  "Yes, that's correct.",
  "Good. You've got it.",
  "That's right.",
  "Well done. That answer works.",
  "Correct. Nice work.",
];

const INCORRECT_RESPONSES = [
  "Not quite. Let's check the step that went wrong.",
  "Close. You were heading in the right direction, but one part needs fixing.",
  "Good try. Let's work it through carefully.",
  "That isn't the answer yet, but the mistake is fixable.",
  "Almost. Let's go back and check the signs and the factor pair.",
];

const PARTIAL_RESPONSES = [
  "You're partly there. Let's tighten it up.",
  "Good start. One more detail to fix.",
  "You're on the right path. Let's finish it properly.",
];

export function generateTeacherResponse(
  studentMessage: string,
  currentState: LessonState,
  lessonData: any,
): TeacherResponse {
  const lowerMessage = studentMessage.toLowerCase();

  // Check for quick action responses
  const quickActionMatch = QUICK_ACTION_RESPONSES[studentMessage];
  if (quickActionMatch) {
    return {
      speak: quickActionMatch.speak || "Let me help you with that.",
      board: {
        title: "Helpful Explanation",
        lines: [
          quickActionMatch.simpleExplanation || "Let me explain this differently.",
          "",
          "Key points to remember:",
          "• Break problems into smaller steps",
          "• Look for patterns",
          "• Practice with examples",
        ],
      },
      nextStep: currentState.step,
      confusionDelta: -0.1,
      encouragementLevel: quickActionMatch.encouragementLevel || "medium",
      simpleExplanation: quickActionMatch.simpleExplanation,
      ...(quickActionMatch.quiz && { quiz: quickActionMatch.quiz }),
    };
  }

  // Check for quiz answers
  const quizAnswerMatch = studentMessage.match(/my answer[:\s]+["']?([^"']+)["']?/i);
  if (quizAnswerMatch) {
    const answer = quizAnswerMatch[1].trim();
    const isCorrect = evaluateQuizAnswer(answer, currentState);

    if (isCorrect) {
      return {
        speak:
          CORRECT_RESPONSES[Math.floor(Math.random() * CORRECT_RESPONSES.length)] +
          " Ready for the next one?",
        board: {
          title: "Correct Answer!",
          lines: [
            "✓ " + answer,
            "",
            "That step is correct.",
            "Let's build on it.",
          ],
          highlight: answer,
        },
        nextStep: STEP_TRANSITIONS[currentState.step],
        confusionDelta: -0.2,
        evaluation: "correct",
        encouragementLevel: "high",
      };
    } else {
      return {
        speak: INCORRECT_RESPONSES[Math.floor(Math.random() * INCORRECT_RESPONSES.length)],
        board: {
          title: "Let's Review",
          lines: [
            "Your answer: " + answer,
            "",
            "Check these three things:",
            "1. Which numbers multiply to the constant?",
            "2. Which numbers add to the coefficient?",
            "3. Did you keep the signs correct?",
          ],
        },
        nextStep: currentState.step,
        confusionDelta: 0.1,
        evaluation: "incorrect",
        encouragementLevel: "medium",
      };
    }
  }

  // Check for "I think I got it wrong"
  if (lowerMessage.includes("wrong") || lowerMessage.includes("mistake")) {
    return {
      speak:
        "That's alright. Mistakes are useful if we can see exactly where they happened. Let's find the step that slipped.",
      board: {
        title: "Learning from Mistakes",
        lines: [
          "It's okay to make mistakes!",
          "",
          "Let's identify the issue:",
          "• Recheck the steps",
          "• Find the exact slip",
          "• Fix it and move on",
        ],
      },
      nextStep: "correction",
      confusionDelta: 0.15,
      evaluation: "incorrect",
      encouragementLevel: "high",
    };
  }

  // Check for understanding
  if (
    lowerMessage.includes("understand") ||
    lowerMessage.includes("get it") ||
    lowerMessage.includes("makes sense")
  ) {
    return {
      speak:
        "Good. If it makes sense now, let's build on it before the idea goes cold.",
      board: {
        title: "Progress Made!",
        lines: [
          "✓ Understanding confirmed",
          "",
          "You're ready for the next step.",
          "Let's keep going.",
        ],
      },
      nextStep: STEP_TRANSITIONS[currentState.step],
      confusionDelta: -0.15,
      evaluation: "correct",
      encouragementLevel: "high",
    };
  }

  // Check for confusion
  if (
    lowerMessage.includes("confused") ||
    lowerMessage.includes("don't know") ||
    lowerMessage.includes("stuck")
  ) {
    return {
      speak:
        "No problem. I'll come at it from a different angle. Sometimes one small reframe is all it takes.",
      board: {
        title: "Alternative Approach",
        lines: [
          "Let's try a different way to understand this.",
          "",
          "Think of it like a puzzle:",
          "• We know the finished result",
          "• We need the pieces that made it",
          "• Then we check that they really fit",
        ],
      },
      nextStep: currentState.step,
      confusionDelta: 0.05,
      encouragementLevel: "high",
    };
  }

  // Check for ready to continue
  if (
    lowerMessage.includes("ready") ||
    lowerMessage.includes("continue") ||
    lowerMessage.includes("next")
  ) {
    return {
      speak: "Good. Let's move to the next step while it's still fresh.",
      board: {
        title: "Moving Forward",
        lines: [
          "Ready for the next challenge!",
          "",
          "Let's apply what we've learned",
          "to a new situation.",
        ],
      },
      nextStep: STEP_TRANSITIONS[currentState.step],
      confusionDelta: -0.1,
      encouragementLevel: "medium",
    };
  }

  // Default response
  return {
    speak:
      "Alright. Let's stay with the method and sort out the next step together.",
    board: {
      title: "Next Step",
      lines: [
        "Let's keep working through it.",
        "",
        "Focus on three things:",
        "• What the step is doing",
        "• Why it works",
        "• Where people usually slip",
      ],
    },
    nextStep: currentState.step,
    confusionDelta: 0,
    encouragementLevel: "medium",
  };
}

function evaluateQuizAnswer(answer: string, state: LessonState): boolean {
  // This is a simplified evaluation - in a real implementation,
  // you'd compare against the actual correct answer
  const correctAnswers = ["2 and 5", "x = 2 and x = 5", "x=2 and x=5"];
  return correctAnswers.some((correct) => answer.toLowerCase().includes(correct.toLowerCase()));
}

export function generateConfusedResponse(currentState: LessonState): TeacherResponse {
  const explanations = [
    "I can see this part isn't settled yet. Let's go back to the foundation and make it clear.",
    "Let's slow it down and make sure each piece makes sense before we move on.",
    "This part is tricky. I'll explain it in a different way and we'll pin down the confusing bit.",
  ];

  return {
    speak: explanations[Math.floor(Math.random() * explanations.length)],
    board: {
      title: "Let's Clarify",
      lines: [
        "Breaking it down:",
        "",
        "Step 1: What are we solving for?",
        "Step 2: What information do we already have?",
        "Step 3: Which method fits this?",
        "Step 4: Work it through carefully",
      ],
    },
    nextStep: currentState.step,
    confusionDelta: -0.1,
    encouragementLevel: "high",
  };
}

export function generateEncouragement(state: LessonState): string {
  if (state.correct > state.mistakes) {
    return "You're doing well. Your answers show that the method is starting to stick.";
  } else if (state.confusionScore > 0.5) {
    return "I can see you're working at it. Don't panic — we just need to steady the shaky part.";
  } else {
    return "You're making progress. Keep asking when something doesn't sit right.";
  }
}

export function generateNextStepPrompt(currentStep: LessonStepKey): string {
  const prompts: Record<LessonStepKey, string> = {
    hook: "Ready to get into the idea behind it?",
    concept: "Want to see what this looks like in practice?",
    worked_example: "Ready to try one with me?",
    guided_practice: "Now try one on your own.",
    independent_question: "Let me check what you did.",
    correction: "Ready for a quick check?",
    quiz: "Good. Let's wrap up what we've learned.",
    summary: "That's the lesson. Nicely done.",
  };
  return prompts[currentStep] || "Ready to continue?";
}

export function adjustResponseStyle(
  baseResponse: TeacherResponse,
  studentLevel: "beginner" | "intermediate" | "advanced",
): TeacherResponse {
  if (studentLevel === "beginner") {
    return {
      ...baseResponse,
      speak: simplifyLanguage(baseResponse.speak),
      simpleExplanation: baseResponse.simpleExplanation || baseResponse.speak,
    };
  } else if (studentLevel === "advanced") {
    return {
      ...baseResponse,
      speak: addDepth(baseResponse.speak),
      encouragementLevel: "low",
    };
  }
  return baseResponse;
}

function simplifyLanguage(text: string): string {
  // Simplify complex language for beginners
  return text
    .replace(/consequently/gi, "so")
    .replace(/furthermore/gi, "also")
    .replace(/therefore/gi, "so")
    .replace(/however/gi, "but")
    .replace(/utilize/gi, "use")
    .replace(/demonstrate/gi, "show")
    .replace(/illustrate/gi, "show");
}

function addDepth(text: string): string {
  // Add more depth and nuance for advanced students
  return (
    text + " This connects to broader mathematical principles you'll encounter in advanced topics."
  );
}

export function shouldOfferQuiz(currentState: LessonState): boolean {
  // Offer quiz after some progress has been made
  const stepOrder = [
    "hook",
    "concept",
    "worked_example",
    "guided_practice",
    "independent_question",
    "correction",
    "quiz",
    "summary",
  ];
  const currentIndex = stepOrder.indexOf(currentState.step);
  return currentIndex >= 4 && currentState.confusionScore < 0.4;
}

export function calculateConfusionDelta(studentMessage: string, currentState: LessonState): number {
  const lowerMessage = studentMessage.toLowerCase();

  // Indicators of understanding
  if (
    lowerMessage.includes("understand") ||
    lowerMessage.includes("get it") ||
    lowerMessage.includes("easy")
  ) {
    return -0.15;
  }

  // Indicators of confusion
  if (
    lowerMessage.includes("confused") ||
    lowerMessage.includes("don't know") ||
    lowerMessage.includes("stuck")
  ) {
    return 0.15;
  }

  // Indicators of partial understanding
  if (
    lowerMessage.includes("kind of") ||
    lowerMessage.includes("sort of") ||
    lowerMessage.includes("maybe")
  ) {
    return 0.05;
  }

  return 0;
}
