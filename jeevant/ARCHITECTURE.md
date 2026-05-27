# Jeevant Architecture

This file is the primary source of truth for how the app is structured, what is already implemented, and what should be prioritized next.

## 1. Product Goal

Jeevant is a backend-driven personal portfolio and admin CMS built as a cyberpunk/sci-fi terminal-inspired web app. It has two equally important faces:

- Public portfolio pages for visitors, recruiters, and collaborators.
- Private admin/CMS pages for maintaining content, schedules, timelines, notes, and profile data.

The long-term goal is not just to look unique. The app should remain easy to maintain, data-backed, fast to load, and structured enough to grow into a complete personal operating system.

## 2. Current Stack

- Framework: Next.js App Router
- Language: TypeScript
- UI: React 19
- Styling: Tailwind CSS v4 via `app/globals.css`
- Database: MongoDB through Mongoose
- Auth/session: `jose` signed session cookie
- Dev/build: Turbopack through `next dev` and `next build`

Important repo reality:

- There is no `tailwind.config.ts` in the current codebase.
- Theme and custom utilities are currently handled in `app/globals.css`.
- Turbopack root is pinned in `next.config.ts` so the app starts from the correct workspace root.

## 3. Runtime Flow

### Public flow

1. A visitor opens a public route under `app/(public)`.
2. The page fetches data from server actions in `lib/actions`.
3. Data is rendered directly in the page or through small feature components.
4. The public UI stays lightweight and mostly server-rendered.

### Admin flow

1. The user visits `/login`.
2. The password is compared against `ADMIN_SECRET` from `.env.local`.
3. If valid, a signed `session` cookie is set.
4. Protected routes are guarded by `proxy.ts`.
5. Admin pages under `app/(private)` load data from MongoDB and submit forms to server actions.

## 4. Route Map

### Public routes

- `/` home
- `/about` profile/character sheet style page
- `/journey` experience and career timeline
- `/projects` project showcase
- `/research` notes and experimentation
- `/library` learning resources
- `/expertise` achievements and proof
- `/schedule` public schedule snapshot
- `/responsibilities` work and commitments
- `/resume` concise resume view
- `/contact` contact form

### Private routes

- `/dashboard` overview
- `/cms/profile` profile editor
- `/cms/projects` project editor
- `/cms/schedule` schedule planner
- `/cms/journey` experience editor
- `/cms/expertise` achievements editor
- `/cms/resume` resume/profile editor
- `/cms/rpg` legacy content/editor area
- `/brain`, `/learning`, `/career`, `/planner/daily`, `/arsenal` for internal organization and content workflows

## 5. Data Layer

All persistent data lives in `lib/database/models.ts`.

### Existing schemas

- `Project`
- `Task`
- `Note`
- `Learning`
- `Experience`
- `Achievement`
- `Certificate`
- `Application`
- `Message`
- `Snippet`
- `Profile`
- `Schedule`

### Key schema responsibilities

#### `Project`

Used for public project cards, CMS project editing, and future chronology views.

Current important fields:

- `title`
- `slug`
- `description`
- `content`
- `techStack`
- `repoLink`
- `liveLink`
- `startDate`
- `endDate`
- `isOngoing`
- `visibility`
- `status`

#### `Experience`

Used for journey and resume timelines.

Current important fields:

- `company`
- `role`
- `startDate`
- `endDate`
- `description`
- `skillsUsed`
- `logoUrl`
- `type`

#### `Schedule`

Used for calendar/planner work blocks.

Current important fields:

- `title`
- `start`
- `end`
- `projectId`
- `notes`
- `isRecurring`
- `recurrence`
- `colorCode`

#### `Profile`

Used for the public identity card, resume page, and homepage summary.

## 6. Server Actions

Server actions live in `lib/actions`.

### Core actions already used

- `lib/actions/auth.actions.ts`
- `lib/actions/profile.actions.ts`
- `lib/actions/project.action.ts`
- `lib/actions/rpg.actions.ts`
- `lib/actions/task.actions.ts`
- `lib/actions/learning.actions.ts`
- `lib/actions/note.actions.ts`
- `lib/actions/schedule.actions.ts`

### Important behaviors

- Actions connect to MongoDB via `connectDB()`.
- Writes usually call `revalidatePath()` so public pages and CMS pages refresh.
- Forms are mostly server-action driven instead of client-side API calls.

