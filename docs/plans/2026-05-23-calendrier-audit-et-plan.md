# 📋 Audit & Plan — Feature Calendrier (Congés & Présence)

**Date d'audit** : 2026-05-23  
**Date de mise à jour** : 2026-05-24 (design system page + redesign planning)  
**Projet** : Teamy  
**Repo local** : `/home/p4bl1/projects/teamy/`  
**Supabase** : `https://pvlcmthyhwssllhlibwt.supabase.co`  
**Branche** : `main` (commits `873d00c` → `e31ec7b`)  
**Déploiement** : ✅ https://teamy-beryl.vercel.app

---

## 1. ÉTAT ACTUEL — Ce qui existe

### 1.1 Stack technique (LOCKÉE)
- **Framework** : Next.js 16.2.6 (Turbopack)
- **Langage** : TypeScript 5 (strict)
- **Styling** : Tailwind CSS 4 + shadcn/ui (theme `base-nova`)
- **Auth & DB** : Supabase + `@supabase/ssr` v0.10.3
- **Icons** : lucide-react
- **Route guard** : `src/proxy.ts` (pattern validé Next.js 16 — non-async, exclusions inline)
- **Server Actions** : `src/app/actions.ts` + `src/app/calendar-actions.ts`

### 1.2 Pages existantes
| Route | Description |
|-------|-------------|
| `/` | TaskBoard (tableau de tâches) |
| `/login` | Connexion |
| `/inscription` | Inscription |
| `/membres` | Liste des membres + formulaire |
| **`/calendrier`** | **Planning 4 semaines (scroll horizontal) ✅** |
| `/profil` | Profil (créé dans une autre session) |
| **`/design-system`** | **Design System — tokens, composants, patterns ✅** |

### 1.3 Schéma DB (migration 001 + 002 appliquées sur remote)

#### Tables :
- `profiles` — membres (id, user_id, full_name, email, role_label, **default_days**, created_at)
- `tasks` — tâches
- `calendar_entries` — entrées calendrier (id, profile_id, date, note, **presence** [enum], created_at, updated_at)
- **`team_holidays`** — jours fériés/collectifs (id, date, name, is_recurring, created_at)

> ⚠️ **ATTENTION** : la table s'appelle **`team_holidays`** et non `company_holidays`. Le code utilise ce nom.

#### Enums :
- `task_status` : todo, in_progress, done, cancelled
- `task_priority` : high, medium, low
- **`presence_type`** : **office, remote, leave, holiday** (PAS vacation/sick_leave)

#### Profils — IMPORTANT :
Le champ `default_days` est de type `Json | null`. Format attendu : `{"monday":"remote","tuesday":"office",...}`.

### 1.4 Types TypeScript
- Fichier : `src/types/database.ts` (généré par `supabase gen types`)
- **NOUVEAU** : `src/types/index.ts` — point d'entrée centralisé avec alias exportés :
  - `Profile`, `Task`, `CalendarEntry`, `TeamHoliday`
  - `TaskStatus`, `TaskPriority`, `PresenceType`
- **Tous les imports du projet** ont été migrés de `@/types/database` vers `@/types`

### 1.5 Composants UI
- shadcn/ui : button, card, dialog, dropdown-menu, input, label, select, separator, sonner, table, avatar, badge, **textarea, checkbox**
- Custom existants : TaskBoard, TaskForm, MemberList, MemberForm, StatusBadge, PriorityBadge
- **Calendrier** :
  - `CalendarGrid.tsx` — header nav + filtrage membres + intégration PlanningView
  - `PlanningView.tsx` — **tableau 4 semaines scroll horizontal, membres en lignes, jours en colonnes**
  - `DayEditModal.tsx` — édition du statut d'un membre sur un jour (modal persistante, badge "Sauvegardé")
  - `CompanyHolidayForm.tsx` — gestion des jours fériés
  - `CalendarLegend.tsx` — légende des couleurs
  - ~~`DayCell.tsx`~~ — supprimé (remplacé par PlanningView)
  - ~~`WeekView.tsx`~~ — supprimé (remplacé par PlanningView)
- **Design System** :
  - `DesignSystemPage.tsx` — **page complète de documentation visuelle (tokens, composants, patterns)**

### 1.6 Server Actions
- `createTask`, `updateTask`, `deleteTask` (`src/app/actions.ts`)
- **Calendrier** (`src/app/calendar-actions.ts`) :
  - `getCalendarEntries(year, month)`
  - **`getCalendarEntriesRange(startDate, endDate)`** — **nouveau : charge un intervalle de dates**
  - `setDayStatus(profileId, date, presence, note?)`
  - `deleteCalendarEntry(id)`
  - `getTeamHolidays(year)` — jours fériés récurrents remappés sur l'année demandée (MM-DD)
  - `addTeamHoliday(date, name, isRecurring)`
  - `removeTeamHoliday(id)`
  - `getProfiles()`
  - `updateProfileDefaults(profileId, defaults)`

