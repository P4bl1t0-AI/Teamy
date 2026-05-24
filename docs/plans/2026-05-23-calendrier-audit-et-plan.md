# 📋 Audit & Plan — Feature Calendrier (Congés & Présence)

**Date d'audit** : 2026-05-23  
**Date de mise à jour** : 2026-05-24 (session en cours)  
**Projet** : Teamy  
**Repo local** : `/home/p4bl1/projects/teamy/`  
**Supabase** : `https://pvlcmthyhwssllhlibwt.supabase.co`  
**Branche** : `main` (commits `873d00c`, `91d8ee7`, `2124548`, `56baf18`, `cd8f75f`)  
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
| **`/calendrier`** | **Calendrier congés & présence ✅** |
| `/profil` | Profil (créé dans une autre session) |

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
  - `CalendarGrid.tsx` — grille mensuelle avec nav + **filtrage membres + toggle Mois/Semaine**
  - `DayCell.tsx` — cellule jour avec badges membres
  - `DayEditModal.tsx` — édition du statut d'un membre sur un jour (modal persistante, badge "Sauvegardé")
  - `CompanyHolidayForm.tsx` — gestion des jours fériés
  - `CalendarLegend.tsx` — légende des couleurs
  - **`WeekView.tsx`** — **vue semaine alternative sous forme de tableau**

### 1.6 Server Actions
- `createTask`, `updateTask`, `deleteTask` (`src/app/actions.ts`)
- **Calendrier** (`src/app/calendar-actions.ts`) :
  - `getCalendarEntries(year, month)`
  - `setDayStatus(profileId, date, presence, note?)`
  - `deleteCalendarEntry(id)`
  - `getTeamHolidays(year)` — **jours fériés récurrents remappés sur l'année demandée (MM-DD)**
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
  - `setDayStatus(profileId, date, presence, note?)`
  - `getTeamHolidays(year)`
  - `addTeamHoliday(date, name, isRecurring)`
  - `removeTeamHoliday(id)`
  - `updateProfileDefaults(profileId, defaults)`

### 2.2 Composants UI Calendrier
- [x] `CalendarGrid.tsx`
- [x] `DayCell.tsx`
- [x] `DayEditModal.tsx`
- [x] `CompanyHolidayForm.tsx`
- [x] `CalendarLegend.tsx`
- [x] **`WeekView.tsx`** (vue semaine)

### 2.3 Page calendrier
- [x] `src/app/calendrier/page.tsx`
- [x] Lien "Calendrier" dans Header (`Calendar` icon)

### 2.4 Paramétrage des jours par défaut
- [x] `MemberForm.tsx` — 5 selects (Lundi–Vendredi) via `default_days` JSON
- [x] `/api/members` route mis à jour pour recevoir `default_days`
- [x] Fallback `default_days` dans `DayCell` quand pas d'entrée explicite
- [x] **`MemberList.tsx` — édition inline des jours par défaut des membres existants (icône crayon)**

### 2.5 Filtrage des membres sur le calendrier
- [x] DropdownMenu avec checkboxes par membre
- [x] Badge affichant le ratio sélectionné / total
- [x] Boutons "Tous" / "Aucun"
- [x] Grille et vue semaine synchronisées avec le filtre

### 2.6 Vue semaine alternative
- [x] Toggle Mois / Semaine avec navigation synchronisée
- [x] Tableau des 7 jours avec badges membres
- [x] Clic sur cellule semaine ouvre `DayEditModal`

### 2.7 Corrections de bugs (commit `56baf18`)
- [x] Modal `DayEditModal` reste ouverte après changement (ne ferme plus `onClose` à chaque save)
- [x] Badge "Sauvegardé" par membre modifié
- [x] Bouton "Fermer" en bas de modal
- [x] Jours fériés récurrents : `getTeamHolidays` remappe les dates sur l'année demandée (MM-DD)

### 2.8 Design visuel — Spécifications

#### Couleurs des statuts :
| Statut | Tailwind classes |
|--------|-----------------|
| Sur site (`office`) | `bg-emerald-100 text-emerald-800 border-emerald-300` |
| Télétravail (`remote`) | `bg-blue-100 text-blue-800 border-blue-300` |
| Absence (`leave`) | `bg-amber-100 text-amber-800 border-amber-300` |
| Férié (`holiday`) | `bg-rose-100 text-rose-800 border-rose-300` |
| Non défini | `bg-gray-50 text-gray-400` |
| Jour férié/collectif | Bandeau `bg-rose-100 text-rose-800` en haut de cellule |

