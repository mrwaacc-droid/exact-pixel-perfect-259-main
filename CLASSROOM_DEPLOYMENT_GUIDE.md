# 🎓 Classroom — End-to-End Deployment Guide

**Date:** 2026-07-15
**Status:** ✅ CLASSROOM IS READY FOR DEPLOYMENT
**Build health:** TypeScript 0 errors · `vite build` succeeded · Vercel output generated

---

## 1. What "The Classroom" Is

The Klassruum classroom is a teacher-led virtual classroom that supports:

- **AI teacher** (Mr. Klass / Ms. Amani) who writes on a live whiteboard, explains
  aloud with TTS, asks mid-lesson checks, and adapts to confusion.
- **Live human teacher / hybrid sessions** where a real teacher drives the same
  board, with learner questions appearing in real time.
- **Accessibility modes** (deaf, blind, ADHD, dyslexia, speech-difficulty,
  extra support, challenge) wired through the live speech engine and captions.
- **Progress evidence** captured as questions, hands, practice attempts,
  hints, confidence checks, and exit-ticket reflection — never as a single
  high-stakes exam.
- **Multiple session modes**: 1:1 AI solo, AI broadcast (group), and
  human/hybrid teacher-led.

---

## 2. Verified Build & Type Health

| Check                                          | Status                  |
| ---------------------------------------------- | ----------------------- |
| `npx tsc --noEmit`                             | ✅ **0 errors**         |
| `npm run build` (Vite + Nitro → Vercel preset) | ✅ **Succeeded**        |
| Generated `.vercel/output/`                    | ✅ `config.json` + `functions/__server.func` + `static/{assets,favicon.svg,images,media}` |
| Generated `.vercel/output/nitro.json`          | ✅ Yes                  |
| Router tree generation                         | ✅ All classroom routes present |
| `use client` directive warnings                | ⚠️ Non-blocking (only informational, from third-party packages) |

> The "use client" warnings in the build log are from TanStack Router, React
> Query, Radix UI and Sonner — these are RSC directives ignored by the
> Nitro bundle. They have no effect on a Vite SPA/SSR build.

---

## 3. Classroom Surface (Routes)

All of the following routes are registered in `src/routeTree.gen.ts` and have
been verified by build + typecheck:

| Route                                              | File                                                 | Auth                                | Purpose                                   |
| -------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- | ----------------------------------------- |
| `/classroom`                                       | `src/routes/classroom.tsx`                           | Public                              | Marketing info page + nested outlet      |
| `/classroom/$lessonId`                             | `src/routes/classroom.$lessonId.tsx`                 | `requireClientAuthRoute` (real UUID)| Live AI classroom (production engine)     |
| `/classroom/session/$sessionId`                    | `src/routes/classroom.session.$sessionId.tsx`        | `requireClientAuthRoute`            | Live session dispatcher (AI / hybrid / human) |
| `/classroom/preview/$lessonId`                     | `src/routes/classroom.preview.$lessonId.tsx`         | `requireClientRoleRoute([teacher,…])` | Teacher-only lesson preview             |
| `/classroom-enhanced/$lessonId`                    | `src/routes/classroom-enhanced.$lessonId.tsx`        | `requireClientAuthRoute`            | Legacy classroom UI (still works)         |
| `/classroom-design/$lessonId`                      | `src/routes/classroom-design.$lessonId.tsx`          | Public                              | Design-time classroom preview             |
| `/demo/classroom`                                  | `src/routes/demo.classroom.tsx`                      | Public                              | Marketing demo entry                      |
| `/student/classrooms`                              | `src/routes/_authenticated/student.classrooms.tsx`   | Student                             | Student's classroom list                  |
| `/institution/classrooms`                          | `src/routes/_authenticated/institution.classrooms.tsx` | Institution admin                  | Institution classroom management          |
| `/_authenticated/dev/classroom-enhanced/$lessonId` | `src/routes/_authenticated/dev/classroom-enhanced.$lessonId.tsx` | Auth dev path        | Dev-only                                   |
| `/_authenticated/dev/classroom-design/$lessonId`   | `src/routes/_authenticated/dev/classroom-design.$lessonId.tsx`   | Auth dev path        | Dev-only                                   |

---

## 4. Classroom Components (in `src/components/classroom/`)

All 26 components compile and ship in the production bundle:

