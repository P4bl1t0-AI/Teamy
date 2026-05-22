# 📅 Calendrier d'equipe — Plan d'implémentation (v2 CORRIGE)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Ajouter une page calendrier pour visualiser et gerer les congés, teletravail et presence sur site de chaque membre de l'equipe, avec pre-remplissage intelligent depuis les parametres de profil.

**Architecture:** Vue calendrier mensuelle en grille visuelle (lignes = membres, colonnes = jours). Les presences quotidiennes se basent sur les jours par defaut du profil mais restent modifiables. Les congés collectifs (jours feries, fermeture) s'appliquent a tous.

**Tech Stack:** Next.js 16 App Router, Supabase SSR, shadcn/ui (`base-nova`), Tailwind CSS v4, Lucide React

---

## Contexte du projet

Le projet Teamy utilise deja :
- Auth Supabase avec route guard `src/proxy.ts` (pattern synchronesupabase-auth valide)
- Tables `profiles` et `tasks` avec RLS
- Composants shadcn/ui existants
- Pattern de données : client supabase pour les composants client, server client pour les Server Components

**Patterns a respecter :**
- Proxy route guard non-async, static exclusions inline (Next.js 16)
- Composants client marques `'use client'`
- Types Supabase dans `src/types/database.ts`
- Pas de `export const config`
- Migrations dans `supabase/migrations/`
- Build zero-warning obligatoire a chaque etape

---

## Vue d'ensemble des taches

| # | Tache | Fichiers touches | Estime |
|---|-------|-----------------|--------|
| 1 | Migration DB — Schema calendrier | `supabase/migrations/002_calendar_schema.sql` | 10 min |
| 2 | Mise a jour types TypeScript | `src/types/database.ts` | 5 min |
| 3 | Page calendrier (structure) | `src/app/calendrier/page.tsx` | 10 min |
| 4 | Composant CalendarGrid | `src/components/calendar/CalendarGrid.tsx` | 15 min |
| 5 | Composant CalendarLegend | `src/components/calendar/CalendarLegend.tsx` | 10 min |
| 6 | Composant DayCell (cellule cliquable) | `src/components/calendar/DayCell.tsx` | 15 min |
| 7 | Composant EditDayDialog | `src/components/calendar/EditDayDialog.tsx` | 15 min |
| 8 | Hook useCalendar | `src/hooks/useCalendar.ts` | 15 min |
| 9 | Page profil — Parametres jours defaut | `src/app/profil/page.tsx` | 15 min |
| 10 | Composant DefaultDaysForm | `src/components/profile/DefaultDaysForm.tsx` | 15 min |
| 11 | API route admin congés collectifs | `src/app/api/holidays/route.ts` | 10 min |
| 12 | Composant TeamHolidaysManager | `src/components/admin/TeamHolidaysManager.tsx` | 15 min |
| 13 | Mise a jour Header + navigation | `src/components/layout/Header.tsx` | 5 min |
| 14 | Build sans warnings + verification | — | 10 min |

---

## Schema de donnees

### `presence_type` ENUM

```sql
CREATE TYPE public.presence_type AS ENUM ('office', 'remote', 'leave', 'holiday');
```

Valeurs :
- `office` = Present sur site
- `remote` = Teletravail
- `leave` = Conges individuel
- `holiday` = Conge collectif (jours feries, fermeture)

### Nouvelle table : `calendar_entries`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID PK | Identifiant unique |
| `profile_id` | UUID FK → profiles | Le membre concerne |
| `date` | DATE | Jour (YYYY-MM-DD) |
| `presence` | presence_type | Type de presence |
| `note` | TEXT | Note optionnelle |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto |

Unicite : `(profile_id, date)`
Index : `idx_calendar_date`, `idx_calendar_profile`
Trigger : reutiliser `set_updated_at()`
RLS : SELECT/INSERT/UPDATE/DELETE pour authenticated

### Nouvelle table : `team_holidays`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID PK | Identifiant unique |
| `name` | TEXT | Nom du jour ferie |
| `date` | DATE | Jour concerne |
| `is_recurring` | BOOLEAN | Recurrent chaque annee |
| `created_at` | TIMESTAMPTZ | Auto |

