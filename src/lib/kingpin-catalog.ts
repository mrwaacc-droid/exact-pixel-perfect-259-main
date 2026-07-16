import type { CourseSourceType } from "@/lib/types";
import {
  KINGPIN_CBC_GRADE9_MATHEMATICS_FULL_YEAR,
  KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_1,
  KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_2,
  KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_3,
} from "./kingpin-grade9-mathematics-catalog";

export type KingpinLessonSection = {
  title: string;
  purpose: string;
  content: string[];
};

export type KingpinLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  objective: string;
  tools: string[];
  departments: string[];
  roles: string[];
  outcomes: string[];
  sections: KingpinLessonSection[];
};

export type KingpinModule = {
  id: string;
  title: string;
  overview: string;
  tools: string[];
  departments: string[];
  roles: string[];
  outcomes: string[];
  lessons: KingpinLesson[];
};

export type KingpinCertificateTheme = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  website: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  sealText: string;
  signatureLabel: string;
};

export type KingpinCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  owner: string;
  sourceType: CourseSourceType;
  visibility: "public_catalog" | "platform_admin_only";
  priceUsd: number;
  pricingLabel: string;
  description: string;
  heroDescription: string;
  audience: string[];
  departments: string[];
  roles: string[];
  toolUniverse: string[];
  includedResources: string[];
  assessmentModel: string[];
  outcomes: string[];
  certificateTheme: KingpinCertificateTheme;
  modules: KingpinModule[];
};

type LessonSeed = {
  id: string;
  title: string;
  objective: string;
  focus: string;
  practice: string;
};

type ModuleSeed = {
  id: string;
  title: string;
  overview: string;
  tools: string[];
  departments: string[];
  roles: string[];
  outcomes: string[];
  lessons: [LessonSeed, LessonSeed];
};

function makeLesson(module: ModuleSeed, seed: LessonSeed): KingpinLesson {
  return {
    id: seed.id,
    title: seed.title,
    durationMinutes: 15,
    objective: seed.objective,
    tools: module.tools,
    departments: module.departments,
    roles: module.roles,
    outcomes: module.outcomes,
    sections: [
      {
        title: "Why this lesson matters",
        purpose: "Anchor the topic in real work, learning, or research.",
        content: [module.overview, seed.focus, `The lesson objective is: ${seed.objective}`],
      },
      {
        title: "Workflow and tool logic",
        purpose: "Show how the tools are selected and used together.",
        content: [
          `This lesson uses ${module.tools.join(", ")} to move from raw problem to usable output.`,
          `Learners practice structured prompting, review, and iteration while working toward: ${seed.objective}`,
          "The instructor explains where one tool begins, where another tool adds value, and how output quality improves when the workflow is intentionally sequenced.",
        ],
      },
      {
        title: "Department and role application",
        purpose: "Translate the workflow into practical contexts.",
        content: [
          `Department examples: ${module.departments.join(", ")}.`,
          `Role examples: ${module.roles.join(", ")}.`,
          "Learners are expected to adapt the same AI workflow differently depending on whether they are acting as a student, teacher, analyst, founder, manager, or department specialist.",
        ],
      },
      {
        title: "Guided practice",
        purpose: "Move from explanation into active application.",
        content: [
          seed.practice,
          "The guided practice phase is intended to make the learner produce a usable output rather than simply describe a concept.",
        ],
      },
      {
        title: "Quality control and reflection",
        purpose: "Help learners avoid weak, unsafe, or shallow usage.",
        content: [
          `Learners must review outputs for accuracy, usefulness, and fit before trusting work created with ${module.tools.join(", ")}.`,
          "The lesson ends with a reflection on where human judgment must stay in the loop.",
          "Special attention is given to privacy, weak assumptions, low-quality evidence, and the risk of accepting polished outputs without verification.",
        ],
      },
    ],
  };
}

function makeModule(seed: ModuleSeed): KingpinModule {
  return {
    id: seed.id,
    title: seed.title,
    overview: seed.overview,
    tools: seed.tools,
    departments: seed.departments,
    roles: seed.roles,
    outcomes: seed.outcomes,
    lessons: seed.lessons.map((lesson) => makeLesson(seed, lesson)),
  };
}