### 1.7 Déploiement Vercel
- Projet lié (dossier `.vercel/` existe)
- **Variables d'environnement sur Vercel** : ✅ OK (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Build local : ✅ clean (0 warnings)
- Build Vercel : ✅ clean (0 warnings)

---

## 2. CE QUI MANQUAIT — Tout est ✅ FAIT

### 2.1 Backend
- [x] **Actions serveur calendrier** : `src/app/calendar-actions.ts`
  - `getCalendarEntries(year, month)`
  - `getCalendarEntriesRange(startDate, endDate)`
  - `setDayStatus(profileId, date, presence, note?)`
  - `getTeamHolidays(year)`
  - `addTeamHoliday(date, name, isRecurring)`
  - `removeTeamHoliday(id)`
  - `updateProfileDefaults(profileId, defaults)`

### 2.2 Composants UI Calendrier
- [x] `CalendarGrid.tsx` — header, nav, filtres
- [x] `PlanningView.tsx` — tableau 4 semaines scroll horizontal
- [x] `DayEditModal.tsx` — édition du statut d'un membre sur un jour
- [x] `CompanyHolidayForm.tsx` — gestion des jours fériés
- [x] `CalendarLegend.tsx` — légende des couleurs
- ~~[x] `DayCell.tsx`~~ — supprimé
- ~~[x] `WeekView.tsx`~~ — supprimé

### 2.3 Page calendrier
- [x] `src/app/calendrier/page.tsx`
- [x] Lien "Calendrier" dans Header (`Calendar` icon)

### 2.4 Paramétrage des jours par défaut
- [x] `MemberForm.tsx` — 5 selects (Lundi–Vendredi) via `default_days` JSON
- [x] `/api/members` route mis à jour pour recevoir `default_days`
- [x] Fallback `default_days` dans `PlanningView` quand pas d'entrée explicite
- [x] `MemberList.tsx` — édition inline des jours par défaut des membres existants (icône crayon)

### 2.5 Filtrage des membres sur le planning
- [x] DropdownMenu avec checkboxes par membre
- [x] Badge affichant le ratio sélectionné / total
- [x] Boutons "Tous" / "Aucun"
- [x] PlanningView synchronisé avec le filtre

### 2.6 Vue Planning (remplace mois + semaine)
- [x] **4 semaines affichées** : semaine courante + 3 suivantes (28 jours)
- [x] **Membres en lignes** — colonne fixe à gauche avec nom + initiale
- [x] **Jours en colonnes** — scroll horizontal
- [x] **Week-ends grisés** — non cliquables, texte gris
- [x] **Jours fériés** — visibles dans le header avec nom
- [x] **Aujourd'hui** — cellule et header surlignés
- [x] **Séparateurs de semaine** — bordure verticale entre les semaines
- [x] **Navigation par semaine** — ← → et bouton "Aujourd'hui"
- [x] **Clic sur jour ouvré** — ouvre `DayEditModal`

### 2.7 Corrections de bugs
- [x] Modal `DayEditModal` reste ouverte après changement (ne ferme plus `onClose` à chaque save)
- [x] Badge "Sauvegardé" par membre modifié
- [x] Bouton "Fermer" en bas de modal
- [x] Jours fériés récurrents : `getTeamHolidays` remappe les dates sur l'année demandée (MM-DD)
- [x] **Sauvegarde jours par défaut (`MemberList`) : `FormData` ne capturait pas les valeurs du `<Select>` shadcn/ui → remplacé par state contrôlé (`useState` + `value`/`onValueChange`)**

### 2.9 Design System
- [x] **Page `/design-system`** — documentation visuelle complète
- [x] **Tokens couleurs** — primaires, neutres, sémantiques, présence (Teamy)
- [x] **Typographie** — échelle de tailles, font stack, line heights
- [x] **Spacing & Radius** — visualisation des échelles
- [x] **Composants** — gallery complète (buttons, badges, cards, forms, avatars, dialog, table)
- [x] **Alertes & Feedback** — succès, info, warning, erreur
- [x] **Tokens CSS** — table de référence avec valeurs et usage
- [x] **Dark mode toggle** — preview en temps réel
- [x] **Lien dans Header** — accessible via dropdown utilisateur

