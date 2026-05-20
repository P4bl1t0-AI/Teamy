# 🎯 Teamy — Product Brief

## Vision
Teamy est une web application de gestion d'équipe légère, moderne et collaborative, conçue pour un usage interne au sein d'une équipe professionnelle. L'objectif premier est de construire une base solide pour maîtriser le workflow de production assistée par IA, tout en créant un outil réellement utilisable au quotidien.

## Objectifs
1. Apprendre le workflow optimal de création d'application avec IA
2. Créer une application de gestion d'équipe fonctionnelle et maintenable
3. Poser les fondations techniques pour des projets futurs plus complexes

## Contexte & Utilisateurs
- **Usage** : Application interne pour l'équipe pro de l'utilisateur (CDC)
- **Nombre d'équipes** : Une seule équipe à gérer dans le MVP
- **Langue** : Interface 100% en français

## Fonctionnalités MVP (Validé)

### Must-have
- **Authentification** : Connexion sécurisée via email/mot de passe (Supabase Auth)
- **Gestion des membres** : Ajouter les collègues, voir qui fait partie de l'équipe
- **Gestion des tâches** : Créer, lire, modifier, supprimer des tâches
- **Statuts** : À faire → En cours → Terminé → Annulé
- **Priorités** : Haute, Moyenne, Basse
- **Assignation** : Attribuer une tâche à un membre de l'équipe
- **Vue liste** : Liste des tâches filtrable et triable (par statut, priorité, assigné, date)

### Out-of-scope MVP (V2)
- Vue calendrier / timeline
- Dashboard avec KPI
- Multi-équipes
- Notifications email
- Export de données
- Recherche avancée
- Tags / labels
- Commentaires sur les tâches

## Contraintes
- **Stack** : Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL, Auth, Realtime)
- **Charts** : Recharts (préinstallé pour V2)
- **Deployment** : Vercel
- **Workflow** : Tickets petits incréments, validation avant déploiement
- **Langue** : Français (interface, labels, messages d'erreur)

## Questions bloquantes — Résolues ✅
| # | Question | Réponse |
|---|----------|---------|
| 1 | Usage (interne / SaaS public) | Interne, équipe pro |
| 2 | Priorité absolue MVP | A — Gestion des tâches avec statuts/priorités |
| 3 | Multi-équipe dès le MVP | Non, une seule équipe |
| 4 | Contraintes métier (RGPD, emails, export, intégration) | Non pour le MVP |
| 5 | Langue de l'interface | Français |

## User Stories MVP
> En tant que **chef d'équipe**, je veux **créer une tâche et l'assigner à un membre** afin de **suivre qui fait quoi**.

> En tant que **membre d'équipe**, je veux **voir mes tâches assignées et changer leur statut** afin de **rendre compte de mon avancement**.

> En tant qu'**utilisateur**, je veux **filtrer les tâches par statut ou priorité** afin de **m'y retrouver rapidement**.

---
*Brief validé le 20/05/2026 — Passage à la Spec Fonctionnelle autorisé.*
