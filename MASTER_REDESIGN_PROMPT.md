# Master Redesign Prompt: Klassruum Platform Full Redesign & Refinement

> **Role**: Master AI Coding Agent / Frontend Architect / UX Specialist
>
> **Task**: Perform a complete visual, layout, and UX redesign of the Klassruum platform (public website, authentication pages, dashboards, course pages, etc.) and apply surgical refinements to the classroom interface. Maintain all backend functionality, state logic, and routing intact.

---

## 1. OBJECTIVE & SCOPE

Redesign the entire Klassruum platform to establish a premium, warm, editorial, and academic-grade virtual learning system.

### A. Full Visual & UX Redesign (Complete Overhaul)
- **Public Website Pages**: Landing, About, Features, How It Works, Pricing, Demo, Classroom Demo, AI Teacher Demo, Institution Demo, Contact, Help, Accessibility, Privacy, Terms.
- **Authentication Pages**: Login, Sign up, Forgot password, Reset password, Verify email, Complete profile, Select role, Institution registration, Registration success.
- **Learner & Parent Dashboards**: Continue learning panel, schedule, image-led course cards, parent views, weekly summaries, non-judgmental progress tracking.
- **Teacher & Institution Dashboards**: Materials, generation jobs, active classrooms, programme/course hierarchy (Institution → Programme → Course → Lesson → Classroom).
- **Platform Admin Dashboard**: Stable, operational, highly-structured layout with compact tables, system health panels, and real-time activity streams (no playful illustrations here).
- **Course & Lesson Pages**: Hero sections, course cards with subject images, lesson lists as compact rows/timeline cards.
- **All Shared UI**: Forms, tables, settings panels, navigation dropdowns, notifications, search, support, and resources.

### B. Classroom Refinement Only (Surgical UX & Visual Improvements)
**DO NOT replace or rewrite:** Core whiteboard canvas, streaming/teaching workflow, routes, runtime logic, AI teacher behavior, captions transcript, progress trackers, or state management.
**DO refine only:**
- **Sizing & Spacing**: Reduce top bar height, button sizes, font sizes, and excessive padding.
- **AI Teacher Panel**: Clean portrait/video frame, simplify state badges, display clean active speaking waveform.
- **Whiteboard Frame**: Clean up borders, apply a warm paper-like surface, clean header/toolbar, and improve text clarity.
- **Captions Ribbon**: Position as a permanent, high-contrast, deep ink or dark crimson ribbon with distinct speaker hierarchy.
- **Right Drawer & Spacing**: Group controls compactly, improve tabs, and utilize soft neutral tones.
- **Accessibility**: Preserve semantic HTML, keyboard focus states, screen reader descriptions, and ensure no-audio-only instructions.

---

## 2. DESIGN DIRECTION & PRODUCT IDENTITY

### A. Brand Archetype
- **Klassruum is**: Premium, editorial, warm, calm, human, institution-ready, highly polished, and recognizably unique.
- **Klassruum is NOT**: A generic SaaS template, a chatbot widget, a standard rigid LMS, a corporate Zoom clone, or a childish playground.
- **Core Narrative**: 
  $$\text{Institution Content} \longrightarrow \text{Structured Lessons} \longrightarrow \text{AI Teacher Delivery} \longrightarrow \text{Learner Engagement} \longrightarrow \text{Learning Evidence}$$

### B. Visual Language & Composition
- **Layouts**: Asymmetrical grid compositions, overlapping layers, and organic/irregular section boundaries.
- **Whitespace**: Generous whitespace, comfortable text line-heights, and compact metadata groups.
- **Visual Depth**: Flat designs accented by soft, low-blur shadows, clean thin borders (`#E7DAD1`), and subtle curved section separators.
- **Card Shapes**: Introduce "Irregular Card Shapes" (e.g., asymmetric rounded corners, offset border-shadow layers, sloped edges, and arch-top frames).
  - *Rule*: Use irregular card shapes for marketing sections, hero media, role cards, and final CTAs.
  - *Rule*: DO NOT use irregular shapes for operational surfaces like data tables, forms, settings, or classroom controls.

