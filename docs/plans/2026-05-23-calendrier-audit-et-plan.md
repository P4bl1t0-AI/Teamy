# 📋 Audit & Plan — Feature Calendrier (Congés & Présence)

**Date d'audit** : 2026-05-23
**Projet** : Teamy
**Repo local** : `/home/p4bl1/projects/teamy/`
**Supabase** : `https://pvlcmthyhwssllhlibwt.supabase.co`
**Branche** : `main` (commit `1e72f64`)

---

## 1. ÉTAT ACTUEL — Ce qui existe déjà

### 1.1 Stack technique (LOCKÉE)
- **Framework** : Next.js 16.2.6 (Turbopack)
- **Langage** : TypeScript 5 (strict)
- **Styling** : Tailwind CSS 4 + shadcn/ui (theme `base-nova`)
- **Auth & DB** : Supabase + `@supabase/ssr` v0.10.3
- **Icons** : lucide-react
- **Route guard** : `src/proxy.ts` (pattern validé Next.js 16 — non-async, exclusions inline)
- **Server Actions** : `src/app/actions.ts`

### 1.2 Pages existantes
| Route | Description |
|-------|-------------|
| `/` | TaskBoard (tableau de tâches) |
| `/login` | Connexion |
| `/inscription` | Inscription |
| `/membres` | Liste des membres + formulaire |

### 1.3 Schéma DB (migration 001 + 002 appliquées sur remote)

#### Tables :
- `profiles` — membres (id, user_id, full_name, email, role_label, created_at)
- `tasks` — tâches (id, title, description, status, priority, assigned_to, due_date, created_by, created_at, updated_at)
- `calendar_entries` — **existe, vide** (id, profile_id, date, type [enum], note, presence [enum], created_at, updated_at)
- `company_holidays` — ** existe selon la migration 002, à vérifier dans la prochaine session**

#### Enums :
- `task_status` : todo, in_progress, done, cancelled
- `task_priority` : high, medium, low
- `calendar_entry_type` : vacation, remote, office, sick_leave
- `company_holiday_type` : public_holiday, company_day

#### Profils — IMPORTANT :
Le champ `default_days` est de type `Json | null`. **Ce n'est PAS les colonnes `default_monday`... que j'avais prévues dans une ébauche.** Cela signifie que le paramétrage des jours par défaut doit se faire via le JSON `default_days` (ex: `{"monday":"remote","tuesday":"office",...}`).

### 1.4 Types TypeScript
- Fichier : `src/types/database.ts` (généré par `supabase gen types`)
- Contient déjà les types pour `calendar_entry_type`, `company_holiday_type`, `calendar_entries`
- **À vérifier** : le type exact de `default_days` (actuellement `Json | null`)

### 1.5 Composants UI existants
- shadcn/ui : button, card, dialog, dropdown-menu, input, label, select, separator, sonner, table, avatar, badge
- Custom : TaskBoard, TaskForm, MemberList, MemberForm, StatusBadge, PriorityBadge
- **Manquant** : TOUT le calendrier

### 1.6 Server Actions existantes
- `createTask`, `updateTask`, `deleteTask` (dans `src/app/actions.ts`)
- **Manquant** : actions calendrier

### 1.7 Déploiement Vercel
- Projet lié (dossier `.vercel/` existe)
- **Variables d'environnement sur Vercel** : À VÉRIFIER dans la prochaine session (`vercel env ls`)
- Build local : ✅ clean (0 warnings)

---

## 2. CE QUI MANQUE — Travail restant

### 2.1 Backend
- [ ] **Actions serveur calendrier** : `src/app/calendar-actions.ts`
  - `getCalendarEntries(year, month)` — récupérer toutes les entrées d'un mois
  - `setDayStatus(profileId, date, type, notes?)` — définir le statut d'un jour
  - `getCompanyHolidays(year)` — récupérer les jours fériés/collectifs
  - `addCompanyHoliday(date, name, type)` — ajouter un jour férié/collectif
  - `removeCompanyHoliday(id)` — supprimer un jour férié/collectif
  - `updateProfileDefaults(profileId, defaults)` — mettre à jour les jours par défaut
- [ ] **API route** (optionnel) : si certaines données doivent être fetch côté client

### 2.2 Composants UI Calendrier
Créer dans `src/components/calendar/` :
- [ ] `CalendarGrid.tsx` — Grille mensuelle 7x5/6 avec navigation mois précédent/suivant
- [ ] `DayCell.tsx` — Cellule d'un jour avec liste des membres et leurs statuts
- [ ] `DayEditModal.tsx` — Modal pour éditer le statut de chaque membre sur un jour
- [ ] `CompanyHolidayForm.tsx` — Formulaire pour ajouter/supprimer des jours fériés/collectifs
- [ ] `CalendarLegend.tsx` — Légende des couleurs
- [ ] `ProfileWorkDefaults.tsx` — Formulaire pour éditer les jours par défaut d'un membre (intégré dans MemberForm ou page profil)

### 2.3 Page calendrier
- [ ] Créer `src/app/calendrier/page.tsx` — Page principale assemblant tous les composants
- [ ] Ajouter le lien "Calendrier" dans le Header/nav (`src/components/layout/Header.tsx`)

### 2.4 Paramétrage des jours par défaut
- [ ] Modifier `MemberForm.tsx` OU créer un composant séparé pour éditer `default_days` (JSON)
- [ ] Logique de pré-remplissage : quand on affiche un mois, si un jour n'a pas d'entrée explicite, utiliser la valeur de `default_days` pour ce jour de la semaine

### 2.5 Design visuel — Spécifications