## 7. Admin Security

### Authentication

- Login is password-based and uses `ADMIN_SECRET`.
- The session is a signed cookie called `session`.
- `lib/auth.ts` handles signing and verification.

### Route protection

- `proxy.ts` protects private admin and planner routes.
- If the session is missing or invalid, the user is redirected to `/login`.

### Operational notes

- Changing `ADMIN_SECRET` requires restarting the dev server.
- The app should always be run from `d:\Desktop\Jeevant\jeevant`.
- If port `3000` is busy, start on another port or stop the existing dev process.

## 8. Visual System

The current visual direction is intentionally terminal-like, neon, and cinematic.

### Current implementation

- Layouts use dark backgrounds, border accents, and glow-like gradients.
- Motion is limited and intentional.
- Public pages are content-first, not dashboard clutter.
- Admin pages keep a terminal/operations style.

### Styling reality

- Tailwind utilities are available.
- Custom CSS lives in `app/globals.css`.
- Because there is no `tailwind.config.ts`, custom shadow or theme utilities should be added in `app/globals.css` unless the project later adopts a Tailwind config file.

## 9. What Is Already Built Well

- Public pages are wired to real backend content.
- Admin schedule has a dedicated CMS page.
- Journey, expertise, and resume editors now exist.
- Public journey and resume pages show timeline-style visuals.
- Project creation already accepts chronology fields.
- The build currently passes after the latest changes.

## 10. What Is Still Missing or Incomplete

These are real gaps, not assumed features.

### Missing or partial items

- True drag-and-drop interaction in the admin schedule is not implemented.
- The admin calendar is a custom day/week view, not a drag-and-drop calendar library.
- Project timeline bars are present conceptually, but there is no fully accurate month-scale Gantt engine yet.
- Edit/delete flows for journey and expertise entries are still basic.
- Some CMS forms could still use broader accessibility and keyboard polish.
- A dedicated migration/backfill script for old project chronology data does not exist yet.

### Not present in the repo right now

- `tailwind.config.ts`
- `@dnd-kit/core`
- `react-big-calendar`
- `@fullcalendar/react`
- A migration script folder or CLI tooling for schema backfills

## 11. Prioritized Roadmap

This is the order that should matter most.

### Priority 1: Keep the foundation stable

- Preserve build stability.
- Keep admin auth working.
- Keep the data model aligned with pages.
- Avoid adding heavy libraries unless they solve a real problem.

### Priority 2: Improve content maintenance

- Finish CRUD for journey, expertise, and schedule entries.
- Add safer discard/unsaved-changes warnings for CMS forms.
- Improve a11y across all CMS forms.

### Priority 3: Make chronology accurate

- Add a proper project date backfill strategy.
- Ensure public and admin timelines derive from the same data source.
- Improve the month-by-month visualization math for project and experience views.

### Priority 4: Add interaction carefully

- If drag-and-drop scheduling is needed, add a small headless library only when necessary.
- Keep the UI custom and cyberpunk-themed.
- Avoid corporate calendar visuals.

### Priority 5: Expand documentation

- Keep this file current whenever schemas, routes, or CMS flows change.
- Update `README.md` for setup, env vars, and admin usage.

## 12. Working Rules For Future Changes

- Prefer server actions over extra API routes unless there is a clear reason not to.
- Prefer custom UI over bulky third-party UI kits.
- Use lightweight dependencies only for logic, not presentation.
- Keep data models and public pages in sync.
- Update this file whenever a new route, schema, or CMS area becomes important.

## 13. Setup Notes

### Required environment variables

- `ADMIN_SECRET`
- MongoDB connection variable used by `lib/db.ts`

### Common run commands

```bash
cd jeevant
npm run dev
```

```bash
cd jeevant
npm run build
```

## 14. Practical Summary

If you need one short version of the current architecture:

- Public pages read from MongoDB through server actions.
- Admin pages write to MongoDB through server actions.
- Authentication is one secret and one signed cookie.
- Scheduling, journey, expertise, resume, and projects are the main content systems.
- The repo is intentionally leaning toward a custom cyberpunk terminal UI rather than a standard SaaS dashboard.

This file should be treated as the canonical architecture summary for the project.