---

## 3. COLOR SYSTEM (WARM EDITORIAL PALETTE)

Replace all blue-dominant styling with this warm, humanistic academic palette. Ensure a clean, pristine white background (`#FFFFFF`) remains the absolute, uniform background all through the landing page. **There must be no dark backgrounds on the landing page.** All sections must flow continuously on pristine white backgrounds, and color accents are utilized strategically.

### Recommended Usage Ratio (Landing Page Specific)
- **80%**: Pristine Clean White (`#FFFFFF`) as the uniform background for all landing page sections
- **10%**: Deep Ink (`#221B1C`) for visible headings, body copy, and primary navigation text
- **6%**: Primary Crimson (`#B22234`) for primary actions, active link states, and interactive waveforms
- **3%**: Warm Beige (`#D9C6B2`, `#F4ECE4`) for subtle borders or decorative lines
- **1%**: Supporting / Status Accents

### Critical Contrast & Visibility Rules (White-on-White Prevention)
- **Top Bar Header & Navigation**: The top bar menu items and brand text must be Deep Ink (`#221B1C`) or text-secondary/crimson. They must **never** be white on white. Ensure 100% text visibility across all headers, dropdown menus, and footers.
- **Button Overlays**: Buttons placed on light backgrounds must use dark text/crimson backgrounds, and buttons placed on crimson backgrounds must use clean white text. Always ensure rigorous contrast compliance.
- **No Card Borders/Backgrounds for Avatars**: Illustrative smooth avatars must float directly on the white background without hard rectangular cards or background boxes.

### Palette Reference

| Group | Token | Hex Code | Ideal Application |
| :--- | :--- | :--- | :--- |
| **Primary** | Primary Crimson | `#B22234` | Primary actions, active states, active teacher speaking waveform. |
| | Primary Dark | `#8B0000` | Accent text, dark theme panels, critical CTAs. |
| | Primary Hover | `#991B2F` | Interactive hover states for primary elements. |
| | Primary Soft | `#FCE8EB` | Highlight backgrounds, badge backgrounds. |
| **Neutrals (Light)**| Page Background | `#FFFFFF` | Clean, pristine white all through the landing page background. |
| | Surface | `#FFFFFF` | Core cards, panels, clean whiteboard area. |
| | Soft Beige | `#F4ECE4` | Secondary dashboard panels, subtle outlines (never landing backgrounds). |
| | Warm Beige | `#D9C6B2` | Elegant hand-drawn accent lines, subtle vector guides. |
| | Border | `#E7DAD1` | Clean structural borders and grid separators. |
| **Neutrals (Dark)** | Deep Ink | `#221B1C` | Page headers, main body headings, primary text. |
| | Text Primary | `#2C2224` | Main paragraph and body copy. |
| | Text Secondary | `#6F5C60` | Secondary metadata and labels. |
| | Muted Text | `#8A7478` | Subtext, placeholders, and disabled states. |
| **Status Accents** | Success | `#2F7D5A` | Preserved for positive state indicators. |
| | Warning | `#C97922` | Alert and attention indicators. |
| | Information | `#536FA8` | Information and tooltips. |
| | Error | `#B4232D` | Error alerts, delete buttons, and warnings. |

### Tailwind CSS Color Tokens Config
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

### CSS Custom Variables
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

## 4. TYPOGRAPHY & BUTTON SYSTEM

### A. Compact & Clean Typography
Use **Inter** (or another clean professional typeface). Fonts are smaller, cleaner, and strictly structured.

- **Hero Headline**: `56–68px` (desktop)
- **Section Heading**: `38–48px`
- **Page Title / Main Heading**: `28–36px`
- **Dashboard Title**: `24–30px`
- **Card Titles**: `16–18px`
- **Body Text**: `15–17px`
- **UI Labels & Captions**: `12–14px`
- **Buttons / Tables / Metadata**: `13–14px`

