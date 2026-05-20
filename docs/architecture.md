# 🏗️ Teamy — Architecture Technique

> **Statut** : MVP — Version 1.0  
> **Basée sur** : `docs/product-brief.md` + `docs/spec-fonctionnelle.md`

---

## 1. Stack complète

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| **Framework** | Next.js | 16.x (App Router) | SSR/SSG, routing, API routes |
| **Langage** | TypeScript | 5.x | Type safety |
| **UI** | React | 19.x | Composants |
| **Styling** | Tailwind CSS | 4.x (via shadcn) | Utility-first CSS |
| **Composants** | shadcn/ui | latest | UI primitives (dialog, table, form, etc.) |
| **Backend** | Supabase | Cloud-hosted | DB, Auth, Realtime |
| **Database** | PostgreSQL | 15 | Données structurées, RLS |
| **Auth** | Supabase Auth | latest | JWT, email/password, sessions |
| **Icons** | Lucide React | latest | Icônes cohérentes |
| **Date utilities** | date-fns | latest | Manipulation des dates |
| **Forms** | React Hook Form + Zod | latest | Validation formulaires |
| **Deployment** | Vercel | latest | Hosting, CI/CD natif |
| **Charts** | Recharts | 2.x | Préinstallé pour V2 |

---

## 2. Schéma de base de données

