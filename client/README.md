# Frontend - Application Vue 3

Application frontend Vue 3 avec Quasar Framework pour la gestion de Todos, Tags et Candidatures.

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build de production
npm run preview
```

Le serveur de développement démarre sur **http://localhost:5173** (par défaut)

## 🛠️ Technologies

- **Vue 3** - Framework JavaScript réactif
- **Vite** - Build tool et serveur de développement
- **Quasar Framework** - Framework UI avec composants Material Design
- **Vue Router** - Routing pour les applications Vue
- **Axios** - Client HTTP pour les appels API
- **TailwindCSS** - Framework CSS utility-first
- **Sass** - Préprocesseur CSS

## 📁 Structure du projet

```
client/src/
├── api/                # Services API
│   ├── Job.js         # Appels API pour les candidatures
│   ├── Tags.js        # Appels API pour les tags
│   └── Todos.js       # Appels API pour les todos
│
├── assets/             # Ressources statiques
│   ├── base.css       # Styles de base
│   ├── main.css       # Styles principaux
│   └── quasar-variables.sass  # Variables Quasar
│
├── components/         # Composants réutilisables
│   ├── AddComment.vue           # Modal d'ajout de commentaire
│   ├── AddJobApplication.vue    # Modal d'ajout/modification de candidature
│   ├── AddTodo.vue              # Modal d'ajout de todo
│   ├── ConfirmDialog.vue       # Dialog de confirmation
│   ├── CopyButton.vue           # Bouton de copie
│   ├── FiltersTodo.vue          # Filtres pour les todos
│   ├── ListCard.vue             # Carte de liste
│   ├── StatCard.vue             # Carte de statistiques
│   └── Tags.vue                 # Gestion des tags
│
├── constants/         # Constantes
│   └── jobStatuses.js # Statuts de candidature et langages
│
├── router/            # Configuration du routing
│   └── index.js      # Définition des routes
│
├── utils/            # Fonctions utilitaires
│   └── function.js   # Fonctions helper (formatDate, etc.)
│
├── views/            # Pages de l'application
│   ├── HomePage.vue           # Page d'accueil avec statistiques
│   ├── Todo.vue               # Page de gestion des todos
│   ├── TagsPage.vue           # Page de gestion des tags
│   ├── 404.vue                # Page d'erreur 404
│   └── Jobs/
│       ├── JobAlerts.vue      # Liste des candidatures
│       └── JobDetails.vue     # Détails d'une candidature
│
├── App.vue           # Composant racine
├── Menu.vue          # Menu de navigation latéral
└── main.js           # Point d'entrée de l'application
```

## 🗺️ Routes de l'application

- `/` - **Home** : Page d'accueil avec statistiques et listes
- `/job-alerts` - **Job Alerts** : Liste des candidatures
- `/job-details/:id` - **Job Details** : Détails d'une candidature (avec commentaires)
- `/todo` - **Todo** : Gestion des tâches avec tags
- `/configuration/tags` - **Tags** : Gestion des tags (sous-menu Configuration)
- `/404` - **404** : Page d'erreur

## 🎨 Composants principaux

### Modals
- **AddJobApplication** : Création et modification de candidatures
- **AddTodo** : Création de nouvelles tâches
- **AddComment** : Ajout de commentaires sur les candidatures
- **ConfirmDialog** : Dialog de confirmation générique

### Composants UI
- **Menu** : Menu de navigation latéral avec sous-menus
- **StatCard** : Cartes de statistiques
- **ListCard** : Cartes de liste avec items
- **Tags** : Gestion complète des tags (CRUD)
- **CopyButton** : Bouton de copie avec feedback

## 🔌 Configuration API

L'URL de l'API backend est définie dans les fichiers `api/*.js` :

```javascript
const API = 'http://localhost:3000'
```

Pour changer l'URL de l'API, modifiez cette constante dans chaque fichier API ou utilisez une variable d'environnement.

## 📦 Scripts disponibles

- `npm run dev` - Lance le serveur de développement Vite
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise le build de production

## 🎯 Fonctionnalités

### Gestion des Todos
- ✅ Création, modification, suppression de todos
- 🏷️ Association de tags multiples
- ✅ Marquage comme terminé/non terminé
- 🔍 Filtrage par statut (tous, à faire, terminés)
- 🔎 Recherche par texte ou tags

### Gestion des Tags
- ➕ Création de tags via modal
- ✏️ Modification de tags
- 🗑️ Suppression de tags avec confirmation
- 📋 Liste de tous les tags disponibles

### Gestion des Candidatures
- ➕ Création de candidatures avec modal
- ✏️ Modification de candidatures
- 🗑️ Suppression de candidatures
- 📊 Suivi des statuts (À envoyer, Envoyée, Relance faite, Entretien, Offre, Refusée)
- 💬 Ajout et gestion de commentaires
- 📅 Suivi des dates de candidature
- 🔗 Liens vers les offres d'emploi
- 👤 Informations de contact (nom, email, téléphone)
- 🖥️ Plateforme de candidature
- 💻 Langages de programmation requis

### Page d'accueil
- 📊 Statistiques (candidatures, réponses, entretiens, tâches)
- 📋 Liste des relances à faire
- ✅ Liste des tâches à faire

## 🎨 Styles

L'application utilise :
- **Quasar** pour les composants UI (boutons, inputs, dialogs, etc.)
- **TailwindCSS** pour le styling utilitaire
- **Variables CSS personnalisées** pour les couleurs et thèmes

## 🔧 Configuration Vite

Le fichier `vite.config.js` configure :
- Le plugin Vue
- Le plugin Quasar
- La transformation des assets

## 📝 Notes de développement

- Les composants utilisent la Composition API de Vue 3 (`<script setup>`)
- Les appels API sont centralisés dans le dossier `api/`
- Le routing utilise Vue Router avec lazy loading des composants
- Les notifications utilisent Quasar Notify
- Le menu latéral gère automatiquement les routes avec sous-menus

## 🌐 Variables d'environnement

Pour configurer l'URL de l'API backend, vous pouvez créer un fichier `.env` :

```env
VITE_API_URL=http://localhost:3000
```

Puis utiliser `import.meta.env.VITE_API_URL` dans les fichiers API.
