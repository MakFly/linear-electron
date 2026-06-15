# Translation quality (i18n)

Rules for every string added to `resources/js/locales/**` (currently `en` + `fr`, namespace `common`).

## Language correctness — non-negotiable
Translations are user-facing product copy. Before adding/editing any value, double-check:

- **Spelling** — no typos. When unsure of a French word, verify it; do not guess.
- **Punctuation** — French rules:
  - Non-breaking space before `:` `;` `!` `?` and inside `« … »` guillemets (use a real `’` apostrophe, not `'`).
  - Use `…` (ellipsis char) consistently with the source, or three dots — match the existing key style.
  - French quotes are `« »`, not `"`. Em dash `—` for asides.
- **Grammar & agreement** — gender/number agreement (le/la, accord des adjectifs et participes), correct verb conjugation, proper articles.
- **Accents** — never omit them: é, è, ê, à, ç, ï, ô, ù… Missing accents are errors.

## Consistency
- Reuse the established glossary. Keep terms stable across the app:
  - issue → **ticket**, label → **étiquette**, assignee → **responsable**, workspace → **espace de travail**, view → **vue**, project → **projet**, status → **statut**, priority → **priorité**.
- Keep the same register (vouvoiement) and tone as existing copy.
- Keep proper nouns/brands untranslated: Linear, GitHub, Slack, Jira, Claude Code, Codex, etc.
- Don't translate dynamic/data values (issue titles, user names, team names).

## Keys & structure
- `en` and `fr` must have **identical key sets**. Add the key to both files in the same edit.
- Group by area (`sidebar.*`, `header.*`, `issues.*`, `settings.*`, …). Use camelCase leaf keys.
- Use i18next interpolation (`{{var}}`) and plurals (`key_one` / `key_other`) rather than string concatenation in components.
- In components, translate at the render site with `useTranslation()` → `t('…')`; never hardcode user-facing text or leave a raw key visible.

## Before calling it done
- No raw keys rendered (e.g. `settings.profile.title`), no `i18next::missingKey` warnings in the console.
- Re-read the French values once for orthographe / ponctuation / grammaire.