const moduleSeeds: ModuleSeed[] = [
  {
    id: "m01",
    title: "AI Foundations and Safe Use",
    overview: "Build the mental model needed to use AI responsibly and productively.",
    tools: ["ChatGPT", "Claude", "Gemini", "Microsoft Copilot", "Perplexity"],
    departments: ["Education", "Operations", "Administration"],
    roles: ["Student", "Teacher", "Manager"],
    outcomes: [
      "Understand model differences",
      "Prompt better",
      "Recognize privacy and hallucination risks",
    ],
    lessons: [
      {
        id: "m01-l01",
        title: "What modern AI tools actually do",
        objective: "Understand major AI categories and their strengths.",
        focus:
          "Learners compare assistants, research tools, and embedded workplace AI instead of treating them as identical.",
        practice: "Map ten real tasks to the most suitable AI tool and justify each choice.",
      },
      {
        id: "m01-l02",
        title: "Prompt design and output verification",
        objective: "Write better prompts and verify results critically.",
        focus:
          "The lesson teaches role, goal, audience, constraints, evidence, and review criteria as a reusable prompt structure.",
        practice:
          "Rewrite weak prompts into strong prompts for research, writing, and planning work.",
      },
    ],
  },
  {
    id: "m02",
    title: "Chat Assistants and Reasoning Tools",
    overview: "Use conversational AI for drafting, explanation, comparison, and structured work.",
    tools: ["ChatGPT", "Claude", "Gemini", "Microsoft Copilot", "Perplexity"],
    departments: ["Education", "Marketing", "Product"],
    roles: ["Teacher", "Founder", "Analyst"],
    outcomes: [
      "Compare assistant outputs",
      "Route tasks to better tools",
      "Use AI for serious work",
    ],
    lessons: [
      {
        id: "m02-l01",
        title: "Comparing ChatGPT, Claude, Gemini, and Copilot",
        objective: "Match major assistants to the right kind of work.",
        focus:
          "Learners compare summarization, brainstorming, planning, explanation, and long-form reasoning across tools.",
        practice:
          "Run one task through multiple assistants and score the results for clarity, grounding, and usefulness.",
      },
      {
        id: "m02-l02",
        title: "Perplexity and answer-grounded search",
        objective: "Use AI search for evidence-backed answers.",
        focus: "The lesson shows how current-source workflows differ from standard chat workflows.",
        practice:
          "Build a short evidence-backed briefing, then refine it into a decision-ready summary.",
      },
    ],
  },
  {
    id: "m03",
    title: "Research and Literature Intelligence",
    overview:
      "Use AI to accelerate literature review, source synthesis, and grounded note-building.",
    tools: ["Elicit", "Consensus", "SciSpace", "NotebookLM", "Perplexity"],
    departments: ["Research", "Education", "Policy"],
    roles: ["Researcher", "Lecturer", "Analyst"],
    outcomes: ["Search literature efficiently", "Synthesize evidence", "Build grounded notes"],
    lessons: [
      {
        id: "m03-l01",
        title: "Academic search and literature review acceleration",
        objective: "Shorten first-pass review work without losing rigor.",
        focus:
          "Learners frame research questions, compare papers, and extract methods, claims, and evidence more efficiently.",
        practice:
          "Create a short reading shortlist and explain why each source deserves attention.",
      },
      {
        id: "m03-l02",
        title: "NotebookLM for grounded synthesis",
        objective: "Turn multiple sources into a coherent grounded workspace.",
        focus:
          "The class shows how to ask source-grounded questions and convert them into briefings or notes.",
        practice: "Build a short evidence memo from a multi-document notebook.",
      },
    ],
  },
  {
    id: "m04",
    title: "Writing, Editing, and Documentation",
    overview: "Use AI to draft, refine, summarize, and adapt professional writing with discipline.",
    tools: ["Notion AI", "Grammarly", "QuillBot", "Jasper", "ChatGPT", "Otter AI"],
    departments: ["Marketing", "HR", "Administration"],
    roles: ["Writer", "Marketer", "Administrator"],
    outcomes: ["Draft faster", "Edit systematically", "Improve documentation"],
    lessons: [
      {
        id: "m04-l01",
        title: "Drafting, rewriting, and tone control",
        objective: "Produce stronger drafts for different audiences.",
        focus:
          "Learners turn one message into multiple versions for memo, email, proposal, or internal update contexts.",
        practice: "Transform one weak draft into three audience-specific outputs.",
      },
      {
        id: "m04-l02",
        title: "Knowledge notes and reusable documentation",
        objective: "Convert raw material into reusable internal knowledge.",
        focus:
          "The lesson covers extracting actions, decisions, and key ideas from notes, reports, or meetings.",
        practice: "Turn a raw transcript into a structured internal knowledge page.",
      },
    ],
  },
  {
    id: "m05",
    title: "Presentations and Visual Communication",
    overview: "Create AI-assisted presentations and explainers that improve communication quality.",
    tools: ["Gamma", "Tome", "Canva AI", "Beautiful.ai"],
    departments: ["Education", "Marketing", "Leadership"],
    roles: ["Teacher", "Manager", "Founder"],
    outcomes: ["Build better decks", "Design explainers", "Improve narrative flow"],
    lessons: [
      {
        id: "m05-l01",
        title: "Slide structure and narrative flow",
        objective: "Build presentations with stronger logic and pacing.",
        focus:
          "Learners start with story structure and decision flow before relying on AI design assistance.",
        practice:
          "Create a short deck with one clear message per slide and defined audience intent.",
      },
      {
        id: "m05-l02",
        title: "Canva AI for explainers and visual assets",
        objective: "Create useful visuals without losing clarity.",
        focus:
          "The class helps non-designers build explainers, onboarding assets, and internal posters with better structure.",
        practice:
          "Design a visual explainer for a department problem and review it for clarity and accessibility.",
      },
    ],
  },
  {
    id: "m06",
    title: "Image Generation and Design Support",
    overview:
      "Use image generation systems for campaign support, concept work, and teaching media.",
    tools: ["Midjourney", "DALL·E", "Adobe Firefly", "Leonardo AI"],
    departments: ["Marketing", "Education", "Creative"],
    roles: ["Designer", "Teacher", "Marketer"],
    outcomes: ["Prompt for images better", "Judge image usefulness", "Use visuals responsibly"],
    lessons: [
      {
        id: "m06-l01",
        title: "Prompting for images with purpose",
        objective: "Generate visuals that support a real communication goal.",
        focus:
          "Learners move from brief to prompt to review rather than generating images aimlessly.",
        practice: "Create a visual set for a specific audience and defend the chosen outputs.",
      },
      {
        id: "m06-l02",
        title: "Design support workflows with Firefly and Canva",
        objective: "Use AI visual tools inside practical design workflows.",
        focus:
          "The lesson connects AI image generation with banners, posters, decks, and classroom media.",
        practice: "Produce a mini visual pack for an event, campaign, or teaching context.",
      },
    ],
  },
  {
    id: "m07",
    title: "Video Creation and Editing",
    overview: "Use AI to script, edit, and scale video content for teaching and communication.",
    tools: ["Runway", "Pika", "Synthesia", "Descript", "CapCut AI"],
    departments: ["Education", "Marketing", "Communications"],
    roles: ["Teacher", "Trainer", "Marketer"],
    outcomes: ["Build video workflows", "Edit faster", "Use synthetic presenters well"],
    lessons: [
      {
        id: "m07-l01",
        title: "AI video workflows from script to final edit",
        objective: "Design a full workflow for short video production.",
        focus:
          "Learners cover scripting, rough cut creation, captioning, revision, and publishing decisions.",
        practice:
          "Plan a short educational or communication video with an AI-assisted production path.",
      },
      {
        id: "m07-l02",
        title: "Synthetic presenters and explainer delivery",
        objective: "Use AI avatars responsibly in training and communication.",
        focus:
          "The lesson explores when synthetic presenters help and where human delivery remains better.",
        practice:
          "Write a synthetic-presenter brief and define where human delivery must stay in the loop.",
      },
    ],
  },
  {
    id: "m08",
    title: "Voice, Audio, and Spoken Knowledge Work",
    overview: "Use AI for speech generation, transcription, audio notes, and voice-first learning.",
    tools: ["ElevenLabs", "Murf", "Whisper", "NotebookLM", "Otter AI", "Suno"],
    departments: ["Education", "Media", "Communications"],
    roles: ["Teacher", "Content Creator", "Researcher"],
    outcomes: ["Create voice assets", "Capture audio knowledge", "Support audio accessibility"],
    lessons: [
      {
        id: "m08-l01",
        title: "Speech synthesis and educational voice workflows",
        objective: "Use AI voices for explainers and learning content.",
        focus:
          "Learners move from script design to voice selection, pacing, emphasis, and accessibility review.",
        practice:
          "Create a narrated explanation script and choose the best voice production settings.",
      },
      {
        id: "m08-l02",
        title: "Transcription and spoken knowledge capture",
        objective: "Turn spoken material into structured knowledge outputs.",
        focus:
          "The class covers transcription cleanup, theme extraction, and transformation into notes and summaries.",
        practice: "Transform a spoken source into structured notes, actions, and learning points.",
      },
    ],
  },
  {
    id: "m09",
    title: "Coding and Technical Productivity",
    overview:
      "Use AI coding assistants to accelerate programming, debugging, and technical explanation.",
    tools: ["GitHub Copilot", "Cursor", "Replit AI", "Codeium", "ChatGPT"],
    departments: ["IT", "Engineering", "Product"],
    roles: ["Developer", "Technical Lead", "Builder"],
    outcomes: [
      "Use coding assistants carefully",
      "Review generated code",
      "Explain systems better",
    ],
    lessons: [
      {
        id: "m09-l01",
        title: "AI coding copilots for practical development work",
        objective: "Speed up implementation without lowering quality.",
        focus: "Learners review suggestions, debug intelligently, and avoid blind code acceptance.",
        practice:
          "Use a coding assistant to solve a problem, then explain and improve the generated approach.",
      },
      {
        id: "m09-l02",
        title: "Explaining code and technical decisions with AI",
        objective: "Use AI to improve technical communication and onboarding.",
        focus:
          "The lesson supports code explanation, architecture summaries, and developer-to-stakeholder translation.",
        practice: "Explain one technical workflow for both technical and non-technical audiences.",
      },
    ],
  },
  {
    id: "m10",
    title: "Data Analysis and Spreadsheet Intelligence",
    overview:
      "Use AI to reason with data, summarize trends, and support spreadsheet-driven analysis.",
    tools: ["Excel Copilot", "Julius AI", "Power BI Copilot", "ChatGPT"],
    departments: ["Finance", "Operations", "Research"],
    roles: ["Analyst", "Finance Officer", "Manager"],
    outcomes: [
      "Frame better data questions",
      "Validate AI-generated analysis",
      "Turn numbers into actions",
    ],
    lessons: [
      {
        id: "m10-l01",
        title: "Spreadsheet copilots and analytical questioning",
        objective: "Use AI to speed up spreadsheet tasks while keeping control.",
        focus:
          "Learners transform business questions into structured analytical requests and validate the results.",
        practice: "Convert a messy spreadsheet problem into a tested analytical task.",
      },
      {
        id: "m10-l02",
        title: "Turning data into management insight",
        objective: "Translate analysis into decisions, summaries, and next steps.",
        focus: "The lesson teaches pattern extraction, management summaries, and decision framing.",
        practice: "Write a short management insight note from a data scenario.",
      },
    ],
  },
  {
    id: "m11",
    title: "Automation and Workflow Orchestration",
    overview:
      "Connect AI tools to triggers, forms, documents, and systems to reduce repetitive work.",
    tools: ["Zapier AI", "Make", "n8n", "Airtable AI"],
    departments: ["Operations", "Sales", "Administration"],
    roles: ["Operations Lead", "Founder", "Administrator"],
    outcomes: ["Find automation candidates", "Design safer automations", "Reduce repetitive work"],
    lessons: [
      {
        id: "m11-l01",
        title: "Automation opportunities and workflow mapping",
        objective: "Identify repeatable processes that benefit from automation.",
        focus:
          "The class maps triggers, actions, approvals, exceptions, and decision points before anything is automated.",
        practice:
          "Design one automation flow with review checkpoints and failure points clearly labeled.",
      },
      {
        id: "m11-l02",
        title: "Practical AI automations with Airtable, Make, and Zapier",
        objective: "Build realistic AI-assisted automation scenarios.",
        focus:
          "Learners create workflows for summarization, categorization, triage, and internal routing.",
        practice:
          "Outline an automation that uses AI plus one business system and define success criteria.",
      },
    ],
  },
  {
    id: "m12",
    title: "Marketing, Sales, and Customer Communication",
    overview:
      "Use AI to create marketing assets, customer communication systems, and support workflows.",
    tools: ["Jasper", "Copy.ai", "HubSpot AI", "Mailchimp AI", "Chatbase"],
    departments: ["Marketing", "Sales", "Customer Support"],
    roles: ["Marketer", "Sales Officer", "Support Lead"],
    outcomes: [
      "Produce better communication assets",
      "Support campaigns with AI",
      "Improve customer-facing workflows",
    ],
    lessons: [
      {
        id: "m12-l01",
        title: "AI-assisted marketing content systems",
        objective: "Build campaign-support content without losing strategy.",
        focus:
          "The lesson links AI content generation to message hierarchy, positioning, and asset repurposing.",
        practice: "Create a mini campaign asset map with AI-generated drafts and review notes.",
      },
      {
        id: "m12-l02",
        title: "Customer-facing assistants and sales enablement",
        objective: "Use AI for support, FAQs, and sales process help.",
        focus:
          "Learners design FAQ systems, response drafting flows, and escalation-aware customer support workflows.",
        practice:
          "Define a customer-facing AI assistant workflow with escalation rules and quality checks.",
      },
    ],
  },
  {
    id: "m13",
    title: "Education and Training Applications",
    overview:
      "Apply AI across classroom teaching, revision support, staff training, and instructional design.",
    tools: ["ChatGPT", "NotebookLM", "Gamma", "Canva AI", "Klassruum"],
    departments: ["Education", "Training"],
    roles: ["Teacher", "Trainer", "Instructional Designer"],
    outcomes: [
      "Improve lesson design",
      "Scale training support",
      "Create stronger learner materials",
    ],
    lessons: [
      {
        id: "m13-l01",
        title: "Instructional design with AI support",
        objective: "Use AI to design lessons and learning sequences.",
        focus:
          "Learners build objectives, sections, examples, checkpoints, and guided practice with AI support.",
        practice:
          "Turn one topic into a structured learning sequence with objectives and guided practice.",
      },
      {
        id: "m13-l02",
        title: "Klassruum and AI classroom delivery workflows",
        objective: "Understand how AI classroom systems support structured delivery.",
        focus:
          "The lesson connects materials, lesson generation, delivery, accessibility, notes, and evidence capture.",
        practice: "Map an end-to-end AI lesson delivery workflow for a subject or training case.",
      },
    ],
  },
  {
    id: "m14",
    title: "Department-Based AI Systems",
    overview:
      "Understand how AI workflows change across HR, finance, operations, research, marketing, and administration.",
    tools: ["ChatGPT", "Copilot", "Perplexity", "Julius AI", "Zapier AI"],
    departments: ["HR", "Finance", "Operations", "Marketing", "Research", "Administration"],
    roles: ["Manager", "HR Officer", "Analyst", "Administrator"],
    outcomes: [
      "Design department workflows",
      "Compare AI use by function",
      "Spot realistic implementation opportunities",
    ],
    lessons: [
      {
        id: "m14-l01",
        title: "AI in HR, admin, and operations",
        objective: "Use AI to improve operational support without uncontrolled automation.",
        focus:
          "Learners examine policy drafting, communication support, scheduling logic, and task-routing use cases.",
        practice:
          "Design one AI-supported workflow for operations or HR and define review checkpoints.",
      },
      {
        id: "m14-l02",
        title: "AI in finance, research, and analysis teams",
        objective: "Apply AI to evidence, numbers, patterns, and structured decision support.",
        focus:
          "The lesson connects evidence gathering, spreadsheet interpretation, research synthesis, and briefing construction.",
        practice:
          "Produce a short cross-department insight note using one research tool and one data tool.",
      },
    ],
  },
  {
    id: "m15",
    title: "Role-Based Capstone Workflows",
    overview:
      "Combine multiple AI tools into complete job-ready workflows for learners, staff, and teams.",
    tools: [
      "ChatGPT",
      "Claude",
      "Perplexity",
      "Canva AI",
      "Zapier AI",
      "NotebookLM",
      "Mailchimp AI",
    ],
    departments: ["Cross-functional"],
    roles: ["Student", "Teacher", "Researcher", "Analyst", "Founder", "Marketer", "Manager"],
    outcomes: [
      "Build multi-tool workflows",
      "Apply AI by role",
      "Move from experimentation to implementation",
    ],
    lessons: [
      {
        id: "m15-l01",
        title: "Capstone: student, teacher, and researcher workflows",
        objective: "Assemble full AI workflows for learning, teaching, and research use cases.",
        focus:
          "Learners combine assistants, notebooks, visuals, and research tools into coherent academic workflows.",
        practice:
          "Map a role-specific workflow from raw problem to final deliverable and explain the tool choices.",
      },
      {
        id: "m15-l02",
        title: "Capstone: analyst, founder, and department lead workflows",
        objective: "Build high-value AI systems for management, analysis, and execution roles.",
        focus:
          "The lesson combines research, analysis, communication, and automation into complete operating models.",
        practice: "Produce a capstone AI workflow blueprint for a real department or role.",
      },
    ],
  },
];

