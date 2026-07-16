# 🎓 Klassruum Platform Architecture Blueprint

## 1. Vision & Core Philosophy

### 1.1 Vision
Klassruum is **not** an LMS, **not** Zoom, **not** ChatGPT, and **not** a video player. 

It is an **AI Teaching Platform** that transforms curriculum into real classroom experiences delivered by an autonomous AI teacher capable of explaining, questioning, adapting, assessing, and supporting learners in real time. The platform should feel as though every learner is being taught by an experienced human educator who understands both the lesson and the learner.

---

### 1.2 Core Philosophy
Every lesson in Klassruum is structured to answer four fundamental questions:

```
                    ┌──────────────────────────────┐
                    │     What should be taught?   │
                    │     Curriculum & Standards   │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │     How should it be taught? │
                    │     Pedagogical Strategy     │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │     Who is being taught?     │
                    │     Learner Profile & Needs  │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  What happens after teaching?│
                    │  Assessments & Analytics     │
                    └──────────────────────────────┘
```

1. **What should be taught?**
   - Syllabus structure, national standards (e.g., Kenyan CBC), lesson learning objectives, prerequisite skills, and source text resources.
2. **How should it be taught?**
   - Active whiteboard drawing sequences, audio explanations, conceptual analogies, graded practice, interjected check questions, and targeted remediation.
3. **Who is being taught?**
   - Academic levels, accessibility settings, motivation profiles, learning history, and emotional/cognitive load tracking.
4. **What happens after teaching?**
   - Exit tickets, homework problems, performance reports for parents, teacher metrics, and diagnostic inputs to optimize the curriculum.

---

## 2. The AI Teaching Engine

The AI Teacher is not a raw Language Model responding directly to user prompts. Instead, it is orchestrated by a dedicated **Teaching Engine** that guides lesson delivery, whiteboard updates, cognitive state modeling, accessibility, and analytics.

```
                              Curriculum Ingestion
                                       │
                                       ▼
                             Lesson Planning Engine
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │   AI Teacher Mind   │
                            └──────────┬──────────┘
                                       │
                                       ▼
                         Classroom Intelligence Engine
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
   Intelligent Canvas        Human Teaching Voice        Question Engine
(whiteboard sketches, text) (multilingual TTS/Piper)  (interactive checkpoints)
             │                         │                         │
             └─────────────────────────┼─────────────────────────┘
                                       ▼
                           Learner Interaction Layer
                                       │
                                       ▼
                         Assessment & Adaptation Engine
                                       │
                                       ▼
                           Learning Analytics Engine
```

### 2.1 Intelligent Teaching Canvas
The whiteboard is not a pre-drawn slide or linear animation; it is **where the teacher thinks**. The engine constructs ideas dynamically exactly like a human teacher:
*   Writes, erases, underlines, circles, highlights, and sketches diagrams.
*   Draws equations, resolves calculations, constructs coordinate graphs, and annotates uploaded textbook images.
*   Paces all drawings so every stroke is synchronized letter-by-letter with speech.

### 2.2 Human Teaching Voice
Speech is generated conversationally rather than as flat narration:
*   Pace changes dynamically based on the student's age, content complexity, and cognitive load.
*   Pauses, repeats, stresses key vocabulary, and changes tone to express encouragement, warning, or excitement.
*   Uses voice-cloning capabilities or local high-performance TTS servers (**Kokoro / Piper**) to ensure smooth pronunciation.

### 2.3 Classroom Intelligence Engine
Continuous monitoring of student comprehension and engagement. The engine guides the flow by asking:
*   *Did the learner understand this step?*
*   *Should I slow down or offer another alternate explanation?*
*   *Is it time to show a visual diagram instead of writing equations?*
*   *Should I interject with a prerequisite checkpoint check?*

---

## 3. The 16-Step Pedagogical Lesson Flow

Every lesson, for every subject and age group, follows a structured pedagogical pipeline:

```
Welcome ➔ Hook ➔ Learning Objectives ➔ Activate Prior Knowledge ➔ Explain Concept ➔
Guided Example ➔ Check Understanding ➔ Clarify Misconceptions ➔ Second Example ➔
Practice Together ➔ Independent Practice ➔ Question Session ➔ Summary ➔ Exit Ticket ➔
Homework ➔ Reflection
```