### 2.1 Table `profiles` (Membres de l'équipe)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 1 AND char_length(full_name) <= 100),
  email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role_label TEXT CHECK (char_length(role_label) <= 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Règles :**
- `user_id` est la clé vers `auth.users` (table interne Supabase Auth).
- `email` est unique : un utilisateur ne peut pas être ajouté deux fois.
- Trigger automatique : à la création d'un compte Auth, un profil est créé automatiquement (voir §5).

### 2.2 Table `tasks`

```sql
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 2000),
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les performances des filtres/tri
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

**Règles :**
- `assigned_to` → `ON DELETE SET NULL` : si un membre est supprimé, ses tâches restent mais deviennent non assignées.
- `created_by` → `ON DELETE CASCADE` : si on supprime un membre, on supprime aussi ses tâches créées (évite les orphelins).
- `due_date` : type `DATE` (pas besoin d'heure), validation application-level pour empêcher les dates passées.

### 2.3 Row Level Security (RLS) — Politiques

Toutes les tables ont RLS activé. En MVP, tous les utilisateurs authentifiés voient/modifient tout (pas de segmentation par équipe).

```sql
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Profiles are insertable by authenticated users"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Profiles are updatable by authenticated users"
ON profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Profiles are deletable by authenticated users"
ON profiles FOR DELETE
TO authenticated
USING (true);

-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by authenticated users"
ON tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tasks are insertable by authenticated users"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Tasks are updatable by authenticated users"
ON tasks FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Tasks are deletable by authenticated users"
ON tasks FOR DELETE
TO authenticated
USING (true);
```

> **Note V2** : Quand il y aura multi-équipe, les politiques passeront à `team_id` scoped.

---

## 3. Structure du projet

```
~/projects/teamy/
├── README.md                         # Setup rapide + liens docs
├── docs/
│   ├── product-brief.md              # Phase 1
│   ├── spec-fonctionnelle.md         # Phase 2
│   └── architecture.md               # Phase 3 (ce fichier)
├── .hermes/
│   └── plans/
│       └── (plans d'implémentation générés par Hermes)
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Provider Auth, Header)
│   │   ├── page.tsx                  # Liste des tâches (route `/`)
│   │   ├── login/
│   │   │   └── page.tsx              # Page de connexion (route `/login`)
│   │   ├── membres/
│   │   │   └── page.tsx              # Page membres (route `/membres`)
│   │   └── globals.css               # Styles globaux + Tailwind
│   ├── components/
│   │   ├── ui/                       # Composants shadcn/ui (auto-générés)
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Header avec navigation + profil
│   │   │   └── AuthProvider.tsx      # Contexte d'authentification
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx          # Table / liste des tâches
│   │   │   ├── TaskCard.tsx          # Carte d'une tâche (desktop)
│   │   │   ├── TaskFilters.tsx       # Barre de filtres
│   │   │   ├── TaskForm.tsx          # Formulaire création/édition (modal)
│   │   │   ├── StatusBadge.tsx       # Badge de statut (couleur + icône)
│   │   │   ├── PriorityBadge.tsx     # Badge de priorité
│   │   │   └── DeleteConfirm.tsx     # Modal de confirmation suppression
│   │   └── members/
│   │       ├── MemberList.tsx        # Liste des membres
│   │       └── MemberForm.tsx        # Formulaire ajout membre
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Client Supabase (Browser/Client)
│   │   │   └── server.ts             # Client Supabase (Server / API routes)
│   │   ├── utils/
│   │   │   └── cn.ts                 # Utilitaire cn() (Tailwind merge)
│   │   └── constants.ts              # Valeurs statiques (status, priority)
│   ├── types/
│   │   └── database.ts               # Types générés Supabase (supabase gen)
│   └── hooks/
│       ├── useAuth.ts                # Hook d'authentification
│       ├── useTasks.ts               # Hook CRUD tâches (React Query style)
│       └── useMembers.ts             # Hook CRUD membres
├── public/
│   └── (assets statiques)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Migration initiale (DB + RLS + trigger)
│   └── config.toml                   # Config CLI Supabase (local dev)
├── components.json                   # Config shadcn/ui
├── next.config.ts
├── tailwind.config.ts                # v4 config (si nécessaire)
├── tsconfig.json
└── package.json
```

---

## 4. Conventions de code

### 4.1 Nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants React | PascalCase | `TaskList.tsx` |
| Hooks | camelCase, préfixe `use` | `useTasks.ts` |
| Fonctions utilitaires | camelCase | `formatDate()` |
| Types/Interfaces | PascalCase | `Task`, `CreateTaskInput` |
| Constantes | UPPER_SNAKE_CASE | `TASK_STATUSES` |
| Fichiers SQL | snake_case + numérotation | `001_initial_schema.sql` |
| Routes API | kebab-case | `app/login/page.tsx` |

### 4.2 Imports — Ordre recommandé

```tsx
// 1. Bibliothèques standard (React, Next)
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Bibliothèques tierces (Supabase, date-fns)
import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// 3. Composants internes
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/tasks/TaskList'

// 4. Hooks / Utils internes
import { useTasks } from '@/hooks/useTasks'
import { cn } from '@/lib/utils/cn'
```

### 4.3 Gestions des types Supabase

- Utiliser `supabase gen types typescript` pour générer automatiquement les types à partir du schéma.
- Stocker les types dans `src/types/database.ts`.
- Ne jamais typer manuellement ce que Supabase peut générer.

### 4.4 Messages utilisateur (UI)

**Tous en français.** Exemples :
- ✅ "Tâche créée avec succès"
- ✅ "Veuillez saisir un titre de tâche"
- ✅ "Aucune tâche pour le moment"
- ❌ "Task created" (jamais)
- ❌ "Please enter task title" (jamais)

### 4.5 Commits Git

Format : `<type>: <description courte>`

| Type | Usage |
|------|-------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `refactor:` | Refactoring sans changement de comportement |
| `style:` | Formatage, pas de changement logique |
| `docs:` | Documentation |
| `chore:` | Tâches diverses (deps, config) |

Exemples :
- `feat: add task creation modal`
- `fix: resolve due_date validation edge case`
- `docs: update architecture schema`

---

## 5. Stratégie d'authentification

### 5.1 Supabase Auth — Email / Mot de passe

- Inscription / Connexion classiques via `supabase.auth.signInWithPassword()` et `signUp()`.
- Sessions gérées par cookies HTTP-only de Supabase (pas de stockage localStorage).
- Middleware Next.js (`middleware.ts`) pour protéger les routes privées et rediriger vers `/login` si non authentifié.

### 5.2 Middleware de route (`src/middleware.ts`)

```ts
// Résumé logique (à implémenter)
// - Si l'utilisateur n'est pas authentifié et essaie d'accéder à / ou /membres
//   → redirect 307 vers /login
// - Si l'utilisateur est authentifié et essaie d'accéder à /login
//   → redirect 307 vers /
// - Routes publiques autorisées sans auth : /login, /_next/*, /static/*
```

### 5.3 Trigger : Création automatique du profil

Quand un utilisateur s'inscrit via Supabase Auth, un trigger PostgreSQL crée automatiquement son entrée dans `profiles`.

```sql
-- Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Utilisateur'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Note MVP** : L'admin (toi) s'inscrit en premier. Pour ajouter un membre : tu crées manuellement le compte via le formulaire Membres (qui appelle `supabase.auth.admin.createUser()` depuis une API route sécurisée), ou tu communique un mot de passe temporaire.

### 5.4 Gestionnaire de session client

- Hook `useAuth` expose : `user`, `profile`, `isLoading`, `signOut()`.
- L'état de connexion est synchronisé via `supabase.auth.onAuthStateChange()`.
- Le header affiche le nom du membre connecté (depuis `profiles.full_name`).

---

## 6. Plan de sécurité

| Menace | Mitigation |
|--------|-----------|
| **Injection SQL** | RLS activé + Supabase client préparé (paramétré) |
| **Accès non authentifié aux données** | RLS `TO authenticated` sur toutes les tables |
| **Attaque XSS** | React échappe automatiquement le JSX. Pas de `dangerouslySetInnerHTML` sans sanitize. |
| **CSRF** | Tokens JWT stockés en cookies HTTP-only par Supabase |
| **Fuite de secrets** | Variables d'environnement Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement) |
| **Validation** | Zod côté client ET côté serveur (API routes) pour toutes les entrées utilisateur |
| **CORS** | Géré par Supabase (whitelist domaines Vercel en production) |

---

## 7. Endpoints / Fonctions prévues

| Route / Fonction | Type | Description |
|------------------|------|-------------|
| `POST /auth/login` | Server Action | Connexion |
| `POST /auth/signup` | Server Action | Inscription (admin seulement en MVP) |
| `POST /auth/signout` | Server Action | Déconnexion |
| `GET /tasks` | Supabase Query | Liste des tâches +
| `POST /tasks` | Supabase Insert | Créer une tâche |
| `PATCH /tasks/:id` | Supabase Update | Modifier une tâche |
| `DELETE /tasks/:id` | Supabase Delete | Supprimer une tâche |
| `GET /members` | Supabase Query | Liste des membres |
| `POST /members` | Server Action | Créer un membre (appel admin Supabase) |
| `DELETE /members/:id` | Supabase Delete | Supprimer un membre |

---

## 8. Performance & Évolutivité

- **Pagination** : Pas nécessaire en MVP (équipe de ~5-20 personnes, <1000 tâches). Implémenter `limit/offset` si volume croît.
- **Indexes** : Déjà définis sur les colonnes de filtre pour des requêtes rapides.
- **Realtime** : Non activé en MVP. Peut être ajouté pour synchronisation live entre onglets/utilisateurs plus tard.
- **Caching** : Next.js App Router cache par défaut sur les Server Components. Invalidation manuelle sur mutation.

---

*Architecture validée. Passage à la Phase 4 — Plan d'implémentation (découpage en tickets).*
