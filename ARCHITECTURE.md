# Architecture du Projet Todo-Tags

## 📋 Vue d'ensemble

Ce projet est une application web full-stack de gestion de tâches (Todos) et de candidatures (Jobs) avec système de tags et authentification multi-utilisateurs. L'application suit une architecture **client-serveur** avec séparation claire entre le frontend et le backend.

## 🏗️ Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                     │
│  Vue 3 + Quasar + TailwindCSS + Vite                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Router     │  │   Composants │  │   API Calls  │      │
│  │  (Guards)    │  │   Vue 3      │  │   Axios      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                        SERVER (Backend)                      │
│  Node.js + Express + Sequelize                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │  Middleware  │  │   Models     │     │
│  │   API REST   │  │   (Auth)     │  │  Sequelize   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ ORM
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                           │
│                    SQLite (database.sqlite)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Todos   │  │   Tags   │  │   Jobs   │   │
│  │          │  │          │  │          │  │ Comments │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Stack technologique

### Frontend
- **Vue 3** : Framework JavaScript réactif
- **Vite** : Build tool et serveur de développement
- **Quasar Framework** : Framework UI avec composants Material Design
- **Vue Router** : Routing avec guards d'authentification
- **Axios** : Client HTTP pour les appels API
- **TailwindCSS** : Framework CSS utility-first
- **Sass** : Préprocesseur CSS

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web pour Node.js
- **Sequelize** : ORM pour SQLite
- **SQLite** : Base de données relationnelle
- **Express Session** : Gestion des sessions utilisateur
- **bcryptjs** : Hachage des mots de passe
- **connect-sqlite3** : Store de sessions SQLite

## 📁 Structure du projet

```
todo-tags-project/
│
├── index.js                    # Point d'entrée principal (redirige vers server)
│
├── client/                     # Frontend Vue 3
│   ├── src/
│   │   ├── api/               # Services API
│   │   │   ├── auth.js        # Authentification
│   │   │   ├── axios.js       # Configuration Axios
│   │   │   ├── Job.js         # API Candidatures
│   │   │   ├── Tags.js        # API Tags
│   │   │   └── Todos.js       # API Todos
│   │   │
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── AddComment.vue
│   │   │   ├── AddJobApplication.vue
│   │   │   ├── AddTodo.vue
│   │   │   ├── ConfirmDialog.vue
│   │   │   ├── CopyButton.vue
│   │   │   ├── EditableTimeline.vue
│   │   │   ├── FiltersTodo.vue
│   │   │   ├── ListCard.vue
│   │   │   ├── StatCard.vue
│   │   │   └── Tags.vue
│   │   │
│   │   ├── composables/      # Composables Vue
│   │   │   └── useAuth.js    # Gestion de l'authentification
│   │   │
│   │   ├── constants/        # Constantes
│   │   │   └── jobStatuses.js
│   │   │
│   │   ├── router/           # Configuration du routing
│   │   │   ├── guards.js    # Guards d'authentification
│   │   │   └── index.js     # Définition des routes
│   │   │
│   │   ├── utils/           # Fonctions utilitaires
│   │   │   └── function.js
│   │   │
│   │   ├── views/           # Pages de l'application
│   │   │   ├── HomePage.vue
│   │   │   ├── Login.vue
│   │   │   ├── Todo.vue
│   │   │   ├── TagsPage.vue
│   │   │   ├── 404.vue
│   │   │   ├── Jobs/
│   │   │   │   ├── JobAlerts.vue
│   │   │   │   └── JobDetails.vue
│   │   │   └── TheGames/
│   │   │       └── Wordle.vue
│   │   │
│   │   ├── App.vue          # Composant racine
│   │   ├── Menu.vue         # Menu de navigation
│   │   └── main.js          # Point d'entrée Vue
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                    # Backend Node.js
    ├── server.js              # Point d'entrée du serveur Express
    │
    ├── config/               # Configuration
    │   ├── database.js       # Configuration Sequelize
    │   └── session.js        # Configuration des sessions
    │
    ├── middleware/           # Middleware Express
    │   └── auth.js           # Middleware d'authentification
    │
    ├── models/               # Modèles Sequelize
    │   ├── index.js          # Initialisation Sequelize + associations
    │   ├── User.js           # Modèle Utilisateur
    │   ├── Todo.js           # Modèle Todo
    │   ├── Tag.js            # Modèle Tag
    │   ├── Job.js            # Modèle Candidature
    │   └── Comment.js        # Modèle Commentaire
    │
    ├── migrations/           # Migrations Sequelize
    │   ├── 20250101000001-create-tags.js
    │   ├── 20250101000002-create-todos.js
    │   ├── 20250101000003-create-todo-tags.js
    │   ├── 20250101000004-create-jobs.js
    │   ├── 20250101000005-create-comments.js
    │   ├── 20250101000006-create-users.js
    │   ├── 20250101000007-add-userid-to-todos.js
    │   ├── 20250101000008-add-userid-to-jobs.js
    │   └── 20250101000009-add-userid-to-tags.js
    │
    ├── modules/              # Logique métier
    │   ├── db.js             # Utilitaires base de données
    │   ├── users.js          # Logique utilisateurs
    │   ├── todos.js          # Logique todos
    │   ├── tags.js           # Logique tags
    │   └── jobs.js           # Logique candidatures
    │
    ├── routes/               # Routes API
    │   ├── auth.js           # Routes authentification
    │   ├── todos.js          # Routes todos
    │   ├── tags.js           # Routes tags
    │   └── jobs.js           # Routes candidatures
    │
    ├── scripts/              # Scripts utilitaires
    │   ├── create-initial-users.js
    │   ├── migrate-db.js
    │   ├── backup-database.js
    │   ├── restore-database.js
    │   └── ...
    │
    ├── database.sqlite       # Base de données SQLite
    ├── sessions.db           # Base de données des sessions
    └── package.json
```

