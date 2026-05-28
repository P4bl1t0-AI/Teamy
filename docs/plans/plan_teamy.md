# Plan Teamy — Vue d'ensemble projet

**Projet** : Teamy  
**Statut** : ✅ En production — itération continue  
**Dernière mise à jour** : 2026-05-28  
**URL production** : https://teamy-beryl.vercel.app  
**Repo local** : `/home/p4bl1/projects/teamy/`

---

## 1. Résumé

Teamy est une **app web de gestion d'équipe** (Next.js 16 + Supabase) qui centralise :
- **Tâches** — gestion collaborative avec vue Liste et **vue Kanban** (drag & drop)
- **Membres** — gestion et jours de présence par défaut
- **Calendrier** — planning interactif 4 semaines (présence, congés, fériés)

---

## 2. Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16.2.6 (Turbopack, App Router) |
| Langage | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (theme `base-nova`, pas Radix) |
| Auth & DB | Supabase + `@supabase/ssr` v0.10.3 |
| Icons | lucide-react |
| DnD | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Route guard | `src/proxy.ts` (pattern validé Next.js 16 — non async) |

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

#### `tasks`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
title TEXT NOT NULL
description TEXT
status task_status DEFAULT 'todo'
priority task_priority DEFAULT 'medium'
assigned_to UUID REFERENCES profiles(id)
due_date DATE
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