*Guidelines*: Avoid excessive line length, oversized metadata, and bold text clusters. Maintain clear text contrast ratios.

### B. Smaller & More Precise Buttons
Buttons must look sharp, premium, and functional. Avoid giant pill shapes.

- **Small**: `30–34px` height
- **Medium**: `36–40px` height
- **Large / Main CTA**: `42–46px` height
- **Corner Radius**: `10–12px` rounded corners.
- **Button Themes**:
  - **Primary**: Crimson background, white text.
  - **Secondary**: White background with border.
  - **Tertiary**: Text-only, clean underline/hover shifts.
  - **Destructive**: Error red.

---

## 5. SIGNATURE VISUAL COMPONENTS

Create these 12 cohesive, highly-reusable components to build the "Klassruum signature look":

1. **TeacherPresenceFrame**
   A premium video/portrait panel containing: AI Teacher portrait, state badge (e.g., *Explaining*, *Listening*), subject label, and an animated speaking waveform.
2. **LearningWhiteboardPreview**
   A warm paper-like card highlighting: current topic, bulleted goal list, teaching focus, and elegant simulated hand-drawn board marks.
3. **CaptionRibbon**
   A deep ink or dark crimson ribbon showing: active speaker name, high-readability caption text, language, and speed indicator.
4. **LessonJourney**
   A horizontal curved path detailing the modular learning loop: `Welcome` $\rightarrow$ `Concept` $\rightarrow$ `Example` $\rightarrow$ `Practice` $\rightarrow$ `Reflection`.
5. **TeachingMomentCard**
   A clean overview showcasing: teacher's current explanation, active whiteboard visual, learner's live chat response, and next system decision.
6. **LearningEvidenceTile**
   A verification card summarizing a user's progress: learner's question asked, adapted explanation served, interactive example replayed, and concept completed.
7. **RoleEntryCard**
   An image-centric navigation card for Learners, Teachers, Institutions, and Families, utilizing irregular shape boundaries and elegant overlays.
8. **ProductScene**
   An integrated mock UI dashboard combining screenshots, live captions, teacher avatars, and overlay notes in a clean layout.
9. **FloatingFeatureCallout**
   Small, highly-refined tooltip labels indicating context around product illustrations.
10. **ClassroomModeCard**
    Mode indicators for `AI Teacher`, `Human Live`, and `Hybrid` options.
11. **EditorialImageCard**
    An image card utilizing irregular, clipped silhouettes or offset layers for an artistic look.
12. **OrganicSectionFrame**
    A container that replaces traditional flat section cuts with softened asymmetrical curves or subtle corner fillets.

---

## 6. ILLUSTRATION & AVATAR SYSTEM

Utilize highly professional, smooth, modern illustrative avatars instead of real photography. **All real human photos must be removed entirely from the landing page.** All avatars must float freely and blend directly with the clean white website background without hard borders or card outlines. No robots, glowing blue brain chips, or childish/cluttered tech mockups.

### A. LANDING PAGE MEDIA REQUIREMENTS (Minimum 6 Smooth, Clean Illustrative Avatars)
The landing page must incorporate at least **six (6) unique, high-quality, professional illustrative avatar scenes** with transparent backgrounds:
1. **Hero Learner Avatar**: A smooth, backgroundless student avatar actively engaging with a laptop.
2. **Teacher Preparation Avatar**: A professional instructor avatar curating digital notes/curriculums.
3. **Institution Admin Avatar**: An administrative manager avatar viewing educational workflows.
4. **Accessibility Focus Avatar**: A student avatar utilizing assistive technologies/captions.
5. **Family/Parent View Avatar**: A parent-learner duo avatar reviewing progressive lesson results together.
6. **Collaborative Team Avatar**: A clean group of education coordinator avatars sync-planning classes.

