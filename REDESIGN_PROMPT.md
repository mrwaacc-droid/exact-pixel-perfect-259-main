# Klassruum Platform — Master Redesign Prompt

> **Use this as the master redesign prompt for Codex, Claude, Lovable, or another AI coding agent.**
>
> This document is a clean, consolidated specification. Implement against the
> existing codebase (TanStack Start + React 19 + TypeScript + Tailwind CSS v4 +
> shadcn/ui). Preserve all routes, runtime logic, and backend integrations.

---

## 0. Objective

Redesign the entire Klassruum platform visually and in UX, with one exception:
the **classroom** is **refined, not replaced**.

### Scope of full redesign

- Public website (landing + all marketing/legal pages)
- Authentication pages
- Learner dashboards
- Teacher dashboards
- Institution dashboards
- Platform admin dashboards
- Parent dashboards
- Course pages
- Programme pages
- Lesson lists
- Resources
- Notes
- Transcripts
- Progress
- Assignments
- Settings
- Notifications
- Support pages

### Scope of classroom refinement only

- Reduce button sizes
- Reduce excessive font sizes
- Improve spacing
- Improve visual hierarchy
- Improve clarity
- Apply the new color system
- Improve teacher image/video presentation
- Sharpen captions
- Clean the whiteboard frame
- Simplify control groups
- Improve accessibility
- Improve responsive behavior

### Do NOT touch in the classroom

- Structure, routes, runtime logic, teaching workflow
- AI teacher behavior, whiteboard, captions
- Notes, transcript, progress, lesson controls

---

## 1. Product Identity

Klassruum is an AI-powered virtual classroom platform for institutions.

It turns institution-approved content into structured lessons delivered through:
an AI teacher, a learning whiteboard, captions, learner questions, notes,
transcripts, progress, accessible learning modes, and live/hybrid teaching.

**Narrative to communicate:**

Institution content → structured lessons → AI teacher delivery → learner
engagement → learning evidence

**The result must feel:**

premium, editorial, warm, professional, human, calm, institution-ready,
accessible, modern, highly polished, and recognizably Klassruum.

**The result must NOT feel like:**

- a generic SaaS template
- a chatbot company
- a normal LMS
- a Zoom clone
- a card-heavy dashboard
- a childish school platform
- a copied education website

---

## 2. Design Direction

Create a strong original visual identity using:

- warm editorial layouts
- real learner and teacher photography
- professional AI teacher portraits inside product interfaces
- clean flat editorial illustrations
- hand-drawn line illustrations
- large product scenes
- asymmetrical compositions
- irregular but refined card shapes
- subtle curved sections
- overlapping visual layers
- soft shadows
- clean borders
- smooth visual rhythm
- restrained motion
- strong whitespace

**Do not copy** another company's layout, artwork, illustrations, wording,
source code, icons, screenshots, animations, or visual identity. Implement an
original Klassruum design.

---

## 3. Color System

Replace the current blue-heavy identity with this warm editorial palette.

### Primary

| Token | Hex | Use |
| --- | --- | --- |
| Primary Crimson | `#B22234` | primary actions, active states, progress highlights, teacher speaking state, selected tabs |
| Primary Dark | `#8B0000` | dark premium sections, hover states |
| Primary Hover | `#991B2F` | hover on crimson |
| Primary Soft | `#FCE8EB` | soft crimson backgrounds |

### Warm neutrals

| Token | Hex | Use |
| --- | --- | --- |
| Warm Beige | `#D9C6B2` | large background shapes, editorial sections, illustration backgrounds |
| Soft Beige | `#F4ECE4` | secondary panels, image frames |
| Burnt Brown | `#A0522D` | supporting accent only — illustration accents, secondary buttons, warm callouts |

### Light neutrals

| Token | Hex | Use |
| --- | --- | --- |
| Page Background | `#FBF8F5` | page background |
| Surface | `#FFFFFF` | cards, surfaces |
| Border | `#E7DAD1` | borders |
| Muted Surface | `#F2E8E1` | muted surfaces |

### Dark neutrals

| Token | Hex | Use |
| --- | --- | --- |
| Deep Ink | `#221B1C` | headings, primary text, dark sections |
| Text Primary | `#2C2224` | body text |
| Text Secondary | `#6F5C60` | secondary text |
| Muted Text | `#8A7478` | muted text |

### Support colors (restrained, not red)

