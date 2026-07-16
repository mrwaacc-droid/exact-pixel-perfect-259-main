/**
 * chemistry-bonding.ts
 *
 * Demo lesson: Chemical Bonding — Ionic vs Covalent Bonds
 * Subject: Chemistry | Level: Secondary (Form 3 / Grade 9-10)
 *
 * Follows the same ClassroomLessonContent contract as the math demo.
 */

import type { MathTeachingItem } from "../lesson-models";
import type { ClassroomLessonContent } from "../classroom-content";

export const CHEMISTRY_LESSON_ID = "demo_chemistry";
export const CHEMISTRY_LESSON_TITLE = "Chemical Bonding: Ionic vs Covalent";
export const CHEMISTRY_LESSON_EQUATION = "NaCl → Na⁺ + Cl⁻";

const chemistrySequence: MathTeachingItem[] = [
  // ── Section: Welcome ──
  {
    id: "chem_1",
    type: "concept",
    boardText: "Chemical Bonding",
    exactSpokenText: "Chemical Bonding.",
    teacherExplanation:
      "Today we're looking at chemical bonding — how atoms join to form substances. If this idea is clear, a lot of chemistry starts making much more sense.",
    whyThisStepMatters:
      "Understanding bonding explains why substances have different properties — why salt dissolves in water but oil does not, why diamond is hard but graphite is soft.",
    accessibleDescription: "The board shows the heading: Chemical Bonding.",
    writingSpeed: "normal",
  },
  {
    id: "chem_2",
    type: "concept",
    boardText: "Goal: Understand ionic and covalent bonds",
    exactSpokenText: "Our goal today is to understand ionic bonds and covalent bonds.",
    teacherExplanation:
      "By the end, you should be able to tell the difference between ionic and covalent bonding, and explain each one with an example.",
    whyThisStepMatters:
      "Having a clear goal helps you know what to focus on as we go through each step.",
    accessibleDescription: "The board shows the lesson goal: Understand ionic and covalent bonds.",
    writingSpeed: "normal",
  },

  // ── Section: Concept — What is a bond? ──
  {
    id: "chem_3",
    type: "concept",
    boardText: "What is a Chemical Bond?",
    exactSpokenText: "What is a Chemical Bond?",
    teacherExplanation:
      "A chemical bond is a force that holds two atoms together. Atoms bond because they want to have a full outer shell of electrons — this makes them stable, like a full house.",
    whyThisStepMatters:
      "This is the foundation. Everything about bonding comes back to atoms wanting full outer shells.",
    accessibleDescription: "Heading on the board: What is a Chemical Bond?",
    writingSpeed: "normal",
  },
  {
    id: "chem_4",
    type: "instruction",
    boardText: "Atoms bond to get a full outer shell",
    exactSpokenText: "Atoms bond to get a full outer shell.",
    teacherExplanation:
      "Think of it like seats on a bus. Atoms want every seat in their outer row filled. If they have empty seats, they will try to fill them by bonding with other atoms.",
    whyThisStepMatters: "This single idea explains both ionic and covalent bonding.",
    accessibleDescription: "Bullet point: Atoms bond to get a full outer shell.",
    writingSpeed: "normal",
  },
  {
    id: "chem_5",
    type: "instruction",
    boardText: "Two main types: Ionic and Covalent",
    exactSpokenText: "There are two main types: ionic and covalent.",
    teacherExplanation:
      "We will learn each type, starting with ionic bonds. The difference comes down to one thing: does the atom give away electrons, or does it share them?",
    whyThisStepMatters: "Knowing there are two types helps you classify any bond you encounter.",
    accessibleDescription: "Bullet point: Two main types: Ionic and Covalent.",
    writingSpeed: "normal",
  },

  // ── Section: Concept — Ionic Bonds ──
  {
    id: "chem_6",
    type: "concept",
    boardText: "Ionic Bonds",
    exactSpokenText: "Ionic Bonds.",
    teacherExplanation:
      "An ionic bond happens when one atom gives its electrons to another atom. The atom that gives away electrons becomes positively charged — we call it a cation. The atom that receives electrons becomes negatively charged — we call it an anion.",
    whyThisStepMatters: "Ionic bonding is how salts like table salt are formed.",
    accessibleDescription: "Heading on the board: Ionic Bonds.",
    writingSpeed: "normal",
  },
  {
    id: "chem_7",
    type: "concept",
    boardText: "Transfer of electrons from metal to non-metal",
    exactSpokenText: "Ionic bonds involve the transfer of electrons from a metal to a non-metal.",
    teacherExplanation:
      "Metals on the left side of the periodic table have few electrons in their outer shell — they want to give them away. Non-metals on the right side have almost-full outer shells — they want to receive electrons. It is a perfect match.",
    whyThisStepMatters:
      "This rule lets you predict which elements form ionic bonds just by looking at the periodic table.",
    commonMistake:
      "Learners sometimes say electrons are shared in ionic bonds. No — they are transferred, moved completely from one atom to the other.",
    accessibleDescription:
      "The board explains that ionic bonds transfer electrons from metal to non-metal.",
    writingSpeed: "normal",
  },

  // ── Section: Worked Example — NaCl ──
  {
    id: "chem_8",
    type: "concept",
    boardText: "Example: Sodium Chloride (NaCl)",
    exactSpokenText:
      "Let's look at an example: sodium chloride, written as N a C l. This is ordinary table salt.",
    teacherExplanation:
      "Every time you sprinkle salt on your food, you are using an ionically bonded compound. Let me show you how sodium and chlorine form this bond.",
    whyThisStepMatters:
      "NaCl is the most familiar example of ionic bonding. Understanding it gives you a template for all ionic compounds.",
    accessibleDescription: "Heading: Example: Sodium Chloride (NaCl).",
    writingSpeed: "normal",
  },
  {
    id: "chem_9",
    type: "calculation",
    boardText: "Na has 1 outer electron → gives it away",
    exactSpokenText: "Sodium has one electron in its outer shell. It gives that electron away.",
    teacherExplanation:
      "Sodium is in group one of the periodic table. It has just one electron in its outer shell. It is much easier to give away one electron than to gain seven, so sodium loses its outer electron and becomes a positive ion — N a plus.",
    whyThisStepMatters: "This is why metals form positive ions — they lose electrons.",
    accessibleDescription: "The board shows: Na has 1 outer electron and gives it away.",
    writingSpeed: "normal",
  },
  {
    id: "chem_10",
    type: "calculation",
    boardText: "Cl has 7 outer electrons → gains 1",
    exactSpokenText:
      "Chlorine has seven electrons in its outer shell. It gains one electron to make eight.",
    teacherExplanation:
      "Chlorine is in group seven. It needs just one more electron to complete its outer shell. When it takes sodium's electron, it becomes a negative ion — C l minus.",
    whyThisStepMatters: "Non-metals form negative ions by gaining electrons.",
    accessibleDescription: "The board shows: Cl has 7 outer electrons and gains 1.",
    writingSpeed: "normal",
  },
  {
    id: "chem_11",
    type: "equation",
    boardText: "Na⁺ + Cl⁻ → NaCl",
    exactSpokenText:
      "The positive sodium ion and the negative chloride ion attract each other. This attraction is the ionic bond. Together they form N a C l — sodium chloride.",
    teacherExplanation:
      "Opposite charges attract. The positive sodium and negative chloride are held together by electrostatic attraction — like two magnets clicking together. This is the ionic bond.",
    whyThisStepMatters:
      "This is the core mechanism of ionic bonding: electron transfer creates opposite charges, and the attraction between those charges is the bond.",
    commonMistake:
      "Do not write NaCl as Na + Cl without the charges. The ions have charges — Na positive and Cl negative.",
    accessibleDescription: "Equation on the board: Na+ plus Cl- forms NaCl.",
    writingSpeed: "slow",
    pauseAfter: 2000,
  },

  // ── Section: Concept — Covalent Bonds ──
  {
    id: "chem_12",
    type: "concept",
    boardText: "Covalent Bonds",
    exactSpokenText: "Now let's look at covalent bonds.",
    teacherExplanation:
      "Covalent bonds are completely different from ionic bonds. Instead of transferring electrons, atoms share electrons. This happens between two non-metals.",
    whyThisStepMatters:
      "Covalent bonds form the molecules in your body — water, oxygen, DNA. They are everywhere.",
    accessibleDescription: "Heading on the board: Covalent Bonds.",
    writingSpeed: "normal",
  },
  {
    id: "chem_13",
    type: "concept",
    boardText: "Sharing of electrons between two non-metals",
    exactSpokenText: "Covalent bonds involve the sharing of electrons between two non-metals.",
    teacherExplanation:
      "When two non-metals meet, neither wants to give away its electrons — they both want to gain. So they compromise: they share electrons. Each atom counts the shared electrons as part of its own outer shell.",
    whyThisStepMatters:
      "Sharing means both atoms get a fuller outer shell without losing anything.",
    commonMistake:
      "Learners confuse ionic and covalent. Remember: ionic = transfer (metal + non-metal), covalent = share (non-metal + non-metal).",
    accessibleDescription:
      "The board explains that covalent bonds share electrons between non-metals.",
    writingSpeed: "normal",
  },

  // ── Section: Worked Example — H₂O ──
  {
    id: "chem_14",
    type: "concept",
    boardText: "Example: Water (H₂O)",
    exactSpokenText: "Let's look at water, written as H two O.",
    teacherExplanation:
      "Water is the most important covalent compound on Earth. Every drop of water is held together by covalent bonds. Let me show you how hydrogen and oxygen share electrons.",
    whyThisStepMatters:
      "Water is so familiar that using it as an example makes covalent bonding immediately relatable.",
    accessibleDescription: "Heading: Example: Water (H₂O).",
    writingSpeed: "normal",
  },
  {
    id: "chem_15",
    type: "calculation",
    boardText: "O needs 2 electrons → shares with 2 H atoms",
    exactSpokenText:
      "Oxygen has six electrons in its outer shell. It needs two more. So it shares one electron with each of two hydrogen atoms.",
    teacherExplanation:
      "Oxygen has six outer electrons and needs eight. Each hydrogen has one electron and needs two. By sharing, oxygen gets eight — its own six plus two shared — and each hydrogen gets two — its own one plus one shared. Everyone is happy.",
    whyThisStepMatters:
      "This is how covalent bonding works: sharing fills both shells simultaneously.",
    accessibleDescription: "The board shows oxygen sharing electrons with two hydrogen atoms.",
    writingSpeed: "normal",
  },
  {
    id: "chem_16",
    type: "equation",
    boardText: "H—O—H (shared electrons)",
    exactSpokenText:
      "The shared electrons sit between the atoms, holding them together. We draw lines to represent shared pairs. Each line is one shared pair — two electrons.",
    teacherExplanation:
      "The dashes you see represent shared electron pairs. Each dash is a bond. Water has two bonds — one between oxygen and each hydrogen. The electrons belong to both atoms at the same time.",
    whyThisStepMatters:
      "This diagram is the standard way to represent covalent molecules in chemistry.",
    accessibleDescription: "Equation showing H-O-H with shared electrons represented by lines.",
    writingSpeed: "slow",
    pauseAfter: 2000,
  },

  // ── Section: Comparison ──
  {
    id: "chem_17",
    type: "concept",
    boardText: "Ionic vs Covalent — Summary",
    exactSpokenText: "Let's compare ionic and covalent bonds side by side.",
    teacherExplanation:
      "Now that you have seen both types, let me put them next to each other so the differences are crystal clear.",
    whyThisStepMatters:
      "Comparing and contrasting is one of the strongest ways to learn. Seeing them side by side cements the distinction.",
    accessibleDescription: "Heading: Ionic vs Covalent — Summary.",
    writingSpeed: "normal",
  },
  {
    id: "chem_18",
    type: "instruction",
    boardText: "Ionic: transfer electrons | Covalent: share electrons",
    exactSpokenText: "Ionic bonds transfer electrons. Covalent bonds share electrons.",
    teacherExplanation:
      "This is the single most important difference. If you remember nothing else, remember this: transfer versus share.",
    whyThisStepMatters: "This one sentence lets you classify any bond type.",
    accessibleDescription: "Comparison: Ionic transfers electrons, Covalent shares electrons.",
    writingSpeed: "normal",
  },
  {
    id: "chem_19",
    type: "instruction",
    boardText: "Ionic: metal + non-metal | Covalent: non-metal + non-metal",
    exactSpokenText:
      "Ionic bonds form between metals and non-metals. Covalent bonds form between two non-metals.",
    teacherExplanation:
      "This is your quick rule for predicting bond type. Look at the elements involved. If one is a metal and the other is a non-metal, it is ionic. If both are non-metals, it is covalent.",
    whyThisStepMatters:
      "This rule works for the vast majority of compounds you will encounter at this level.",
    accessibleDescription:
      "Comparison: Ionic is metal plus non-metal. Covalent is non-metal plus non-metal.",
    writingSpeed: "normal",
  },
  {
    id: "chem_20",
    type: "instruction",
    boardText: "Ionic: forms crystals | Covalent: forms molecules",
    exactSpokenText: "Ionic compounds form crystal structures. Covalent compounds form molecules.",
    teacherExplanation:
      "Ionic compounds like salt arrange themselves in a regular grid — a crystal. Covalent compounds like water exist as individual molecules floating around. This is why salt is a solid at room temperature but water is a liquid.",
    whyThisStepMatters:
      "The type of bond directly affects the physical properties of the substance.",
    accessibleDescription: "Comparison: Ionic forms crystals, Covalent forms molecules.",
    writingSpeed: "normal",
  },

  // ── Section: Summary ──
  {
    id: "chem_21",
    type: "concept",
    boardText: "What You Learned Today",
    exactSpokenText: "What You Learned Today.",
    teacherExplanation: "Let me recap the key ideas from this lesson.",
    whyThisStepMatters: "Reviewing consolidates your learning and helps you remember for exams.",
    accessibleDescription: "Heading: What You Learned Today.",
    writingSpeed: "normal",
  },
  {
    id: "chem_22",
    type: "instruction",
    boardText: "Atoms bond to fill their outer electron shell",
    exactSpokenText: "Atoms bond to fill their outer electron shell.",
    teacherExplanation: "This is the driving force behind all chemical bonding.",
    whyThisStepMatters: "This single idea explains all bonding behavior.",
    accessibleDescription: "Recap: Atoms bond to fill their outer electron shell.",
    writingSpeed: "normal",
  },
  {
    id: "chem_23",
    type: "instruction",
    boardText: "Ionic = electron transfer (metal + non-metal)",
    exactSpokenText: "Ionic bonds involve electron transfer between a metal and a non-metal.",
    teacherExplanation: "Like sodium giving its electron to chlorine to form salt.",
    whyThisStepMatters: "This rule lets you classify ionic bonds instantly.",
    accessibleDescription: "Recap: Ionic bonds transfer electrons between metal and non-metal.",
    writingSpeed: "normal",
  },
  {
    id: "chem_24",
    type: "instruction",
    boardText: "Covalent = electron sharing (non-metal + non-metal)",
    exactSpokenText: "Covalent bonds involve electron sharing between two non-metals.",
    teacherExplanation: "Like oxygen sharing electrons with hydrogen to form water.",
    whyThisStepMatters: "This rule lets you classify covalent bonds instantly.",
    accessibleDescription: "Recap: Covalent bonds share electrons between non-metals.",
    writingSpeed: "normal",
  },
  {
    id: "chem_25",
    type: "instruction",
    boardText: "Bond type determines properties (crystal vs molecule)",
    exactSpokenText:
      "The bond type determines the properties of the substance — ionic compounds form crystals, covalent compounds form molecules.",
    teacherExplanation:
      "This is why chemistry matters — the invisible bonds between atoms decide everything we can see and touch about a substance.",
    whyThisStepMatters:
      "Connecting bond type to properties is the practical payoff of this lesson.",
    accessibleDescription: "Recap: Bond type determines physical properties.",
    writingSpeed: "normal",
  },
];