#### Couleurs des statuts :
| Statut | Tailwind classes |
|--------|-----------------|
| Sur site (`office`) | `bg-emerald-100 text-emerald-800 border-emerald-300` |
| Télétravail (`remote`) | `bg-blue-100 text-blue-800 border-blue-300` |
| Absence (`leave`) | `bg-amber-100 text-amber-800 border-amber-300` |
| Férié (`holiday`) | `bg-rose-100 text-rose-800 border-rose-300` |
| Non défini | `bg-gray-50 text-gray-300` |

#### Layout Planning :
- Header : "Planning" + flèches nav semaine + bouton "Aujourd'hui" + filtre membres + légende
- Tableau scroll horizontal (`overflow-x-auto`) avec `min-w-[900px]`
- Colonne fixe gauche (Membre) : `sticky left-0` avec fond opaque
- 28 colonnes de jours : Lun→Dim × 4 semaines
- Séparateur de semaine : `border-l-2` toutes les 7 colonnes
- Week-ends : fond `bg-gray-50/50`, texte grisé, non cliquables
- Jours fériés : nom affiché sous la date dans le header
- Aujourd'hui : header `bg-primary/10`, cellule `bg-primary/5`
- Cellule jour ouvré : badge coloré avec label complet (ex: "Sur site", "Télétravail")
- Clic sur cellule jour ouvré = modal d'édition

---

## 3. PLAN D'IMPLÉMENTATION — ✅ TOUT TERMINÉ

### Phase 1 : Fondation
- [x] Migration 002 créée et poussée sur Supabase
- [x] Types TypeScript générés
- [x] Schéma DB vérifié : table = `team_holidays`, enum = `presence_type` (office/remote/leave/holiday)

### Phase 2 : Server Actions
- [x] `src/app/calendar-actions.ts` créé avec toutes les fonctions

### Phase 3 : Composants UI
- [x] `CalendarLegend`, `CalendarGrid`, `DayEditModal`, `CompanyHolidayForm`
- [x] `PlanningView.tsx` (tableau 4 semaines scroll horizontal)
- ~~[x] `DayCell.tsx`~~ — supprimé
- ~~[x] `WeekView.tsx`~~ — supprimé

### Phase 4 : Page calendrier
- [x] `src/app/calendrier/page.tsx` — charge 28 jours via `getCalendarEntriesRange`
- [x] Lien "Calendrier" dans Header (`Calendar` icon)

### Phase 5 : Jours par défaut
- [x] `MemberForm` modifié avec selects Lundi–Vendredi
- [x] Logique fallback `PlanningView` via `default_days`
- [x] `MemberList` : édition inline des jours par défaut des membres existants

### Phase 6 : Filtrage membres
- [x] DropdownMenu checkboxes dans `CalendarGrid`
- [x] Badge ratio + boutons Tous/Aucun

