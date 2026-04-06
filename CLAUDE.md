# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint

# Database
npx prisma migrate dev --name <name>   # Create & apply migration
npx prisma db push                     # Push schema without migration
npx prisma generate                    # Regenerate client after schema change
npx tsx prisma/seed.ts                 # Seed database

# Production (PM2)
pm2 start ecosystem.config.js          # Start on port 82
```

## Architecture

**Next.js 16 + App Router** CBT (Computer-Based Testing) platform. Single app, not a monorepo.

- **Database:** Prisma + SQLite (`dev.db` local, `prod.db` production)
- **Auth:** NextAuth 5 beta with Credentials provider, JWT strategy, roles: `ADMIN` / `STUDENT`
- **State:** Zustand (`src/stores/exam-store.ts`) for client-side exam state
- **UI:** Tailwind CSS 4, base components in `src/components/ui/`
- **Validation:** Zod 4

### Route Groups

- `src/app/(public)/` — Login, register (unauthenticated)
- `src/app/(student)/` — Dashboard, exams, results, study (authenticated students)
- `src/app/api/admin/` — REST API for external admin frontend (authenticated via `X-Admin-Key` header)
- `src/app/api/attempts/` — Exam save/submit endpoints

### Server Actions vs REST API

Two parallel interfaces exist:
- **Server Actions** (`src/app/actions/`) — Used by the Next.js frontend (auth, exams, questions, categories, attempts, study)
- **Admin REST API** (`src/app/api/admin/`) — Used by the separate `cbt-admin` frontend, with CORS enabled

### Key Business Logic

- `src/lib/grading.ts` — Grading engine; evaluates responses, creates StudyRecords for wrong answers, syncs results to external work_studio API
- `src/lib/question-shuffle.ts` — Seeded PRNG (Mulberry32) + Fisher-Yates for deterministic question/option shuffling per attempt
- `src/lib/auth.ts` — NextAuth config, `requireAdmin()` helper
- `src/lib/prisma.ts` — Prisma singleton (prevents connection issues in dev)

### Data Model (core flow)

`User` → `Attempt` → `Response` (per question)
`Exam` → `ExamItem` → `Question` → `Category` (hierarchical tree)
`User` + `Question` → `StudyRecord` (wrong answer tracking)

Question types: `MULTIPLE_CHOICE`, `MULTIPLE_SELECT`, `TRUE_FALSE`, `SHORT_ANSWER`

### Path Alias

`@/*` → `./src/*`
