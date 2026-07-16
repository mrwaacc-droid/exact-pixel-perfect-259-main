import type {
    ClassroomChoiceQuestion,
    ClassroomConfidenceOption,
    ClassroomLessonContent,
    ClassroomPracticeCycle,
    ClassroomPracticeProblem,
    ClassroomReteachMoment,
    ClassroomVisualAsset,
} from "@/lib/classroom-content";
import type { MathTeachingItem } from "@/lib/lesson-models";
import { findKingpinGrade9MathematicsLesson } from "./kingpin-grade9-mathematics-catalog";

type LessonTemplate = {
    focusStatement: string;
    workedExample: string[];
    guidedPrompt: string;
    independentPrompt: string;
    commonMistake: string;
    recap: string[];
    practiceProblems: ClassroomPracticeProblem[];
    middleQuestion: ClassroomChoiceQuestion;
    exitTicket: ClassroomChoiceQuestion;
};

const CONFIDENCE_OPTIONS: ClassroomConfidenceOption[] = [
    { label: "I understand clearly", value: "clear", emoji: "😀" },
    { label: "I need one more example", value: "almost", emoji: "🙂" },
    { label: "I am still unsure", value: "support", emoji: "😐" },
    { label: "Please reteach this", value: "reteach", emoji: "🔁" },
];

function item(
    id: string,
    type: MathTeachingItem["type"],
    boardText: string,
    exactSpokenText: string,
    teacherExplanation: string,
    whyThisStepMatters: string,
    commonMistake?: string,
): MathTeachingItem {
    return {
        id,
        type,
        boardText,
        exactSpokenText,
        teacherExplanation,
        whyThisStepMatters,
        commonMistake,
        accessibleDescription: boardText,
        writingSpeed: type === "equation" || type === "calculation" ? "normal" : "slow",
    };
}