## 🔄 Flux de données

### 1. Authentification

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │                    │ Server  │                    │   DB    │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ POST /api/auth/login         │                              │
     │ {email, password}            │                              │
     ├─────────────────────────────>│                              │
     │                              │ SELECT * FROM users          │
     │                              │ WHERE email = ?              │
     │                              ├─────────────────────────────>│
     │                              │<─────────────────────────────┤
     │                              │ bcrypt.compare()             │
     │                              │                              │
     │                              │ req.session.userId = user.id │
     │                              │ (SQLite sessions.db)         │
     │                              │                              │
     │ {success: true, user: {...}} │                              │
     │<─────────────────────────────┤                              │
     │                              │                              │
     │ Cookie: sessionId            │                              │
     │<─────────────────────────────┤                              │
```

### 2. Requête authentifiée (ex: GET /todos)

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │                    │ Server  │                    │   DB    │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ GET /todos                    │                              │
     │ Cookie: sessionId             │                              │
     ├─────────────────────────────>│                              │
     │                              │ Middleware requireAuth       │
     │                              │ Vérifie req.session.userId   │
     │                              │                              │
     │                              │ SELECT * FROM todos          │
     │                              │ WHERE userId = ?             │
     │                              ├─────────────────────────────>│
     │                              │<─────────────────────────────┤
     │                              │                              │
     │ [{todo1}, {todo2}, ...]      │                              │
     │<─────────────────────────────┤                              │
```

## 🗄️ Modèle de données

### Schéma de base de données

```
┌─────────────┐
│    Users    │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
       │                  │                  │
┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
│    Todos    │    │    Jobs     │    │    Tags     │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ userId (FK) │    │ userId (FK) │    │ userId (FK) │
│ text        │    │ company     │    │ name        │
│ done        │    │ position    │    │ color       │
│ createdAt   │    │ status      │    │ createdAt   │
│ updatedAt   │    │ ...         │    │ updatedAt   │
└──────┬──────┘    │ createdAt   │    └──────┬──────┘
       │           │ updatedAt   │           │
       │           └──────┬──────┘           │
       │                  │                  │
       │                  │ 1:N              │
       │                  │                  │
       │            ┌─────▼──────┐           │
       │            │  Comments  │           │
       │            ├────────────┤           │
       │            │ id (PK)    │           │
       │            │ jobId (FK) │           │
       │            │ content     │           │
       │            │ createdAt   │           │
       │            │ updatedAt   │           │
       │            └────────────┘           │
       │                                     │
       │            N:M                      │
       └─────────────────────────────────────┘
                    │
            ┌───────▼────────┐
            │   TodoTags     │
            ├───────────────┤
            │ todoId (FK)   │
            │ tagId (FK)    │
            └───────────────┘
```

### Relations

1. **User → Todos** : One-to-Many (un utilisateur a plusieurs todos)
2. **User → Jobs** : One-to-Many (un utilisateur a plusieurs candidatures)
3. **User → Tags** : One-to-Many (un utilisateur a plusieurs tags)
4. **Todo ↔ Tags** : Many-to-Many (via table `TodoTags`)
5. **Job → Comments** : One-to-Many (une candidature a plusieurs commentaires)

## 🔐 Sécurité

### Authentification

- **Sessions** : Stockage des sessions dans SQLite (`sessions.db`)
- **Cookies** : Cookies HTTP-only avec SameSite protection
- **Mots de passe** : Hachage avec bcryptjs (10 rounds)
- **Middleware** : `requireAuth` pour protéger les routes sensibles

### Configuration des sessions

```javascript
// server/config/session.js
- Store: SQLite (connect-sqlite3)
- Secret: Variable d'environnement SESSION_SECRET
- Cookie: httpOnly, secure en production, maxAge 24h
- SameSite: 'lax' (protection CSRF)
```

