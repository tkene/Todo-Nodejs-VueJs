# Backend - API REST

Backend Node.js + Express pour la gestion des Todos, Tags et Candidatures (Jobs).

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Démarrer le serveur
npm start

# Mode développement (avec nodemon pour le rechargement automatique)
npm run dev
```

Le serveur démarre sur **http://localhost:3000** (ou le port défini dans `PORT`)

## 📁 Structure du projet

```
server/
├── server.js          # Point d'entrée du serveur Express
├── db.json            # Base de données JSON (stockage des données)
├── modules/           # Logique métier
│   ├── store.js       # Gestion du stockage JSON
│   ├── todos.js       # Logique des todos
│   ├── tags.js        # Logique des tags
│   └── jobs.js        # Logique des candidatures
└── routes/            # Routes API
    ├── todos.js       # Routes /todos
    ├── tags.js        # Routes /tags
    └── jobs.js        # Routes /jobs
```

## 📡 API Endpoints

### Todos

- `GET /todos` - Récupérer tous les todos
- `POST /todos` - Créer un nouveau todo
  ```json
  {
    "text": "Ma tâche",
    "tags": [1234567890],
    "done": false
  }
  ```
- `GET /todos/:id` - Récupérer un todo par ID
- `PUT /todos/:id` - Mettre à jour un todo
- `DELETE /todos/:id` - Supprimer un todo

### Tags

- `GET /tags` - Récupérer tous les tags
- `POST /tags` - Créer un nouveau tag
  ```json
  {
    "name": "Nom du tag"
  }
  ```
- `GET /tags/:id` - Récupérer un tag par ID
- `PUT /tags/:id` - Mettre à jour un tag
- `DELETE /tags/:id` - Supprimer un tag

### Jobs (Candidatures)

- `GET /jobs` - Récupérer toutes les candidatures
- `POST /jobs` - Créer une nouvelle candidature
  ```json
  {
    "company": "Nom de l'entreprise",
    "job": "Intitulé du poste",
    "status": "Envoyée",
    "date": "2025-01-15",
    "job_link": "https://...",
    "contactName": "Nom du contact",
    "contactEmail": "email@example.com",
    "contactPhone": "+33...",
    "platform": "LinkedIn",
    "language": ["JavaScript", "Vue.js"]
  }
  ```
- `GET /jobs/:id` - Récupérer une candidature par ID
- `PUT /jobs/:id` - Mettre à jour une candidature
- `DELETE /jobs/:id` - Supprimer une candidature

#### Commentaires sur les candidatures

- `GET /jobs/:id/comment` - Récupérer tous les commentaires d'une candidature
- `PUT /jobs/:id/comment` - Ajouter un commentaire
  ```json
  {
    "comment": "Texte du commentaire"
  }
  ```
- `PUT /jobs/:id/comment/:commentId` - Mettre à jour un commentaire
- `DELETE /jobs/:id/comment/:commentId` - Supprimer un commentaire

## 💾 Stockage des données

Les données sont stockées dans `db.json` avec la structure suivante :

```json
{
  "todos": [...],
  "tags": [...],
  "jobs": [...],
  "comments": [...]
}
```

⚠️ **Important** : Les modifications sont persistées automatiquement dans `db.json`. Faites des sauvegardes régulières si nécessaire.

## 🔧 Configuration

- **Port** : Défini par la variable d'environnement `PORT` (défaut: 3000)
- **CORS** : Activé pour permettre les requêtes depuis le frontend
- **Body Parser** : JSON activé pour parser les requêtes

## 📝 Logs

Le serveur affiche des logs détaillés pour :
- Les requêtes reçues
- Les opérations CRUD
- Les erreurs éventuelles

## 🛠️ Dépendances

- **express** : Framework web
- **cors** : Gestion CORS
- **nodemon** : Rechargement automatique (dev)

## 🔍 Exemples d'utilisation

### Créer un todo
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Nouvelle tâche", "tags": [], "done": false}'
```

### Créer un tag
```bash
curl -X POST http://localhost:3000/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "Urgent"}'
```

### Créer une candidature
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Tech Corp",
    "job": "Développeur Fullstack",
    "status": "Envoyée",
    "date": "2025-01-15",
    "language": ["JavaScript", "Vue.js"]
  }'
```