function pickTemplate(title: string): LessonTemplate {
    const lower = title.toLowerCase();

    if (lower.includes("integer")) {
        return {
            focusStatement: "Integers help us reason about value above and below zero in a consistent way.",
            workedExample: ["-3 < 0 < 5", "-4 + 7 = 3", "6 - 9 = -3"],
            guidedPrompt: "Compare, order, or operate on integers while explaining why the sign changes or stays the same.",
            independentPrompt: "Complete three short integer questions and justify one answer in words.",
            commonMistake: "Treating a negative sign as decoration instead of part of the value.",
            recap: [
                "Integers extend whole numbers below zero.",
                "A number farther right on the number line is greater.",
                "Sign rules matter because direction and value both matter.",
            ],
            practiceProblems: [
                {
                    equation: "-6 + 9",
                    question: "Find the sum.",
                    correctAnswer: "3",
                    hint: "Start at -6 and move 9 units to the right.",
                    hints: ["Use the number line idea.", "A larger positive value can offset a negative value."],
                    misconception: { answer: "-15", note: "You added the values but kept the wrong sign logic." },
                },
                {
                    equation: "4 - 11",
                    question: "Find the difference.",
                    correctAnswer: "-7",
                    hint: "Subtracting a bigger number from a smaller one crosses below zero.",
                    hints: ["Think of 4 as your starting point.", "Move 11 units left."],
                    misconception: { answer: "7", note: "The absolute difference is 7, but the result must be negative." },
                },
            ],
            middleQuestion: {
                question: "Which statement is true?",
                options: ["-2 is greater than 1", "1 is greater than -2", "-2 and 1 are equal", "0 is less than -2"],
                correct: "1 is greater than -2",
                feedbackCorrect: "Correct. Numbers to the right on the number line are greater.",
                feedbackIncorrect: "Revisit the number line and compare positions carefully.",
            },
            exitTicket: {
                question: "What is -8 + 5?",
                options: ["-13", "13", "-3", "3"],
                correct: "-3",
                feedbackCorrect: "Correct. The positive 5 does not fully cancel the negative 8.",
                feedbackIncorrect: "Think about combining opposites and the remaining value.",
            },
        };
    }

    if (lower.includes("fraction") || lower.includes("decimal") || lower.includes("percentage")) {
        return {
            focusStatement: "Fractions, decimals, and percentages are different ways of expressing the same quantity.",
            workedExample: ["1/2 = 0.5 = 50%", "25% of 80 = 20", "0.75 = 75%"],
            guidedPrompt: "Convert between the three forms and explain what stays the same in each conversion.",
            independentPrompt: "Solve short conversion questions and one percentage application problem.",
            commonMistake: "Moving between forms without thinking about place value or the meaning of percent.",
            recap: [
                "Percent means out of 100.",
                "Decimals can be rewritten as fractions and percentages.",
                "Equivalent forms represent the same amount.",
            ],
            practiceProblems: [
                {
                    equation: "35% of 200",
                    question: "Calculate the value.",
                    correctAnswer: "70",
                    hint: "Write 35% as 35/100 or 0.35 first.",
                    hints: ["Find one form you trust first.", "Then multiply by 200."],
                    misconception: { answer: "7", note: "You divided by 10 but did not account for the full percentage value." },
                },
                {
                    equation: "0.48",
                    question: "Write this decimal as a percentage.",
                    correctAnswer: "48%",
                    hint: "Multiply by 100.",
                    hints: ["Shift the decimal two places right.", "Then attach the percent sign."],
                    misconception: { answer: "0.48%", note: "A decimal written as a percent must be scaled by 100." },
                },
            ],
            middleQuestion: {
                question: "Which is equivalent to 0.25?",
                options: ["2.5%", "25%", "250%", "1/25"],
                correct: "25%",
                feedbackCorrect: "Correct. 0.25 means 25 hundredths, which is 25%.",
                feedbackIncorrect: "Return to the idea that percent means out of one hundred.",
            },
            exitTicket: {
                question: "What is 10% of 450?",
                options: ["4.5", "45", "450", "40"],
                correct: "45",
                feedbackCorrect: "Correct. Ten percent is one tenth of the quantity.",
                feedbackIncorrect: "Use the idea that 10% is 0.1 or one tenth.",
            },
        };
    }

    if (lower.includes("ratio") || lower.includes("proportion") || lower.includes("rate")) {
        return {
            focusStatement: "Ratio and proportion compare quantities in a way that keeps the relationship consistent.",
            workedExample: ["3:4", "6:8 = 3:4", "If 2 books cost 300, 5 books cost 750"],
            guidedPrompt: "Simplify ratios, scale them correctly, and explain how proportional relationships are preserved.",
            independentPrompt: "Solve ratio and direct-proportion questions from daily-life contexts.",
            commonMistake: "Scaling one side of a ratio without scaling the other side by the same factor.",
            recap: [
                "Ratios compare like or unlike quantities.",
                "Equivalent ratios preserve the same relationship.",
                "Direct proportion means quantities change together by the same multiplier.",
            ],
            practiceProblems: [
                {
                    equation: "12:18",
                    question: "Simplify the ratio.",
                    correctAnswer: "2:3",
                    hint: "Divide both terms by their highest common factor.",
                    hints: ["Look for a common factor of 6.", "Always divide both parts."],
                    misconception: { answer: "6:9", note: "You reduced the ratio, but not to the simplest form." },
                },
                {
                    equation: "3 pens cost 90 KES",
                    question: "How much do 7 pens cost if the rate stays constant?",
                    correctAnswer: "210",
                    hint: "Find the cost of one pen first.",
                    hints: ["90 ÷ 3 gives the unit rate.", "Then multiply by 7."],
                    misconception: { answer: "270", note: "Check whether you multiplied the full cost instead of the unit rate." },
                },
            ],
            middleQuestion: {
                question: "What must stay true in equivalent ratios?",
                options: [
                    "Only the first term changes",
                    "Both terms are scaled by the same factor",
                    "The terms must add to 10",
                    "The second term becomes zero",
                ],
                correct: "Both terms are scaled by the same factor",
                feedbackCorrect: "Correct. Equivalent ratios preserve the same multiplicative relationship.",
                feedbackIncorrect: "Think multiplicatively, not additively.",
            },
            exitTicket: {
                question: "If 5 mangoes cost 100 KES, how much do 2 mangoes cost?",
                options: ["20 KES", "40 KES", "50 KES", "200 KES"],
                correct: "40 KES",
                feedbackCorrect: "Correct. One mango costs 20 KES, so two cost 40 KES.",
                feedbackIncorrect: "Use the unit rate before scaling up or down.",
            },
        };
    }

    if (lower.includes("index") || lower.includes("square") || lower.includes("cube") || lower.includes("pattern")) {
        return {
            focusStatement: "Patterns, powers, and roots help us describe repeated structure efficiently.",
            workedExample: ["4² = 16", "∛27 = 3", "2, 5, 8, 11, ..."],
            guidedPrompt: "Read the pattern, identify the rule, and explain the structure behind it.",
            independentPrompt: "Complete short pattern, power, and root tasks with correct notation.",
            commonMistake: "Confusing repeated multiplication with repeated addition, or roots with division.",
            recap: [
                "Indices show repeated multiplication.",
                "Roots reverse powers.",
                "Patterns are easier to manage when we identify the rule clearly.",
            ],
            practiceProblems: [
                {
                    equation: "7²",
                    question: "Evaluate the expression.",
                    correctAnswer: "49",
                    hint: "Square means multiply the number by itself once.",
                    hints: ["7 × 7", "Then state the product."],
                    misconception: { answer: "14", note: "Squaring is not doubling." },
                },
                {
                    equation: "3, 6, 9, 12, ...",
                    question: "What is the next term?",
                    correctAnswer: "15",
                    hint: "Look at the repeated change between consecutive terms.",
                    hints: ["The difference is constant.", "Add the same amount again."],
                    misconception: { answer: "14", note: "Check whether the pattern is additive or multiplicative." },
                },
            ],
            middleQuestion: {
                question: "Which statement is correct?",
                options: ["√16 = 8", "√16 = 4", "4² = 8", "3² = 6"],
                correct: "√16 = 4",
                feedbackCorrect: "Correct. Square root asks for the number that squares to 16.",
                feedbackIncorrect: "Review how powers and roots undo one another.",
            },
            exitTicket: {
                question: "What is the next term in 10, 15, 20, 25, ...?",
                options: ["30", "35", "40", "45"],
                correct: "30",
                feedbackCorrect: "Correct. The pattern increases by 5 each time.",
                feedbackIncorrect: "Check the constant difference between terms.",
            },
        };
    }

    if (lower.includes("expression") || lower.includes("term") || lower.includes("expand")) {
        return {
            focusStatement: "Algebraic expressions describe patterns and relationships in a general way.",
            workedExample: ["3x + 2x = 5x", "2(a + 3) = 2a + 6", "7n - 4"],
            guidedPrompt: "Identify like terms, explain each symbol, and simplify carefully.",
            independentPrompt: "Simplify or expand short expressions while keeping notation tidy.",
            commonMistake: "Combining unlike terms as if all variables and numbers are interchangeable.",
            recap: [
                "Like terms share the same variable part.",
                "Coefficients tell us how many of a variable we have.",
                "Expansion distributes multiplication across the bracket.",
            ],
            practiceProblems: [
                {
                    equation: "4x + 3x",
                    question: "Simplify the expression.",
                    correctAnswer: "7x",
                    hint: "Both terms have the same variable part.",
                    hints: ["Add the coefficients.", "Keep the variable the same."],
                    misconception: { answer: "7x²", note: "Adding like terms does not square the variable." },
                },
                {
                    equation: "3(y + 2)",
                    question: "Expand the bracket.",
                    correctAnswer: "3y + 6",
                    hint: "Multiply 3 by each term inside the bracket.",
                    hints: ["3 × y", "3 × 2"],
                    misconception: { answer: "3y + 2", note: "The 3 must affect every term in the bracket." },
                },
            ],
            middleQuestion: {
                question: "Which pair are like terms?",
                options: ["2x and 3x", "2x and 2y", "3 and x", "4a and 4ab"],
                correct: "2x and 3x",
                feedbackCorrect: "Correct. They share the same variable structure.",
                feedbackIncorrect: "Like terms must have the same variable part.",
            },
            exitTicket: {
                question: "Simplify 5m - 2m.",
                options: ["3", "3m", "7m", "10m"],
                correct: "3m",
                feedbackCorrect: "Correct. Subtract the coefficients and keep the variable.",
                feedbackIncorrect: "Focus on the coefficients of like terms.",
            },
        };
    }

    if (lower.includes("substitution") || lower.includes("formula")) {
        return {
            focusStatement: "Substitution and formula use allow us to turn general relationships into exact answers.",
            workedExample: ["If x = 3, then 2x + 5 = 11", "A = l × w", "v = d/t"],
            guidedPrompt: "Replace symbols with values carefully and keep the order of operations visible.",
            independentPrompt: "Substitute into expressions or formulae and state answers with correct units where needed.",
            commonMistake: "Dropping brackets or substituting values into the wrong position.",
            recap: [
                "A formula is a rule connecting quantities.",
                "Substitution must preserve the original structure.",
                "Units matter when formulae describe measurement.",
            ],
            practiceProblems: [
                {
                    equation: "2x + 4 when x = 5",
                    question: "Evaluate the expression.",
                    correctAnswer: "14",
                    hint: "Replace x with 5 first.",
                    hints: ["2(5) + 4", "Then calculate."],
                    misconception: { answer: "10", note: "You substituted but forgot to add the constant term." },
                },
                {
                    equation: "A = l × w, l = 8, w = 3",
                    question: "Find A.",
                    correctAnswer: "24",
                    hint: "Write the formula with the new values before multiplying.",
                    hints: ["A = 8 × 3", "Then multiply."],
                    misconception: { answer: "11", note: "Area here is multiplication, not addition." },
                },
            ],
            middleQuestion: {
                question: "What is the first step in substitution?",
                options: [
                    "Change the signs randomly",
                    "Replace the variable with its given value",
                    "Delete the formula",
                    "Always divide first",
                ],
                correct: "Replace the variable with its given value",
                feedbackCorrect: "Correct. Start by rewriting the expression with the known value in place.",
                feedbackIncorrect: "Substitution begins by replacing symbols with the stated values.",
            },
            exitTicket: {
                question: "If y = 4, what is y + 6?",
                options: ["2", "10", "24", "46"],
                correct: "10",
                feedbackCorrect: "Correct. Substitute 4 and add 6.",
                feedbackIncorrect: "Substitute first, then apply the operation shown.",
            },
        };
    }

    if (lower.includes("equation")) {
        return {
            focusStatement: "An equation states that two expressions are equal, so every move must keep the balance true.",
            workedExample: ["x + 5 = 12", "x = 12 - 5", "x = 7"],
            guidedPrompt: "Use inverse operations and explain why each step keeps the equation balanced.",
            independentPrompt: "Solve short equations and one word problem using clear algebraic steps.",
            commonMistake: "Doing an operation on one side only and breaking the balance.",
            recap: [
                "Equations model unknown values.",
                "Inverse operations undo what was done to the variable.",
                "Both sides must stay balanced after every step.",
            ],
            practiceProblems: [
                {
                    equation: "x + 9 = 14",
                    question: "Solve for x.",
                    correctAnswer: "5",
                    hint: "Undo the +9.",
                    hints: ["Subtract 9 from both sides.", "Then simplify."],
                    misconception: { answer: "23", note: "You added instead of undoing the operation." },
                },
                {
                    equation: "3x = 21",
                    question: "Solve for x.",
                    correctAnswer: "7",
                    hint: "Undo multiplication by dividing both sides by 3.",
                    hints: ["Keep the equation balanced.", "Then check the result."],
                    misconception: { answer: "18", note: "Subtracting 3 does not undo multiplication by 3." },
                },
            ],
            middleQuestion: {
                question: "Why do we use inverse operations in solving equations?",
                options: [
                    "To make the equation longer",
                    "To isolate the variable while keeping the equation balanced",
                    "To remove all numbers",
                    "To avoid checking answers",
                ],
                correct: "To isolate the variable while keeping the equation balanced",
                feedbackCorrect: "Correct. The goal is to uncover the unknown without breaking equality.",
                feedbackIncorrect: "Think about balance and isolating the variable.",
            },
            exitTicket: {
                question: "Solve y - 4 = 9.",
                options: ["5", "13", "-13", "36"],
                correct: "13",
                feedbackCorrect: "Correct. Add 4 to both sides.",
                feedbackIncorrect: "Undo subtraction carefully by using the inverse operation.",
            },
        };
    }

    if (lower.includes("sequence")) {
        return {
            focusStatement: "Sequences help us describe regular change and predict what comes next.",
            workedExample: ["5, 8, 11, 14", "Add 3 each time", "nth term: 3n + 2"],
            guidedPrompt: "Describe the rule in words, then express it as a mathematical pattern.",
            independentPrompt: "Complete missing terms, predict future terms, and explain the rule.",
            commonMistake: "Guessing from one pair of terms instead of checking the whole pattern.",
            recap: [
                "A sequence follows a rule.",
                "A constant difference creates an arithmetic pattern.",
                "General rules help us predict efficiently.",
            ],
            practiceProblems: [
                {
                    equation: "6, 10, 14, 18, ...",
                    question: "Write the next term.",
                    correctAnswer: "22",
                    hint: "Look for the constant difference.",
                    hints: ["The difference is +4.", "Add 4 once more."],
                    misconception: { answer: "20", note: "Check the repeated difference carefully." },
                },
                {
                    equation: "2, 5, 8, 11, ...",
                    question: "Describe the rule.",
                    correctAnswer: "Add 3 each time",
                    hint: "Compare consecutive terms.",
                    hints: ["5 - 2", "8 - 5"],
                    misconception: { answer: "Multiply by 3", note: "The pattern changes by addition, not multiplication." },
                },
            ],
            middleQuestion: {
                question: "What tells us a sequence is arithmetic?",
                options: [
                    "The terms all look similar",
                    "The same number is added or subtracted each time",
                    "Every term is even",
                    "The sequence has four terms",
                ],
                correct: "The same number is added or subtracted each time",
                feedbackCorrect: "Correct. A constant difference defines an arithmetic sequence.",
                feedbackIncorrect: "Focus on how the sequence changes from one term to the next.",
            },
            exitTicket: {
                question: "What is the next term in 4, 9, 14, 19, ...?",
                options: ["20", "24", "25", "29"],
                correct: "24",
                feedbackCorrect: "Correct. The common difference is 5.",
                feedbackIncorrect: "Look for the repeated increase between terms.",
            },
        };
    }

    if (lower.includes("coordinate") || lower.includes("cartesian") || lower.includes("graph")) {
        return {
            focusStatement: "Coordinates help us describe exact position on a plane and prepare us for graph-based reasoning.",
            workedExample: ["(2, 3)", "x-axis → horizontal", "y-axis → vertical"],
            guidedPrompt: "Plot and read ordered pairs while keeping x and y in the correct order.",
            independentPrompt: "Use a coordinate grid to locate, label, and interpret points accurately.",
            commonMistake: "Reversing the x-coordinate and y-coordinate positions.",
            recap: [
                "Ordered pairs are written (x, y).",
                "The x-coordinate comes first.",
                "Coordinates describe exact location.",
            ],
            practiceProblems: [
                {
                    equation: "(4, 1)",
                    question: "State the x-coordinate.",
                    correctAnswer: "4",
                    hint: "The x-coordinate is written first.",
                    hints: ["Read left to right inside the bracket.", "The first value is horizontal position."],
                    misconception: { answer: "1", note: "You selected the y-coordinate instead of the x-coordinate." },
                },
                {
                    equation: "Point A = (2, 5)",
                    question: "State the y-coordinate.",
                    correctAnswer: "5",
                    hint: "The second value gives the vertical position.",
                    hints: ["The y-value comes second.", "Look after the comma."],
                    misconception: { answer: "2", note: "You used the first value, which is the x-coordinate." },
                },
            ],
            middleQuestion: {
                question: "Which ordered pair places a point 3 units right and 2 units up?",
                options: ["(2, 3)", "(3, 2)", "(-3, 2)", "(3, -2)"],
                correct: "(3, 2)",
                feedbackCorrect: "Correct. Right corresponds to positive x, and up corresponds to positive y.",
                feedbackIncorrect: "Remember: x first, then y.",
            },
            exitTicket: {
                question: "In the ordered pair (6, 4), what is the y-coordinate?",
                options: ["6", "4", "10", "2"],
                correct: "4",
                feedbackCorrect: "Correct. The y-coordinate is the second number.",
                feedbackIncorrect: "Review the meaning of x first, y second.",
            },
        };
    }

    if (lower.includes("angle") || lower.includes("line")) {
        return {
            focusStatement: "Angle facts help us reason about space, shape, and direction with precision.",
            workedExample: ["Angles on a straight line = 180°", "Angles at a point = 360°", "Vertically opposite angles are equal"],
            guidedPrompt: "Use known angle facts to determine unknown values step by step.",
            independentPrompt: "Solve short geometry questions and explain which angle fact you used.",
            commonMistake: "Using the right fact but applying it to the wrong diagram position.",
            recap: [
                "Angles on a straight line sum to 180°.",
                "Angles around a point sum to 360°.",
                "Some angle relationships depend on line position and intersection.",
            ],
            practiceProblems: [
                {
                    equation: "x + 70 = 180",
                    question: "Find x if the angles are on a straight line.",
                    correctAnswer: "110",
                    hint: "Use the straight-line sum.",
                    hints: ["Subtract 70 from 180.", "Then write the missing angle."],
                    misconception: { answer: "250", note: "Straight-line angles add to 180°, not 360°." },
                },
                {
                    equation: "Two vertically opposite angles",
                    question: "If one angle is 55°, what is the other?",
                    correctAnswer: "55",
                    hint: "Vertically opposite angles are equal.",
                    hints: ["Opposite pairs match in measure.", "No extra addition is needed here."],
                    misconception: { answer: "125", note: "You may have mixed this up with supplementary angles." },
                },
            ],
            middleQuestion: {
                question: "What is the sum of angles on a straight line?",
                options: ["90°", "180°", "270°", "360°"],
                correct: "180°",
                feedbackCorrect: "Correct. That fact anchors many line-and-angle problems.",
                feedbackIncorrect: "Revisit the standard angle facts used in diagrams.",
            },
            exitTicket: {
                question: "Angles at a point add up to:",
                options: ["90°", "180°", "270°", "360°"],
                correct: "360°",
                feedbackCorrect: "Correct. A full turn measures 360°.",
                feedbackIncorrect: "Think of making a full turn around a point.",
            },
        };
    }

    return {
        focusStatement: "Revision helps us organise ideas, identify weak points, and prepare for stronger independent performance.",
        workedExample: ["Recall the key method", "Choose the right rule", "Explain one correction clearly"],
        guidedPrompt: "Revisit major methods, compare mistakes, and explain how to improve them.",
        independentPrompt: "Complete a short mixed review and identify one area that still needs support.",
        commonMistake: "Rushing into answers without deciding which method matches the question.",
        recap: [
            "Revision is most powerful when errors are analysed.",
            "Strong learners can explain not only the answer but also the method.",
            "Confidence grows when patterns across topics become clear.",
        ],
        practiceProblems: [
            {
                equation: "Mixed review item 1",
                question: "Choose the correct strategy before solving.",
                correctAnswer: "Use the topic rule shown in class",
                hint: "Name the topic first, then the method.",
                hints: ["Ask: what kind of question is this?", "Then apply the matching rule."],
                misconception: { answer: "Guess and check only", note: "Use a deliberate method instead of random guessing." },
            },
            {
                equation: "Mixed review item 2",
                question: "Correct one mistake and explain it.",
                correctAnswer: "A corrected explanation",
                hint: "State what was wrong before giving the right method.",
                hints: ["Find the exact error first.", "Then rewrite the step properly."],
                misconception: { answer: "Only change the final answer", note: "Good correction explains the faulty step, not just the final value." },
            },
        ],
        middleQuestion: {
            question: "What is the purpose of revision?",
            options: [
                "To memorise without understanding",
                "To organise, practise, and correct understanding",
                "To avoid mathematics",
                "To skip weak topics",
            ],
            correct: "To organise, practise, and correct understanding",
            feedbackCorrect: "Correct. Revision is about strengthening understanding through organised review.",
            feedbackIncorrect: "Revision should improve understanding, not hide confusion.",
        },
        exitTicket: {
            question: "What should you do after spotting a mistake?",
            options: [
                "Ignore it",
                "Blame the question",
                "Correct it and explain the right method",
                "Erase all working",
            ],
            correct: "Correct it and explain the right method",
            feedbackCorrect: "Correct. Reflection turns errors into learning evidence.",
            feedbackIncorrect: "Learning improves when mistakes are corrected deliberately.",
        },
    };
}

