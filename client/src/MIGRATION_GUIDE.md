# Guide de Migration

## Migration vers les nouveaux composables

### Exemple : JobAlerts.vue

#### Avant
```javascript
const jobs = ref([])
const isLoading = ref(false)
const error = ref(null)

async function loadJobs() {
  try {
    isLoading.value = true
    const data = await getJobsApi()
    jobs.value = data
  } catch (err) {
    error.value = err
    // Gestion d'erreur manuelle
  } finally {
    isLoading.value = false
  }
}
```

#### Après (avec useJobs)
```javascript
import { useJobs } from '@/composables/useJobs'

const { 
  jobs, 
  isLoading, 
  error, 
  activeJobs, 
  rejectedJobs,
  loadJobs, 
  addJob 
} = useJobs()

// Plus besoin de gérer isLoading et error manuellement
// Les notifications sont automatiques
onMounted(() => {
  loadJobs()
})
```

### Exemple : Todo.vue

#### Avant
```javascript
const todos = ref([])

async function loadTodos() {
  const res = await getTodos()
  todos.value = res
}

async function createTodo(todo) {
  const res = await createTodoApi(todo)
  todos.value.push(res)
  // Notification manuelle
}
```

#### Après (avec useTodos)
```javascript
import { useTodos } from '@/composables/useTodos'

const { 
  todos, 
  activeTodos,
  completedTodos,
  loadTodos, 
  addTodo,
  updateTodo,
  removeTodo,
  toggleTodo
} = useTodos()

// Les notifications sont automatiques
// Les computed properties sont déjà disponibles
```

## Migration des utilitaires

### Avant
```javascript
import { formatDate, isPendingReview, formatCommentDate } from '../utils/function'
```

### Après
```javascript
import { formatDate, isPendingReview, formatCommentDate } from '../utils/date.utils'
// ou
import { formatDate, isPendingReview, formatCommentDate } from '../utils'
```

## Utilisation des notifications

### Avant
```javascript
$q.notify({
  message: 'Succès !',
  color: 'positive',
  icon: 'check',
  position: 'top-right',
  timeout: 2000
})
```

### Après
```javascript
import { useNotifications } from '@/composables/useNotifications'

const { success, error, warning, info } = useNotifications()

success('Succès !')
error('Erreur !')
warning('Attention !')
info('Information')
```

## Migration progressive

Vous pouvez migrer progressivement :
1. Commencez par utiliser les nouveaux composables dans les nouvelles fonctionnalités
2. Migrez les vues une par une
3. Les anciennes fonctions restent disponibles pour la compatibilité