const moduleCatalog = moduleSeeds.map(makeModule);
const uniqueTools = Array.from(new Set(moduleCatalog.flatMap((module) => module.tools)));
const uniqueDepartments = Array.from(
  new Set(moduleCatalog.flatMap((module) => module.departments)),
);
const uniqueRoles = Array.from(new Set(moduleCatalog.flatMap((module) => module.roles)));

const kingpinCertificateTheme: KingpinCertificateTheme = {
  brandName: "KingPin",
  tagline: "Business Technology, AI & Strategy Consulting",
  logoUrl: "https://kingpin.co.ke/images/kingpin-logo-512x512.png",
  website: "https://kingpin.co.ke",
  primaryColor: "#000000",
  accentColor: "#7D2233",
  backgroundColor: "#FBF8F5",
  sealText: "KingPin Professional Certificate",
  signatureLabel: "KingPin Academic & Strategy Office",
};

function createKingpinCourse(input: {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroDescription: string;
  moduleIds: string[];
  pricingLabel?: string;
  priceUsd?: number;
}) {
  const modules = moduleCatalog.filter((module) => input.moduleIds.includes(module.id));
  const courseTools = Array.from(new Set(modules.flatMap((module) => module.tools)));
  const courseDepartments = Array.from(new Set(modules.flatMap((module) => module.departments)));
  const courseRoles = Array.from(new Set(modules.flatMap((module) => module.roles)));

  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    owner: "KingPin Academy",
    sourceType: "kingpin" as CourseSourceType,
    visibility: "public_catalog" as const,
    priceUsd: input.priceUsd ?? 15,
    pricingLabel: input.pricingLabel ?? "$15 one-time",
    description: input.description,
    heroDescription: input.heroDescription,
    audience: ["Students", "Teachers", "Researchers", "Analysts", "Founders", "Professionals"],
    departments: courseDepartments,
    roles: courseRoles,
    toolUniverse: courseTools,
    includedResources: [
      `${modules.length} curriculum modules`,
      `${modules.reduce((sum, module) => sum + module.lessons.length, 0)} detailed classroom lessons`,
      `${courseTools.length}+ current AI tools`,
      "Department-specific applications",
      "Role-based examples",
      "Guided practice and implementation tasks",
    ],
    assessmentModel: [
      "Guided task completion",
      "Workflow blueprint exercises",
      "Role-based application tasks",
      "Critical evaluation and reflection",
    ],
    outcomes: Array.from(new Set(modules.flatMap((module) => module.outcomes))),
    certificateTheme: kingpinCertificateTheme,
    modules,
  } satisfies KingpinCourse;
}