function buildSequence(title: string, objective: string, template: LessonTemplate): MathTeachingItem[] {
    const safeId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return [
        item(`${safeId}-1`, "concept", title, title, `Today we focus on ${objective.toLowerCase()}`, "This names the learning target clearly."),
        item(`${safeId}-2`, "concept", template.focusStatement, template.focusStatement, template.focusStatement, "It anchors the big idea before procedure."),
        item(`${safeId}-3`, "instruction", "Goal: explain each step clearly", "Goal: explain each step clearly", "Mathematics becomes stronger when we can justify each move, not only give final answers.", "This sets the expectation for reasoning and communication."),
        item(`${safeId}-4`, "equation", template.workedExample[0], `Our first worked example is ${template.workedExample[0]}.`, `We begin with a visible example so that the board, the voice explanation, and the learner notes stay connected.`, "A worked example gives learners a safe first model."),
        item(`${safeId}-5`, "calculation", template.workedExample[1], `Now notice ${template.workedExample[1]}.`, `This step shows the mathematical relationship or method we must pay attention to.`, "This is where the method becomes visible and repeatable.", template.commonMistake),
        item(`${safeId}-6`, "answer", template.workedExample[2], `So the key outcome becomes ${template.workedExample[2]}.`, `The class should pause here and ask why this result makes sense, not only whether it is written correctly.`, "This step turns procedure into meaning.", template.commonMistake),
        item(`${safeId}-7`, "question", template.guidedPrompt, template.guidedPrompt, `This guided prompt checks whether learners can now imitate the method with support.`, "Guided practice moves the lesson from observation to participation."),
        item(`${safeId}-8`, "instruction", template.independentPrompt, template.independentPrompt, `Learners should now try a short independent task while keeping the method organised and neat.`, "Independent practice shows whether the learner can transfer the method."),
        item(`${safeId}-9`, "warning", `Common mistake: ${template.commonMistake}`, `Common mistake: ${template.commonMistake}`, `Highlighting the error pattern early reduces repeated confusion and supports correction.`, "Misconception checks prevent weak habits from settling."),
        item(`${safeId}-10`, "concept", `Summary: ${template.recap[0]}`, `Summary: ${template.recap[0]}`, `${template.recap.join(" ")}`, "A strong ending helps the learner carry the key idea into the next lesson."),
    ].map((entry) => ({ ...entry, type: entry.type === "warning" ? "concept" : entry.type }));
}

