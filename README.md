# Todo Tags Project

Application de gestion de tâches (Todos) et de candidatures (Jobs) avec système de tags et authentification utilisateur.

## 🛠️ Technologies

### Backend
- **Node.js** + **Express**
- **MySQL** avec **Sequelize ORM** (base de données relationnelle)
- **Express Session** (gestion des sessions utilisateur avec MySQL)
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

**Note** : Configurez les variables d'environnement MySQL avant de démarrer :

à faire

Les tables seront créées automatiquement au premier démarrage via les migrations Sequelize.

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
├── client/                    # Frontend Vue 3 + Quasar
│   ├── src/
│   │   ├── api/              # Appels API (Jobs, Tags, Todos, Auth)
│   │   │   ├── auth.js
│   │   │   ├── axios.js
│   │   │   ├── Job.js
│   │   │   ├── Tags.js
│   │   │   └── Todos.js
│   │   ├── assets/           # Assets statiques (CSS, images)
│   │   │   ├── images/
│   │   │   ├── base.css
│   │   │   ├── main.css
│   │   │   └── quasar-variables.sass
│   │   ├── components/       # Composants réutilisables
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
│   │   ├── composables/      # Composables Vue (useAuth)
│   │   │   └── useAuth.js
│   │   ├── constants/        # Constantes de l'application
│   │   │   └── jobStatuses.js
│   │   ├── views/            # Pages de l'application
│   │   │   ├── Jobs/
│   │   │   │   ├── JobAlerts.vue
│   │   │   │   └── JobDetails.vue
│   │   │   ├── TheGames/
│   │   │   │   └── Wordle.vue
│   │   │   ├── 404.vue
│   │   │   ├── HomePage.vue
│   │   │   ├── Login.vue
│   │   │   ├── TagsPage.vue
│   │   │   └── Todo.vue
│   │   ├── router/           # Configuration des routes avec guards
│   │   │   ├── guards.js
│   │   │   └── index.js
│   │   ├── utils/            # Fonctions utilitaires
│   │   │   └── function.js
│   │   ├── App.vue
│   │   ├── Menu.vue
│   │   ├── index.css
│   │   └── main.js
│   ├── dist/                 # Dossier de build de production
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js        # Configuration Vite
│   ├── tailwind.config.js     # Configuration TailwindCSS
│   └── postcss.config.js      # Configuration PostCSS
│
├── server/                   # Backend Node.js + Express
│   ├── config/               # Configuration (database, session)
│   │   ├── database.js
│   │   └── session.js
│   ├── middleware/          # Middleware (auth)
│   │   └── auth.js
│   ├── migrations/           # Migrations Sequelize
│   │   ├── 20250101000001-create-tags.js
│   │   ├── 20250101000002-create-todos.js
│   │   ├── 20250101000003-create-todo-tags.js
│   │   ├── 20250101000004-create-jobs.js
│   │   ├── 20250101000005-create-comments.js
│   │   ├── 20250101000006-create-users.js
│   │   ├── 20250101000007-add-userid-to-todos.js
│   │   ├── 20250101000008-add-userid-to-jobs.js
│   │   └── 20250101000009-add-userid-to-tags.js
│   ├── models/               # Modèles Sequelize
│   │   ├── Comment.js
│   │   ├── index.js
│   │   ├── Job.js
│   │   ├── Tag.js
│   │   ├── Todo.js
│   │   └── User.js
│   ├── modules/              # Logique métier
│   │   ├── jobs.js
│   │   ├── tags.js
│   │   ├── todos.js
│   │   └── users.js
│   ├── routes/               # Routes API
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── tags.js
│   │   └── todos.js
│   ├── scripts/              # Scripts utilitaires
│   │   └── init-db.js
│   ├── backUp/               # Dossier de sauvegarde
│   ├── config/                # Configuration
│   │   ├── database.js        # Configuration MySQL
│   │   └── session.js         # Configuration des sessions
│   ├── server.js             # Point d'entrée du serveur
│   ├── package.json
│   ├── DEPLOYMENT.md         # Documentation de déploiement
│   └── ZEABUR.md             # Guide de déploiement Zeabur
│
├── scripts/                  # Scripts à la racine du projet
│   └── postinstall.js        # Script post-installation (installation serveur)
│
├── index.js                  # Point d'entrée pour Zeabur
├── package.json              # Configuration npm racine
├── zeabur.json               # Configuration Zeabur (build et déploiement)
├── ARCHITECTURE.md           # Documentation de l'architecture
└── README.md                 # Ce fichier
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
- `GET /jobs/:id/comments` - Récupérer les commentaires d'une candidature
- `POST /jobs/:id/comments` - Ajouter un commentaire

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

# Configuration MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_tags_dev
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# CORS Origin (pour la production)
CORS_ORIGIN=https://votre-domaine.com

# Session secret (générer une clé aléatoire sécurisée)
SESSION_SECRET=votre-secret-session-tres-securise

# Auto-migration au démarrage (true/false)
AUTO_MIGRATE=true
```

## 📝 Notes importantes

- **Base de données** : MySQL est utilisé pour toutes les données (développement, production, test)
- **Configuration MySQL** : Configurez les variables d'environnement DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- **Migrations** : Les migrations Sequelize sont exécutées automatiquement au démarrage (si `AUTO_MIGRATE=true`)
- **Sessions** : Les sessions sont stockées dans la table `sessions` de MySQL
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