| Token | Hex | Use |
| --- | --- | --- |
| Success | `#2F7D5A` | success states |
| Warning | `#C97922` | warnings |
| Information | `#536FA8` | informational |
| Error | `#B4232D` | destructive actions, errors |

### Color rules

- White and warm off-white dominate.
- Deep ink for headings and body text.
- Crimson for primary actions and active states only.
- Beige for large background shapes and editorial sections.
- Deep red for dark premium sections.
- Burnt brown is a supporting accent only.
- Do **not** make the entire interface red.
- Preserve green for success, amber for warnings.
- Preserve clear contrast for accessibility.

### Usage ratio

- 55% white and warm off-white
- 20% deep ink and dark surfaces
- 12% crimson
- 8% beige
- 5% supporting colors

### Section-specific color guidance

| Section | Background | Notes |
| --- | --- | --- |
| Header | `#FFFFFF` | text `#221B1C`, border `#E7DAD1`, CTA `#B22234` |
| Hero | `#FBF8F5` | large curved shape `#D9C6B2`, accent `#A0522D` |
| Dark feature (AI Teacher Intelligence) | `#8B0000` | text `#FFFFFF`, secondary `#F4DADD`, cards `#991B2F` |
| Classroom mockup section | `#F4ECE4` | product frame `#FFFFFF`, caption bar `#221B1C`, progress `#B22234` |
| Accessibility section | `#FFFFFF` | image frames `#F4ECE4`, labels `#B22234`, line art `#A0522D` |
| Institution section | `#221B1C` | dashboard surface `#FFFFFF`, accent `#B22234`, secondary `#D9C6B2` |

> The actual classroom interface should remain mostly white for readability.
> Do not make the active classroom heavily red.

