# CLAUDE.md

Project: Linear clone — Laravel + Inertia + React (TypeScript), served on `http://localhost:8100`.

## Internationalization (i18n)

The UI is localized with **i18next + react-i18next**. Locale comes from the user `language`
preference (en/fr), shared via Inertia and initialized in `app.tsx` / `ssr.jsx`
(`resources/js/lib/i18n.ts`). Strings live in `resources/js/locales/{en,fr}/common.json`.

When adding or editing any user-facing string, follow **[.claude/rules/translations.md](.claude/rules/translations.md)** —
in particular: correct French **orthographe, ponctuation et grammaire** (accents included),
identical key sets across `en`/`fr`, and the shared glossary.

## Seeing changes locally

The app serves the **production build** (no Vite dev server). Run `bun run build`
(and `bunx vite build --ssr`) to see source changes. Verify in the browser via the
"Continue with demo account" login.