function buildVisualPlan(title: string, theme: string): ClassroomVisualAsset[] {
    return [
        {
            id: `${title}-visual-1`,
            kind: "formula",
            source: "whiteboard",
            title: `${title} formula board`,
            description: `Whiteboard support for ${title} with focus on ${theme}.`,
            alt: `${title} whiteboard support`,
            teacherCue: "Point to the key relationship on the board before asking the learner to respond.",
        },
        {
            id: `${title}-visual-2`,
            kind: "text_reference",
            source: "fallback",
            title: `${title} vocabulary card`,
            description: `Short vocabulary and method reference for ${title}.`,
            alt: `${title} vocabulary reference`,
            teacherCue: "Use this as a recap support when the learner needs to re-hear the exact mathematical language.",
        },
    ];
}

function buildPracticeCycles(lessonTitle: string, practiceProblems: ClassroomPracticeProblem[]): ClassroomPracticeCycle[] {
    return [
        {
            id: `${lessonTitle}-cycle-beginner`,
            topic: lessonTitle,
            difficulty: "beginner",
            problems: practiceProblems,
        },
    ];
}

function buildReteachMoments(title: string, template: LessonTemplate): ClassroomReteachMoment[] {
    return [
        {
            concept: title,
            recapPoints: template.recap,
            alternateExplanation:
                "If confusion appears, slow down the worked example, restate the rule in simpler language, and model one fresh example before asking the learner to try again.",
            visualCue: "Re-point to the worked example and underline the step where the misconception begins.",
        },
    ];
}