### Tailwind config

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        klassruum: {
          crimson: "#B22234",
          "crimson-dark": "#8B0000",
          "crimson-hover": "#991B2F",
          "crimson-soft": "#FCE8EB",
          beige: "#D9C6B2",
          "beige-soft": "#F4ECE4",
          brown: "#A0522D",
          background: "#FBF8F5",
          surface: "#FFFFFF",
          border: "#E7DAD1",
          ink: "#221B1C",
          text: "#2C2224",
          secondary: "#6F5C60",
          muted: "#8A7478",
          success: "#2F7D5A",
          warning: "#C97922",
          info: "#536FA8",
          error: "#B4232D",
        },
      },
    },
  },
};
```

### CSS variables

```css
:root {
  --kr-primary: #b22234;
  --kr-primary-dark: #8b0000;
  --kr-primary-hover: #991b2f;
  --kr-primary-soft: #fce8eb;
  --kr-beige: #d9c6b2;
  --kr-beige-soft: #f4ece4;
  --kr-brown: #a0522d;
  --kr-background: #fbf8f5;
  --kr-surface: #ffffff;
  --kr-border: #e7dad1;
  --kr-ink: #221b1c;
  --kr-text: #2c2224;
  --kr-text-secondary: #6f5c60;
  --kr-muted: #8a7478;
  --kr-success: #2f7d5a;
  --kr-warning: #c97922;
  --kr-info: #536fa8;
  --kr-error: #b4232d;
}
```

---

## 4. Typography

Use **Inter** (or a comparable clean professional typeface). Compact and refined.
Smaller and cleaner than the current product.

### Desktop scale

| Element | Size |
| --- | --- |
| Hero headline | 56–68px |
| Major section heading | 38–48px |
| Page title | 28–36px |
| Dashboard heading | 24–30px |
| Card title | 16–18px |
| Body copy | 15–17px |
| UI labels | 12–14px |
| Buttons | 13–14px |
| Table text | 13–14px |
| Captions | 13–15px |

### Rules

- Short line lengths, strong line-height, clear heading hierarchy.
- Compact metadata, readable labels.
- Avoid oversized dashboard headings, large padded buttons, long paragraphs,
  inconsistent font weights, and excessive bold text.

---

## 5. Button System

Smaller, more precise, more professional.

### Sizes (desktop)

| Size | Height |
| --- | --- |
| Small | 30–34px |
| Medium | 36–40px |
| Large CTA | 42–46px |

### Rules

- Rounded 10–12px corners.
- Reduce excessive horizontal padding.
- Concise labels; icons only when useful.
- No giant pill buttons everywhere.
- Primary → crimson. Secondary → white with border. Tertiary → text-only.
  Destructive → error red.
- Focus states must be clearly visible.

### Avoid

- Huge buttons, excessive pill shapes, heavy shadows, multiple competing
  primary buttons in one section.

---

## 6. Signature Klassruum Components

Build these reusable signature components to make the product feel original.

1. **TeacherPresenceFrame** — teacher image/video frame with name, AI Teacher
   label, current state, subtle speaking waveform, caption preview, subject,
   clean status badge.
2. **LearningWhiteboardPreview** — warm paper-like surface with current goal,
   board heading, teaching item, handwritten accent marks, progress label.
3. **CaptionRibbon** — deep ink or dark crimson caption bar with speaker name,
   spoken text, language, playback speed.
4. **LessonJourney** — curved visual path:
   Welcome → Concept → Example → Practice → Reflection.
5. **TeachingMomentCard** — teacher action, board action, learner response,
   next decision.
6. **LearningEvidenceTile** — question asked, explanation adapted, example
   replayed, concept completed.
7. **RoleEntryCard** — image-led card for learner, teacher, institution, family.
8. **ProductScene** — large UI composition with screenshots, callouts,
   illustrations, and real people.
9. **FloatingFeatureCallout** — small refined labels around product scenes.
10. **ClassroomModeCard** — for AI Teacher, Human Live, Hybrid.
11. **EditorialImageCard** — image card with an irregular refined silhouette.
12. **OrganicSectionFrame** — section container with subtle asymmetric curves or
    softened geometric corners.

---

## 7. Irregular and Signature Card Shapes

Use clean irregular shapes **carefully**.

### Examples

- asymmetric rounded corners
- one oversized curved corner
- soft arch-top image cards
- offset border layers
- clipped editorial image frames
- rounded rectangle with one sloped edge
- overlapping circular or capsule accents
- curved section separators

### Rules

Shapes must blend with the website, feel refined, remain responsive, never
reduce readability, and not look childish or random.

### Use irregular shapes for

- hero media
- role cards
- image sections
- illustration frames
- featured product scenes
- final CTA

### Do NOT use irregular shapes for

- data tables
- forms
- settings panels
- important accessibility controls
- classroom controls

Functional product areas must remain clean and stable.

---

## 8. Image and Media System

The landing page must include **at least 6 high-quality images or media assets**.

### Minimum media set

1. Hero learner image or video — a focused learner using a laptop.
2. Teacher preparation image — a teacher preparing digital lesson materials.
3. Institution administrator image — an administrator reviewing a dashboard.
4. Accessibility image — a learner following captions or using assistive tech.
5. Family image — a parent and learner reviewing progress.
6. Education team image — a small education team discussing digital learning.

Also include: AI teacher portrait inside product mockups, classroom UI
screenshot, clean editorial illustrations, optional short video loops.

### Image rules

- authentic education photography
- African and international representation
- natural expressions, soft daylight, real environments
- no exaggerated posing, no visible third-party logos, no fake endorsements
- no childish graphics, no unrealistic holograms

### Landing page media balance

- 40% real people
- 35% product UI
- 25% clean illustration

---

## 9. Illustration System

Use two original illustration families.

### Primary (70%): Clean flat editorial vector illustration

- simplified human figures
- geometric shapes, rounded forms
- minimal shading, soft depth
- mature educational tone, warm palette
- clean composition

### Secondary (30%): Hand-drawn editorial line illustration

- expressive deep ink (`#221B1C`) linework
- small crimson (`#B22234`) or beige (`#D9C6B2`) accent fills
- controlled sketch quality
- arrows, lesson paths, board marks, thought flows, section transitions

### Create original illustrations for

- learner using an AI classroom
- AI teacher delivering a lesson
- course materials becoming a lesson
- teacher reasoning process
- lesson journey
- accessibility modes
- AI, live, and hybrid classrooms
- institution hierarchy
- learning evidence
- family progress
- assignment workflow
- course community

### Do NOT use

- robots, glowing AI brains, anime, mascots, childish cartoons, copied stock
  illustrations, complex futuristic graphics.

### Illustration color system

**Flat vector:**

- Skin tones: natural and varied
- Clothing: `#B22234`, `#8B0000`, `#A0522D`, `#D9C6B2`, `#FFFFFF`, `#221B1C`
- Background shapes: `#F4ECE4`, `#D9C6B2`, `#FCE8EB`
- Lines/details: `#221B1C`, `#6F5C60`

**Hand-drawn:**