| Step | Phase | Pedagogical Purpose |
| :--- | :--- | :--- |
| **1. Welcome** | Introduction | Establish classroom context and greet the learner. |
| **2. Hook** | Engagement | Create interest with a practical scenario, real-world context, or puzzle. |
| **3. Learning Objectives** | Goal Setting | Present clear goals and student success criteria. |
| **4. Activate Prior Knowledge** | Retrieval | Review background concepts or perform a prerequisite skills check. |
| **5. Explain Concept** | Direct Instruction | Break down the core idea slowly on the whiteboard. |
| **6. Guided Example** | Modeling | Step-through a worked problem on the canvas with detailed steps. |
| **7. Check Understanding** | Formative Assessment | Interject with a mid-lesson question to diagnose immediate retention. |
| **8. Clarify Misconceptions** | Remediation | Address common errors or alternate paths if the check failed. |
| **9. Second Example** | Deepening | Show a variation of the worked example to demonstrate transfer. |
| **10. Practice Together** | Collaborative Practice | Solve a problem interactively, guiding the learner through choices. |
| **11. Independent Practice** | Student Work | Graded practice (beginner, intermediate, advanced) completed by the learner. |
| **12. Question Session** | Dialogue | A 5-minute checkpoint for students to raise hands or ask custom questions. |
| **13. Summary** | Consolidation | Highlight key takeaways, formulas, and common mistakes on the board. |
| **14. Exit Ticket** | Final Check | A mandatory final problem to evaluate performance before departure. |
| **15. Homework** | Extension | Assign structured follow-up tasks linked to their mastery level. |
| **16. Reflection** | Metacognition | Prompt the student to score their confidence and list remaining concerns. |

---

## 4. Learner Model & Teacher Mind

### 4.1 The Learner Model
To achieve personalization, the platform tracks a comprehensive multi-dimensional profile:
*   **Academic Profile**: Current grade, reading level, and subject mastery levels.
*   **Cognitive State**: Attention indicators, emotional state (confident, curious, confused, frustrated), and cognitive load.
*   **Learning Preferences**: Spoken speech rate, visual density, and accessibility configurations.
*   **Performance Graph**: Weak/strong concepts, mistake history, and session duration patterns.

### 4.2 The AI Teacher Mind
The orchestration layer runs a continuous pedagogical reasoning loop before, during, and after a lesson:

```
    ┌────────────────────────────────────────────────────────┐
    │ 1. BEFORE TEACHING (Planning Phase)                    │
    │   • Analyze prerequisite needs                         │
    │   • Identify typical student mistakes                  │
    │   • Prepare conceptual analogies and board visuals     │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │ 2. DURING TEACHING (Interactive Phase)                 │
    │   • Is the student paying attention?                   │
    │   • Did they answer correctly or hesitate?             │
    │   • Should I repeat the rule, slow down, or remediate? │
    └───────────────────────────┬────────────────────────────┘
                                │
                                ▼
    ┌────────────────────────────────────────────────────────┐
    │ 3. AFTER TEACHING (Evaluation Phase)                   │
    │   • Did the learner meet the objectives?               │
    │   • What weak topics should go into homework?          │
    │   • Should tomorrow's class start with a review?       │
    └────────────────────────────────────────────────────────┘
```

---

## 5. Ambient Accessibility

Accessibility is **invisible** in Klassruum. The user should never feel like they have entered a "special mode." Instead, the layout and speech engine automatically adapt:
*   **Captions**: Auto-generated and styled dynamically based on screen real estate.
*   **Font Scaling & Sizing**: Automatically adapts sizes to readability profiles.
*   **Speech Controls**: Speech rate adapts from 0.7x to 1.5x based on comprehension.
*   **Reduced Motion**: Autoscrolls and board drawing animations simplify under heavy cognitive load.
*   **Keyboard Navigation**: Full keyboard control hooks expand automatically for physical challenges.

---

## 6. Content Pipeline

Klassruum features an end-to-end curriculum compiler:

```
Institution Uploads Curriculum
              │
              ▼
AI Extracts Text & Figures (OCR / PDF Parser)
              │
              ▼
AI Maps Syllabus Outcomes & Identifies Units
              │
              ▼
Lesson Planning Engine Creates 16-Step Lessons
              │
              ▼
Generates Whiteboard Plans, TTS Scripts, Assessments, & Worksheets
              │
              ▼
Teacher/Institution Approves & Publishes to Classroom
```

---

## 7. Classroom Delivery Modes

1. **AI Teacher Classroom**: Fully autonomous sessions led by the AI teacher with dynamic speech and canvas drawing.
2. **Human Teacher Classroom**: Instructor-led session where the teacher controls the canvas, aided by automatic AI captioning and real-time student sentiment tracking.
3. **Hybrid Classroom**: Shared duties. The AI teacher handles standard concept explanations and guided practice, while the human teacher steps in for 1:1 tutoring.
4. **Self-Paced Classroom**: On-demand AI lesson delivery where students progress through the 16 steps at their own speed.

---

## 8. Roadmap & Capability Milestones

### Phase 2 (Implementation RAMP-UP)
*   Fully automated curriculum ingestion.
*   Dynamic 16-step lesson generation.
*   Structured AI Teacher Mind loops.
*   Multi-subject coverage with comprehensive learner profiles.

### Phase 3 (Scale & Integration)
*   Offline classroom local sync support.
*   Multilingual teaching and voice cloning for schools.
*   Collaborative peer activities.
*   Klassruum SDK for third-party embedding.