#### Layout calendrier :
- Header : Mois/Année + flèches nav + bouton "Aujourd'hui" + **toggle Mois/Semaine**
- **Filtre membres** : DropdownMenu avec checkboxes + badge ratio
- Jours de la semaine : Lun, Mar, Mer, Jeu, Ven, Sam, Dim
- Cellules : hauteur fixe ~120px
- Badges ronds avec initiale + couleur par membre
- Clic = modal d'édition
- Survol = tooltip nom + statut

---

## 3. PLAN D'IMPLÉMENTATION — ✅ TOUT TERMINÉ

### Phase 1 : Fondation
- [x] Migration 002 créée et poussée sur Supabase
- [x] Types TypeScript générés
- [x] Schéma DB vérifié : table = `team_holidays`, enum = `presence_type` (office/remote/leave/holiday)

### Phase 2 : Server Actions
- [x] `src/app/calendar-actions.ts` créé avec toutes les fonctions

### Phase 3 : Composants UI
- [x] `CalendarLegend`, `DayCell`, `CalendarGrid`, `DayEditModal`, `CompanyHolidayForm`
- [x] `WeekView.tsx` (vue semaine)

### Phase 4 : Page calendrier
- [x] `src/app/calendrier/page.tsx` + lien Header

### Phase 5 : Jours par défaut
- [x] `MemberForm` modifié avec selects Lundi–Vendredi
- [x] Logique fallback `DayCell` via `default_days`
- [x] `MemberList` : édition inline des jours par défaut des membres existants

### Phase 6 : Filtrage membres
- [x] DropdownMenu checkboxes dans `CalendarGrid`
- [x] Badge ratio + boutons Tous/Aucun

### Phase 7 : Vue semaine
- [x] `WeekView.tsx` créé
- [x] Toggle Mois/Semaine dans `CalendarGrid`

### Phase 8 : Tests & Build
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

### Ce qui a bien marché :
- Créer `src/types/index.ts` comme facade pour centraliser tous les types exportés
- Résoudre les conflits de merge via `git checkout --theirs` sur les nouveaux fichiers
- Supprimer le doublon `EditDayDialog.tsx` (créé dans une autre session) qui bloquait le build Vercel
- Fermer la modal manuellement (bouton "Fermer") plutôt que auto-close à chaque save — meilleure UX pour éditer plusieurs membres

---

## 5. FICHIERS CRÉÉS / MODIFIÉS

### Nouveaux fichiers :
```
src/app/calendrier/page.tsx
src/app/calendar-actions.ts
src/components/calendar/CalendarGrid.tsx
src/components/calendar/DayCell.tsx
src/components/calendar/DayEditModal.tsx
src/components/calendar/CompanyHolidayForm.tsx
src/components/calendar/CalendarLegend.tsx
src/components/calendar/WeekView.tsx          ← vue semaine
src/components/ui/checkbox.tsx
src/components/ui/textarea.tsx
src/types/index.ts
```

### Fichiers modifiés :
```
src/app/actions.ts                          (import @/types)
src/app/api/members/route.ts                (+ default_days)
src/components/layout/Header.tsx            (+ lien Calendrier)
src/components/members/MemberForm.tsx       (+ selects jours par défaut)
src/components/members/MemberList.tsx       (+ édition inline jours par défaut)
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
- ~~Vue semaine alternative~~ ✅ **FAIT**
- Export PDF/iCal du calendrier
- Vue liste alternative
- Notifications de conflits (2 personnes en congé sur un même projet)
- Drag & drop pour changer rapidement le statut d'un membre
- Vue annuelle (heatmap)

**Checklist à LIRE avant chaque session** :
- [ ] Lire ce fichier plan
- [ ] Vérifier les types DB (`src/types/database.ts`) si modifications récentes
- [ ] Vérifier que `.env.local` contient les bonnes clés
- [ ] Faire un build (`npm run build`) AVANT de coder pour s'assurer que l'état de départ est clean
- [ ] Après chaque fichier créé/modifié, re-build pour vérifier
- [ ] **Mettre à jour ce plan à la fin de chaque session**
