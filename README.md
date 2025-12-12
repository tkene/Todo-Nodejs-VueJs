# Todo Tags Project

Application de gestion de tâches (Todos) et de candidatures (Jobs) avec système de tags.

## 🛠️ Technologies

### Backend
- **Node.js** + **Express**
- Stockage de données en JSON (db.json)
- API REST pour Todos, Tags et Jobs

### Frontend
- **Vue 3** + **Vite**
- **Quasar Framework** (UI components)
- **TailwindCSS** (styling)
- **Vue Router** (routing)

## 🚀 Démarrage rapide

### 1. Backend

```bash
cd server
npm install
npm start
```

Le serveur backend démarre sur **http://localhost:3000**

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Le serveur de développement démarre sur **http://localhost:5173** (par défaut)

### 3. Accéder à l'application

Ouvrez votre navigateur sur **http://localhost:5173**

## 📁 Structure du projet

```
todo-tags-project/
├── client/              # Frontend Vue 3 + Quasar
│   ├── src/
│   │   ├── api/        # Appels API (Jobs, Tags, Todos)
│   │   ├── components/ # Composants réutilisables
│   │   ├── views/      # Pages de l'application
│   │   ├── router/     # Configuration des routes
│   │   └── utils/      # Fonctions utilitaires
│   └── package.json
│
└── server/             # Backend Node.js + Express
    ├── modules/        # Logique métier
    ├── routes/         # Routes API
    ├── db.json         # Base de données JSON
    └── server.js       # Point d'entrée du serveur
```

## 🎯 Fonctionnalités

- ✅ **Gestion des Todos** : Création, modification, suppression, marquage comme terminé
- 🏷️ **Système de Tags** : Création et gestion de tags pour organiser les todos
- 💼 **Gestion des Candidatures** : Suivi des candidatures avec statuts, contacts, langages
- 📝 **Commentaires** : Ajout de commentaires sur les candidatures
- 🔍 **Filtres et recherche** : Filtrage des todos par statut et recherche par texte/tags

## 📡 API Endpoints

- `GET/POST /todos` - Liste et création de todos
- `GET/PUT/DELETE /todos/:id` - Opérations sur un todo
- `GET/POST /tags` - Liste et création de tags
- `GET/PUT/DELETE /tags/:id` - Opérations sur un tag
- `GET/POST /jobs` - Liste et création de candidatures
- `GET/PUT/DELETE /jobs/:id` - Opérations sur une candidature
- `GET/PUT /jobs/:id/comment` - Gestion des commentaires

## 🔧 Scripts disponibles

### Backend
- `npm start` - Démarrer le serveur
- `npm run dev` - Démarrer avec nodemon (reload automatique)

### Frontend
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build de production

## 📝 Notes

- La base de données est stockée dans `server/db.json`
- Le backend utilise CORS pour permettre les requêtes depuis le frontend
- Les données sont persistées dans le fichier JSON à chaque modification