export function buildKingpinGrade9MathematicsClassroomContent(
    lessonId: string,
): ClassroomLessonContent | null {
    const match = findKingpinGrade9MathematicsLesson(lessonId);
    if (!match || match.module.id !== "term1") return null;

    const { course, module, lesson } = match;
    const template = pickTemplate(lesson.title);
    const sequence = buildSequence(lesson.title, lesson.objective, template);

    return {
        lessonId: lesson.id,
        title: lesson.title,
        subject: "Mathematics",
        course: course.title,
        courseLevel: "Grade 9",
        institution: "KingPin Academy",
        academicLevel: "secondary",
        disciplineType: "mathematics",
        pacingPlan: {
            minimumDurationMinutes: 40,
            targetDurationMinutes: 45,
            maximumDurationMinutes: 50,
            extensionStrategies: [
                "Pause for oral justification before moving to the next board step.",
                "Use one extra worked example when learners hesitate on the guided prompt.",
                "End with a correction clinic using one common misconception from the lesson.",
            ],
        },
        visualPlan: buildVisualPlan(lesson.title, module.title),
        instructionalSegments: [
            { id: `${lesson.id}-seg-1`, title: "Lesson launch", type: "welcome", estimatedMinutes: 5 },
            { id: `${lesson.id}-seg-2`, title: "Concept and modelling", type: "concept", estimatedMinutes: 12, visualRequired: true },
            { id: `${lesson.id}-seg-3`, title: "Worked example", type: "worked_example", estimatedMinutes: 10, visualRequired: true },
            { id: `${lesson.id}-seg-4`, title: "Guided practice", type: "guided_practice", estimatedMinutes: 8 },
            { id: `${lesson.id}-seg-5`, title: "Independent practice", type: "independent_practice", estimatedMinutes: 6 },
            { id: `${lesson.id}-seg-6`, title: "Summary and exit check", type: "summary", estimatedMinutes: 4 },
        ],
        reteachMoments: buildReteachMoments(lesson.title, template),
        guidedQuestions: [
            {
                question: `Before we go deeper, what is today's central idea in ${lesson.title.toLowerCase()}?`,
                options: [template.recap[0], template.commonMistake, "There is no method today", "Only the final answer matters"],
                correct: template.recap[0],
                explanation: "Naming the right idea first helps the learner choose the correct method later.",
            },
            {
                question: template.middleQuestion.question,
                options: template.middleQuestion.options,
                correct: template.middleQuestion.correct,
                explanation: template.middleQuestion.feedbackCorrect,
            },
        ],
        practiceCycles: buildPracticeCycles(lesson.title, template.practiceProblems),
        teacher: { name: "Mr. Klass", image: "/images/teachers/man.png", voice: "male" },
        openingNarrative: `Welcome to ${lesson.title}. In this lesson, we will move carefully from explanation to worked example, then to guided and independent practice so that you can use the idea with confidence.`,
        lessonGoal: lesson.objective,
        whyItMatters: lesson.sections[0]?.content[1] ?? `${lesson.title} matters because it strengthens one of the essential Grade 9 mathematics habits needed across the term.`,
        prerequisiteReview: `Recall the key ideas from the previous Grade 9 Mathematics work connected to ${module.title.toLowerCase()}. We will use that prior knowledge as the starting point for today's learning.`,
        sequence,
        sectionGoals: {
            welcome: "Understand today's focus and why it matters.",
            concept: "Learn the main mathematical idea clearly.",
            worked_example: "Follow and explain the modelled example.",
            guided_practice: "Solve with support and explain your steps.",
            independent_practice: "Try the method on your own.",
            summary: "Leave with the key rule, correction, and next step clear.",
        },
        sectionStops: [
            { key: "welcome", startIndex: 0 },
            { key: "concept", startIndex: 2 },
            { key: "worked_example", startIndex: 3 },
            { key: "guided_practice", startIndex: 6 },
            { key: "independent_practice", startIndex: 7 },
            { key: "summary", startIndex: 9 },
        ],
        sectionRecaps: {
            concept: { title: "Core idea recap", points: template.recap.slice(0, 2) },
            summary: { title: "Lesson recap", points: template.recap },
        },
        thinkingPauses: {
            3: "Pause and predict what rule or relationship the worked example is about to show.",
            7: "Pause and decide which exact method you will use before solving independently.",
        },
        middleQuestion: template.middleQuestion,
        confidenceOptions: CONFIDENCE_OPTIONS,
        practiceProblems: template.practiceProblems,
        exitTicket: template.exitTicket,
        exitReflection: {
            question: "What will help you most in the next mathematics lesson?",
            options: [
                "One more worked example",
                "More independent practice",
                "A slower explanation of the rule",
                "I am ready to continue",
            ],
        },
        learnerNotes: [
            `Lesson: ${lesson.title}`,
            `Objective: ${lesson.objective}`,
            "Key points:",
            ...template.recap.map((point) => `- ${point}`),
            `Common mistake to avoid: ${template.commonMistake}`,
            `Independent practice reminder: ${template.independentPrompt}`,
        ].join("\n"),
    };
}

export function isKingpinGrade9MathematicsClassroomLesson(lessonId: string): boolean {
    return buildKingpinGrade9MathematicsClassroomContent(lessonId) !== null;
}