### Phase 7 : Vue Planning (remplace mois + semaine)
- [x] `PlanningView.tsx` créé avec tableau scroll horizontal
- [x] 4 semaines (28 jours), membres en lignes, jours en colonnes
- [x] Colonne membre sticky à gauche
- [x] Week-ends grisés, non cliquables
- [x] Jours fériés dans le header
- [x] Navigation par semaine (← → Aujourd'hui)
- [x] Clic sur jour ouvré = DayEditModal

### Phase 9 : Design System
- [x] `DesignSystemPage.tsx` créé avec documentation complète
- [x] Route `/design-system` ajoutée
- [x] Lien dans le dropdown utilisateur (Header)

### Phase 10 : Tests & Build
- [x] `npm run build` → 0 warning
- [x] Commit & push
- [x] Env vars Vercel vérifiés
- [x] Déploiement Vercel réussi

---

## 4. PIÈGES CONNUS / RETROSPECTIVE

### Erreurs à ne PAS refaire :
1. **Ne pas relire les types avant de coder** — utiliser `Json` au lieu de colonnes individuelles pour `default_days`
2. **Ne pas vérifier la DB remote avant de coder** — l'incohérence `company_holidays` vs `team_holidays`
3. **Ne pas vérifier que les types générés n'ont pas perdu des alias** — `TaskStatus`/`TaskPriority` ont disparu du `database.ts` généré, ce qui a cassé le build
4. **Coder avant d'avoir les env vars** — le `npm run build` échoue sans `NEXT_PUBLIC_SUPABASE_URL`
5. **Ne pas tester le build à chaque étape** — accumuler les erreurs TypeScript
6. **Ne pas mettre à jour le plan après chaque session** — le plan devient obsolète et induit en erreur
7. **Utiliser `new FormData()` avec des composants shadcn/ui `<Select>`** — le composant `<Select>` de shadcn/ui ne rend pas un `<select>` HTML natif. `FormData` ne capture jamais les valeurs. Toujours utiliser un state contrôlé (`value` + `onValueChange`) avec shadcn/ui Select.

### Ce qui a bien marché :
- Créer `src/types/index.ts` comme facade pour centraliser tous les types exportés
- Résoudre les conflits de merge via `git checkout --theirs` sur les nouveaux fichiers
- Supprimer le doublon `EditDayDialog.tsx` (créé dans une autre session) qui bloquait le build Vercel
- Fermer la modal manuellement (bouton "Fermer") plutôt que auto-close à chaque save — meilleure UX pour éditer plusieurs membres
- **Le redesign PlanningView** en tableau horizontal est beaucoup plus lisible que la grille mois (membres en lignes + jours en colonnes)

---

## 5. FICHIERS CRÉÉS / MODIFIÉS

### Nouveaux fichiers :
```
src/app/calendrier/page.tsx
src/app/design-system/page.tsx
src/app/calendar-actions.ts
src/components/calendar/CalendarGrid.tsx
src/components/calendar/DayEditModal.tsx
src/components/calendar/CompanyHolidayForm.tsx
src/components/calendar/CalendarLegend.tsx
src/components/calendar/PlanningView.tsx     ← tableau 4 semaines scroll horizontal
src/components/design-system/DesignSystemPage.tsx  ← documentation visuelle
src/components/ui/checkbox.tsx
src/components/ui/textarea.tsx
src/types/index.ts
```

### Fichiers modifiés :
```
src/app/actions.ts                          (import @/types)
src/app/api/members/route.ts                (+ default_days)
src/components/layout/Header.tsx            (+ lien Calendrier + Design System)
src/components/members/MemberForm.tsx       (+ selects jours par défaut)
src/components/members/MemberList.tsx       (+ édition inline jours par défaut + bugfix sauvegarde)
src/components/tasks/TaskBoard.tsx          (import @/types)
src/components/tasks/TaskForm.tsx           (import @/types)
src/components/tasks/StatusBadge.tsx        (import @/types)
src/components/tasks/PriorityBadge.tsx      (import @/types)
src/lib/constants.ts                        (+ PRESENCE_* + DAY_*)
src/lib/supabase/client.ts                  (import @/types)
src/lib/supabase/server.ts                  (import @/types)
src/types/database.ts                       (régénéré par supabase)
```

### Fichiers supprimés :
```
src/components/calendar/EditDayDialog.tsx   (doublon de DayEditModal, import cassé)
src/components/calendar/DayCell.tsx         (remplacé par PlanningView)
src/components/calendar/WeekView.tsx        (remplacé par PlanningView)
```

---

## 6. CREDENTIALS & CONFIG

### Supabase Production :
- URL : `https://pvlcmthyhwssllhlibwt.supabase.co`
- Anon Key : `sb_publishable_XOnW21KVXDCDqGykJGyHaQ_MZcN4zwo`
- Project ID : `pvlcmthyhwssllhlibwt`

### Local :
- Repo : `/home/p4bl1/projects/teamy/`
- `.env.local` : à jour avec les credentials ci-dessus

### GitHub :
- User : `P4bl1t0-AI`
- Credentials : configurés dans `~/.git-credentials`

### Vercel :
- URL prod : https://teamy-beryl.vercel.app
- Project : `no-va-s-projects/teamy`

---

## 7. NOTES POUR LA PROCHAINE SESSION

**Cette feature est TERMINÉE.** Le calendrier est en production et fonctionnel.

**Si des bugs apparaissent sur le calendrier** :
- Vérifier que `calendar_entries` contient les bonnes données (date au format ISO `YYYY-MM-DD`)
- Vérifier que le `default_days` JSON est bien parsé côté client
- Vérifier les RLS policies (tables ont `FOR ALL authenticated`)

**Améliorations futures possibles** (hors scope actuel) :
- ~~Édition des jours par défaut d'un membre existant~~ ✅ **FAIT**
- ~~Filtrage des membres affichés sur le calendrier~~ ✅ **FAIT**
- ~~Vue Planning (4 semaines scroll horizontal)~~ ✅ **FAIT**
- Export PDF/iCal du calendrier
- Vue annuelle (heatmap)
- Notifications de conflits (2 personnes en congé sur un même projet)
- Drag & drop pour changer rapidement le statut d'un membre
- Navigation directe à une date précise (date picker)
- Affichage du nombre total de jours de congé par membre sur la période

**Checklist à LIRE avant chaque session** :
- [ ] Lire ce fichier plan
- [ ] Vérifier les types DB (`src/types/database.ts`) si modifications récentes
- [ ] Vérifier que `.env.local` contient les bonnes clés
- [ ] Faire un build (`npm run build`) AVANT de coder pour s'assurer que l'état de départ est clean
- [ ] Après chaque fichier créé/modifié, re-build pour vérifier
- [ ] **Mettre à jour ce plan à la fin de chaque session**

---

## 8. DESIGN SYSTEM — Recommandations & Références

> Cette section documente les références de design modernes trouvées sur internet et les recommandations pour améliorer l'UI/UX de Teamy.

### 8.1 Références analysées

| Référence | URL | Ce qui est remarquable |
|-----------|-----|------------------------|
| **Linear** | linear.app | Dense, dark-ready, bordures ultra-fines (1px), typographie monospace pour les IDs, sidebar icon-only rétractable, command palette (Cmd+K) |
| **Vercel** | vercel.com | Fond blanc pur, cards avec ombre légère, gradients subtils, typographie bold sur les titres, espacement généreux, animations fluides |
| **shadcn Dashboard** | ui.shadcn.com/examples/dashboard | Sidebar + main content, metric cards avec sparklines, tables avec sorting/filters, tabs pour navigation secondaire |
| **Dub** | dub.co | Cards avec bordures colorées par section, typographie large et aérée, sections alternées clair/gris, testimonials intégrés |

### 8.2 Patterns communs aux designs modernes (2024-2025)

#### Layout
- **Sidebar navigation** (icon + label, rétractable) plutôt que header horizontal
- **Main content area** avec padding généreux (24-32px)
- **Cards** pour regrouper les informations (pas de fond gris global)
- **Breadcrumbs** ou header de page avec titre + actions principales

#### Couleurs
- **Fond blanc pur** (`#ffffff`) ou très légèrement teinté — pas de gris global
- **Bordures fines** (`1px solid hsl(var(--border))`) — pas de shadows lourdes
- **Accents colorés** utilisés avec parcimonie (badges, icônes, états actifs)
- **Texte hiérarchisé** : noir/gris très foncé pour les titres, gris moyen pour le corps, gris clair pour les métadonnées

#### Typographie
- **Inter** ou **Geist** (sans-serif moderne)
- **Titres** : bold (700), tracking tight (-0.02em)
- **Corps** : regular (400), line-height 1.5
- **Monospace** pour les IDs, dates techniques, code

#### Composants
- **Buttons** : radius cohérent (6-8px), pas de bordures sauf outline variant
- **Inputs** : fond blanc, bordure grise, focus ring subtil (2px primary/20%)
- **Tables** : header gris clair, lignes séparées par bordure fine, hover subtil
- **Badges** : pill shape (radius-full), couleur de fond très pâle + texte saturé

#### Micro-interactions
- **Transitions** : 150ms ease-in-out sur les états (hover, focus, active)
- **Hover cards** : légère élévation (shadow-sm) ou changement de bordure
- **Loading states** : skeleton screens plutôt que spinners
- **Empty states** : illustration + texte explicite + CTA

### 8.3 Recommandations pour Teamy

#### Prioritaire (quick wins)
- [ ] **Remplacer le fond gris global** par du blanc pur, utiliser des cards avec bordure
- [ ] **Ajouter une sidebar** à gauche (Tâches, Membres, Calendrier, Paramètres) — libérer le header
- [ ] **Uniformiser les boutons** : même radius, même padding vertical
- [ ] **Améliorer les empty states** : illustration + texte + bouton d'action

#### Moyen terme
- [ ] **Refonte du TaskBoard** : cards au lieu de lignes, tags colorés, assignation visuelle
- [ ] **Dashboard d'accueil** : métriques clés (tâches en cours, membres absents, etc.)
- [ ] **Command palette** (Cmd+K) pour navigation rapide
- [ ] **Dark mode** natif (toggle dans la sidebar)

#### Long terme
- [ ] **Animations** : transitions de page, apparition des modals, drag & drop
- [ ] **Responsive mobile** : sidebar devient bottom nav, cards full-width
- [ ] **Personnalisation** : choix de la densité (compact / confortable)

### 8.4 Ressources

- **shadcn/ui Blocks** : ui.shadcn.com/blocks — layouts prêts à l'emploi
- **Tailwind UI** : tailwindui.com — composants premium (payant)
- **Radix UI Primitives** : radix-ui.com — base accessible pour composants custom
- **Lucide Icons** : lucide.dev — icônes déjà utilisées dans le projet
