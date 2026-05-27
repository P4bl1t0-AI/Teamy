# Feature : Calendrier d'équipe (Congés & Présence)

**Projet** : Teamy  
**Statut** : ✅ Terminée — en production  
**Dernière mise à jour** : 2026-05-24  
**URL production** : https://teamy-beryl.vercel.app  
**Repo local** : `/home/p4bl1/projects/teamy/`

---

## 1. Résumé

Cette feature ajoute un **planning d'équipe interactif** à Teamy. Elle permet de visualiser et gérer :
- La **présence** de chaque membre (sur site / télétravail)
- Les **congés** et **arrêts maladie**
- Les **jours fériés et congés collectifs**
- Les **jours par défaut** de présence configurables par membre (Lundi–Vendredi)

La vue principale affiche **4 semaines glissantes** sous forme de tableau horizontal scrollable : les membres en lignes, les jours en colonnes.

---

## 2. Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16.2.6 (Turbopack) |
| Langage | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (theme `base-nova`) |
| Auth & DB | Supabase + `@supabase/ssr` v0.10.3 |
| Icons | lucide-react |
| Route guard | `src/proxy.ts` (pattern validé Next.js 16) |

---

## 3. Modélisation données

### Tables

#### `profiles` — membres de l'équipe
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
full_name TEXT
email TEXT
role_label TEXT
default_days JSONB        -- {"monday":"remote","tuesday":"office",...}
created_at TIMESTAMPTZ
```

#### `calendar_entries` — entrées calendrier par membre et par jour
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE
date DATE NOT NULL
presence presence_type NOT NULL  -- enum : office, remote, leave, holiday
note TEXT
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
UNIQUE(profile_id, date)
```