Index : `idx_team_holidays_date`
RLS : SELECT pour authenticated, INSERT/UPDATE/DELETE pour authenticated (comme tasks)

### Modification table `profiles`

Ajouter `default_days JSONB DEFAULT '{}'` :

```json
{"monday": "office", "tuesday": "remote", "wednesday": "remote", "thursday": "remote", "friday": "office", "saturday": null, "sunday": null}
```

---

## Design UI / UX

### Palette de couleurs

| Statut | Couleur | Classe Tailwind | Icone Lucide |
|--------|---------|-----------------|--------------|
| Office (site) | Bleu | `bg-blue-100 text-blue-700 border-blue-200` | `Building2` |
| Remote (TT) | Violet | `bg-violet-100 text-violet-700 border-violet-200` | `Home` |
| Leave (conges) | Vert | `bg-emerald-100 text-emerald-700 border-emerald-200` | `Umbrella` |
| Holiday (ferie) | Rouge | `bg-red-100 text-red-700 border-red-200` | `CalendarX` |
| Non defini | Gris clair | `bg-slate-50 text-slate-400 border-slate-200` | `Minus` |

### Vue calendrier

- En-tete : Mois/Annee avec navigation fleches
- Lignes : Chaque membre de l'equipe (trie alphabetique)
- Colonnes : Jours du mois (1-31)
- Cellules : Carre colore selon le statut, clic pour modifier
- Aujourd'hui : Bordure speciale sur la colonne
- Week-end : Colonnes legerement grisees
- Jours feries : Toute la colonne en rouge

### Interactions

- Clic cellule : Dialog d'edition (Site / TT / Conges + note + Reinitialiser)
- Navigation mois : fleches ou selecteur rapide
- Profil : formulaire jours par defaut (Lundi-Dimanche)

---

## Taches detaillees

---

### Task 1: Migration DB — Schema calendrier

**Objectif:** Creer la migration SQL pour toutes les tables du calendrier.

**Fichiers:**
- Creer : `supabase/migrations/002_calendar_schema.sql`

**Step 1: Ecrire la migration**

```sql
-- Enum pour les types de presence
CREATE TYPE public.presence_type AS ENUM ('office', 'remote', 'leave', 'holiday');

-- Table calendar_entries : une entree par personne et par jour
CREATE TABLE public.calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  presence public.presence_type NOT NULL DEFAULT 'office',
  note TEXT CHECK (char_length(note) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, date)
);

-- Index pour les requetes calendrier
CREATE INDEX idx_calendar_date ON public.calendar_entries(date);
CREATE INDEX idx_calendar_profile ON public.calendar_entries(profile_id);
CREATE INDEX idx_calendar_profile_date ON public.calendar_entries(profile_id, date);

-- Trigger updated_at (reutiliser la fonction existante)
CREATE TRIGGER on_calendar_entries_updated
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS calendar_entries
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_select" ON public.calendar_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "calendar_insert" ON public.calendar_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "calendar_update" ON public.calendar_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "calendar_delete" ON public.calendar_entries FOR DELETE TO authenticated USING (true);

-- Table team_holidays : jours feries et fermetures
CREATE TABLE public.team_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_holidays_date ON public.team_holidays(date);

-- RLS team_holidays
ALTER TABLE public.team_holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_holidays_select" ON public.team_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_holidays_insert" ON public.team_holidays FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_holidays_update" ON public.team_holidays FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_holidays_delete" ON public.team_holidays FOR DELETE TO authenticated USING (true);

-- Ajouter default_days a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_days JSONB DEFAULT '{}';
```

**Step 2: Verifier la syntaxe**

Run: `head -30 supabase/migrations/002_calendar_schema.sql`
Expected: Contenu de la migration correct

**Step 3: Commit**

```bash
git add supabase/migrations/002_calendar_schema.sql
git commit -m "feat(calendrier): add calendar schema migration"
```

---

### Task 2: Mise a jour types TypeScript

**Objectif:** Mettre a jour `src/types/database.ts` avec les nouvelles tables et enums.

**Fichiers:**
- Modifier : `src/types/database.ts`