#### `task_comments` — historique des commentaires sur les tâches
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
content TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
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
is_recurring BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT now()
```

### Enums

- `presence_type` : `office` | `remote` | `leave` | `holiday`
- `task_status` : `todo` | `in_progress` | `done` | `cancelled`
- `task_priority` : `high` | `medium` | `low`

### Types TypeScript

- Facade : `src/types/index.ts`
- Types DB générés : `src/types/database.ts` (via `supabase gen types`)
- Alias exportés : `Profile`, `Task`, `TaskComment`, `CalendarEntry`, `TeamHoliday`, `TaskStatus`, `TaskPriority`, `PresenceType`

---

## 4. Ce qui est implémenté

### Pages & Navigation
- [x] **Dashboard personnel** (`/`) — calendrier 90 jours + tâches perso + métriques
- [x] Page `/taches` — Tâches de l'équipe (vue Liste + Kanban)
- [x] Page `/membres` — gestion des membres
- [x] Page `/calendrier` — planning 4 semaines collectif
- [x] Page `/profil` — édition du profil
- [x] Sidebar navigation : Dashboard, Tâches, Membres, Calendrier
- [x] Design System (`/design-system`) — tokens, composants, dark mode

### Gestion des tâches
- [x] **Vue Liste** — tableau avec filtres (recherche, statut, priorité, assigné)
- [x] **Vue Kanban** — matrice membres × statuts avec cartes post-it
  - Drag & drop : assignation entre membres + changement de statut
  - Limite WIP : max 3 tâches À faire/En cours par membre (bloquée avec toast explicatif)
  - Réouverture contrôlée : Terminé → À faire/En cours demande un commentaire obligatoire
  - Toggle Liste / Kanban dans le header de TaskBoard
- [x] Modal détail tâche — statut, priorité, assigné, échéance, description, historique de commentaires
- [x] Création / Édition / Suppression de tâches
- [x] Server Actions (`src/app/actions.ts`) : `createTask`, `updateTask`, `deleteTask`, `updateTaskQuick`, `addTaskComment`, `getTaskComments`

### Gestion des membres
- [x] Liste des membres avec édition inline des jours par défaut
- [x] Formulaire avec jours par défaut Lundi–Vendredi (office/remote)

### Calendrier d'équipe
- [x] Planning 4 semaines glissantes — membres en lignes, jours en colonnes
- [x] Colonne membre fixe, week-ends grisés, jours fériés visibles, jour courant surligné
- [x] Modal d'édition par jour (multi-membres)
- [x] Gestion des jours fériés / collectifs (récurrents ou non)
- [x] Server Actions (`src/app/calendar-actions.ts`) : `getCalendarEntriesRange`, `setDayStatus`, `getTeamHolidays`, etc.

---

## 5. Design & UX

### Couleurs des statuts tâches

| Statut | Badge couleur |
|--------|---------------|
| À faire (`todo`) | Ambre |
| En cours (`in_progress`) | Bleu |
| Terminé (`done`) | Vert |
| Annulé (`cancelled`) | Gris |

### Couleurs des priorités

| Priorité | Badge couleur |
|----------|---------------|
| Haute (`high`) | Rouge |
| Moyenne (`medium`) | Orange |
| Basse (`low`) | Vert |

### Couleurs présence (calendrier)

| Statut | Classes Tailwind | Label UI |
|--------|-----------------|----------|
| Sur site (`office`) | `bg-emerald-100 text-emerald-800 border-emerald-300` | "Sur site" |
| Télétravail (`remote`) | `bg-blue-100 text-blue-800 border-blue-300` | "Télétravail" |
| Absence (`leave`) | `bg-amber-100 text-amber-800 border-amber-300` | "Congé" |
| Férié (`holiday`) | `bg-rose-100 text-rose-800 border-rose-300` | "Férié" |
| Non défini | `bg-gray-50 text-gray-300` | "—" |

### Conventions UI globales
- **Sidebar navigation** (pas de header horizontal)
- **Fond blanc pur** (`bg-background`) — pas de gris global
- **EmptyState** réutilisable sur toutes les pages vides
- **Francisation complète** — tous les textes UI en français
- **Build 0 warning** avant chaque commit

---

## 6. Ce qui reste à faire (backlog)

### Tâches
- [ ] Ajouter les tags/catégories de tâches
- [ ] Temps passé sur chaque tâche (tracking)
- [ ] Vue Timeline / Gantt des tâches
- [ ] Notifications (nouvelle tâche assignée, échéance proche)

### Calendrier
- [ ] Export PDF / iCal du planning
- [ ] Vue annuelle (heatmap des présences)
- [ ] Compteur de jours de congé par membre sur la période affichée
- [ ] Drag & drop rapide sur le calendrier (pas les tâches)
- [ ] Navigation directe à une date précise (date picker)
- [ ] Notifications de conflits (2 personnes clés en congé simultané)

### Global
- [x] Dashboard d'accueil — métriques clés (implémenté sur `/`)
- [ ] Command palette (Cmd+K)
- [ ] Dark mode natif
- [ ] Responsive mobile (bottom nav, cards full-width)
- [ ] Animations — transitions de page, apparition des modals

---

## 7. Pièges connus & Rétrospective

1. **Nom de table holidays** : `team_holidays`, pas `company_holidays`.
2. **Enum `presence_type`** : valeurs `office`, `remote`, `leave`, `holiday` — PAS `vacation` / `sick_leave`.
3. **`default_days` est du JSONB** : pas de colonnes individuelles. Format : `{"monday":"remote","tuesday":"office",...}`.
4. **Ne jamais utiliser `FormData` avec `<Select>` shadcn/ui** — toujours state contrôlé (`value` + `onValueChange`).
5. **Vérifier les types générés** après chaque `supabase gen types` — les alias comme `TaskStatus` peuvent disparaître et casser le build.
6. **Jours fériés récurrents** : stockés avec année fixe en DB, mais `getTeamHolidays(year)` remappe sur l'année demandée.
7. **Build avant de coder** — toujours lancer `npm run build` au début de session pour s'assurer que l'état de départ est clean.
8. **Proxy Next.js 16** : `src/proxy.ts` — pas de `export const config`, auth check via `Promise`, pas `async`.
9. **PersonalCalendar** : structure tableau HTML doit avoir le même nombre de colonnes dans `<thead>` et `<tbody>`. Header avec 90 colonnes + body avec 7 colonnes = affichage compressé/cassé. Solution : colonnes fixes (semaine + 7 jours) avec semaines en lignes.
10. **Plan comme source de vérité** — ce fichier est le plan canonique. Mettre à jour à chaque session.

---

## 8. Fichiers clés

### Architecture
```
src/
  app/
    actions.ts                # Server Actions tâches
    calendar-actions.ts       # Server Actions calendrier
    (dashboard)/
      page.tsx                # Dashboard personnel (/)
      taches/page.tsx         # Tâches équipe (liste + kanban)
      calendrier/page.tsx     # Calendrier
      membres/page.tsx        # Membres
      profil/page.tsx         # Profil
    proxy.ts                  # Route guard (non async)
  components/
    layout/Sidebar.tsx        # Navigation
    dashboard/
      DashboardView.tsx       # Dashboard personnel (calendrier + tâches + métriques)
      PersonalCalendar.tsx    # Calendrier 90 jours (tableau semaines × 7 jours)
      DashboardTaskColumns.tsx # Colonnes tâches perso (À faire / En cours / Terminé)
      DashboardTaskCard.tsx   # Carte tâche enrichie (retard, échéance, commentaires)
    tasks/
      TaskBoard.tsx           # Toggle Liste / Kanban + filtres
      TaskKanbanBoard.tsx     # Logique DnD + modals
      KanbanRow.tsx           # Ligne membre (colonnes × statuts)
      KanbanColumn.tsx        # Colne statut (drop zone)
      TaskCard.tsx            # Carte post-it (draggable)
      TaskDetailModal.tsx     # Détail + historique commentaires
      ReopenDialog.tsx        # Dialog réouverture avec commentaire obligatoire
      TaskForm.tsx            # Création / édition tâche
      StatusBadge.tsx
      PriorityBadge.tsx
    members/
      MemberForm.tsx          # Création membre (+ jours par défaut)
      MemberList.tsx          # Liste + édition inline
    calendar/
      CalendarGrid.tsx        # Vue calendrier (header + grille)
      PlanningView.tsx        # Grille 4 semaines
      DayEditModal.tsx        # Édition multi-membres par jour
      CompanyHolidayForm.tsx  # Gestion jours fériés
      CalendarLegend.tsx      # Légende couleurs
  types/
    index.ts                  # Facade
    database.ts               # Types générés Supabase
  lib/
    constants.ts              # Labels, mappings
    supabase/
      server.ts               # Client SSR
      middleware.ts           # Middleware
  middleware.ts               # Next.js middleware (auth)
```

### Migrations DB
```
supabase/migrations/
  001_initial_schema.sql      # profiles, tasks, auth
  002_calendar_schema.sql     # calendar_entries, team_holidays, presence_type
  003_task_comments.sql       # task_comments, RLS
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
- Routes : `/` (dashboard), `/taches`, `/membres`, `/calendrier`, `/profil`

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