#### Couleurs des statuts :
| Statut | Tailwind classes |
|--------|-----------------|
| Télétravail (`remote`) | `bg-blue-100 text-blue-800 border-blue-300` |
| Sur site (`office`) | `bg-emerald-100 text-emerald-800 border-emerald-300` |
| Congé (`vacation`) | `bg-amber-100 text-amber-800 border-amber-300` |
| Arrêt maladie (`sick_leave`) | `bg-red-100 text-red-800 border-red-300` |
| Non défini (utilise défaut) | `bg-gray-50 text-gray-400` |
| Jour férié/collectif | Bandeau `bg-rose-100 text-rose-800` en haut de cellule |

#### Layout calendrier :
- Header : Mois/Année + flèches nav + bouton "Aujourd'hui"
- Jours de la semaine : Lun, Mar, Mer, Jeu, Ven, Sam, Dim
- Cellules : hauteur fixe ~120px, scroll interne si beaucoup de membres
- Chaque cellule montre les membres sous forme de petits badges ronds (initiale + couleur)
- Clic sur un jour = ouverture du `DayEditModal`
- Survol (tooltip) = nom complet + statut détaillé

---

## 3. PLAN D'IMPLÉMENTATION — Ordre recommandé

### Phase 1 : Fondation (déjà partiellement faite)
- ✅ Migration 002 créée et poussée sur Supabase
- ✅ Types TypeScript générés
- ⏳ **À vérifier** : s'assurer que `company_holidays` existe bien sur la DB (l'erreur API mentionnait `team_holidays`)
  - Si `company_holidays` n'existe pas : corriger la migration ou adapter le code
  - Si `team_holidays` existe à la place : utiliser ce nom de table

### Phase 2 : Server Actions
1. Créer `src/app/calendar-actions.ts` avec toutes les fonctions listées en 2.1
2. Tester localement (via `console.log` ou appels directs)

### Phase 3 : Composants UI (basiques)
1. `CalendarLegend` — simple, pas de dépendances
2. `DayCell` — affiche un jour avec des données mockées
3. `CalendarGrid` — assemblage de DayCell en grille mensuelle
4. `DayEditModal` — formulaire pour changer le statut d'un membre un jour donné
5. `CompanyHolidayForm` — formulaire pour les jours fériés

### Phase 4 : Page calendrier
1. `src/app/calendrier/page.tsx` — page serveur qui fetch les données et passe aux composants
2. Ajouter le lien dans le Header

### Phase 5 : Jours par défaut (profil)
1. Modifier `MemberForm.tsx` pour ajouter les selects Lundi-Vendredi
2. Stocker dans `default_days` (JSON) via `updateProfileDefaults`
3. Modifier la logique d'affichage du calendrier pour utiliser les défauts quand pas d'entrée explicite

### Phase 6 : Tests & Build
1. `npm run build` → doit être 0 warning
2. Vérifier TypeScript (`npx tsc --noEmit`)
3. Test navigation entre pages
4. Commit & push
5. Vérifier env vars Vercel (`vercel env ls`)
6. Déployer (`vercel --prod`)

---

## 4. PIÈGES CONNUS / RETROSPECTIVE

### Erreurs à ne PAS refaire :
1. **Ne pas relire les types avant de coder** — utiliser `Json` au lieu de colonnes individuelles pour `default_days`
2. **Ne pas vérifier la DB remote avant de coder** — l'incohérence `company_holidays` vs `team_holidays`
3. **Coder avant d'avoir les env vars** — le `npm run build` échoue sans `NEXT_PUBLIC_SUPABASE_URL`
4. **Ne pas tester le build à chaque étape** — accumuler les erreurs TypeScript

### Checklist à LIRE avant chaque session :
- [ ] Lire ce fichier plan
- [ ] Vérifier les types DB (`src/types/database.ts`) si modifications récentes
- [ ] Vérifier que `.env.local` contient les bonnes clés
- [ ] Faire un build (`npm run build`) AVANT de coder pour s'assurer que l'état de départ est clean
- [ ] Après chaque fichier créé/modifié, re-build pour vérifier

---

## 5. FICHIERS À CRÉER / MODIFIER

### Nouveaux fichiers :
```
src/app/calendrier/page.tsx
src/app/calendar-actions.ts
src/components/calendar/CalendarGrid.tsx
src/components/calendar/DayCell.tsx
src/components/calendar/DayEditModal.tsx
src/components/calendar/CompanyHolidayForm.tsx
src/components/calendar/CalendarLegend.tsx
```

### Fichiers à modifier :
```
src/components/layout/Header.tsx          (ajouter lien Calendrier)
src/components/members/MemberForm.tsx     (ajouter jours par défaut)
src/types/database.ts                     (si ajout de types manquants — mais normalement gen types suffit)
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
- Credentials : configurés dans `~/.git-credentials` (ne pas redemander)

### Supabase CLI :
- Nécessite `SUPABASE_ACCESS_TOKEN` pour les opérations remote
- Configuré pour les migrations auto-deploy via GitHub Actions

---

## 7. NOTES POUR LA PROCHAINE SESSION

**Tâche à faire en premier** :
1. Vérifier l'exactitude du schéma DB (tables réelles vs migration 002)
2. Lire `src/types/database.ts` pour confirmer les types exacts
3. Puis suivre l'ordre Phase 2 → 3 → 4 → 5 → 6

**Si le calendrier bug** :
- Vérifier que `calendar_entries` contient les bonnes données (date au format ISO `YYYY-MM-DD`)
- Vérifier que le `default_days` JSON est bien parsé côté client
- Vérifier les RLS policies (les tables ont `FOR ALL authenticated` donc ok)

**Ne PAS oublier** :
- Build à 0 warnings AVANT commit
- Commit message conventionnel (ex: `feat(calendar): add calendar grid component`)
- Mettre à jour ce fichier plan à chaque avancée significative
