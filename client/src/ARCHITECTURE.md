# Architecture du Frontend

## Structure des dossiers

```
src/
├── api/                    # Services API et configuration axios
│   ├── axios.js           # Instance axios configurée
│   ├── interceptors.js    # Interceptors pour gestion d'erreurs centralisée
│   ├── auth.js            # API d'authentification
│   ├── Job.js             # API des candidatures
│   ├── Todos.js           # API des tâches
│   └── Tags.js            # API des tags
│
├── components/            # Composants Vue réutilisables
│   ├── layout/           # Composants de layout (Sidebar, etc.)
│   │   └── Sidebar.vue   # Barre latérale de navigation
│   ├── AddComment.vue    # Composant d'ajout de commentaire
│   ├── AddJobApplication.vue
│   ├── AddTodo.vue
│   ├── ConfirmDialog.vue
│   ├── CopyButton.vue
│   ├── EditableTimeline.vue
│   ├── FiltersTodo.vue
│   ├── ListCard.vue
│   ├── StatCard.vue
│   └── Tags.vue
│
├── composables/          # Composables Vue (hooks réutilisables)
│   ├── useAuth.js        # Gestion de l'authentification
│   ├── useJobs.js        # Gestion des candidatures
│   ├── useTodos.js       # Gestion des tâches
│   ├── useTags.js        # Gestion des tags
│   └── useNotifications.js # Gestion des notifications
│
├── config/               # Configuration de l'application
│   ├── app.config.js     # Configuration centralisée
│   └── constants.js      # Constantes de l'application
│
├── constants/            # Constantes spécifiques
│   └── jobStatuses.js    # Statuts des candidatures
│
├── router/               # Configuration du routeur
│   ├── index.js          # Définition des routes
│   └── guards.js         # Guards de navigation
│
├── services/             # Services métier
│   └── notification.service.js # Service de notifications
│
├── types/                # Types et interfaces (JSDoc)
│   └── index.js          # Définitions de types
│
├── utils/                # Utilitaires
│   ├── date.utils.js     # Utilitaires de dates
│   ├── validation.utils.js # Utilitaires de validation
│   ├── string.utils.js   # Utilitaires de chaînes
│   ├── function.js       # Anciennes fonctions (déprécié)
│   └── index.js          # Point d'entrée
│
├── views/                # Pages/Vues
│   ├── HomePage.vue
│   ├── Login.vue
│   ├── Todo.vue
│   ├── TagsPage.vue
│   ├── 404.vue
│   ├── Jobs/
│   │   ├── JobAlerts.vue
│   │   └── JobDetails.vue
│   └── TheGames/
│       └── Wordle.vue
│
├── assets/               # Assets statiques
│   ├── images/
│   ├── base.css
│   ├── main.css
│   └── quasar-variables.sass
│
├── App.vue               # Composant racine
├── main.js               # Point d'entrée de l'application
└── index.css              # Styles globaux
```

## Principes d'architecture

### 1. Séparation des responsabilités

- **API** : Communication avec le backend uniquement
- **Services** : Logique métier réutilisable
- **Composables** : Logique réactive réutilisable
- **Components** : Présentation et interaction utilisateur
- **Utils** : Fonctions utilitaires pures

### 2. Gestion d'état

- Utilisation de composables pour la gestion d'état locale
- État partagé via composables (useAuth, useJobs, etc.)
- Pas de store global pour l'instant (peut être ajouté avec Pinia si nécessaire)

### 3. Gestion des erreurs

- Interceptors axios centralisés dans `api/interceptors.js`
- Service de notifications centralisé dans `services/notification.service.js`
- Gestion d'erreurs cohérente dans tous les composables

### 4. Configuration

- Configuration centralisée dans `config/app.config.js`
- Constantes dans `config/constants.js`
- Variables d'environnement via `import.meta.env`

### 5. Types et documentation

- Types JSDoc dans `types/index.js` pour l'autocomplétion
- Documentation des fonctions avec JSDoc

## Utilisation des composables

### useJobs
```javascript
import { useJobs } from '@/composables/useJobs'

const { jobs, isLoading, loadJobs, addJob, updateJob, removeJob } = useJobs()
```

### useTodos
```javascript
import { useTodos } from '@/composables/useTodos'

const { todos, activeTodos, loadTodos, addTodo, toggleTodo } = useTodos()
```

### useTags
```javascript
import { useTags } from '@/composables/useTags'

const { tags, sortedTags, loadTags, addTag, removeTag } = useTags()
```

### useNotifications
```javascript
import { useNotifications } from '@/composables/useNotifications'

const { success, error, warning, info } = useNotifications()
```

## Migration

Les anciennes fonctions dans `utils/function.js` sont toujours disponibles mais dépréciées.
Utilisez les nouveaux utilitaires dans `utils/date.utils.js`, `utils/validation.utils.js`, etc.

## Améliorations futures

1. **Pinia Store** : Ajouter Pinia pour la gestion d'état globale si nécessaire
2. **Tests** : Ajouter des tests unitaires et d'intégration
3. **TypeScript** : Migrer vers TypeScript pour une meilleure sécurité de type
4. **i18n** : Ajouter la gestion multilingue
5. **PWA** : Transformer en Progressive Web App
6. **Performance** : Optimisations (lazy loading, code splitting, etc.)

