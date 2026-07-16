/**
 * english-parts-of-speech.ts
 *
 * Demo lesson: Parts of Speech — Nouns, Verbs, and Adjectives
 * Subject: English Language | Level: Secondary (Form 1-2 / Grade 7-8)
 */

import type { MathTeachingItem } from "../lesson-models";
import type { ClassroomLessonContent } from "../classroom-content";

export const ENGLISH_LESSON_ID = "demo_english";
export const ENGLISH_LESSON_TITLE = "Parts of Speech: Nouns, Verbs, and Adjectives";

const englishSequence: MathTeachingItem[] = [
  // ── Section: Welcome ──
  {
    id: "eng_1",
    type: "concept",
    boardText: "Parts of Speech",
    exactSpokenText: "Parts of Speech.",
    teacherExplanation:
      "Today we're looking at parts of speech — the jobs words do in a sentence. Once you can spot those jobs, reading becomes clearer and your writing becomes much more controlled.",
    whyThisStepMatters:
      "Parts of speech are the foundation of grammar. Master them, and writing becomes much easier.",
    accessibleDescription: "The board shows the heading: Parts of Speech.",
    writingSpeed: "normal",
  },
  {
    id: "eng_2",
    type: "concept",
    boardText: "Goal: Identify nouns, verbs, and adjectives",
    exactSpokenText:
      "Our goal today is to identify three key parts of speech: nouns, verbs, and adjectives.",
    teacherExplanation:
      "By the end, you should be able to look at a sentence and tell which words name something, which words show action or state, and which words describe.",
    whyThisStepMatters: "These three categories cover the majority of words you use every day.",
    accessibleDescription: "Goal: Identify nouns, verbs, and adjectives.",
    writingSpeed: "normal",
  },

  // ── Section: Concept — Nouns ──
  {
    id: "eng_3",
    type: "concept",
    boardText: "1. Nouns",
    exactSpokenText: "Let's start with nouns.",
    teacherExplanation:
      "A noun is a word that names a person, place, thing, or idea. If you can point to it, go to it, hold it, or think about it — it is probably a noun.",
    whyThisStepMatters:
      "Nouns are the subjects of sentences — the 'who' and 'what' that everything else revolves around.",
    accessibleDescription: "Heading: 1. Nouns.",
    writingSpeed: "normal",
  },
  {
    id: "eng_4",
    type: "instruction",
    boardText: "Person: teacher, student, Maria",
    exactSpokenText: "Nouns can name a person — like teacher, student, or Maria.",
    teacherExplanation:
      "Any word that names a person is a noun. Proper nouns like Maria start with a capital letter. Common nouns like teacher do not.",
    whyThisStepMatters: "Recognizing person-nouns helps you identify the subject of a sentence.",
    accessibleDescription: "Examples of person nouns: teacher, student, Maria.",
    writingSpeed: "normal",
  },
  {
    id: "eng_5",
    type: "instruction",
    boardText: "Place: school, Nairobi, classroom",
    exactSpokenText: "Nouns can name a place — like school, Nairobi, or classroom.",
    teacherExplanation: "Places are nouns too. Countries, cities, rooms — they are all nouns.",
    whyThisStepMatters: "Place nouns are the 'where' of every sentence.",
    accessibleDescription: "Examples of place nouns: school, Nairobi, classroom.",
    writingSpeed: "normal",
  },
  {
    id: "eng_6",
    type: "instruction",
    boardText: "Thing: book, phone, whiteboard",
    exactSpokenText: "Nouns can name a thing — like book, phone, or whiteboard.",
    teacherExplanation:
      "Physical objects you can touch are nouns. Even things you cannot touch, like air or shadow, are nouns.",
    whyThisStepMatters: "Thing nouns are the most common noun type you will encounter.",
    accessibleDescription: "Examples of thing nouns: book, phone, whiteboard.",
    writingSpeed: "normal",
  },
  {
    id: "eng_7",
    type: "instruction",
    boardText: "Idea: love, freedom, knowledge",
    exactSpokenText: "Nouns can name an idea — like love, freedom, or knowledge.",
    teacherExplanation:
      "Abstract ideas are nouns too. You cannot hold love in your hand, but it is still a noun because it names a concept.",
    whyThisStepMatters:
      "Abstract nouns are the hardest to spot. Recognizing them is a sign of strong grammar awareness.",
    accessibleDescription: "Examples of idea nouns: love, freedom, knowledge.",
    writingSpeed: "normal",
  },

  // ── Section: Concept — Verbs ──
  {
    id: "eng_8",
    type: "concept",
    boardText: "2. Verbs",
    exactSpokenText: "Now let's look at verbs.",
    teacherExplanation:
      "A verb is a word that shows an action or a state of being. Every sentence must have a verb — without a verb, you do not have a sentence.",
    whyThisStepMatters: "Verbs are the engine of a sentence. They tell you what is happening.",
    accessibleDescription: "Heading: 2. Verbs.",
    writingSpeed: "normal",
  },
  {
    id: "eng_9",
    type: "instruction",
    boardText: "Action verbs: run, write, read, teach",
    exactSpokenText: "Action verbs show something happening — like run, write, read, or teach.",
    teacherExplanation:
      "If you can physically do it, it is an action verb. Right now, I am teaching and you are reading. Both are action verbs.",
    whyThisStepMatters:
      "Action verbs are the easiest to spot because you can picture someone doing them.",
    accessibleDescription: "Examples of action verbs: run, write, read, teach.",
    writingSpeed: "normal",
  },
  {
    id: "eng_10",
    type: "instruction",
    boardText: "Being verbs: is, am, are, was, were",
    exactSpokenText: "Being verbs show a state of existence — like is, am, are, was, and were.",
    teacherExplanation:
      "These verbs do not show action. They show that something exists or has a quality. The sky is blue. I am a student. They were happy. Each of these uses a being verb.",
    whyThisStepMatters:
      "Being verbs are the most common verbs in English but the hardest to notice because they do not feel like actions.",
    commonMistake:
      "Learners forget that is, am, and are are verbs. They are — they show a state of being.",
    accessibleDescription: "Examples of being verbs: is, am, are, was, were.",
    writingSpeed: "normal",
  },

  // ── Section: Concept — Adjectives ──
  {
    id: "eng_11",
    type: "concept",
    boardText: "3. Adjectives",
    exactSpokenText: "Finally, let's look at adjectives.",
    teacherExplanation:
      "An adjective is a word that describes a noun. It tells you more about the noun — what it looks like, how many there are, or what kind it is.",
    whyThisStepMatters:
      "Adjectives make your writing vivid and specific. Compare 'the car' with 'the red, fast car'. The adjectives paint a picture.",
    accessibleDescription: "Heading: 3. Adjectives.",
    writingSpeed: "normal",
  },
  {
    id: "eng_12",
    type: "instruction",
    boardText: "Describes nouns: tall, beautiful, three, blue",
    exactSpokenText: "Adjectives describe nouns — like tall, beautiful, three, or blue.",
    teacherExplanation:
      "Adjectives answer questions about the noun: What kind? How many? Which one? A tall building — tall tells us what kind. Three books — three tells us how many.",
    whyThisStepMatters:
      "Adjectives always modify nouns. If a word is describing a noun, it is an adjective.",
    accessibleDescription: "Examples of adjectives: tall, beautiful, three, blue.",
    writingSpeed: "normal",
  },
  {
    id: "eng_13",
    type: "instruction",
    boardText: 'Usually comes before the noun: "the RED car"',
    exactSpokenText:
      "Adjectives usually come right before the noun they describe — like the red car.",
    teacherExplanation:
      "In English, adjectives typically sit before the noun. Red describes car. You say 'the red car', not 'the car red'. This is different from some other languages.",
    whyThisStepMatters: "Knowing the position helps you spot adjectives quickly in any sentence.",
    commonMistake:
      "In some languages, adjectives come after the noun. In English, they usually come before.",
    accessibleDescription: "Pattern: adjective comes before the noun, as in 'the red car'.",
    writingSpeed: "normal",
  },

  // ── Section: Worked Example ──
  {
    id: "eng_14",
    type: "concept",
    boardText: "Example: Identify each word",
    exactSpokenText: "Let's practise identifying the parts of speech in a sentence.",
    teacherExplanation:
      "I'll put a sentence on the board, and we'll sort out each word together.",
    whyThisStepMatters:
      "Seeing the method applied to a real sentence makes the skill practical and transferable.",
    accessibleDescription: "Heading: Example — Identify each word.",
    writingSpeed: "normal",
  },
  {
    id: "eng_15",
    type: "equation",
    boardText: '"The tall teacher reads a book."',
    exactSpokenText: "Here is our sentence: The tall teacher reads a book.",
    teacherExplanation:
      "Let's go through it one word at a time and decide what job each word is doing.",
    whyThisStepMatters: "This is the core skill — breaking a sentence into its parts.",
    accessibleDescription: "Sentence on the board: The tall teacher reads a book.",
    writingSpeed: "slow",
    pauseAfter: 1500,
  },
  {
    id: "eng_16",
    type: "calculation",
    boardText: "The → article (special adjective)",
    exactSpokenText:
      "The is an article. Articles are a special type of adjective that tells us which noun is coming.",
    teacherExplanation:
      "The words a, an, and the are called articles. They are technically adjectives because they describe nouns — they tell us 'which one'. The teacher — which teacher? The specific one.",
    whyThisStepMatters:
      "Articles are the most common words in English — understanding their role is essential.",
    accessibleDescription: "Word analysis: 'The' is an article, a special type of adjective.",
    writingSpeed: "normal",
  },
  {
    id: "eng_17",
    type: "calculation",
    boardText: "tall → adjective (describes teacher)",
    exactSpokenText:
      "Tall is an adjective because it describes the noun teacher. What kind of teacher? A tall teacher.",
    teacherExplanation:
      "Tall answers the question 'what kind?' about the teacher. That is how you spot an adjective — it describes a noun.",
    whyThisStepMatters: "The 'what kind?' test is the fastest way to identify adjectives.",
    accessibleDescription: "Word analysis: 'tall' is an adjective describing teacher.",
    writingSpeed: "normal",
  },
  {
    id: "eng_18",
    type: "calculation",
    boardText: "teacher → noun (person)",
    exactSpokenText: "Teacher is a noun because it names a person.",
    teacherExplanation:
      "Teacher names a person — the one doing the action. It is the subject of the sentence.",
    whyThisStepMatters: "The subject of a sentence is almost always a noun.",
    accessibleDescription: "Word analysis: 'teacher' is a noun (person).",
    writingSpeed: "normal",
  },
  {
    id: "eng_19",
    type: "calculation",
    boardText: "reads → verb (action)",
    exactSpokenText: "Reads is a verb because it shows an action — the teacher is doing something.",
    teacherExplanation:
      "Reads tells us what the teacher is doing. It is the action in this sentence. Without it, we would not have a complete sentence.",
    whyThisStepMatters: "Every sentence needs a verb — it is the action or state of being.",
    accessibleDescription: "Word analysis: 'reads' is a verb (action).",
    writingSpeed: "normal",
  },
  {
    id: "eng_20",
    type: "calculation",
    boardText: "a → article (special adjective)",
    exactSpokenText: "A is an article — another special adjective.",
    teacherExplanation:
      "A tells us we are talking about one, non-specific book. Not a particular book, just any book.",
    whyThisStepMatters: "A vs an vs the — articles are small words with big grammatical roles.",
    accessibleDescription: "Word analysis: 'a' is an article.",
    writingSpeed: "normal",
  },
  {
    id: "eng_21",
    type: "calculation",
    boardText: "book → noun (thing)",
    exactSpokenText: "Book is a noun because it names a thing.",
    teacherExplanation:
      "Book is the thing being acted upon — the teacher reads it. It is the object of the sentence.",
    whyThisStepMatters: "Objects receive the action — they are nouns too.",
    accessibleDescription: "Word analysis: 'book' is a noun (thing).",
    writingSpeed: "normal",
  },
  {
    id: "eng_22",
    type: "answer",
    boardText: "Nouns: teacher, book | Verb: reads | Adjectives: the, tall, a",
    exactSpokenText:
      "To summarize: teacher and book are nouns. Reads is a verb. The, tall, and a are adjectives.",
    teacherExplanation:
      "You have just classified every word in a sentence. That is the core skill. Nouns name things, verbs show actions, and adjectives describe nouns.",
    whyThisStepMatters: "This pattern works for any sentence in English.",
    accessibleDescription:
      "Summary: Nouns are teacher and book. Verb is reads. Adjectives are the, tall, and a.",
    writingSpeed: "slow",
    pauseAfter: 2000,
  },

  // ── Section: Summary ──
  {
    id: "eng_23",
    type: "concept",
    boardText: "What You Learned Today",
    exactSpokenText: "What You Learned Today.",
    teacherExplanation: "Let me recap the three parts of speech we learned.",
    whyThisStepMatters: "Reviewing consolidates your learning and helps you remember.",
    accessibleDescription: "Heading: What You Learned Today.",
    writingSpeed: "normal",
  },
  {
    id: "eng_24",
    type: "instruction",
    boardText: "Nouns name persons, places, things, ideas",
    exactSpokenText: "Nouns name persons, places, things, and ideas.",
    teacherExplanation:
      "If you can point to it, go to it, hold it, or think about it — it is a noun.",
    whyThisStepMatters: "This definition covers every noun you will ever encounter.",
    accessibleDescription: "Recap: Nouns name persons, places, things, and ideas.",
    writingSpeed: "normal",
  },
  {
    id: "eng_25",
    type: "instruction",
    boardText: "Verbs show actions or states of being",
    exactSpokenText: "Verbs show actions or states of being.",
    teacherExplanation:
      "Every sentence needs a verb. It is the engine that drives the sentence forward.",
    whyThisStepMatters: "No verb, no sentence — this is the most important grammar rule.",
    accessibleDescription: "Recap: Verbs show actions or states of being.",
    writingSpeed: "normal",
  },
  {
    id: "eng_26",
    type: "instruction",
    boardText: "Adjectives describe nouns",
    exactSpokenText: "Adjectives describe nouns — they answer what kind, how many, or which one.",
    teacherExplanation:
      "Adjectives make your writing specific and vivid. They always modify a noun.",
    whyThisStepMatters: "Adjectives are the words that make your writing vivid and precise.",
    accessibleDescription: "Recap: Adjectives describe nouns.",
    writingSpeed: "normal",
  },
  {
    id: "eng_27",
    type: "instruction",
    boardText:
      "Test: Can you point to it? (noun) Can you do it? (verb) Does it describe a noun? (adjective)",
    exactSpokenText:
      "Here is a quick test. Can you point to it? Then it is a noun. Can you do it? Then it is a verb. Does it describe a noun? Then it is an adjective.",
    teacherExplanation:
      "These three questions are your cheat sheet for identifying parts of speech in any sentence.",
    whyThisStepMatters: "This three-question test works for any word in any sentence.",
    accessibleDescription:
      "Quick test: point to it = noun, do it = verb, describes noun = adjective.",
    writingSpeed: "normal",
  },
];