**ATTENTION IMPORTANTE :**
- Les types `CalendarEntry` et `TeamHoliday` doivent etre exportes a la fin du fichier.
- Utiliser exactement la meme structure que `Profile` et `Task` existants.
- Ajouter les exports : `export type CalendarEntry = Database["public"]["Tables"]["calendar_entries"]["Row"]` et `export type TeamHoliday = Database["public"]["Tables"]["team_holidays"]["Row"]`

**Step 1: Lire le fichier existant**

```bash
head -30 src/types/database.ts
```

**Step 2: Ajouter les nouvelles tables dans Database.public.Tables**

Ajouter avant le `}` fermant de `Tables` :

```typescript
calendar_entries: {
  Row: {
    id: string
    profile_id: string
    date: string
    presence: Database["public"]["Enums"]["presence_type"]
    note: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    profile_id: string
    date: string
    presence?: Database["public"]["Enums"]["presence_type"]
    note?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    profile_id?: string
    date?: string
    presence?: Database["public"]["Enums"]["presence_type"]
    note?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "calendar_entries_profile_id_fkey"
      columns: ["profile_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}
team_holidays: {
  Row: {
    id: string
    name: string
    date: string
    is_recurring: boolean
    created_at: string
  }
  Insert: {
    id?: string
    name: string
    date: string
    is_recurring?: boolean
    created_at?: string
  }
  Update: {
    id?: string
    name?: string
    date?: string
    is_recurring?: boolean
    created_at?: string
  }
  Relationships: []
}
```

**Step 3: Ajouter `presence_type` dans Enums**

```typescript
presence_type: "office" | "remote" | "leave" | " holiday"
```

**Step 4: Mettre a jour Constants et exports**

Dans `Constants.public.Enums`, ajouter :
```typescript
presence_type: ["office", "remote", "leave", "holiday"]
```

A la fin du fichier, ajouter les exports :
```typescript
export type PresenceType = Database["public"]["Enums"]["presence_type"]
export type CalendarEntry = Database["public"]["Tables"]["calendar_entries"]["Row"]
export type TeamHoliday = Database["public"]["Tables"]["team_holidays"]["Row"]
```

**Step 5: Verifier**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: Pas d'erreurs de type supplementaires

**Step 6: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(calendrier): add calendar types"
```

---

### Task 3: Page calendrier (structure)

**Objectif:** Creer la page Next.js pour le calendrier.

**Fichiers:**
- Creer : `src/app/calendrier/page.tsx`

**ATTENTION IMPORTANTE :**
- L'import de CalendarLegend doit etre `@/components/calendar/CalendarLegend` (PAS `@/src/components/...`)
- Utiliser `useCallback` pour les fonctions de navigation pour eviter les re-rendus

**Step 1: Ecrire la page**

```tsx
'use client'

import { useState, useCallback } from 'react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarLegend } from '@/components/calendar/CalendarLegend'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'

export default function CalendrierPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1)
        return 0
      }
      return prev + 1
    })
  }, [])

  const monthNames = [
    'Janvier','Fevrier','Mars','Avril','Mai','Juin',
    'Juillet','Aout','Septembre','Octobre','Novembre','Decembre'
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon size={24} /> Calendrier equipe
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-lg font-semibold min-w-[140px] text-center]">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <CalendarLegend />
      <CalendarGrid year={currentYear} month={currentMonth} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/calendrier/page.tsx
git commit -m "feat(calendrier): add calendar page"
```

---

### Task 4: Composant CalendarGrid

**Objectif:** Creer la grille calendrier avec lignes de membres et colonnes de jours.

**Fichiers:**
- Creer : `src/components/calendar/CalendarGrid.tsx`

**ATTENTION IMPORTANTE :**
- Le `onUpdate` doit utiliser une fonction de rafraichissement propre, pas une closure sur `supabase` qui peut devenir stale
- Utiliser `useMemo` pour `daysInMonth` et `todayStr`
- La detection des weekend doit utiliser `getDay()` ou `getUTCDay()` avec attention ( Sunday = 0, Saturday = 6 )

**Step 1: Ecrire le composant**

```tsx
'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DayCell } from './DayCell'
import type { Profile, CalendarEntry, TeamHoliday } from '@/types/database'

interface CalendarGridProps {
  year: number
  month: number
}