*Media Balance & Rules*:
- **No Real Photos**: 0% real photography on the landing page.
- **Backgroundless Floating Avatars**: All avatars must sit directly on the pure white website background, with no background containers or bounding cards.
- **Layout ratio**: **55%** Smooth Illustrative Avatars (transparent), **45%** High-Contrast Product Mockups and UI components.

### B. Dual-Family Illustration Guidelines (70/30 Mix)
- **70% Clean Flat Editorial Vector Style** (Used for main sections):
  - Simplified geometric human figures, natural varied skin tones, clothing accented in `#B22234`, `#8B0000`, and `#A0522D`. Avatars have transparent backgrounds and flow into `#FFFFFF`. No high-contrast neon gradients.
- **30% Hand-Drawn Editorial Line Style** (Used for supporting accents):
  - Precise deep ink (`#221B1C`) monoline curves, doodles, connecting arrows, lesson pathways, and whiteboard diagram overlays.

---

## 7. LANDING PAGE STRATEGY & LAYOUT SEQUENCE (HIGH-LEVEL CREATIVE REORGANIZATION)

Structure the landing page as an elegant, fluidly animated, and highly cohesive narrative. **Every single section on the landing page must utilize an absolute, pristine white background (`#FFFFFF`)** with no colored background blocks or dark backgrounds whatsoever. All sections must flow seamlessly with smooth animated scrolling and immediate responsive reactive responses.

### A. Layout Structure & Section Order

1. **Top Bar Header (Prism-White Navigation)**
   - Sticky white background with a clean border outline.
   - Menu text/links must use deep, visible **Deep Ink (`#221B1C`)** text, switching to **Crimson (`#B22234`)** when active. 
   - *CRITICAL*: Absolutely no white-on-white text. All menu links must have strong, verified visual visibility.

2. **Hero: Premium Creative Interactive Workspace**
   - Double-column with a pure white background and smooth fade-up entry animations.
   - Left: Minimalist, compact, and powerful academic typography headline (*"AI teachers that deliver real classroom lessons"*).
   - Right: Smooth, backgroundless, and cardless illustrative avatar of an African learner seated with a laptop, blending directly into the white background. Animated hover-reactive tooltip callouts reveal core parameters (*Whiteboard*, *Caption Ribbon*, *Real-time Speed*).

3. **Content-to-Classroom Creative Transformation**
   - No rigid card structures. Features a highly creative, flowing linear vector path connecting:
     $$\text{Syllabus/Course Material Files} \xrightarrow{\quad\text{Converted}\quad} \text{Structured Modular Course} \xrightarrow{\quad\text{Delivered}\quad} \text{AI Teacher Lessons} \xrightarrow{\quad\text{Verified}\quad} \text{Completed Evidence}$$
   - Accentuated by clean hand-drawn lines, arrows, and small transparent educator avatars floating directly on the white canvas.

4. **Classroom Experience Showcase (Refined Product Frame)**
   - A single, oversized, pixel-perfect mockup of the refined classroom interface centered on the page.
   - Spotlights the *TeacherPresenceFrame*, *LearningWhiteboardPreview*, *CaptionRibbon*, and *LessonJourney* path. All textual captions must remain permanently visible with perfect contrast.

5. **AI Teacher Interactive Adaptation & Intelligence**
   - Pure white background. Illustrates the cognitive process with line doodles:
     $$\text{Student Question Avatar} \longrightarrow \text{AI Decision Core} \longrightarrow \text{Custom Explanation Waveform} \longrightarrow \text{Class Resumes}$$
   - Includes transparent teacher avatars interacting in real-time, blending directly into the layout without box margins.

6. **Asymmetric Role Entry (Learners, Teachers, Institutions, Families)**
   - 4 highly creative, asymmetrical, and responsive segments.
   - Utilizes smooth, backgroundless crop illustrations representing each educational persona, floating seamlessly on the website's clean white background.

