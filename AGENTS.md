<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project snapshot
- Framework: Next.js 16 (App Router), React 19, TypeScript strict mode.
- Styling: Tailwind CSS v4 in `app/globals.css` with custom utilities/components.
- Internal import alias: `@/*` (see `tsconfig.json`).
- UI config/aliases: `components.json` (`@/components`, `@/components/ui`, `@/lib`, `@/hooks`).
- Analytics: PostHog client instrumentation in `instrumentation-client.ts` and `/ph/*` rewrites in `next.config.ts`.

## Commands
- Use `npm` for this repo (`package-lock.json` exists).
- Dev: `npm run dev`
- Lint: `npm run lint` (run after edits)
- Build: `npm run build` (run for routing/config/instrumentation-impacting changes)

## Code organization and edit guardrails
- Prefer Server Components in `app/` by default; add `"use client"` only when hooks/browser APIs/event handlers are needed.
- Keep route/layout files in `app/`.
- Place reusable UI in `components/` and shared logic/constants in `lib/`.
- Use `@/` aliases for internal imports unless a relative import is clearly more local/readable.
- Keep changes scoped; avoid reformatting unrelated files.
- Preserve existing style within each file (semicolon/no-semicolon conventions vary by file).
- Preserve `skipTrailingSlashRedirect: true` in `next.config.ts` unless explicitly asked to change it.
- Preserve PostHog proxy rewrites under `/ph/*` unless explicitly asked to change them.

## Styling conventions
- Prefer utility classes and existing utilities from `app/globals.css` (`flex-center`, `text-gradient`, `glass`, `card-shadow`) before adding new global selectors.
- Reuse existing IDs/classes (`#explore-btn`, `#event-card`, `.events`) where appropriate.
- Keep colors/tokens aligned with the theme variables already defined in `app/globals.css`.

## Validation workflow
1. Read nearby files before editing to match local patterns.
2. Make minimal, focused edits.
3. Run `npm run lint` after edits; run `npm run build` when changes affect routes, config, or instrumentation.
4. Summarize what changed and note any follow-up checks.
