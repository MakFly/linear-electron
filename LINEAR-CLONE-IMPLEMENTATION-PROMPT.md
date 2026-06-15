# Prompt d'implémentation — Clone Linear (NativePHP / Laravel + Inertia + React)

> **Usage** : ce fichier est un prompt complet et auto-suffisant. Colle son contenu (ou pointe Claude Code dessus) pour exécuter, phase par phase, le reste des fonctionnalités manquantes du clone Linear. Chaque phase est indépendante, livrable seule, vérifiable. **Travaille une phase à la fois, en plan mode, et fais valider avant la suivante.**

---

## 0. Contexte projet

Application **desktop Electron** (via NativePHP) qui clone l'app **Linear** à l'iso.

**Stack**
- **Backend** : Laravel (PHP), routes dans `routes/web.php` + `routes/settings.php`, contrôleur principal `app/Http/Controllers/IssueController.php`, modèles `app/Models/{Issue,User}.php`.
- **Frontend** : Inertia 2 + React 19 + TypeScript, Vite. SSR actif (`resources/js/ssr.jsx`).
- **UI** : Tailwind CSS v4 (`resources/css/app.css`, config via `@theme`) + shadcn/ui (`resources/js/components/ui/*`) + Radix + lucide-react.
- **Composants Linear** : `resources/js/components/linear/*`.
- **Pages** : `resources/js/pages/*`.
- **Runtime dev** : l'app Electron sert le PHP sur **`http://localhost:8100`**, Vite HMR sur `:5173`. Connexion : bouton **« Continue with demo account »** sur `/login` (route `POST /auth/mock`).

---

## 1. Conventions OBLIGATOIRES (ne pas dévier)

1. **Réponses en français** ; **code, commentaires, commits, titres de PR en anglais**.
2. **Recherche code** : utiliser `ig "pattern" [path]` (instant-grep), jamais `grep`/`rg`. Index hors-projet (cache XDG), jamais de `.ig/` à committer.
3. **Discipline Karpathy** : *Think before coding* (énoncer les hypothèses, demander si ambigu) · *Simplicity first* (code minimal, rien de spéculatif) · *Surgical changes* (ne toucher que le nécessaire, matcher le style existant) · *Goal-driven* (critères de succès vérifiables, loop jusqu'à vérif).
4. **Plan mode** avant toute tâche non triviale + **diagramme ASCII** de l'archi/data-flow dans le plan.
5. **Vérification navigateur systématique** (Playwright MCP) : après chaque changement UI, naviguer sur `http://localhost:8100`, `browser_snapshot`, screenshot, vérifier 0 erreur console. Connexion via « Continue with demo account ».
   - ⚠️ **Sandbox** : `screencapture` est aveugle aux fenêtres ; passer par Playwright/chrome-devtools. Les screenshots écrits dans `.playwright-mcp/` peuvent déclencher une boucle de reload Vite — nettoyer les PNG temporaires créés à la racine après usage.
6. **TypeScript** : `bunx tsc --noEmit` doit passer (utiliser **bun/bunx**, jamais npm/npx — bloqué par hook). Erreurs préexistantes connues et hors-scope : `resources/js/pages/auth/reset-password.tsx`, `resources/js/pages/welcome.tsx`.
7. **Lint/format** : `bun run lint`, `bun run format` (prettier + tailwind plugin).

### Tokens de motion (déjà intégrés — à réutiliser partout)
Définis dans `resources/css/app.css` sous `@theme` (extraits en live de linear.app) :
- Durées : `--speed-quick: .1s`, `--speed-highlight-out: .15s`, `--speed-regular: .25s`, `--speed-slow: .35s`.
- Easings (génèrent les utilities `ease-*`) : `ease-out-quad` (défaut), `ease-in/out` × quad/cubic/quart/quint/expo/circ.
- Défauts Tailwind v4 pointés sur Linear : `--default-transition-duration: .1s`, `--default-transition-timing-function: ease-out-quad`. → toute utility `transition*` adopte déjà le feeling Linear.
- Mouvements amples (sheets/panneaux) : `duration-[var(--speed-regular)] ease-out-quint`.

### Contraintes UI apprises (à respecter)
- **Sidebar** : largeur visuelle ~228px (x=8→236), zone de contenu interne ~204px (x=20→224). Tout dropdown ancré dans la sidebar **ne doit pas déborder** dans le contenu (cf. workspace switcher : `w-52`, bord droit ≤ 236). Les sous-menus et pop-overs qui s'ouvrent vers l'extérieur peuvent déborder (comportement Linear normal).
- **Densité Linear** : items de liste/menu `h-[30px]`, texte `text-[13px]`, icônes `size-4` en `text-muted-foreground`, raccourcis clavier en `text-[11px] text-muted-foreground/60` alignés à droite (`ml-auto`).
- **Persistance d'état UI** : localStorage avec garde SSR (`typeof window`), lecture en `useEffect` au montage pour éviter les mismatch d'hydratation (cf. `linear-promo-collapsed`, `useFavorites`).

---

## 2. État actuel (déjà livré — NE PAS refaire)

- Auth mock + social redirect/callback.
- Sidebar complète : workspace switcher (dropdown iso : Settings / Invite / Download / Switch workspace ▸ / Log out), nav (Inbox, My issues), sections Workspace/Your teams/Try (collapsibles), card promo « Coding sessions » **réductible** via bouton « − » (hover) → laisse un bouton **« ? »** qui ouvre le **menu d'aide** (Search/Docs/Contact/Keyboard shortcuts/Linear status/Download apps/Settings/Slack + What's new).
- Issues : liste par équipe (`/team/DEV/{active|all|backlog}`), groupement par statut, filtres statut/priorité/assignee, **bulk** select/update/delete, **facets panel** (fermé par défaut, `panelOpen=false`), dialog new issue, **command palette** (4 actions), **favoris**.
- Pages : Inbox (« Inbox zero »), My issues, Projects (création basique), Views (basique).
- Settings : **uniquement le starter kit Laravel** (profile/password/appearance) — à remplacer par le système Linear.

