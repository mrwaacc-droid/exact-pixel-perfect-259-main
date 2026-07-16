/**
 * classroom-teacher-brain-content.ts
 *
 * Natural teacher aside templates — the "voice" of the AI teacher between
 * scripted lesson steps. These are deterministic, warm, human phrases that
 * make the teacher feel alive without requiring AI generation.
 *
 * Organized by aside type and section. The teacher brain module
 * (classroom-teacher-brain.ts) selects from these based on the classroom state.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Transition asides (between board items)
// ─────────────────────────────────────────────────────────────────────────────

export const TRANSITION_ASIDES: string[] = [
  "Alright, now watch this next step.",
  "Good. Keep that in mind for this part.",
  "Now we're ready to build on that.",
  "Here's the part that ties it together.",
  "Stay with me here — this next move matters.",
  "That's the base. Now let's use it.",
  "Good progress. Here's what comes next.",
  "Now let's put that idea to work.",
  "Watch this carefully — this is where the method shows itself.",
  "Alright, one more step forward.",
  "Now you can see how the pieces fit.",
  "Let's keep going. You're with it.",
];

// ─────────────────────────────────────────────────────────────────────────────
// Encouragement asides (after correct answers or good progress)
// ─────────────────────────────────────────────────────────────────────────────

export const ENCOURAGEMENT_ASIDES: string[] = [
  "Yes — that's right.",
  "Good. That's the idea.",
  "Exactly. You saw the pattern there.",
  "Well done. That step was solid.",
  "That's it. You've got the right move.",
  "Nice work. You're not guessing anymore — you're seeing it.",
  "Spot on. Keep that same thinking.",
  "Excellent. That was careful and correct.",
  "That's the right approach. Stay with it.",
  "Good work. You checked it properly.",
  "Yes. That's starting to settle in.",
  "You got it. Try to notice why it worked.",
];

// ─────────────────────────────────────────────────────────────────────────────
// Check-in asides (periodic, after several items)
// ─────────────────────────────────────────────────────────────────────────────

export const CHECKIN_ASIDES: string[] = [
  "Are you still with me?",
  "Take a second and look at that — does it make sense?",
  "How are you doing with this part?",
  "Pause there. Can you see the pattern yet?",
  "If that last bit felt quick, we can go again.",
  "Still okay so far?",
];

// ─────────────────────────────────────────────────────────────────────────────
// Reaction asides (to confusion or frustration)
// ─────────────────────────────────────────────────────────────────────────────

export const REACTION_CONFUSED_ASIDES: string[] = [
  "Alright, this is the point where many people get stuck. Let's take it slowly.",
  "This bit is tricky. I'll show it again more carefully.",
  "No problem. Let's go back one step and clear it up.",
  "Take a breath. You don't need to rush this.",
  "You're not the only one who pauses here. Let's work through it properly.",
];

export const REACTION_FRUSTRATED_ASIDES: string[] = [
  "I know this feels rough right now, but you're not far off.",
  "It's alright to get stuck here. Let's steady it and sort out the part that's causing trouble.",
  "Let's come at it from another angle.",
  "You're doing better than it feels. We'll take it one piece at a time.",
  "Don't force it. Let's fix the exact step that's wobbling.",
];

// ─────────────────────────────────────────────────────────────────────────────
// Personality asides (analogy, humor, real-world connection)
// ─────────────────────────────────────────────────────────────────────────────

export const PERSONALITY_ASIDES: Record<string, string[]> = {
  mathematics: [
    "Think of it like a recipe — the numbers have to work together, not just sit there.",
    "This is one of those moments where math stops looking random and starts making sense.",
    "Math gets easier when you notice the pattern instead of trying to memorize everything.",
    "Once you see why this step works, the rest becomes much less scary.",
    "This is the kind of detail that separates guessing from understanding.",
  ],
  science: [
    "This is happening in the real world all the time — we're just slowing it down enough to notice it.",
    "Science usually becomes clearer when you ask one honest question: why is that happening?",
    "You've seen this before in everyday life, even if nobody named it for you.",
    "Treat it like evidence. Follow what the atoms, cells, or forces are doing.",
  ],
  technical: [
    "This is a practical skill, so accuracy matters more than sounding clever.",
    "Think of this like building something real — each small step has to hold.",
    "This is how real work gets done: one clear move at a time.",
    "The people who get good at this usually stop rushing the basics.",
  ],
  social: [
    "This matters because it connects directly to how people live, think, and act.",
    "Try looking at it from another person's point of view. What changes?",
    "Ideas like this shape how people explain the world around them.",
    "Once you understand it, you start noticing it outside class too.",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Bridge asides (between lesson sections)
// ─────────────────────────────────────────────────────────────────────────────

export const BRIDGE_ASIDES: Record<string, string[]> = {
  welcome: [
    "Good. Now let's get into the main idea.",
    "Alright, now we're ready for the actual concept.",
  ],
  concept: [
    "Now that you've seen the idea, let's use it.",
    "Good. Let me show you what it looks like in action.",
    "That's the idea. Now let's make it practical.",
  ],
  worked_example: [
    "You've seen it once. Now let's try it together.",
    "That example showed the pattern. See if you can use it now.",
    "Good. Now it's time to practise it.",
  ],
  guided_practice: [
    "Good. Now try one without leaning on me too much.",
    "You've had support. Now it's your turn to carry it.",
  ],
  independent_practice: [
    "Good work. Let's pull the lesson together.",
    "You've shown you can do it. Let's finish with a quick review.",
  ],
  summary: [
    "That's the lesson. One last check before we finish.",
    "Good work today. Let me ask you one last thing.",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Section-aware transition hints (used to pick more relevant transitions)
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_INTRO_PHRASES: Record<string, string[]> = {
  concept: [
    "Now let's understand the key idea behind this.",
    "Here's the concept we need to grasp.",
  ],
  worked_example: [
    "Let me walk you through a complete example.",
    "Watch how this works step by step.",
  ],
  guided_practice: ["Now let's try one together.", "Your turn to think along with me."],
  independent_practice: ["Now it's all you. Give it a shot.", "Show me what you've learned."],
  summary: ["Let's go back over the main points.", "Here's a quick summary of what you learned."],
};