- Line color: `#221B1C`
- Accent fill: `#B22234`
- Secondary fill: `#D9C6B2`
- Background: `#FFFFFF` or `#FBF8F5`
- Use only one or two accent fills; do not fully color every doodle.

### Illustration prompt references

> **Flat vector learner:** Clean editorial flat vector illustration of an
> African learner seated at a modern desk using a laptop during an online
> lesson. Include notebook, pen, caption panel, small progress indicator.
> Simplified geometric shapes, natural proportions, soft rounded forms, minimal
> shading. Palette: `#B22234`, `#8B0000`, `#D9C6B2`, `#A0522D`, `#FFFFFF`,
> `#221B1C`. Warm off-white background. Mature, institution-ready.

> **AI teacher:** Clean flat editorial vector illustration of an AI teacher
> delivering a lesson through a virtual classroom. Professional African teacher
> inside a video-style frame, with whiteboard, caption ribbon, learner question
> bubble, progress indicator. Calm, intelligent, supportive. No robot, no
> glowing brain, no hologram.

> **Materials-to-lesson:** Clean 2.5D editorial vector illustration showing
> institution course materials transforming into a structured AI-teacher lesson.
> Left: documents, syllabus, slides, images. Centre: structured lesson blocks
> (objective, concept, worked example, practice, checkpoint, summary). Right:
> AI teacher frame, whiteboard, captions, progress. Connect with one smooth
> curved path.

> **Hand-drawn teacher mind:** Hand-drawn editorial line illustration. Teacher
> in centre surrounded by hand-drawn elements: lesson plan, course material,
> learner question, accessibility mode, whiteboard, next teaching action.
> Expressive black line work, loose but controlled. Line `#221B1C`, accent
> `#B22234`, secondary `#D9C6B2`.

> **Learning journey:** Hand-drawn editorial illustration of a lesson journey:
> Welcome → Concept → Example → Practice → Question → Summary. Curved path with
> small human characters and learning objects. Black line work with selective
> crimson and beige accents.

---

## 10. Landing Page Redesign

Use this section order.

### 10.1 Header

Sticky white header with warm border. Items: Klassruum logo, Product,
Classroom, Solutions, Accessibility, Institutions, Resources, Sign in,
Request demo. Product and Solutions may use large editorial dropdowns.

### 10.2 Hero

- **Left:** category label, strong headline, short paragraph, two compact CTAs,
  three trust points.
  - Suggested headline: **AI teachers that deliver real classroom lessons.**
- **Right:** real learner image or muted video, floating classroom UI overlay,
  AI teacher frame, whiteboard, captions, progress, callouts. Use an organic
  large media shape.

### 10.3 Role Entry

Four large image-led cards: Learners, Teachers, Institutions, Families. Vary
image crops and accent shapes — do not make them identical.

### 10.4 Content-to-Classroom

Visual transformation: Course Materials → Structured Lessons → AI Teacher
Delivery → Learning Evidence. Use illustration and large connected visual
objects, not four small cards.

### 10.5 Classroom Experience

One oversized classroom mockup. Callouts: AI teacher presence, live
whiteboard, captions, questions, notes, transcript, progress. This should be
the strongest product scene.

### 10.6 AI Teacher Intelligence

Deep red or deep ink background. Show: learner question, current lesson
context, teacher decision, answer, lesson resume. Use a clean teacher-mind
illustration.

### 10.7 Before, During, After

Three large editorial scenes: prepare, teach, review. No generic icon cards.

### 10.8 Teaching Modes

AI Teacher, Human Live, Hybrid. Same classroom shell with different teaching
presence.

### 10.9 Accessibility

Collage of real images: captions, assistive technology, keyboard navigation,
focus mode. Explain how the classroom changes behavior.

### 10.10 Institution Operations

Dark premium section. Show: institution dashboard, programmes, courses,
teachers, learners, lesson generation, active classrooms, progress.

### 10.11 Course Community

Announcements, lessons, assignments, resources, questions, activity, progress.
Use a product timeline with human imagery.

### 10.12 Family View

Learner progress, upcoming sessions, assignments, feedback, weekly summary.
Use a real parent/learner image.

### 10.13 Learning Evidence

Timeline: Question asked → Explanation adapted → Example replayed → Practice
completed → Concept reviewed.

### 10.14 Trust and Privacy

Institution-controlled materials, role-based access, private learner records,
AI data boundaries. Do not invent certifications.

### 10.15 Testimonials