export function CalendarGrid({ year, month }: CalendarGridProps) {
  const supabase = createClient()
  const [members, setMembers] = useState<Profile[]>([])
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [holidays, setHolidays] = useState<TeamHoliday[]>([])
  const [loading, setLoading] = useState(true)

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month])
  
  const todayStr = useMemo(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  }, [])

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [membersRes, entriesRes, holidaysRes] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('calendar_entries').select('*').gte('date', startDate).lte('date', endDate),
      supabase.from('team_holidays').select('*'),
    ])
    if (membersRes.data) setMembers(membersRes.data)
    if (entriesRes.data) setEntries(entriesRes.data)
    if (holidaysRes.data) setHolidays(holidaysRes.data)
    setLoading(false)
  }, [supabase, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getEntry = useCallback((profileId: string, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return entries.find(e => e.profile_id === profileId && e.date === dateStr)
  }, [entries, year, month])

  const getHoliday = useCallback((day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return holidays.find(h => {
      if (h.is_recurring) {
        // Comparer MM-DD sans l'annee
        return h.date.slice(5) === dateStr.slice(5)
      }
      return h.date === dateStr
    })
  }, [holidays, year, month])

  const getDefaultPresence = useCallback((profile: Profile, day: number) => {
    const date = new Date(year, month, day)
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const defaults = (profile.default_days as Record<string, string>) || {}
    const val = defaults[weekday]
    if (val === 'office' || val === 'remote') return val
    return null
  }, [year, month])

  if (loading) return <p className="text-muted-foreground">Chargement du calendrier...</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10 text-left px-2 py-2 text-sm font-semibold border-b">
              Membre
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === todayStr
              const date = new Date(year, month, day)
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              return (
                <th
                  key={day}
                  className={`text-center py-1 text-xs w-8 border-b ${
                    isToday ? 'bg-blue-50 border-blue-300' : isWeekend ? 'bg-slate-50' : ''
                  }`}
                >
                  {day}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id} className="hover:bg-slate-50/50">
              <td className="sticky left-0 bg-white z-10 px-2 py-1 text-sm font-medium border-b whitespace-nowrap]">
                {member.full_name}
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const entry = getEntry(member.id, day)
                const holiday = getHoliday(day)
                const defaultPresence = getDefaultPresence(member, day)
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                return (
                  <DayCell
                    key={day}
                    profileId={member.id}
                    date={dateStr}
                    presence={entry?.presence || (holiday ? 'holiday' : defaultPresence || null)}
                    holidayName={holiday?.name}
                    note={entry?.note}
                    onUpdate={fetchData}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/calendar/CalendarGrid.tsx
git commit -m "feat(calendrier): add CalendarGrid component"
```

---

### Task 5: Composant CalendarLegend

**Objectif:** Légende colorée des statuts.

**Fichiers:**
- Creer : `src/components/calendar/CalendarLegend.tsx`

```tsx
'use client'

import { Building2, Home, Umbrella, CalendarX, Minus } from 'lucide-react'

export function CalendarLegend() {
  const items = [
    { icon: Building2, label: 'Sur site', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    { icon: Home, label: 'Teletravail', className: 'bg-violet-100 text-violet-700 border-violet-200' },
    { icon: Umbrella, label: 'Conges', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { icon: CalendarX, label: 'Ferie / Fermeture', className: 'bg-red-100 text-red-700 border-red-200' },
    { icon: Minus, label: 'Non defini', className: 'bg-slate-50 text-slate-400 border-slate-200' },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {items.map(item => (
        <div key={item.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${item.className}`}>
          <item.icon size={12} />
          {item.label}
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/calendar/CalendarLegend.tsx
git commit -m "feat(calendrier): add CalendarLegend"
```

---

### Task 6: Composant DayCell

**Objectif:** Cellule cliquable du calendrier.

**Fichiers:**
- Creer : `src/components/calendar/DayCell.tsx`

**ATTENTION IMPORTANTE :**
- `onUpdate` est appelee apres une modification dans le dialog
- Le composant ne doit pas gerer le dialog — il est gere par le parent via `useState` local

```tsx
'use client'

import { useState } from 'react'
import { EditDayDialog } from './EditDayDialog'
import type { Enums } from '@/types/database'

type PresenceType = Enums['presence_type'] | null

interface DayCellProps {
  profileId: string
  date: string
  presence: PresenceType
  holidayName?: string
  note?: string | null
  onUpdate: () => void
}

export function DayCell({ profileId, date, presence, holidayName, note, onUpdate }: DayCellProps) {
  const [open, setOpen] = useState(false)

  const presenceStyles: Record<string, string> = {
    office: 'bg-blue-100 border-blue-200',
    remote: 'bg-violet-100 border-violet-200',
    leave: 'bg-emerald-100 border-emerald-200',
    holiday: 'bg-red-100 border-red-200',
  }

  return (
    <>
      <td
        className={`text-center border px-0.5 py-1 cursor-pointer transition-colors hover:opacity-80 ${
          presence ? presenceStyles[presence] : 'bg-slate-50 border-slate-200'
        }`}
        onClick={() => setOpen(true)}
        title={holidayName || note || undefined}
      >
        <div className="w-full h-4" />
      </td>
      {open && (
        <EditDayDialog
          open={open}
          onClose={() => setOpen(false)}
          profileId={profileId}
          date={date}
          currentPresence={presence}
          holidayName={holidayName}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/calendar/DayCell.tsx
git commit -m "feat(calendrier): add DayCell component"
```

---

### Task 7: Composant EditDayDialog

**Objectif:** Dialog pour editer le statut d'un jour.

**Fichiers:**
- Creer : `src/components/calendar/EditDayDialog.tsx`

**ATTENTION IMPORTANTE :**
- Utiliser `onOpenChange` correctement pour gerer la fermeture (clic extérieur, Escape)
- Le `onClose` doit etre appele dans tous les cas de fermeture
- `onUpdate` doit etre appele apres une sauvegarde reussie

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Building2, Home, Umbrella, RotateCcw } from 'lucide-react'
import type { Enums } from '@/types/database'

type PresenceType = Enums['presence_type'] | null

interface EditDayDialogProps {
  open: boolean
  onClose: () => void
  profileId: string
  date: string
  currentPresence: PresenceType
  holidayName?: string
  onUpdate: () => void
}

export function EditDayDialog({ open, onClose, profileId, date, currentPresence, holidayName, onUpdate }: EditDayDialogProps) {
  const supabase = createClient()
  const [presence, setPresence] = useState<PresenceType>(currentPresence)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setPresence(currentPresence)
      setNote('')
    }
  }, [open, currentPresence])

  const handleSave = async () => {
    if (!presence) return
    setLoading(true)
    const { error } = await supabase
      .from('calendar_entries')
      .upsert({
        profile_id: profileId,
        date,
        presence,
        note: note || null,
      }, { onConflict: 'profile_id,date' })
    setLoading(false)
    if (error) {
      toast.error('Erreur lors de la mise a jour')
    } else {
      toast.success('Jour mis a jour')
      onUpdate()
      onClose()
    }
  }

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.from('calendar_entries').delete().eq('profile_id', profileId).eq('date', date)
    setLoading(false)
    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Reinitialise au defaut')
      onUpdate()
      onClose()
    }
  }

  const options: { value: NonNullable<PresenceType>; label: string; icon: typeof Home }[] = [
    { value: 'office', label: 'Sur site', icon: Building2 },
    { value: 'remote', label: 'Teletravail', icon: Home },
    { value: 'leave', label: 'Conges', icon: Umbrella },
  ]

  if (holidayName) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{holidayName}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Ce jour est ferie ou de fermeture. Les equipes ne travaillent pas.</p>
          <Button onClick={onClose}>Fermer</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Modifier le {date}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-2">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPresence(opt.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                  presence === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <opt.icon size={20} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Reunion a 14h" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !presence} className="flex-1">
              {loading ? '...' : 'Enregistrer'}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RotateCcw size={14} className="mr-1" /> Defaut
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/calendar/EditDayDialog.tsx
git commit -m "feat(calendrier): add EditDayDialog"
```

---

### Task 8: Page profil — Parametres jours defaut

**Objectif:** Page profil pour configurer les jours par defaut.

**Fichiers:**
- Creer : `src/app/profil/page.tsx`

```tsx
'use client'

import { DefaultDaysForm } from '@/components/profile/DefaultDaysForm'

export default function ProfilPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <DefaultDaysForm />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/profil/page.tsx
git commit -m "feat(profil): add profile page"
```

---

### Task 9: Composant DefaultDaysForm

**Objectif:** Formulaire jours par defaut du profil.

**Fichiers:**
- Creer : `src/components/profile/DefaultDaysForm.tsx`

**ATTENTION IMPORTANTE :**
- Utiliser `useAuth()` hook existant pour recuperer l'utilisateur courant
- Ne pas re-implementer la logique d'auth — utiliser le hook existant

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const frenchDays = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

type DayType = 'office' | 'remote' | null

export function DefaultDaysForm() {
  const { user } = useAuth()
  const supabase = createClient()
  const [defaults, setDefaults] = useState<Record<string, DayType>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('default_days').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.default_days) {
          setDefaults(data.default_days as Record<string, DayType>)
        }
        setLoading(false)
      })
  }, [user, supabase])

  const setDay = (day: string, value: DayType) => {
    setDefaults(prev => ({ ...prev, [day]: value }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ default_days: defaults }).eq('user_id', user.id)
    setSaving(false)
    if (error) {
      toast.error('Erreur lors de la sauvegarde')
    } else {
      toast.success('Parametres mis a jour')
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Jours par defaut</h2>
      <p className="text-sm text-muted-foreground">
        Ces valeurs seront utilisees pour pre-remplir votre calendrier. Vous pourrez toujours modifier chaque jour individuellement.
      </p>
      {frenchDays.map(day => (
        <div key={day.key} className="flex items-center justify-between py-2 border-b">
          <Label className="font-medium">{day.label}</Label>
          <div className="flex gap-1">
            <button
              onClick={() => setDay(day.key, 'office')}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                defaults[day.key] === 'office' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sur site
            </button>
            <button
              onClick={() => setDay(day.key, 'remote')}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                defaults[day.key] === 'remote' ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              Teletravail
            </button>
            <button
              onClick={() => setDay(day.key, null)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                !defaults[day.key] ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              Non defini
            </button>
          </div>
        </div>
      ))}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Sauvegarde...' : 'Enregistrer'}
      </Button>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/profile/DefaultDaysForm.tsx
git commit -m "feat(profil): add DefaultDaysForm"
```

---

### Task 10: API route admin congés collectifs

**Objectif:** API pour gerer les jours feriés (admin).

**Fichiers:**
- Creer : `src/app/api/holidays/route.ts`

**ATTENTION IMPORTANTE :**
- La route DELETE doit lire le body (Next.js 15+ ne supporte plus body sur DELETE directement — utiliser searchParams ou passer a POST avec action)
- Pour simplifier, utiliser `POST /api/holidays` pour creer et `DELETE /api/holidays?id=...` pour supprimer

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('team_holidays').select('*').order('date')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const body = await req.json()
  const { data, error } = await supabase.from('team_holidays').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  const { error } = await supabase.from('team_holidays').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

**Step 3: Commit**

```bash
git add src/app/api/holidays/route.ts
git commit -m "feat(admin): add holidays API"
```

---

### Task 11: Composant TeamHolidaysManager

**Objectif:** Interface admin pour gerer les jours feriés.

**Fichiers:**
- Creer : `src/components/admin/TeamHolidaysManager.tsx`

**ATTENTION IMPORTANTE :**
- Le Switch shadcn/ui vient d'etre installe (`npx shadcn add switch`)
- Verifier que le composant est bien dans `src/components/ui/switch.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface Holiday {
  id: string
  name: string
  date: string
  is_recurring: boolean
}

export function TeamHolidaysManager() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [newName, setNewName] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newRecurring, setNewRecurring] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchHolidays = async () => {
    const res = await fetch('/api/holidays')
    const data = await res.json()
    setHolidays(data)
    setLoading(false)
  }

  useEffect(() => { fetchHolidays() }, [])

  const handleAdd = async () => {
    if (!newName || !newDate) return
    const res = await fetch('/api/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, date: newDate, is_recurring: newRecurring }),
    })
    if (res.ok) {
      toast.success('Jour ferie ajoute')
      setNewName('')
      setNewDate('')
      setNewRecurring(false)
      fetchHolidays()
    } else {
      toast.error('Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/holidays?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Supprime')
      fetchHolidays()
    } else {
      toast.error('Erreur')
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-lg font-semibold">Jours feriés et fermetures</h2>
      <Card>
        <CardHeader className="pb-3"><h3 className="text-sm font-medium">Ajouter un jour</h3></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nom</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Fermeture annuelle" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={newRecurring} onCheckedChange={setNewRecurring} id="recurring" />
            <Label htmlFor="recurring">Recurrent chaque annee</Label>
          </div>
          <Button onClick={handleAdd} disabled={!newName || !newDate}>
            <Plus size={14} className="mr-1" /> Ajouter
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {holidays.map(h => (
          <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
            <div>
              <p className="font-medium">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.date} {h.is_recurring ? '(recurrent)' : ''}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(h.id)} className="text-red-600">
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        {holidays.length === 0 && <p className="text-sm text-muted-foreground">Aucun jour ferie defini.</p>}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/admin/TeamHolidaysManager.tsx
git commit -m "feat(admin): add TeamHolidaysManager"
```

---

### Task 12: Mise a jour Header + navigation

**Objectif:** Ajouter les liens Calendrier et Profil dans le header.

**Fichiers:**
- Modifier : `src/components/layout/Header.tsx`

**ATTENTION IMPORTANTE :**
- `Link` est deja importe depuis `next/link` en haut du fichier
- Le DropdownMenuItem avec `asChild` + `Link` fonctionne avec l'import existant
- Verifier que l'icone `User` n'est pas deja importe

**Step 1: Lire le fichier existant**

`read_file("src/components/layout/Header.tsx")`

**Step 2: Ajouter les imports**

Ajouter `CalendarDays, User` dans l'import de lucide-react :

```tsx
import { LogOut, Users, ListChecks, CalendarDays, User } from 'lucide-react'
```

**Step 3: Ajouter les liens de navigation**

Apres le lien Membres et avant le DropdownMenu utilisateur :

```tsx
<Link
  href="/calendrier"
  className={`text-sm font-medium flex items-center gap-1 ${
    pathname === '/calendrier' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
  }`}
>
  <CalendarDays size={16} /> Calendrier
</Link>
```

**Step 4: Ajouter lien Profil dans dropdown**

Dans `DropdownMenuContent`, ajouter avant le LogOut :

```tsx
<DropdownMenuItem asChild>
  <Link href="/profil" className="cursor-pointer flex items-center gap-2">
    <User size={14} /> Profil
  </Link>
</DropdownMenuItem>
```

**Step 5: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(nav): add calendar and profile links"
```

---

### Task 13: Build sans warnings + verification

**Objectif:** Verifier que le build passe sans warnings.

**Step 1: Verifier les imports non utilises**

Run: `cd /home/p4bl1/.hermes/teamy-dev && npm run lint 2>&1 | head -30`
Expected: Pas d'erreurs lint

**Step 2: Build Next.js**

```bash
cd /home/p4bl1/.hermes/teamy-dev && npm run build 2>&1
```

**Step 3: Corriger les warnings**

Si warnings :
- Imports non utilises : supprimer
- Variables non utilisees : prefixer avec `_`
- `any` implicites : ajouter des types
- `useEffect` dependencies manquantes : ajouter

**Step 4: Commit final**

```bash
git add -A
git commit -m "feat(calendrier): final build fixes"
```

---

## Post-implementation

Une fois toutes les taches terminees :
1. Pusher la branche sur GitHub
2. Creer une Pull Request
3. Attendre la CI
4. Merger

```bash
git push origin main
```

---

## Verification finale

- [ ] Migration appliquee dans Supabase
- [ ] Types TypeScript sans erreurs
- [ ] Page /calendrier accessible
- [ ] Page /profil accessible
- [ ] Grille calendrier affiche les membres et jours
- [ ] Les jours se colorent selon le statut
- [ ] Clic sur cellule ouvre le dialog d'edition
- [ ] Formulaire profil sauvegarde les jours par defaut
- [ ] Les jours par defaut s'appliquent au calendrier
- [ ] Les conges collectifs s'affichent en rouge
- [ ] Build sans warnings

---

**Plan generated:** 2026-05-22
**Feature:** Calendrier d'equipe (conges + presence + teletravail)
**Version:** v2 (corrige) — Fix import path, types exports, stale closures, onOpenChange, DELETE body, useAuth hook, Switch install, build verification
