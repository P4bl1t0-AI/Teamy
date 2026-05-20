# 📋 Teamy — Spec Fonctionnelle

> **Statut** : MVP — Validée le 20/05/2026
> **Basée sur** : `docs/product-brief.md`

---

## 1. Arborescence des écrans

```
/login              → Page de connexion (email + mot de passe)
/                   → Liste des tâches (page principale)
/                   → Modal "Nouvelle tâche" (depuis la liste)
/                   → Modal "Éditer une tâche" (depuis la liste)
/membres            → Gestion des membres de l'équipe
```

**Navigation globale** (Header fixe) :
- Logo "Teamy" (clic → retour `/`)
- Onglet "Tâches" (`/`) — actif par défaut
- Onglet "Membres" (`/membres`)
- Bouton "Nouvelle tâche" (primary, visible sur la page Tâches)
- Menu profil / Déconnexion (dropdown avec nom de l'utilisateur)

---

## 2. Parcours utilisateur (User Flows)

### Flow A — Connexion
```
Arrivée sur /login
→ Saisie email + mot de passe
→ Clic "Se connecter"
→ Si succès : redirection vers / (liste des tâches)
→ Si échec : message d'erreur en français sous le formulaire
```

### Flow B — Créer une tâche
```
Depuis /, clic "Nouvelle tâche"
→ Modal s'ouvre avec formulaire vide
→ Remplissage : Titre*, Description, Priorité*, Assigné, Date d'échéance
→ Clic "Créer"
→ Modal se ferme, tâche apparaît en haut de la liste
→ Toast de confirmation : "Tâche créée"
```

### Flow C — Modifier le statut (action rapide)
```
Depuis /, clic sur le badge statut d'une tâche
→ Dropdown : À faire / En cours / Terminé / Annulé
→ Sélection du nouveau statut
→ Badge se met à jour instantanément
→ Pas de confirmation nécessaire (action rapide)
```

### Flow D — Éditer une tâche
```
Depuis /, clic sur le titre ou le bouton "Éditer" d'une tâche
→ Modal s'ouvre avec formulaire pré-rempli
→ Modification des champs
→ Clic "Enregistrer" : modal se ferme, liste mise à jour
→ Toast : "Tâche mise à jour"
```

### Flow E — Supprimer une tâche
```
Depuis le modal d'édition
→ Clic "Supprimer" (bouton rouge, secondaire)
→ Confirmation modal : "Confirmer la suppression ? Cette action est irréversible."
→ Si confirmation : tâche supprimée, modal fermé, liste refresh
→ Toast : "Tâche supprimée"
```

### Flow F — Gérer les membres
```
Clic sur "Membres" dans le header
→ Page /membres avec liste des membres actuels
→ Clic "Ajouter un membre"
→ Modal : saisie nom + email
→ Clic "Ajouter" : membre ajouté à la liste
→ L'utilisateur invité pourra se connecter avec ces credentials
```

---

## 3. Rôles et permissions (MVP simplifié)

| Action | Utilisateur authentifié |
|--------|-------------------------|
| Voir les tâches | ✅ |
| Créer une tâche | ✅ |
| Éditer n'importe quelle tâche | ✅ |
| Supprimer n'importe quelle tâche | ✅ |
| Changer le statut d'une tâche | ✅ |
| Voir les membres | ✅ |
| Ajouter un membre | ✅ |
| Retirer un membre | ✅ |
| Se déconnecter | ✅ |

> **Note MVP** : Pas de différenciation admin/membre. L'usage est interne et basé sur la confiance. Les rôles granulaires seront une feature V2 si besoin.

---

## 4. Logique métier détaillée

### 4.1 Entité : Tâche (Task)

| Champ | Type | Obligatoire | Règles |
|-------|------|-------------|--------|
| `id` | UUID | Auto | Généré par Supabase |
| `title` | Texte | ✅ | 1 à 200 caractères |
| `description` | Texte | ❌ | Max 2000 caractères |
| `status` | Enum | ✅ (défaut : `todo`) | `todo`, `in_progress`, `done`, `cancelled` |
| `priority` | Enum | ✅ (défaut : `medium`) | `high`, `medium`, `low` |
| `assigned_to` | UUID (réf. user) | ❌ | Membre de l'équipe ou null |
| `due_date` | Date | ❌ | Format ISO, doit être ≥ aujourd'hui si renseignée |
| `created_by` | UUID (réf. user) | Auto | Utilisateur connecté au moment de la création |
| `created_at` | Timestamp | Auto | Généré par Supabase |
| `updated_at` | Timestamp | Auto | Mis à jour à chaque modification |

**Règles de gestion :**
- Le titre ne peut pas être vide ni dépasser 200 caractères.
- La date d'échéance, si renseignée, doit être dans le futur ou aujourd'hui.
- Une tâche supprimée est définitivement effacée (pas de soft-delete en MVP).

### 4.2 Entité : Membre / Profil (Profile)

| Champ | Type | Obligatoire | Règles |
|-------|------|-------------|--------|
| `id` | UUID | Auto | Généré par Supabase |
| `user_id` | UUID | Auto | Lié à Supabase Auth |
| `full_name` | Texte | ✅ | 1 à 100 caractères |
| `email` | Email | ✅ | Unique, format valide |
| `role_label` | Texte | ❌ | Ex: "Chef d'équipe", "Analyste" — libre |
| `created_at` | Timestamp | Auto | Généré par Supabase |

**Règles de gestion :**
- L'email doit être unique dans l'application.
- L'ajout d'un membre crée un profil. L'utilisateur devra utiliser "Mot de passe oublié" ou recevoir un email d'invitation (V2) pour définir son mot de passe initial.
- En MVP, l'ajout d'un membre crée un profil + un compte Auth Supabase avec un mot de passe temporaire que l'administrateur communique manuellement, ou le membre utilise la récupération de mot de passe.

### 4.3 Filtres et Tri (Page Liste des Tâches)

**Filtres disponibles :**
- Statut : multi-sélection (checkboxes : À faire, En cours, Terminé, Annulé)
- Priorité : multi-sélection (Haute, Moyenne, Basse)
- Assigné : dropdown avec liste des membres + "Non assigné"
- Recherche texte : recherche dans titre et description (min. 2 caractères)

**Options de tri :**
- Date de création (plus récente d'abord — défaut)
- Date d'échéance (la plus urgente d'abord)
- Priorité (Haute → Moyenne → Basse)

### 4.4 Indicateurs visuels

| Élément | Affichage |
|---------|-----------|
| Priorité Haute | Badge rouge "Haute" |
| Priorité Moyenne | Badge orange "Moyenne" |
| Priorité Basse | Badge vert "Basse" |
| Statut "À faire" | Badge gris |
| Statut "En cours" | Badge bleu |
| Statut "Terminé" | Badge vert avec icône check |
| Statut "Annulé" | Badge gris barré |
| Date d'échéance passée | Date en rouge + petit badge "En retard" |
| Non assigné | Texte italique "Non assigné" |

---

## 5. Cas limites (Edge Cases)

| # | Situation | Comportement attendu |
|---|-----------|----------------------|
| 1 | Membre supprimé de l'équipe | Ses tâches assignées restent visibles mais affichent "Non assigné" |
| 2 | Tâche sans assigné | Affichage "Non assigné" dans la colonne/carte assigné |
| 3 | Date d'échéance passée | Badge "En retard" + date en rouge dans la liste |
| 4 | Suppression de tâche | Modal de confirmation obligatoire avant suppression définitive |
| 5 | Email déjà existant (ajout membre) | Message d'erreur : "Ce membre fait déjà partie de l'équipe." |
| 6 | Session expirée (token invalide) | Redirection silencieuse vers `/login` avec message "Votre session a expiré. Veuillez vous reconnecter." |
| 7 | Champs vides à la création | Validation frontend + backend : titre obligatoire, pas de sauvegarde possible |
| 8 | Deux utilisateurs éditent la même tâche simultanément | En MVP : "last write wins" (dernier à sauvegarder écrase). Pas de gestion de conflits complexe. |
| 9 | Aucune tâche dans la liste | Affichage d'un état vide illustré : "Aucune tâche pour le moment. Créez votre première tâche !" + bouton CTA |
| 10 | Aucun membre dans l'équipe (hors soi) | Page membres vide avec message + CTA "Ajouter un membre" |

---

## 6. Principes UX / UI

- **Mobile-first responsive** : La liste fonctionne aussi sur mobile (cartes empilées).
- **Actions rapides** : Changer le statut en 1 clic, pas besoin d'ouvrir le modal.
- **Feedback immédiat** : Toasts à chaque action importante (création, modification, suppression).
- **Français partout** : Interface, labels, messages d'erreur, toasts, emails (même les clés techniques restent en anglais, l'UI est 100% FR).
- **Simplicité** : Pas de sidebar complexe, pas de tableaux de bord lourds. Une liste claire, des modals propres.

---

*Spec prête pour validation. Si validée, passage à l'Architecture Technique (Phase 3).*