export const KINGPIN_AI_MASTERCLASS: KingpinCourse = createKingpinCourse({
  id: "kingpin-ai-masterclass-001",
  slug: "kingpin-ai-productivity-masterclass",
  title: "KingPin AI Productivity Masterclass",
  subtitle: "40+ AI tools for work, research, analysis, automation, and department use",
  description:
    "A comprehensive KingPin-owned AI master course that teaches modern AI tools through practical workflows, departmental applications, role-based use cases, research methods, and integration thinking.",
  heroDescription:
    "This course is built as a serious curriculum product: detailed lessons, structured sections, practical tasks, workflow thinking, and real applications across education, business, research, operations, marketing, HR, finance, and technical teams.",
  moduleIds: moduleCatalog.map((module) => module.id),
});

export const KINGPIN_AI_RESEARCH_ANALYSIS: KingpinCourse = createKingpinCourse({
  id: "kingpin-ai-research-analysis-001",
  slug: "kingpin-ai-research-and-analysis-specialist",
  title: "KingPin AI Research & Analysis Specialist",
  subtitle: "Evidence, literature, data, reasoning, and structured analytical workflows",
  description:
    "A premium KingPin course focused on research, analytical reasoning, evidence workflows, NotebookLM-driven synthesis, and decision-grade output design.",
  heroDescription:
    "Designed for researchers, analysts, advanced students, and decision support teams who need AI to improve evidence quality without reducing rigor.",
  moduleIds: ["m01", "m02", "m03", "m08", "m10", "m14", "m15"],
});

