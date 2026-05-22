# Plan Feature : Calendrier d'équipe (Congés & Présence)

**Date** : 2026-05-23
**Statut** : 📋 Planification

---

## 1. Objectif

Créer une page calendrier visuelle permettant de :
- Visualiser et gérer les **congés** de chaque membre
- Visualiser et gérer la **présence sur site vs télétravail**
- Gérer les **jours de congés collectifs** (fériés, jours imposés)
- Paramétrer les **jours par défaut** de présence sur le profil de chaque membre

---

## 2. Modélisation données

### 2.1 Nouvelles tables

#### `company_holidays` (Congés collectifs)
```sql
CREATE TABLE public.company_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('public_holiday', 'company_day')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `calendar_entries` (Entrées calendrier par membre)
```sql
CREATE TABLE public.calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'remote', 'office', 'sick_leave')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, date)
);
```

#### Modification `profiles` (Jours par défaut)
```sql
ALTER TABLE public.profiles 
  ADD COLUMN default_monday TEXT CHECK (default_monday IN ('remote', 'office')),
  ADD COLUMN default_tuesday TEXT CHECK (default_tuesday IN ('remote', 'office')),
  ADD COLUMN default_wednesday TEXT CHECK (default_wednesday IN ('remote', 'office')),
  ADD COLUMN default_thursday TEXT CHECK (default_thursday IN ('remote', 'office')),
  ADD COLUMN default_friday TEXT CHECK (default_friday IN ('remote', 'office'));
```

### 2.2 Enums TypeScript
```typescript
export type CalendarEntryType = 'vacation' | 'remote' | 'office' | 'sick_leave'
export type CompanyHolidayType = 'public_holiday' | 'company_day'
export type WorkLocation = 'remote' | 'office'
```

---

## 3. Architecture UI

### 3.1 Page principale : `/calendrier`
- **Layout** : Vue mensuelle avec grille de jours
- **Sidebar** : Liste des membres avec couleurs
- **Légende** : Couleurs par type (congé, télétravail, site, férié)
- **Navigation** : Mois précédent/suivant, aujourd'hui

### 3.2 Composants

#### `CalendarGrid`
- Grille 7 colonnes (Lun-Dim) x 5-6 lignes
- Chaque cellule = 1 jour
- Affichage des membres sous forme de petits badges colorés
- Clic sur jour = modal d'édition

#### `DayCell`
- Numéro du jour
- Indicateur congés collectifs (bandeau rouge/orange)
- Liste des membres avec leur statut ce jour-là
- Couleurs :
  - 🟦 Télétravail
  - 🟩 Sur site
  - 🟨 Congé
  - 🟥 Arrêt maladie
  - ⬜ Non défini (utilise défaut profil)

#### `MemberDayStatus`
- Petit badge rond avec initiale + couleur de statut
- Tooltip au hover : nom complet + statut

#### `DayEditModal`
- Modal s'ouvrant au clic sur un jour
- Liste des membres avec Select pour changer le statut
- Option "Utiliser le défaut du profil"
- Sauvegarde immédiate (optimistic UI)

#### `CompanyHolidayForm`
- Formulaire pour ajouter/modifier un jour férié/collectif
- Date picker + nom + type

#### `ProfileWorkDefaults`
- Section dans la page profil/membres
- 5 selects (Lun-Ven) pour choisir remote/office
- Sauvegarde automatique

### 3.3 Navigation
- Ajouter "Calendrier" dans la nav principale
- Route : `/calendrier`

---

## 4. Server Actions

```typescript
// calendar-actions.ts
export async function getCalendarEntries(month: string, year: string)
export async function setDayStatus(profileId: string, date: string, type: CalendarEntryType | null, notes?: string)
export async function getCompanyHolidays(year: string)
export async function addCompanyHoliday(date: string, name: string, type: CompanyHolidayType)
export async function removeCompanyHoliday(id: string)
export async function updateProfileWorkDefaults(profileId: string, defaults: WorkDefaults)
```

---

## 5. Logique métier

### 5.1 Défauts profil
- Si un jour n'a pas d'entrée explicite dans `calendar_entries`, utiliser le défaut du profil
- Si pas de défaut non plus, afficher "Non défini" (gris)

### 5.2 Pré-remplissage
- Quand on change les défauts d'un profil, générer automatiquement les entrées pour les mois futurs ?
- **Non** : calculer à la volée pour éviter la duplication
- La requête SQL fera un LEFT JOIN avec les défauts du profil

### 5.3 Congés collectifs
- Affichés en priorité (bandeau en haut de la cellule)
- Empêchent toute autre entrée ce jour-là

---

## 6. Plan d'implémentation

### Phase 1 : Fondation (DB + Types)
- [ ] Créer migration `002_calendar_schema.sql`
- [ ] Générer types TypeScript (`supabase gen types`)
- [ ] Mettre à jour `src/types/database.ts`

### Phase 2 : API (Server Actions)
- [ ] Créer `src/app/calendar-actions.ts`
- [ ] Implémenter toutes les actions

### Phase 3 : Composants UI
- [ ] Créer `src/components/calendar/CalendarGrid.tsx`
- [ ] Créer `src/components/calendar/DayCell.tsx`
- [ ] Créer `src/components/calendar/DayEditModal.tsx`
- [ ] Créer `src/components/calendar/CompanyHolidayForm.tsx`
- [ ] Créer `src/components/calendar/CalendarLegend.tsx`

### Phase 4 : Page
- [ ] Créer `src/app/calendrier/page.tsx`
- [ ] Ajouter lien de navigation

### Phase 5 : Profil (défauts)
- [ ] Modifier `src/components/members/MemberForm.tsx` pour ajouter les défauts
- [ ] Modifier `src/app/membres/page.tsx` si besoin

### Phase 6 : Tests & Build
- [ ] Build local (0 warnings)
- [ ] Vérifier types TypeScript
- [ ] Pousser migration sur Supabase
- [ ] Déployer sur Vercel

---

## 7. Design visuel

### Couleurs (thème base-nova)
- Congé : `bg-amber-100 text-amber-800 border-amber-300`
- Télétravail : `bg-blue-100 text-blue-800 border-blue-300`
- Sur site : `bg-emerald-100 text-emerald-800 border-emerald-300`
- Arrêt maladie : `bg-red-100 text-red-800 border-red-300`
- Férié/Collectif : `bg-rose-100 text-rose-800 border-rose-300` (bandeau)
- Non défini : `bg-gray-50 text-gray-400`

### Layout calendrier
- Header : Mois/Année + navigation
- Grille : Jours de la semaine en header
- Cellules : Hauteur fixe (~100px), scroll interne si trop de membres
- Responsive : Scroll horizontal sur mobile

---

## 8. Checklist pré-déploiement

- [ ] Migration poussée sur Supabase
- [ ] Types TypeScript à jour
- [ ] Build local clean (0 warnings)
- [ ] Env vars Vercel à jour
- [ ] Test navigation entre pages
- [ ] Test CRUD calendrier
- [ ] Test défauts profil