**Modèle `issues`** (migrations `database/migrations/2026_06_13_*`) : `number, title, description, status, priority, assignee`. Rien d'autre.

---

## 3. Roadmap (phases ordonnées par dépendance/valeur)

> Recommandation : **Phase 1 d'abord** (isolée, sans risque, gros gain de réalisme), puis Phase 2 (fondations data qui débloquent le reste).

---

### PHASE 1 — Espace Settings + page Preferences (images de référence fournies)

**But** : reproduire à l'iso l'espace Settings de Linear (`/settings/...`) avec son layout 2 colonnes, la nav latérale complète, et la page **Preferences** fonctionnelle.

**Layout cible**
```
┌───────────────────────────────────────────────────────────┐
│ ‹ Back to app                                               │
│ ┌──────────────────┐  ┌──────────────────────────────────┐ │
│ │ Personal         │  │  Preferences                     │ │
│ │  Preferences ◄   │  │                                  │ │
│ │  Profile         │  │  General                         │ │
│ │  Notifications   │  │   Default home view   [Active ▾] │ │
│ │  ...             │  │   Display names       [Full ▾]   │ │
│ │ Issues           │  │   First day of week   [Sunday ▾] │ │
│ │  Labels ...      │  │   Convert emoticons   [ ●——]     │ │
│ │ Projects         │  │   Send comment on...  [Enter ▾]  │ │
│ │ Features         │  │                                  │ │
│ │ Administration   │  │  Interface and theme             │ │
│ │ Your teams       │  │   App sidebar         Customize  │ │
│ └──────────────────┘  │   Font size           [Default▾] │ │
│                        │   Use pointer cursors [——○]     │ │
│                        │   Interface theme     [Dark ▾]  │ │
│                        │  Desktop application             │ │
│                        │   Open in desktop app [——○]     │ │
│                        └──────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

**Nav settings à reproduire** (groupes + items, libellés exacts + icônes lucide approchantes) :
- **Personal** : Preferences, Profile, Notifications, Code & reviews, Security & access, Connected accounts, Agent personalization
- **Issues** : Labels, Templates, SLAs
- **Projects** : Labels, Templates, Statuses, Updates
- **Features** : AI & Agents, Initiatives, Documents, Customer requests, Releases, Pulse, Asks, Emojis, Integrations
- **Administration** : Workspace, Teams, Members, Security, API, Applications, Billing, Import & export
- **Your teams** : Devaubree, + Create a team

**Page Preferences — contenu exact**
- *General* :
  - **Default home view** : select (Active issues / My issues / Inbox…). Persiste et **pilote la redirection `/`** (route actuelle redirige en dur vers `/team/DEV/active`).
  - **Display names** : select (Full name / Short name / Username).
  - **First day of week** : select (Sunday / Monday).
  - **Convert text emoticons into emojis** : toggle (sous-texte « Strings like :) will be converted to 🙂 »).
  - **Send comment on…** : select (Enter / ⌘+Enter).
- *Interface and theme* :
  - **App sidebar** : lien « Customize » (peut ouvrir un dialog stub).
  - **Font size** : select (Small / Default / Large) → applique une CSS var de scale globale.
  - **Use pointer cursors** : toggle → ajoute/retire une classe sur `<html>` qui force `cursor: pointer` sur les éléments interactifs.
  - **Interface theme** : select (Light / Dark / System) → **branché** sur le dark mode (`<html class="dark">`).
- *Desktop application* :
  - **Open in desktop app** : toggle (stub, persiste).

**Implémentation suggérée**
- Composant `resources/js/components/linear/settings-sidebar.tsx` (nav, items actifs selon `url`).
- Layout `resources/js/layouts/settings/linear-settings-layout.tsx` (header « Back to app » → `/`, 2 colonnes, scroll interne).
- Page `resources/js/pages/settings/preferences.tsx`.
- Pages stub minimalistes pour chaque autre item (titre + « Coming soon » dans le même layout) afin que la nav soit cliquable sans 404.
- Routes dans `routes/settings.php` (`settings/preferences`, `settings/profile`, …). **Réutiliser** les contrôleurs existants quand pertinent (profile/password).
- Réutiliser les primitives `ui/select.tsx`, `ui/switch`/`toggle`, `ui/separator`.
- Store de préférences : table `user_preferences` **ou** colonne JSON `users.preferences` (au choix, simple) + hook `usePreferences()` côté front (localStorage + persist serveur). Garde SSR.

**Acceptance criteria**
- [ ] `/settings` redirige vers `/settings/preferences`.
- [ ] Nav latérale complète, item actif surligné, tous les liens naviguent (stub OK).
- [ ] Page Preferences pixel-proche des captures (espacements, selects à droite, toggles bleus, sous-textes muted).
- [ ] **Interface theme** change réellement le thème ; **Use pointer cursors** change réellement le curseur ; **Default home view** change la cible de `/`.
- [ ] « ‹ Back to app » revient à l'app.
- [ ] `tsc` OK, 0 erreur console, vérifié au navigateur (light + dark).

---

### PHASE 2 — Fondations data « issue » (débloque le reste)

**But** : étendre le modèle pour des issues réalistes. Migrations + relations + UI de sélection.

**À ajouter au modèle**
- **Labels** : table `labels` (name, color), pivot `issue_label`. CRUD minimal + sélecteur multi dans issue sheet/detail + chips dans la liste. Brancher l'onglet « Labels » du facets panel sur de vraies données.
- **Projects** (réels) : table `projects` (name, description, status, lead, start/target date, icon/color), relation `issues.project_id`. Page Projects = vraie liste + page projet (issues du projet).
- **Cycles** : table `cycles` (number, start/end, team) + `issues.cycle_id` + filtre/affichage.
- **Sub-issues / parent** : `issues.parent_id` (self-relation) + UI d'arborescence dans le détail.
- **Relations** : table `issue_relations` (type: blocks/blocked_by/duplicate/relates) — UI dans le détail.
- **Champs additionnels** : `due_date`, `estimate` (points), `started_at`, `completed_at`.

**Acceptance criteria**
- [ ] Migrations réversibles, seed mis à jour (`database/seeders`), `php artisan migrate:fresh --seed` OK.
- [ ] Sélecteurs (label/project/cycle/assignee/priority/status) cohérents et persistés via les endpoints `PATCH /issues/{issue}`.
- [ ] Filtres facets panel branchés sur les vraies données.
- [ ] `tsc` OK, vérif navigateur.

---

### PHASE 3 — Vues & affichage

**But** : parité d'affichage avec Linear.
- **Board view (Kanban)** : colonnes par statut, drag & drop (réutiliser `@hello-pangea/dnd` ou Radix/HTML5 DnD), toggle List/Board dans le header.
- **Display options** complètes (le bouton existe) : grouping (status/assignee/priority/project/cycle/label/no grouping), ordering (priority/last updated/created/manual), sub-grouping, show/hide propriétés, completed issues.
- **Saved views** : `/views` réelles = filtres+grouping persistés (table `views`), favoritables.
- **My issues** : onglets Assigned / Created / Subscribed.
- **Inbox** : notifications réelles (mentions, assignations, changements de statut) — table `notifications`, marquage lu/non-lu, « Inbox zero » quand vide.

**Acceptance criteria** : chaque vue testée au navigateur, DnD fonctionnel, états persistés, `tsc` OK.

---

### PHASE 4 — Collaboration sur une issue

- **Comments / activity feed** : table `comments` + flux d'activité (changements de statut/assignee/labels horodatés). Préférence **Send comment on…** respectée (Enter vs ⌘+Enter).
- **Description rich-text** : éditeur (Tiptap recommandé) avec markdown, mentions, slash-commands basiques.
- **Subscribers** + **attachments** (upload simple).

---

### PHASE 5 — Features Linear de plus haut niveau (stubs → réel selon besoin)

Initiatives, Roadmap, Documents, Releases, Pulse, Customer requests, Asks, Templates (issue/projet), SLAs, Statuses custom, Triage, recherche full-text dans la palette, keyboard shortcuts réels (la modale n'a que des libellés), multi-équipes/rôles/members.

---

### PHASE 6 — Détails desktop / Electron

- Brancher **Open in desktop app**, **Font size**, **Use pointer cursors**, **Interface theme** (si pas déjà fait en Phase 1) sur de vrais effets.
- Comportements fenêtre macOS (zone draggable déjà en place via `app-drag`/`app-no-drag`).

---

## 4. Méthode d'exécution par phase

1. **Plan mode** : lister hypothèses, fichiers touchés, **diagramme ASCII**, critères de succès. Faire valider.
2. Implémenter en **changements chirurgicaux**, en matchant le style existant (densité, tokens, motion).
3. **Vérifier** : `bunx tsc --noEmit` (ignorer les 2 erreurs préexistantes connues) + `bun run lint` + navigateur Playwright (snapshot + screenshot + console).
4. Nettoyer les artefacts temporaires (PNG à la racine, fichiers `.playwright-mcp` non voulus).
5. Récapituler en français : ce qui a changé, fichiers, vérifs faites.

## 5. Checklist de vérification globale (à chaque livraison)

- [ ] `bunx tsc --noEmit` ne révèle aucune **nouvelle** erreur.
- [ ] `bun run lint` clean.
- [ ] App testée connectée (demo account) sur `http://localhost:8100`, **light + dark**.
- [ ] 0 erreur console (`browser_console_messages level=error`).
- [ ] Aucun dropdown de sidebar ne déborde dans le contenu.
- [ ] Densité/tokens/motion Linear respectés.
- [ ] Aucun fichier temporaire laissé dans le repo.

---

## 6. Références utiles (fichiers clés)

| Rôle | Chemin |
|---|---|
| Sidebar Linear | `resources/js/components/linear/linear-sidebar.tsx` |
| Shell + contexte | `resources/js/components/linear/{linear-shell,shell-context}.tsx` |
| Liste issues + facets | `resources/js/pages/issues.tsx`, `components/linear/facets-panel.tsx` |
| Détail / sheet | `resources/js/pages/issue-detail.tsx`, `components/linear/issue-sheet.tsx` |
| Command palette | `resources/js/components/linear/command-palette.tsx` |
| Favoris | `resources/js/lib/favorites.ts` |
| Données issues (front) | `resources/js/lib/issues.ts` |
| Tokens motion + thème | `resources/css/app.css` |
| Routes | `routes/web.php`, `routes/settings.php` |
| Contrôleur | `app/Http/Controllers/IssueController.php` |
| Modèles | `app/Models/{Issue,User}.php` |
| Migrations | `database/migrations/2026_06_13_*` |

> **Rappel final** : iso visuel = vérité par capture/inspection DOM, pas à l'estime. Quand un doute de taille/timing existe, mesurer via Playwright `browser_evaluate` (getBoundingClientRect / getComputedStyle) avant d'ajuster.