export const KINGPIN_AI_MARKETING_CONTENT: KingpinCourse = createKingpinCourse({
  id: "kingpin-ai-marketing-content-001",
  slug: "kingpin-ai-marketing-and-content-systems",
  title: "KingPin AI Marketing & Content Systems",
  subtitle: "Content, campaigns, visuals, presentations, and customer-facing AI workflows",
  description:
    "A premium KingPin course for marketers, founders, communicators, and creative teams using AI to design campaigns, assets, and customer communication systems.",
  heroDescription:
    "This course helps teams move from generic AI content generation to strategic content systems, brand-safe visuals, stronger storytelling, and campaign execution.",
  moduleIds: ["m01", "m02", "m04", "m05", "m06", "m07", "m12", "m15"],
});

export const KINGPIN_AI_AUTOMATION_OPERATIONS: KingpinCourse = createKingpinCourse({
  id: "kingpin-ai-automation-operations-001",
  slug: "kingpin-ai-automation-and-operations-builder",
  title: "KingPin AI Automation & Operations Builder",
  subtitle: "Operations, workflow orchestration, admin systems, and AI productivity design",
  description:
    "A premium KingPin course for operations leads, administrators, founders, and managers building safer automations and AI-assisted operating systems.",
  heroDescription:
    "Focused on process design, automation discipline, role-based workflows, and the practical use of AI inside modern operational systems.",
  moduleIds: ["m01", "m02", "m04", "m10", "m11", "m14", "m15"],
});

export function getKingpinCourseCatalog() {
  return [
    KINGPIN_AI_MASTERCLASS,
    KINGPIN_AI_RESEARCH_ANALYSIS,
    KINGPIN_AI_MARKETING_CONTENT,
    KINGPIN_AI_AUTOMATION_OPERATIONS,
    KINGPIN_CBC_GRADE9_MATHEMATICS_FULL_YEAR,
    KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_1,
    KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_2,
    KINGPIN_CBC_GRADE9_MATHEMATICS_TERM_3,
  ];
}

export function getKingpinCourseBySlug(slug: string) {
  return getKingpinCourseCatalog().find((course) => course.slug === slug) ?? null;
}

export function getKingpinCourseById(id: string) {
  return getKingpinCourseCatalog().find((course) => course.id === id) ?? null;
}

export { makeLesson, makeModule };
