# Remaining Work

This document lists the remaining tasks across the workspace to finish restoring the SalesOps dashboard into the admin route, finalize UI enhancements, and ensure the project runs cleanly.

## Priority: High
- **Restore admin page**: Replace `src/app/admin/page.tsx` with the adapted SalesOps dashboard from `sales-ops-dashboard/app/page.tsx`, merging the visual enhancements already implemented.
- **Run dev server & QA**: Start the Next.js dev server locally and verify `/admin` renders, sidebar navigation works, and there are no runtime import errors.
- **Fix runtime imports / wrappers**: Ensure all `src/components/dashboard/*` wrapper files correctly re-export SalesOps components and add missing wrappers for any `components/ui/*` primitives used by SalesOps.
- **Environment variables**: Confirm `.env` values required by Supabase / local mode and update `.env.example` to reflect required keys (e.g., SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL, NEXT_PUBLIC_* keys).

## Priority: Medium
- **Merge UI enhancements**: Reconcile visual improvements (full-bleed AdminShell/layout, spacing, panel styles) with the original SalesOps layout; decide which components keep the enhancements.
- **Per-section admin pages**: Flesh out files under `src/app/admin/[section]/page.tsx` to be real routes or wire them to the dashboard's client-side section switching strategy (pick server or client approach).
- **Ensure `getAdminDashboardData` compatibility**: Verify `src/lib/admin-data.ts` returns the same shape the SalesOps components expect; update types and transform data where needed.
- **Authentication/Authorization checks**: Review admin access gating (the `authorized` flag) and ensure consistent UX for non-admin users.

## Priority: Low / Nice-to-have
- **Polish mobile responsiveness**: Validate responsive layouts for dashboard tables, mobile cards, and header controls.
- **Accessibility audit**: Run quick axe checks or manual checks (semantic headings, ARIA labels on interactive controls, keyboard nav for the sidebar).
- **Performance check**: Identify heavy client components, lazy-load charts and non-critical widgets, and add skeletons where useful.
- **Remove unused code**: Search for stale/duplicate components after merging and delete or archive them.

## Testing & CI
- **Unit tests**: Add tests for key components (Panel, KpiCard, StatusPill) and simple data transforms in `src/lib`.
- **E2E / Visual tests**: Add at least one Playwright or Cypress test to open `/admin` and assert that the main KPI cards render.
- **CI pipeline**: Ensure `npm run build` and test steps are present in CI and pass. If CI config is absent, add a minimal workflow.

## Dev DX / Tooling
- **Formatting & linting**: Run Prettier / ESLint across codebase; add pre-commit hooks if not present.
- **Update docs**: Add a short `CONTRIBUTING.md` and document how to run the dev server, env keys, and where the SalesOps components live.
- **PROGRESS.md sync**: Update `PROGRESS.md` to reflect current state and link to this `remaining.md` for next steps.

## Files to Inspect / Likely Problem Locations
- `src/app/admin/page.tsx` — target for restore.
- `src/app/admin/full/page.tsx` — backup/adapted copy created earlier.
- `src/components/dashboard/*` — wrappers and shim components.
- `sales-ops-dashboard/app/page.tsx` and `sales-ops-dashboard/components/dashboard/*` — original dashboard source.
- `src/lib/admin-data.ts` — data shape provider.
- `src/lib/utils.ts` — common helpers like `cn` and `formatCurrencyZar`.
- Tailwind and global CSS: `tailwind.config.ts`, `src/app/globals.css` — check global tokens and colors.
- Environment: `.env.example` (update keys), any Supabase configs.

## Verification Steps (How to confirm task completion)
1. Start dev server:

   ```powershell
   Set-Location 'c:\Users\anoti\OneDrive\Desktop\WAAS'
   npm run dev
   ```

2. Open `http://localhost:3000/admin` — verify:
   - Dashboard renders without console errors.
   - Sidebar links open pages or switch sections.
   - KPI cards, RevenueFlow, PipelineBars, and Recent platform events render.
3. Run `npm run build` to confirm production build passes.
4. Run unit tests and E2E if added.

## Notes & Risks
- The SalesOps package expects certain UI primitives and paths; prefer adding thin wrappers in `src/components` rather than copying entire components to minimize drift.
- Git history access failed in the environment earlier; if you need to restore historical file contents, do it from local git or another environment with full git support.
- Some large UI files may require manual merge resolution to preserve both functionality and stylistic enhancements.

---
If you want, I can now:
- replace `src/app/admin/page.tsx` with the adapted SalesOps page (I have the backup at `src/app/admin/full/page.tsx`), and then run the dev server to surface any runtime errors.
- or run an automated repo scan to produce a more granular per-file checklist.

Tell me which next step you prefer.