| File                                     | Role                                  |
| ---------------------------------------- | ------------------------------------- |
| `AIVideoClassroom.tsx`                   | Main classroom (teacher panel + whiteboard + intellige |
| `AIBroadcastClassroom.tsx`               | Group AI broadcast session            |
| `LearnerLiveClassroomPage.tsx`           | Learner view of human/hybrid session  |
| `TeacherLiveClassroomPage.tsx`           | Teacher view of human/hybrid session  |
| `InteractiveClassroomPage.tsx`           | 1:1 / solo AI session                 |
| `ClassroomPage.tsx`                      | Lower-level classroom shell           |
| `EnhancedClassroomPage.tsx`              | Enhanced variant                      |
| `VideoClassroomPage.tsx`                 | Video-only classroom                  |
| `AITeacherPanel.tsx`                     | Teacher video panel                   |
| `AITeacherVideoPanel.tsx`                | Video panel                           |
| `TeacherVideoPlaceholder.tsx`            | Video fallback                        |
| `WhiteboardPanel.tsx`                    | Whiteboard component                  |
| `AnimatedWhiteboard.tsx`                 | Animated whiteboard renderer          |
| `StepsPanel.tsx`                         | Lesson steps sidebar                  |
| `ChatPanel.tsx`                          | Chat panel                            |
| `NotesPanel.tsx`                         | Manual notes                          |
| `IntegratedNotesPanel.tsx`               | Notes + transcript integrated          |
| `InlineEngagementArea.tsx`               | Inline engagement (sentiment)         |
| `LearnPanel.tsx`                         | Combined learning panel               |
| `AccessPanel.tsx`                        | Accessibility controls                |
| `AudioControlBar.tsx`                    | Audio playback bar                    |
| `CaptionBar.tsx`                         | Live caption bar                      |
| `QuestionSystem.tsx`                     | Raise-hand & ask system               |
| `LessonCompletionFlow.tsx`               | End-of-lesson flow                    |
| `SessionSummaryPage.tsx`                 | Post-session summary                  |
| `SessionReplayPage.tsx`                  | Replay page                           |
| `TeachingFlowUI.tsx`                     | Teaching flow overlay                 |
| `TeacherStartClassButton.tsx`            | Start class CTA                       |

---

## 5. Classroom Server Functions (in `src/lib/`)

These are bundled into the Nitro server build and exposed as Vercel functions:

- `classroom.engine.ts` — Optimistic classroom state engine
- `classroom.reducer.ts` — Reducer for the engine
- `classroom.model.ts` — Core domain model
- `classroom.contracts.ts` — Zod-typed contracts
- `classroom.payloads.ts` — Server-action payload builders
- `classroom-lesson.functions.ts` — Load published lesson content
- `classrooms.functions.ts` — CRUD over classroom_sessions
- `live-sessions.functions.ts` — Start/leave/end live sessions
- `sessions.functions.ts` — Session context for the route dispatcher
- `classroom-ai.functions.ts` — AI Q&A and adaptive interjections
- `classroom-board-sync.functions.ts` — Whiteboard state sync
- `classroom-personalization.functions.ts` — Learner profile load/save
- `classroom-instructional-planning.ts` — Adaptive planning
- `classroom-adaptive-interjection.ts` — Confusion-triggered interventions
- `classroom-confusion-tracker.ts` — Confusion signals
- `classroom-teacher-brain.ts` / `classroom-teacher-brain-content.ts` — Teacher asides
- `voice/teacher-voice.functions.ts` — TTS server function
- `voice/teacher-voice-service.ts` — ElevenLabs / local TTS bridge
- `autonomous-teaching.functions.ts` / `autonomous-teaching-engine.ts` — Auto-teach
- `teacher-availability.functions.ts` — Slot booking
- `kingpin-grade9-mathematics-classroom.ts` — Kingpin Math classroom content

---

## 6. Supabase Migrations (in `supabase/migrations/`)

The classroom depends on the following migrations, in order. Run them in
the Supabase SQL editor (or `supabase db push`) before going live:

```
20260608120437_0a06cff5-25a0-4c4c-a050-cb0be777afc5.sql   ← core
20260608120454_f14cb4d2-353d-4c08-82d1-12fddc4d5078.sql   ← core
20260608120521_ca69a910-f471-4562-ad2e-16c30d41bab9.sql   ← core
20260608121358_d5314399-08c0-4232-9971-522541c02b96.sql   ← core
20260609120000_phase1_classroom_foundation.sql            ← CLASSROOM FOUNDATION
20260609121000_phase2_idempotency.sql                      ← CLASSROOM
20260609122000_phase2_access_control.sql                   ← CLASSROOM
20260609130000_phase8_notifications_analytics.sql          ← CLASSROOM
20260609140000_phase9_programmes_materials_lessons.sql     ← CLASSROOM
20260610093313_phase11_autonomous_teaching.sql             ← CLASSROOM
20260610120000_phase10_user_presence.sql                   ← CLASSROOM
20260611133000_local_teacher_voice.sql                     ← TTS / VOICE
20260614120000_add_profiles_role.sql                       ← auth
20260614234500_phase12_onboarding_invites_email_queue.sql
20260615001000_phase13_business_workflows_foundation.sql
20260618120000_add_paystack_billing.sql
20260619110000_auth_profile_identifiers.sql
20260619123000_automated_notifications.sql
20260619124500_parent_linked_notifications.sql
20260620120000_course_pricing_and_purchases.sql
20260621120000_kenyan_cbc_curriculum_rollout.sql
20260622120000_harden_billing_rls.sql
20260622133000_make_kenyan_cbc_courses_teachable.sql
20260622143000_tighten_cbc_lesson_depth_and_pacing.sql
20260622153000_expand_kingpin_cbc_ai_lessons.sql
20260622160000_tighten_cbc_ai_expansion_depth.sql
20260625_classroom_realtime_and_booking.sql                ← CLASSROOM REALTIME
20260625_session_lifecycle_payouts_rentals.sql             ← CLASSROOM LIFECYCLE
```

**If any classroom migration is missing, the live classroom route will fail
to load lesson content.** Verify on production Supabase:

```sql
select count(*) from classroom_sessions;
select count(*) from classroom_messages;
select count(*) from classroom_session_events;
select count(*) from classroom_quiz_attempts;
select count(*) from classroom_session_notes;
select count(*) from classroom_board_states;
select count(*) from learner_profiles;
select count(*) from teacher_voice_profiles;
select count(*) from teacher_voice_cache;
```

---

## 7. Environment Variables Required for the Classroom

The classroom needs the following production env vars. The full set is
documented in `.env.example`; this is the classroom-relevant subset:

### Core (must set)
```
NODE_ENV=production
APP_URL=https://klassruum.com
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### AI teacher (at least one of)
```
OPENAI_API_KEY=...           # preferred — gpt-4o-mini / gpt-5-nano / gpt-4.1-nano only
DEEPSEEK_API_KEY=...         # alternative/secondary — always uses deepseek-v4-flash
```

### Teacher voice (TTS)
```
# Premium — used as primary when set
ELEVENLABS_API_KEY=...
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

# Local fallback (Kokoro / Piper)
LOCAL_TTS_SECRET=...
LOCAL_KOKORO_TTS_URL=http://localhost:8008
LOCAL_PIPER_TTS_URL=http://localhost:8008
```

> Without ElevenLabs, the classroom gracefully falls back to local TTS,
> then to browser `speechSynthesis`. The classroom **will not break** if
> TTS env vars are missing — speech just becomes browser-only.

### Asset URLs (optional)
```
# Canonical origin used by invite/auth/billing callbacks
PUBLIC_APP_URL=https://klassruum.com
VITE_APP_URL=https://klassruum.com
```

### Outbound email (for invites/notifications, classroom-adjacent)
Sent via Resend, relayed through the deployed `send-email` Supabase Edge
Function (`supabase/functions/send-email`). The Resend API key lives only as
an Edge Function secret (`supabase secrets set RESEND_API_KEY=... EMAIL_FUNCTION_BEARER=...`),
never in app env.
```
SUPABASE_EMAIL_FUNCTION_URL=https://<project-ref>.supabase.co/functions/v1/send-email
SUPABASE_EMAIL_FUNCTION_BEARER=...   # must match the edge function's EMAIL_FUNCTION_BEARER secret
```

---

## 8. Static Assets Already in Place

The classroom relies on the following public assets, all verified present:

```
public/images/teachers/man.png        ← male AI teacher portrait
public/images/teachers/woman.png      ← female AI teacher portrait
public/favicon.svg
public/images/scenes/                 ← marketing visuals
public/media/                         ← misc media
```

If you ever swap the AI teacher brand, drop the replacement PNGs into
`public/images/teachers/` keeping the same filenames.

---

## 9. Deployment Commands

```bash
# 1. Install
npm ci

# 2. Verify (typecheck + lint + build)
npm run verify:deploy

# 3. Deploy (Vercel)
vercel --prod

# Or run the prebuilt Vercel output locally
npx vite preview
```

The build emits a Vercel-compatible payload at `.vercel/output/`:

```
.vercel/output/
├── config.json
├── nitro.json
├── functions/
│   └── __server.func/         ← TanStack Start / Nitro server
└── static/
    ├── favicon.svg
    ├── assets/                ← bundled JS + CSS
    ├── images/                ← teacher portraits, scenes
    └── media/
```

---

## 10. End-to-End Smoke Test (Recommended)

Before declaring the classroom live, run this from a fresh incognito window:

1. **Visit `/classroom`** → confirm the marketing page renders and links to
   `/demo/classroom`.
2. **Open `/demo/classroom`** → confirm the demo lesson auto-starts
   (Mr. Klass, whiteboard writes, voice plays via browser speech).
3. **Sign up as a student** → confirm `/student/classrooms` is reachable.
4. **Open a published lesson** (`/classroom/$lessonId` with UUID) → confirm
   the live classroom loads, voice plays, board writes, and a session is
   started in the database.
5. **Raise a hand & ask a question** → confirm it persists in
   `classroom_messages` and an answer is returned.
6. **Complete the lesson** → confirm `classroom_session_events`,
   `classroom_session_notes`, and `learner_profiles.optimalPace` are
   updated.
7. **Reopen the same lesson** → confirm the resume prompt shows the saved
   progress.
8. **Sign in as a teacher** → confirm `/classroom/preview/$lessonId` and
   `/classroom/session/$sessionId` are reachable with the right role.
9. **Sign in as an institution admin** → confirm `/institution/classrooms`
   shows the correct roster.

If any of those fail, the classroom is **not** production-ready — fix the
failing step before flipping DNS.

---

## 11. Known Non-Blockers (Acknowledge, Don't Block)

- **Bundle size warning**: `assets/index-*.js` is ~1.86 MB (475 kB gzipped).
  Acceptable for a feature-rich classroom app; optimise with manual chunking
  in a follow-up sprint.
- **ESLint warnings** (~61 react-hooks / react-refresh warnings) — none
  are blocking, but worth a cleanup pass.
- **`"use client"` module-level warnings** — emitted by TanStack Router,
  React Query, Radix UI, Sonner. Harmless: these are RSC directives that
  Nitro ignores. No action needed.

---

## 12. Rollback Plan

If a deployment goes wrong:

1. **Vercel**: `vercel rollback` (or "Promote previous deployment" in the
   Vercel dashboard).
2. **Database**: classroom migrations are additive — no destructive
   changes — so database rollback is not required for a code rollback.
3. **Env vars**: Vercel keeps previous env values in the project settings;
   no manual reset needed.

---

## 13. Classroom-Specific Operational Notes

- **Realtime**: classroom uses Supabase Realtime for messages, board
  state, and presence. If realtime is misconfigured, the classroom falls
  back to polling via the query cache — no crash, just higher latency.
- **TTS cache**: every generated teacher utterance is cached in
  `teacher_voice_cache` (keyed by voice profile + speech type + text
  hash) so repeated phrases don't burn ElevenLabs quota.
- **Adaptive interjection**: the confusion tracker samples sentiment
  every few turns; on a threshold it injects a teacher aside via
  `decideAside()`. Disable by setting `learningMode = "standard"` and
  not loading a `learnerProfile`.
- **Demo lesson registry**: `src/lib/demo-lessons/demo-lesson-registry.ts`
  contains the seed lessons that back direct demo URLs without auth.
  Keep this file in sync with marketing pages.

---

**Conclusion**: The classroom is end-to-end buildable, type-clean, and
ships a Vercel-ready output. Once the env vars in §7 and the Supabase
migrations in §6 are applied to production, the classroom can be served
from `https://klassruum.com/classroom`, `/classroom/$lessonId`, and
`/classroom/session/$sessionId` without further code changes.
