# Todo Tags Project

Application de gestion de tâches (Todos) et de candidatures (Jobs) avec système de tags et authentification utilisateur.

## 🛠️ Technologies

### Backend
- **Node.js** + **Express**
- **SQLite** avec **Sequelize ORM** (base de données relationnelle)
- **Express Session** (gestion des sessions utilisateur)
- **bcryptjs** (hachage des mots de passe)
- API REST pour Todos, Tags, Jobs et Authentification

### Frontend
- **Vue 3** + **Vite**
- **Quasar Framework** (UI components)
- **TailwindCSS** (styling)
- **Vue Router** (routing avec guards d'authentification)

## 🚀 Démarrage rapide

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### 1. Backend

```bash
cd server
npm install
npm start
```

Le serveur backend démarre sur **http://localhost:3000**

**Note** : La base de données SQLite (`database.sqlite`) sera créée automatiquement au premier démarrage, ainsi que les tables via les migrations Sequelize.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Le serveur de développement démarre sur **http://localhost:5173** (par défaut)

### 3. Accéder à l'application

Ouvrez votre navigateur sur **http://localhost:5173**

### 4. Créer un compte utilisateur

Lors du premier démarrage, vous pouvez :
- Créer un compte via l'interface d'inscription
- Ou utiliser le script pour créer des utilisateurs initiaux :
  ```bash
  cd server
  node scripts/create-initial-users.js
  ```

## 📁 Structure du projet

```
todo-tags-project/
├── client/              # Frontend Vue 3 + Quasar
│   ├── src/
│   │   ├── api/        # Appels API (Jobs, Tags, Todos, Auth)
│   │   ├── components/ # Composants réutilisables
│   │   ├── composables/# Composables Vue (useAuth)
│   │   ├── views/      # Pages de l'application
│   │   ├── router/     # Configuration des routes avec guards
│   │   └── utils/      # Fonctions utilitaires
│   └── package.json
│
└── server/             # Backend Node.js + Express
    ├── config/         # Configuration (database, session)
    ├── middleware/     # Middleware (auth)
    ├── migrations/    # Migrations Sequelize
    ├── models/         # Modèles Sequelize (User, Todo, Tag, Job, Comment)
    ├── modules/        # Logique métier
    ├── routes/         # Routes API (todos, tags, jobs, auth)
    ├── scripts/        # Scripts utilitaires
    ├── database.sqlite # Base de données SQLite
    └── server.js       # Point d'entrée du serveur
```

## 🎯 Fonctionnalités

- 🔐 **Authentification** : Inscription, connexion, déconnexion avec sessions sécurisées
- 👤 **Multi-utilisateurs** : Chaque utilisateur a ses propres todos, tags et candidatures
- ✅ **Gestion des Todos** : Création, modification, suppression, marquage comme terminé
- 🏷️ **Système de Tags** : Création et gestion de tags pour organiser les todos
- 💼 **Gestion des Candidatures** : Suivi des candidatures avec statuts, contacts, langages
- 📝 **Commentaires** : Ajout de commentaires sur les candidatures
- 🔍 **Filtres et recherche** : Filtrage des todos par statut et recherche par texte/tags
- 💾 **Base de données SQLite** : Stockage relationnel avec Sequelize ORM

## 📡 API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
  ```json
  {
    "email": "user@example.com",
    "password": "motdepasse123"
  }
  ```
- `POST /api/auth/login` - Connexion
  ```json
  {
    "email": "user@example.com",
    "password": "motdepasse123"
  }
  ```
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Vérifier l'état de la session
- `GET /api/auth/check` - Vérifier l'authentification (requiert auth)

### Todos

- `GET /todos` - Liste des todos de l'utilisateur connecté
- `POST /todos` - Créer un nouveau todo
- `GET /todos/:id` - Récupérer un todo par ID
- `PUT /todos/:id` - Mettre à jour un todo
- `DELETE /todos/:id` - Supprimer un todo

### Tags

- `GET /tags` - Liste des tags de l'utilisateur connecté
- `POST /tags` - Créer un nouveau tag
- `GET /tags/:id` - Récupérer un tag par ID
- `PUT /tags/:id` - Mettre à jour un tag
- `DELETE /tags/:id` - Supprimer un tag

### Jobs (Candidatures)

- `GET /jobs` - Liste des candidatures de l'utilisateur connecté
- `POST /jobs` - Créer une nouvelle candidature
- `GET /jobs/:id` - Récupérer une candidature par ID
- `PUT /jobs/:id` - Mettre à jour une candidature
- `DELETE /jobs/:id` - Supprimer une candidature
- `GET /jobs/:id/comment` - Récupérer les commentaires d'une candidature
- `PUT /jobs/:id/comment` - Ajouter un commentaire

## 🔧 Scripts disponibles

### Backend
- `npm start` - Démarrer le serveur
- `npm run dev` - Démarrer avec nodemon (reload automatique)
- `npm run migrate` - Exécuter les migrations manuellement
- `npm run db:migrate` - Exécuter les migrations Sequelize
- `npm run db:migrate:undo` - Annuler la dernière migration
- `npm run backup:db` - Sauvegarder la base de données
- `npm run restore:db` - Restaurer la base de données
- `npm run setup:production` - Configuration pour la production

### Frontend
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build de production

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` dans le dossier `server/` :

```env
# Port du serveur
PORT=3000

# Environnement (development, production, test)
NODE_ENV=development

# CORS Origin (pour la production)
CORS_ORIGIN=https://votre-domaine.com

# Session secret (générer une clé aléatoire sécurisée)
SESSION_SECRET=votre-secret-session-tres-securise

# Auto-migration au démarrage (true/false)
AUTO_MIGRATE=true
```

## 📝 Notes importantes

- **Base de données** : La base de données SQLite est stockée dans `server/database.sqlite`
- **Migrations** : Les migrations Sequelize sont exécutées automatiquement au démarrage (si `AUTO_MIGRATE=true`)
- **Sessions** : Les sessions sont stockées dans `server/sessions.db` (SQLite)
- **Authentification** : Toutes les routes (sauf `/api/auth/*`) nécessitent une authentification
- **Isolation des données** : Chaque utilisateur ne voit que ses propres todos, tags et candidatures
- **Sécurité** : Les mots de passe sont hashés avec bcrypt (10 rounds)
- **CORS** : Configuré pour permettre les requêtes depuis le frontend

## 🔒 Sécurité

- Mots de passe hashés avec bcryptjs
- Sessions sécurisées avec express-session
- Validation des emails et mots de passe
- Middleware d'authentification sur les routes protégées
- Isolation des données par utilisateur