Real or clearly marked placeholder testimonial layouts only.

### 10.16 Final CTA

Strong crimson or deep red composition. Heading: **Bring your institution's
content to life.** Buttons: Build a Classroom, Request a Demonstration.

---

## 11. Public Website Pages

Redesign in the same visual system:

- About
- Features
- How It Works
- Pricing
- Demo
- Classroom Demo
- AI Teacher Demo
- Institution Demo
- Contact
- Help
- Accessibility
- Privacy
- Terms

Each page should have a unique hero composition, relevant photography or
illustration, large product visuals, and avoid repeated generic cards.

---

## 12. Authentication Pages

Redesign: Login, Sign up, Forgot password, Reset password, Verify email,
Complete profile, Select role, Institution registration, Registration success.

### Split layout

- **Left:** real learner/teacher/institution image, soft crimson/beige overlay,
  short product message, one small product illustration.
- **Right:** compact clean form, smaller input heights, clear labels, strong
  validation, restrained shadows.

### Form sizing

- Inputs: 40–44px height
- Buttons: 40–44px height
- Labels: 13–14px
- Compact vertical spacing

Forms must not feel oversized.

---

## 13. Shared Dashboard System

Redesign all dashboards with a shared visual system.

### Components to create

- DashboardShell
- Sidebar
- TopBar
- PageHeader
- CompactStatCard
- FeaturedActionPanel
- ActivityFeed
- CourseCard
- LessonCard
- SessionCard
- ProgressCard
- DataTable
- FilterBar
- EmptyState
- LoadingState
- ErrorState
- RealtimeStatus
- NotificationPanel
- SettingsPanel

### Dashboard style

- warm off-white page background
- white surfaces, deep ink text
- crimson active states, beige secondary panels
- subtle borders, minimal shadows
- compact spacing, smaller buttons, smaller typography
- stronger information hierarchy

Do not make every item a floating card. Use grouped sections, tables,
timelines, lists, compact panels, feature scenes, and one or two strong
highlighted actions per page.

---

## 14. Student Dashboard

### Pages

Dashboard, My Classrooms, My Courses, Course Details, Lesson Lists, Lesson
Details, Notes, Note Details, Quizzes, Resources, Calendar, Learning Access,
Progress, Notifications, Search, Sessions, Replay, Summary, Settings, Profile.

### Priorities

1. **Continue Learning** — large featured panel: lesson title, AI teacher,
   progress, last completed step, continue button.
2. **Today's Learning** — compact schedule and recommended tasks.
3. **My Courses** — image-led course cards.
4. **Recent Sessions** — timeline or compact list.
5. **Notes and Transcript** — quick access panel.
6. **Learning Access** — current accessibility mode.
7. **Progress** — supportive, non-judgmental visual language.

Use smaller buttons and minimal clutter.

---

## 15. Teacher Dashboard

### Pages

Dashboard, Courses, Course Details, Analytics, Students, Lessons, Lesson
Editor, Resources, Sessions, Messages, Settings.

### Priorities

- assigned courses
- lessons awaiting review
- generation jobs
- learner questions
- active learners
- progress alerts
- upcoming sessions
- recent materials
- quick lesson actions

Use a strong **Featured Teaching Action** panel. Avoid oversized analytics
cards. Use compact data visualizations and clear actions.

---

## 16. Institution Dashboard

### Pages

Dashboard, Activity, Analytics, Billing, Classrooms, Programmes, Courses,
Course Details, Materials, Lesson Generation, Enrollments, Resources, Sessions,
Students, Teachers, Invitations, Settings.

### Priorities

- active classrooms
- online learners
- teachers online
- programmes, courses
- generation jobs
- pending reviews
- learner progress
- recent activity
- quick actions

Use a clean hierarchy view:
Institution → Programme → Course → Lesson → Classroom.

Use deep ink, crimson, beige, and muted support colors.

---

## 17. Platform Admin Dashboard

### Pages

Platform Dashboard, Users, User Details, Institutions, Institution Details,
KingPin Courses, Programmes, Courses, Lessons, Materials, Lesson Generation,
AI Settings, Realtime, Usage, Support, Health, Activity, Audit Logs, Settings.

### Style

Operational, stable, serious, highly structured. Use compact tables, status
ribbons, system health panels, realtime activity stream, clear filters, strong
audit layout. No playful illustration inside operational admin areas.

---

## 18. Parent Dashboard