export function buildChemistryLessonContent(): ClassroomLessonContent {
  return {
    lessonId: CHEMISTRY_LESSON_ID,
    title: CHEMISTRY_LESSON_TITLE,
    equation: CHEMISTRY_LESSON_EQUATION,
    subject: "Chemistry",
    course: "Science Form 3",
    institution: "Klassruum Demo Academy",
    academicLevel: "secondary",
    teacher: {
      name: "Dr. Amara",
      image: "/images/teachers/woman.png",
      voice: "female",
    },
    openingNarrative:
      "Welcome to today's chemistry lesson. We are going to explore chemical bonding — how atoms stick together to make everything around us. By the end, you will be able to tell the difference between ionic and covalent bonds.",
    lessonGoal:
      "Understand the difference between ionic bonds (electron transfer) and covalent bonds (electron sharing).",
    whyItMatters:
      "Chemical bonding explains why salt dissolves in water, why diamond is hard, and why you can breathe oxygen. It is the foundation of all chemistry.",
    sequence: chemistrySequence,
    sectionGoals: {
      welcome: "Understand what chemical bonding is and why it matters.",
      concept: "Learn how atoms bond by filling their outer electron shells.",
      worked_example:
        "See how NaCl (salt) forms through ionic bonding and H₂O (water) forms through covalent bonding.",
      guided_practice: "Identify bond types together with the teacher.",
      independent_practice: "Classify bonds on your own.",
      summary: "Review the key differences between ionic and covalent bonds.",
      exit_ticket: "Show what you learned with one final check.",
      complete: "Lesson complete — review your notes and progress.",
    },
    sectionStops: [
      { key: "welcome", startIndex: 0 },
      { key: "concept", startIndex: 2 },
      { key: "worked_example", startIndex: 7 },
      { key: "summary", startIndex: 20 },
    ],
    sectionRecaps: {
      concept: {
        title: "Concept recap",
        points: [
          "Atoms bond to fill their outer electron shell.",
          "Ionic bonds transfer electrons from metal to non-metal.",
          "Covalent bonds share electrons between non-metals.",
        ],
      },
      worked_example: {
        title: "Examples recap",
        points: [
          "NaCl: Na gives 1 electron to Cl → ionic bond.",
          "H₂O: O shares electrons with 2 H atoms → covalent bond.",
          "Opposite charges attract in ionic bonds; shared electrons hold covalent bonds.",
        ],
      },
    },
    thinkingPauses: {},
    middleQuestion: {
      question: "In sodium chloride (NaCl), what happens to the electron from sodium?",
      options: [
        "It is shared between Na and Cl",
        "It is transferred to chlorine",
        "It disappears",
        "It stays with sodium",
      ],
      correct: "It is transferred to chlorine",
      feedbackCorrect:
        "Correct! The electron moves from sodium to chlorine. This is what makes it an ionic bond.",
      feedbackIncorrect:
        "Not quite. In ionic bonds, electrons are transferred — moved completely — from the metal to the non-metal. Sodium's electron goes to chlorine.",
    },
    confidenceOptions: [
      { label: "I understand", value: "understand", emoji: "😀" },
      { label: "Almost", value: "almost", emoji: "🙂" },
      { label: "Not yet", value: "not_yet", emoji: "😐" },
      { label: "Explain again", value: "explain_again", emoji: "🔁" },
    ],
    practiceProblems: [
      {
        equation: "MgO — Magnesium Oxide",
        question: "Is MgO an ionic or covalent bond? Hint: Mg is a metal, O is a non-metal.",
        correctAnswer: "ionic",
        hint: "Remember: metal + non-metal = ionic bond.",
        hints: [
          "Look at the elements involved. Is magnesium a metal or a non-metal?",
          "Magnesium is a metal (left side of periodic table). Oxygen is a non-metal.",
          "Metal + non-metal → ionic bond (electron transfer).",
        ],
        misconception: {
          answer: "covalent",
          note: "Covalent bonds form between two non-metals. Since magnesium is a metal, this is an ionic bond.",
        },
      },
      {
        equation: "CO₂ — Carbon Dioxide",
        question: "Is CO₂ an ionic or covalent bond? Hint: Both carbon and oxygen are non-metals.",
        correctAnswer: "covalent",
        hint: "Remember: non-metal + non-metal = covalent bond.",
        hints: [
          "Look at the elements. Is carbon a metal or a non-metal?",
          "Both carbon and oxygen are non-metals (right side of periodic table).",
          "Non-metal + non-metal → covalent bond (electron sharing).",
        ],
        misconception: {
          answer: "ionic",
          note: "Ionic bonds need a metal. Since both carbon and oxygen are non-metals, they share electrons — a covalent bond.",
        },
      },
    ],
    exitTicket: {
      question: "What is the key difference between ionic and covalent bonds?",
      options: [
        "Ionic shares electrons, covalent transfers them",
        "Ionic transfers electrons, covalent shares them",
        "They are the same thing",
        "Ionic is for liquids, covalent is for solids",
      ],
      correct: "Ionic transfers electrons, covalent shares them",
      feedbackCorrect:
        "Exactly right! Ionic bonds transfer electrons (metal to non-metal), and covalent bonds share electrons (between non-metals).",
      feedbackIncorrect:
        "The key difference is: ionic bonds transfer electrons from a metal to a non-metal, while covalent bonds share electrons between two non-metals.",
    },
    exitReflection: {
      question: "Before we finish — which part should we review again next time?",
      options: [
        "What a chemical bond is",
        "Ionic bonding (NaCl)",
        "Covalent bonding (H₂O)",
        "I understood everything",
      ],
    },
    visualPlan: [
      {
        id: "chem_ionic_bond",
        anchorId: "chem_8",
        kind: "diagram",
        source: "fallback",
        title: "Sodium Chloride electron transfer",
        description: "Sodium (Na) transfers its 1 valence electron to Chlorine (Cl), forming stable Na⁺ and Cl⁻ ions.",
        alt: "Na [•] + Cl [•••••••] → Na⁺ + [••••••••]⁻",
        teacherCue: "Observe how Sodium loses an electron to become a positive cation, and Chlorine gains it to become a negative anion.",
        labels: ["Valence Electron", "Electron Transfer", "Na+ Cation", "Cl- Anion", "Electrostatic Attraction"]
      },
      {
        id: "chem_covalent_bond",
        anchorId: "chem_14",
        kind: "workflow",
        source: "fallback",
        title: "Water (H₂O) electron sharing",
        description: "Oxygen shares two of its valence electrons with two separate Hydrogen atoms so all achieve full shells.",
        alt: "H — O — H structure",
        teacherCue: "Notice that the shared electrons are counted toward the outer shells of both Oxygen and Hydrogen.",
        labels: ["Shared Electron Pair", "Single Covalent Bond", "Full Outer Shell", "H2O Molecule"]
      },
      {
        id: "chem_comparison_table",
        anchorId: "chem_17",
        kind: "table",
        source: "fallback",
        title: "Ionic vs Covalent bonds comparison",
        description: "Side-by-side comparison of the core characteristics of ionic and covalent bonding.",
        alt: "Comparison matrix",
        teacherCue: "Note how metal + non-metal pairs always transfer electrons, whereas non-metals share electrons.",
        labels: ["Bond Type", "Electron Action", "Elements Involved", "Structure Formed"]
      }
    ],
    learnerNotes: `# Chemical Bonding: Ionic vs Covalent

## What is a Chemical Bond?
A force that holds atoms together. Atoms bond to achieve a full outer electron shell.

## Ionic Bonds
- **Definition**: Transfer of electrons from a metal to a non-metal
- **How it works**: Metal loses electrons (becomes positive), non-metal gains electrons (becomes negative). Opposite charges attract.
- **Example**: NaCl (table salt) — Na gives 1 electron to Cl
- **Properties**: Forms crystals, dissolves in water, conducts electricity when dissolved

## Covalent Bonds
- **Definition**: Sharing of electrons between two non-metals
- **How it works**: Both atoms share electrons to fill their outer shells
- **Example**: H₂O (water) — O shares electrons with 2 H atoms
- **Properties**: Forms molecules, lower melting points, does not conduct electricity

## Quick Rule
- Metal + Non-metal → Ionic bond
- Non-metal + Non-metal → Covalent bond

## Common Mistakes
- Saying electrons are "shared" in ionic bonds (they are transferred)
- Confusing which elements are metals vs non-metals
- Forgetting that bond type determines physical properties`,
  };
}