#### `team_holidays` — jours fériés et congés collectifs
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
date DATE NOT NULL UNIQUE
name TEXT NOT NULL
is_recurring BOOLEAN DEFAULT false  -- si true, seul MM-DD est stocké, remappé sur l'année demandée
created_at TIMESTAMPTZ DEFAULT now()
```

### Enums

- `presence_type` : `office` | `remote` | `leave` | `holiday`
- `task_status` : `todo` | `in_progress` | `done` | `cancelled`
- `task_priority` : `high` | `medium` | `low`

### Types TypeScript

- Fichier central : `src/types/index.ts` (facade qui ré-exporte tout)
- Types DB générés : `src/types/database.ts` (via `supabase gen types`)
- Alias exportés : `Profile`, `Task`, `CalendarEntry`, `TeamHoliday`, `TaskStatus`, `TaskPriority`, `PresenceType`

---

## 4. Ce qui est implémenté

### Backend
- [x] **Server Actions** (`src/app/calendar-actions.ts`) :
  - `getCalendarEntries(year, month)` — charge les entrées d'un mois
  - `getCalendarEntriesRange(startDate, endDate)` — charge un intervalle de dates (utilisé par la vue 4 semaines)
  - `setDayStatus(profileId, date, presence, note?)` — crée ou met à jour le statut d'un membre sur un jour
  - `deleteCalendarEntry(id)` — supprime une entrée
  - `getTeamHolidays(year)` — récupère les jours fériés (récurrents remappés sur l'année demandée)
  - `addTeamHoliday(date, name, isRecurring)` — ajoute un jour férié/collectif
  - `removeTeamHoliday(id)` — supprime un jour férié
  - `updateProfileDefaults(profileId, defaults)` — met à jour les jours par défaut d'un membre
  - `getProfiles()` — liste des membres

### Frontend — Composants calendrier
- [x] **`PlanningView.tsx`** — tableau 4 semaines scroll horizontal. Membres en lignes, jours en colonnes. Colonne membre fixe (`sticky left-0`). Week-ends grisés et non cliquables. Jours fériés visibles dans le header. Aujourd'hui surligné. Séparateurs de semaine.
- [x] **`CalendarGrid.tsx`** — header de navigation (semaine précédente/suivante, bouton "Aujourd'hui"), filtrage des membres par checkbox, intégration de PlanningView + légende.
- [x] **`DayEditModal.tsx`** — modal d'édition du statut d'un membre sur un jour donné. Liste tous les membres avec un Select par membre. Badge "Sauvegardé" par membre modifié. Bouton "Fermer" manuel (pas d'auto-close).
- [x] **`CompanyHolidayForm.tsx`** — formulaire de gestion des jours fériés/collectifs (date, nom, récurrent ou non).
- [x] **`CalendarLegend.tsx`** — légende des couleurs de statut.

### Frontend — Pages & Navigation
- [x] **Page `/calendrier`** — route group `(dashboard)`, sidebar navigation, fond blanc pur.
- [x] **Filtrage membres** — dropdown avec checkboxes, badge ratio sélectionné/total, boutons "Tous" / "Aucun".
- [x] **Jours par défaut** — `MemberForm.tsx` (5 selects Lundi–Vendredi lors de la création) + `MemberList.tsx` (édition inline des jours par défaut des membres existants).

### Design System
- [x] **Page `/design-system`** — documentation visuelle complète (tokens, typographie, spacing, composants, alertes, dark mode toggle).

---

## 5. Design & UX

### Couleurs des statuts (thème base-nova)

| Statut | Tailwind classes | Label UI |
|--------|-----------------|----------|
| Sur site (`office`) | `bg-emerald-100 text-emerald-800 border-emerald-300` | "Sur site" |
| Télétravail (`remote`) | `bg-blue-100 text-blue-800 border-blue-300` | "Télétravail" |
| Absence (`leave`) | `bg-amber-100 text-amber-800 border-amber-300` | "Congé" |
| Férié (`holiday`) | `bg-rose-100 text-rose-800 border-rose-300` | "Férié" |
| Non défini | `bg-gray-50 text-gray-300` | "—" |

### Layout du planning
- **4 semaines** affichées : semaine courante + 3 suivantes (28 jours)
- **Scroll horizontal** sur le tableau (`overflow-x-auto`, `min-w-[900px]`)
- **Colonne membre fixe** à gauche avec fond opaque
- **Week-ends** : fond grisé, texte grisé, non cliquables
- **Jours fériés** : nom affiché sous la date dans le header
- **Aujourd'hui** : header et cellule surlignés (`bg-primary/10` et `bg-primary/5`)
- **Clic sur jour ouvré** = ouvre `DayEditModal`

### Conventions UI globales
- **Sidebar navigation** (pas de header horizontal) — Tâches, Membres, Calendrier
- **Fond blanc pur** (`bg-background`) — pas de gris global
- **EmptyState** réutilisable sur toutes les pages vides
- **Francisation complète** — tous les textes UI en français

---

## 6. Ce qui reste à faire (backlog)

### Améliorations calendrier
- [ ] **Export PDF / iCal** du planning
- [ ] **Vue annuelle** (heatmap des présences)
- [ ] **Compteur de jours de congé** par membre sur la période affichée
- [ ] **Drag & drop** rapide pour changer le statut d'un membre
- [ ] **Navigation directe** à une date précise (date picker dans le header)
- [ ] **Notifications de conflits** (ex: 2 personnes clés en congé simultané)

### Améliorations globales UI/UX
- [ ] **Dashboard d'accueil** — métriques clés (tâches en cours, membres absents, etc.)
- [ ] **Command palette** (Cmd+K) pour navigation rapide
- [ ] **Dark mode** natif (toggle dans la sidebar)
- [ ] **Refonte TaskBoard** — cards au lieu de lignes, tags colorés, assignation visuelle
- [ ] **Animations** — transitions de page, apparition des modals
- [ ] **Responsive mobile** — sidebar devient bottom nav, cards full-width

---

## 7. Pièges connus & Rétrospective

> Lire cette section avant de toucher au code calendrier.

1. **Nom de table** : la table s'appelle `team_holidays`, pas `company_holidays`. Le plan initial avait un autre nom.
2. **Enum `presence_type`** : les valeurs sont `office`, `remote`, `leave`, `holiday` — PAS `vacation` / `sick_leave`.
3. **`default_days` est du JSONB** : pas de colonnes individuelles (`default_monday`, etc.). Format : `{"monday":"remote","tuesday":"office",...}`.
4. **Ne jamais utiliser `FormData` avec `<Select>` shadcn/ui** — le composant ne rend pas un `<select>` HTML natif. Toujours utiliser un state contrôlé (`value` + `onValueChange`).
5. **Vérifier les types générés** après chaque `supabase gen types` — les alias comme `TaskStatus` peuvent disparaître et casser le build.
6. **Jours fériés récurrents** : stockés avec année fixe en DB, mais `getTeamHolidays(year)` remappe sur l'année demandée en ne gardant que le MM-DD.
7. **Build avant de coder** — toujours lancer `npm run build` au début de session pour s'assurer que l'état de départ est clean.

---

## 8. Fichiers clés

### Nouveaux (créés pour cette feature)
```
src/app/(dashboard)/calendrier/page.tsx
src/app/calendar-actions.ts
src/components/calendar/CalendarGrid.tsx
src/components/calendar/PlanningView.tsx
src/components/calendar/DayEditModal.tsx
src/components/calendar/CompanyHolidayForm.tsx
src/components/calendar/CalendarLegend.tsx
src/components/layout/Sidebar.tsx
src/components/ui/empty-state.tsx
src/types/index.ts
```

### Modifiés (impactés par cette feature)
```
src/components/members/MemberForm.tsx       (+ jours par défaut)
src/components/members/MemberList.tsx       (+ édition inline jours par défaut)
src/app/api/members/route.ts                (+ default_days)
src/lib/constants.ts                        (+ PRESENCE_* + DAY_*)
src/types/database.ts                       (régénéré)
```

---

## 9. Config & Déploiement

### Supabase Production
- URL : `https://pvlcmthyhwssllhlibwt.supabase.co`
- Project ID : `pvlcmthyhwssllhlibwt`
- Anon Key : `sb_publishable_XOnW21KVXDCDqGykJGyHaQ_MZcN4zwo`

### Local
- Repo : `/home/p4bl1/projects/teamy/`
- `.env.local` : à jour avec les credentials ci-dessus

### Vercel
- URL prod : https://teamy-beryl.vercel.app
- Project : `no-va-s-projects/teamy`
- Env vars : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### GitHub
- User : `P4bl1t0-AI`
- Credentials : configurés dans `~/.git-credentials`

---

## 10. Checklist — Début de session

- [ ] Lire ce fichier plan
- [ ] Vérifier `src/types/database.ts` si modifications DB récentes
- [ ] Vérifier `.env.local`
- [ ] `npm run build` — s'assurer que l'état de départ est clean (0 warning)
- [ ] Après chaque fichier créé/modifié : re-build
- [ ] Mettre à jour ce plan à la fin de la session