### Pages

Dashboard, Learners, Progress, Sessions, Reports, Messages, Settings.

### Priorities

- learner selector
- current courses
- lesson completion
- upcoming sessions
- assignments
- teacher feedback
- weekly summary
- messages

Use supportive language. Avoid surveillance-style terminology.

---

## 19. Course and Lesson Pages

### Course pages include

- course hero
- AI teacher
- current progress
- next lesson
- lessons list
- resources
- notes
- transcript
- assignments
- activity

### Course cards include

- subject image or illustration
- title
- institution
- AI teacher
- progress
- next action
- duration

Lesson lists should use compact rows or timeline cards. Avoid oversized card
grids.

---

## 20. Forms, Tables, and Settings

### Forms

Compact, clear labels, strong field grouping, helpful descriptions, inline
validation, no huge inputs, no unnecessary modals.

### Tables

Warm white surface, compact rows, sticky header where useful, clear filters,
responsive mobile behavior, row actions in clean menus, no excessive border
lines.

### Settings

Grouped categories, left category navigation, right content panel, smaller
toggles, clear save states, autosave where appropriate.

---

## 21. Classroom Refinement Only

**Do not completely redesign the classroom.**

### Preserve

- top bar, AI teacher panel, whiteboard, current goal, captions
- inline engagement, notes, transcript, progress, bottom controls
- classroom routes, state logic, AI teacher runtime, lesson flow

### Refine

| Area | Refinements |
| --- | --- |
| Top bar | reduce height, badge sizes, button sizes; improve spacing; apply warm palette; keep lesson context readable |
| AI teacher panel | improve portrait/video placeholder; reduce status clutter and badge count; clearer current state; cleaner waveform; better responsive collapse |
| Whiteboard | preserve dominance; improve border/background; warm paper surface; improve text clarity; simplify header controls; reduce toolbar size |
| Captions | deep ink or deep crimson; improve speaker hierarchy and readability; keep permanently visible |
| Inline engagement | reduce height; smaller buttons; reduce visual noise; preserve accessibility |
| Bottom controls | reduce height, icon sizes, label size; clearer groups; remove duplicated actions; preserve keyboard navigation |
| Right drawer | reduce visual density; improve tabs; simplify note cards; warm neutral colors |
| Accessibility | preserve captions, keyboard controls, screen-reader labels, reduced motion, no-audio-only instruction |

---

## 22. Responsive Design

Must work at: large desktop, standard desktop, tablet landscape, tablet
portrait, mobile.

### Desktop

Asymmetrical composition, overlapping scenes, large visuals.

### Tablet

Reduce overlap, stack intelligently, preserve hierarchy, avoid tiny text.

### Mobile

Single-column structure, compact header, horizontal media carousels where
useful, sticky bottom actions only when necessary, no hidden essential content,
no overflow, no tiny controls, captions remain readable, proper image crops,
cards lose complex shapes when needed for clarity.

---

## 23. Scrolling Effects and Animations

Smooth, restrained animations.

### Use

- soft fade-up
- subtle scale-in
- slow parallax on large background shapes
- product callout reveal
- image mask reveal
- gentle number transitions
- smooth accordion open/close
- sticky section storytelling
- progressive product scene reveal
- soft hover elevation
- responsive button feedback
- smooth tab transitions
- animated teacher waveform
- subtle progress animations

### Do NOT use

- aggressive parallax
- constant floating animations
- large bounce effects
- flashy gradients
- long animation delays
- motion that blocks reading

### Respect

- `prefers-reduced-motion`
- keyboard navigation
- touch devices

### Durations

| Type | Duration |
| --- | --- |
| Hover | 120–180ms |
| Component transition | 180–260ms |
| Section reveal | 350–600ms |
| Major scene transition | 500–800ms |

### Easing

- `ease-out`
- `cubic-bezier(0.22, 1, 0.36, 1)`

---

## 24. Interaction Quality

Every interactive element must feel reactive.

### Implement

- immediate hover state
- clear pressed state
- clear loading state
- success confirmation
- error feedback
- disabled state
- visible focus ring
- skeleton loading
- optimistic updates where safe
- smooth drawer behavior
- clean dropdown behavior
- responsive tabs
- real-time status indicators

### Avoid

- delayed button response
- silent failures
- layout jumping
- unclear save state
- repeated toast notifications
- excessive popup use

---

## 25. Accessibility

All pages must support:

- semantic HTML
- keyboard navigation
- visible focus states
- strong contrast
- screen-reader labels
- reduced motion
- large enough touch targets
- no color-only meaning
- proper form labels
- accessible drawers and menus
- meaningful image alt text
- captions for videos
- muted autoplay only
- no forced audio
- accessible error messages

---

## 26. Image Performance

- AVIF first, WebP fallback
- responsive `srcSet`
- `width` and `height` attributes
- lazy loading below the fold
- poster images for videos
- WebM and MP4 fallback
- preload only hero media

### Targets

- normal images under 250KB
- hero image under 400KB
- video loops approximately 1–4MB
- no autoplay audio

---

## 27. Code Quality

### Use

- React, TypeScript, Tailwind CSS
- reusable components with clear boundaries
- route preservation
- strong typing
- no duplicated UI logic
- design tokens
- shared animation utilities
- shared spacing scale
- shared button system
- shared form system
- shared dashboard shell
- shared media components

### Do NOT

- rewrite working backend logic unnecessarily
- break current routes
- remove existing functionality
- replace real data with permanent mock data
- hardcode large repeated structures
- create one giant page component

---

## 28. Implementation Order

1. Design tokens
2. Typography
3. Button system
4. Shared surfaces and cards
5. Signature Klassruum components
6. Global header and footer
7. Landing page
8. Public website pages
9. Authentication pages
10. Shared dashboard shell
11. Student dashboard
12. Teacher dashboard
13. Institution dashboard
14. Platform admin dashboard
15. Parent dashboard
16. Course and lesson pages
17. Forms and tables
18. Settings pages
19. Classroom refinement
20. Responsive refinement
21. Animations
22. Accessibility audit
23. Performance audit
24. Final consistency review

---

## 29. Acceptance Criteria

The redesign is **not complete** unless:

- the landing page contains at least 6 high-quality images or media assets
- the AI teacher is visually central
- the site no longer looks like a generic SaaS template
- buttons are smaller and more refined
- typography is smaller and cleaner
- card shapes feel original but remain usable
- the new warm color palette is applied consistently
- illustrations follow one unified style
- dashboard layouts feel compact and professional
- pages use varied compositions
- the classroom is refined, not replaced
- responsive behavior works on desktop, tablet, and mobile
- animations are smooth and restrained
- accessibility is preserved
- routes and product functionality remain intact
- the final result feels premium, calm, human, and institution-ready

---

## 30. Final Correction Pass

After the first implementation pass, run this correction prompt:

> Review the entire Klassruum redesign against the approved specification. Do
> not create a new design direction. Correct every area where the
> implementation still feels generic, oversized, card-heavy, visually
> inconsistent, poorly spaced, weakly branded, unresponsive, inaccessible,
> overly red, or too similar across sections.
>
> Confirm that:
> - the landing page uses at least 6 meaningful images
> - illustrations share one consistent style
> - buttons and fonts are compact
> - irregular card shapes are refined, not decorative clutter
> - public pages share the new identity
> - all dashboards share one compact system
> - the classroom was refined without changing its core structure
> - responsive layouts work properly
> - animations respect reduced motion
> - the final result is recognizably Klassruum
>
> Return corrected production-ready code only.

---

## 31. Illustration Style Reference

### Primary: Flat editorial vector illustration

Also known as: modern web illustration, editorial vector illustration, 2D
character illustration, flat design illustration, SaaS landing-page
illustration.

Characteristics: simplified human characters, solid color shapes, little or no
texture, soft rounded forms, minimal shading, clean geometric composition,
floating interface elements, friendly but professional tone.

Suitable for: how Klassruum works, course materials to lesson, learner
experience, family view, institution workflows, accessibility modes.

### Secondary: Hand-drawn editorial line illustration

Also known as: doodle illustration, monoline illustration, sketch-style web
illustration, black-and-white editorial illustration, hand-drawn SaaS
illustration.

Characteristics: black line work, minimal or no color, expressive human poses,
playful irregular shapes, very simple backgrounds, strong personality without
looking childish.

Suitable for: hero support illustration, AI teacher intelligence, learning
journey, before/during/after, lesson generation, questions and answers,
accessibility explanation, arrows, lesson paths, teaching notes, whiteboard
marks, small characters, section transitions, decorative details.

### Final direction

- **70%** clean flat vector illustrations (large sections)
- **30%** black line doodle illustrations (supporting details)

---

_End of master redesign prompt._