# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured.

## Required env vars

`.env.local` must define:
- `NEXT_PUBLIC_API_URL` — backend REST API base URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## Architecture

**Auth** — Supabase handles auth. `src/middleware.ts` runs `updateSession` on every request and redirects unauthenticated users to `/auth/login`. Auth server actions live in `src/app/auth/actions.ts`.

**API client** — `src/lib/axios/client.ts` exports a singleton `apiClient`. It reads the Supabase session on every request and injects `Authorization: Bearer <token>`. All Redux thunks and direct API calls must use this client, never raw `fetch` or a new axios instance.

**State management** — Redux Toolkit, wrapped in `src/store/StoreProvider.tsx` (mounted in the root layout). Two slices:
- `dashboardSlice` — dashboard overview data (stats, activities, entity rows)
- `entitySlice` — entity list, selected entity, dimension scores, analysis posts, daily metrics

Async state follows the `status: 'idle' | 'loading' | 'succeeded' | 'failed'` pattern throughout both slices.

**Routing** — App Router. All dashboard pages are under `src/app/dashboard/`. Entity detail is at `/dashboard/entity/[canonical_name]`. Pages that need Redux state are `'use client'` components; layout (`src/app/dashboard/layout.tsx`) is a server component with a client sidebar.

**Styling** — Tailwind v4 with shadcn/ui (base-nova style). Design tokens: primary `#4664ff`, background `#f5f5f5`, text `#0e0e0e`, muted `#6b6b6b`, error/destructive `#e55a2b`. Heading font uses CSS var `--font-heading` (Space Grotesk); body uses Manrope. Prefer inline Tailwind classes over new CSS; match the existing card pattern (`rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]`).

**shadcn components** — add with `npx shadcn add <component>`. Components install to `src/components/ui/`.