export function buildEnglishLessonContent(): ClassroomLessonContent {
  return {
    lessonId: ENGLISH_LESSON_ID,
    title: ENGLISH_LESSON_TITLE,
    subject: "English Language",
    course: "English Form 2",
    institution: "Klassruum Demo Academy",
    academicLevel: "secondary",
    teacher: {
      name: "Ms. Wanjiku",
      image: "/images/teachers/woman.png",
      voice: "female",
    },
    openingNarrative:
      "Welcome to today's English lesson. We are going to learn about parts of speech — specifically nouns, verbs, and adjectives. These are the building blocks of every sentence you read and write.",
    lessonGoal: "Identify nouns, verbs, and adjectives in any sentence.",
    whyItMatters:
      "Understanding parts of speech makes you a stronger writer, a better reader, and helps you communicate more clearly in every language.",
    sequence: englishSequence,
    sectionGoals: {
      welcome: "Understand what parts of speech are and why they matter.",
      concept: "Learn the definitions and examples of nouns, verbs, and adjectives.",
      worked_example: "Classify every word in a sentence together.",
      guided_practice: "Identify parts of speech with the teacher's help.",
      independent_practice: "Classify words on your own.",
      summary: "Review the three key parts of speech.",
      exit_ticket: "Show what you learned with one final check.",
      complete: "Lesson complete — review your notes and progress.",
    },
    sectionStops: [
      { key: "welcome", startIndex: 0 },
      { key: "concept", startIndex: 2 },
      { key: "worked_example", startIndex: 13 },
      { key: "summary", startIndex: 22 },
    ],
    sectionRecaps: {
      concept: {
        title: "Parts of speech recap",
        points: [
          "Nouns name persons, places, things, and ideas.",
          "Verbs show actions or states of being.",
          "Adjectives describe nouns.",
        ],
      },
      worked_example: {
        title: "Sentence analysis recap",
        points: [
          "In 'The tall teacher reads a book' — teacher and book are nouns.",
          "Reads is the verb (the action).",
          "The, tall, and a are adjectives (they describe nouns).",
        ],
      },
    },
    thinkingPauses: {},
    middleQuestion: {
      question: "In the sentence 'The happy dog runs fast', which word is the verb?",
      options: ["The", "happy", "dog", "runs"],
      correct: "runs",
      feedbackCorrect:
        "Correct! Runs is the verb — it shows the action. The dog is doing the running.",
      feedbackIncorrect:
        "The verb is 'runs'. It is the word that shows what the dog is doing — running.",
    },
    confidenceOptions: [
      { label: "I understand", value: "understand", emoji: "😀" },
      { label: "Almost", value: "almost", emoji: "🙂" },
      { label: "Not yet", value: "not_yet", emoji: "😐" },
      { label: "Explain again", value: "explain_again", emoji: "🔁" },
    ],
    practiceProblems: [
      {
        equation: '"The clever student answered the difficult question."',
        question: "How many nouns are in this sentence?",
        correctAnswer: "2",
        hint: "Nouns name persons, places, things, or ideas. Look for the naming words.",
        hints: [
          "Ask: which words name a person, place, thing, or idea?",
          "'Student' names a person. 'Question' names a thing.",
          "There are 2 nouns: student and question.",
        ],
        misconception: {
          answer: "3",
          note: "'Difficult' and 'clever' are adjectives, not nouns. They describe nouns but do not name anything themselves.",
        },
      },
      {
        equation: '"She sings beautifully."',
        question: "Which word is the verb in this sentence?",
        correctAnswer: "sings",
        hint: "The verb shows the action. What is the subject doing?",
        hints: [
          "Ask: what is the action in this sentence?",
          "What is 'she' doing? She sings.",
          "The verb is 'sings'. Beautifully is an adverb (describes how she sings).",
        ],
        misconception: {
          answer: "beautifully",
          note: "'Beautifully' describes how she sings — it is an adverb, not a verb. The verb is 'sings'.",
        },
      },
    ],
    exitTicket: {
      question: "What does an adjective do?",
      options: [
        "Names a person, place, thing, or idea",
        "Shows an action or state of being",
        "Describes a noun",
        "Connects two sentences",
      ],
      correct: "Describes a noun",
      feedbackCorrect:
        "Exactly! Adjectives describe nouns — they tell you what kind, how many, or which one.",
      feedbackIncorrect:
        "An adjective describes a noun. It answers questions like 'what kind?', 'how many?', or 'which one?'",
    },
    exitReflection: {
      question: "Before we finish — which part of speech should we practice more?",
      options: ["Nouns", "Verbs", "Adjectives", "I understood everything"],
    },
    visualPlan: [
      {
        id: "eng_def_table",
        anchorId: "eng_3",
        kind: "table",
        source: "fallback",
        title: "Noun, Verb, and Adjective definitions",
        description: "Definitions and key indicators for the three core parts of speech.",
        alt: "Definitions matrix",
        teacherCue: "Compare how nouns name, verbs show actions or states, and adjectives describe nouns.",
        labels: ["Nouns: Person/Place/Thing/Idea", "Verbs: Action/State of Being", "Adjectives: Modifiers of Nouns"]
      },
      {
        id: "eng_sentence_diagram",
        anchorId: "eng_15",
        kind: "workflow",
        source: "fallback",
        title: "Word classification workflow",
        description: "Deconstructing the sentence: 'The tall teacher reads a book' into parts of speech.",
        alt: "[The - Art] [tall - Adj] [teacher - Noun] [reads - Verb] [a - Art] [book - Noun]",
        teacherCue: "Identify how 'tall' describes 'teacher', and 'reads' links the teacher to the 'book'.",
        labels: ["Article", "Adjective", "Subject Noun", "Action Verb", "Object Noun"]
      }
    ],
    learnerNotes: `# Parts of Speech: Nouns, Verbs, and Adjectives

## Nouns
- **Definition**: A word that names a person, place, thing, or idea
- **Examples**: teacher (person), school (place), book (thing), love (idea)
- **Test**: Can you point to it, go to it, hold it, or think about it?

## Verbs
- **Definition**: A word that shows an action or a state of being
- **Action verbs**: run, write, read, teach, sing
- **Being verbs**: is, am, are, was, were
- **Test**: Can you do it? Is something happening?

## Adjectives
- **Definition**: A word that describes a noun
- **Examples**: tall, beautiful, three, blue, the, a
- **Test**: Does it answer what kind, how many, or which one?
- **Position**: Usually comes before the noun ("the RED car")

## Quick Identification Test
1. Can you point to it? → **Noun**
2. Can you do it? → **Verb**
3. Does it describe a noun? → **Adjective**

## Example Analysis
"The tall teacher reads a book."
- **Nouns**: teacher, book
- **Verb**: reads
- **Adjectives**: the, tall, a

## Common Mistakes
- Forgetting that "is", "am", "are" are verbs (being verbs)
- Confusing adjectives with adverbs (adjectives describe nouns, adverbs describe verbs)
- Thinking articles (a, an, the) are not adjectives (they are!)`,
  };
}