7. **Before, During, After: Highly Creative Multi-Lane Timeline**
   - A smooth vertical or horizontal scrolling track describing preparation (importing notes), execution (listening to AI lectures), and reporting (reviewing metrics).

8. **Inclusive Accessibility & Multi-Mode Transition**
   - Displays illustrative accessibility avatars showing focus modes, captions, and keyboard controls. All text labels must maintain a minimum of 4.5:1 contrast ratio against the white backdrop.

9. **Institution Operations & High-Contrast Metrics**
   - A clean layout presenting simplified, compact program analytics and active classrooms.
   - Features compact, high-contrast tables and health meters.

10. **Creative Course Community & Timelines**
    - An asymmetrical timeline flow mapping out student questions, live announcements, and community activity markers.

11. **Minimalist Editorial Testimonials**
    - Beautiful floating quote typography next to backgroundless illustrative avatar faces. No cards, borders, or enclosed frames.

12. **Creative Final CTA Workspace**
    - Pure white background with elegant Crimson accent text and compact buttons.
    - Title: *"Bring your institution's content to life."*
    - Buttons: *Build a Classroom*, *Request a Demonstration*.

### B. High-Visibility Rules & Scroll Interactions
- **White-on-White Prevention**: In any menu dropdowns, dashboards, landing panels, or interactive headers, any text placed on `#FFFFFF` surfaces must be Deep Ink (`#221B1C`) or text-secondary/crimson. No white text is allowed on white or light surfaces.
- **Scroll Animations**: Smooth animated scrolls utilizing `cubic-bezier(0.22, 1, 0.36, 1)` easing.
- **Micro-interactions**: Hover effects must elevate, expand line paths, or gently pulse avatar waveforms within 120–180ms.

---

## 8. IMPLEMENTATION SEQUENCE & ACCEPTANCE CRITERIA

### A. Recommended Implementation Order
1. **Design Tokens & Tailwind/CSS Variables Setup**
2. **Typography & Core Button System Overhaul**
3. **Shared Surfaces & Custom Irregular Card Frames**
4. **12 Signature Visual Components**
5. **Global Sticky Header & Editorial Footer**
6. **Responsive Landing Page Layout**
7. **Secondary Marketing & Legal Pages**
8. **Asymmetric Split-Screen Authentication Pages**
9. **Dashboard Layout Shell (Navigation & Sidebar)**
10. **All 5 Functional Dashboards** (Student, Teacher, Institution, Admin, Parent)
11. **Forms, Tables, and Settings Panels**
12. **Surgical Classroom UI Refinements**
13. **Motion, Responsive, and Accessibility Checks**

### B. Definition of Done & Verification Rules
- **No SaaS Templates**: The interface must look custom-designed and academic-grade.
- **Compact & Premium**: Absolutely no massive padded buttons or oversized typography.
- **Consistent Visual System**: Illustrations, photography style, and warm colors applied across all 35+ redesigned routes.
- **Responsive**: Pixel-perfect layout from desktop down to single-column mobile screens (with smooth horizontal scrolls for carousels and hidden overflow checks).
- **Classroom Intact**: Verified that all teaching mechanisms, state logic, and streams remain completely functional.

---

## 9. POST-IMPLEMENTATION REFINE PROMPT (Self-Correction Loop)

Ensure you run a critical validation pass against the newly generated code:
> Verify that the landing page background is absolutely and pristine white (#FFFFFF) all through every section, with 100% visible deep ink text in the top bar menu and other light areas (absolutely no white text on white backgrounds). Confirm that all real human photography is completely removed and replaced with at least 6 smooth illustrative avatar scenes that float directly on the white website background with no card outlines or background boxes. Check that scrolls are beautifully animated, the responsive design flows seamlessly, all buttons are compact and precise, and that the core interactive classroom logic was entirely undisturbed.

---
_End of master redesign prompt._