## 🛣️ Routes API

### Authentification (`/api/auth`)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - État de la session
- `GET /api/auth/check` - Vérification auth (requiert auth)

### Todos (`/todos`)
- `GET /todos` - Liste des todos de l'utilisateur
- `POST /todos` - Créer un todo
- `GET /todos/:id` - Récupérer un todo
- `PUT /todos/:id` - Mettre à jour un todo
- `DELETE /todos/:id` - Supprimer un todo

### Tags (`/tags`)
- `GET /tags` - Liste des tags de l'utilisateur
- `POST /tags` - Créer un tag
- `GET /tags/:id` - Récupérer un tag
- `PUT /tags/:id` - Mettre à jour un tag
- `DELETE /tags/:id` - Supprimer un tag

### Jobs (`/jobs`)
- `GET /jobs` - Liste des candidatures de l'utilisateur
- `POST /jobs` - Créer une candidature
- `GET /jobs/:id` - Récupérer une candidature
- `PUT /jobs/:id` - Mettre à jour une candidature
- `DELETE /jobs/:id` - Supprimer une candidature
- `GET /jobs/:id/comments` - Commentaires d'une candidature
- `POST /jobs/:id/comments` - Ajouter un commentaire

## 🎨 Frontend - Architecture Vue

### Structure des composants

```
App.vue (Racine)
├── Menu.vue (Navigation latérale)
└── RouterView
    ├── HomePage.vue
    ├── Login.vue
    ├── Todo.vue
    │   ├── FiltersTodo.vue
    │   ├── AddTodo.vue
    │   └── ListCard.vue
    ├── TagsPage.vue
    │   └── Tags.vue
    ├── JobAlerts.vue
    │   ├── AddJobApplication.vue
    │   └── ListCard.vue
    └── JobDetails.vue
        ├── AddComment.vue
        └── EditableTimeline.vue
```

### Guards de navigation

- **authGuard** : Redirige vers `/login` si non authentifié
- **guestGuard** : Redirige vers `/` si déjà authentifié (sur `/login`)

### Services API

Tous les appels API sont centralisés dans `client/src/api/` :
- Configuration Axios avec intercepteurs
- Gestion automatique des erreurs
- Headers avec credentials pour les sessions

## 🔧 Configuration et déploiement

### Variables d'environnement

**Backend** (`.env` dans `server/`) :
- `NODE_ENV` : `development` | `production`
- `PORT` : Port du serveur (défaut: 3000)
- `SESSION_SECRET` : Secret pour les sessions
- `CORS_ORIGIN` : Origine autorisée pour CORS
- `AUTO_MIGRATE` : Exécuter les migrations au démarrage

### Scripts disponibles

**Root** :
- `npm start` : Démarre le serveur
- `npm run build` : Build le frontend

**Server** :
- `npm start` : Démarre le serveur
- `npm run dev` : Mode développement (nodemon)
- `npm run db:migrate` : Exécute les migrations
- `npm run backup:db` : Sauvegarde la base de données

**Client** :
- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Prévisualiser le build

## 📊 Flux de requête complet

```
1. Utilisateur interagit avec l'interface Vue
   ↓
2. Composant Vue appelle un service API (ex: Todos.getTodos())
   ↓
3. Axios envoie une requête HTTP au backend
   ↓
4. Express reçoit la requête
   ↓
5. Middleware requireAuth vérifie la session
   ↓
6. Route handler traite la requête
   ↓
7. Module métier (ex: todos.js) interagit avec Sequelize
   ↓
8. Sequelize exécute une requête SQL sur SQLite
   ↓
9. Résultat remonte à travers les couches
   ↓
10. Réponse JSON envoyée au client
   ↓
11. Composant Vue met à jour l'état réactif
   ↓
12. Interface utilisateur se met à jour
```

## 🚀 Points d'entrée

1. **Production** : `index.js` → redirige vers `server/server.js`
2. **Développement Backend** : `server/server.js` directement
3. **Développement Frontend** : `client/` avec Vite dev server

## 📝 Migrations

Les migrations Sequelize sont exécutées automatiquement au démarrage si `AUTO_MIGRATE !== 'false'`. Elles créent et mettent à jour le schéma de la base de données.

Ordre d'exécution :
1. Création des tables de base (tags, todos, jobs, comments, users)
2. Création de la table de liaison (TodoTags)
3. Ajout des clés étrangères userId aux tables

## 🔍 Points importants

- **Isolation des données** : Chaque utilisateur ne voit que ses propres données (filtrage par `userId`)
- **Sessions persistantes** : Stockage SQLite pour la persistance entre redémarrages
- **ORM Sequelize** : Abstraction de la base de données avec relations automatiques
- **SPA (Single Page Application)** : Le frontend est une SPA avec routing côté client
- **Build de production** : Le frontend est compilé et servi comme fichiers statiques par Express

