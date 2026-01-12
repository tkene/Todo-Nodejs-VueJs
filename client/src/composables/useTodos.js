/**
 * Composable pour la gestion des todos
 */
import { ref, computed } from 'vue'
import { 
  getTodos,
  createTodo as createTodoApi,
  updateTodo as updateTodoApi,
  deleteTodo as deleteTodoApi
} from '../api/todos'
import { useNotifications } from './useNotifications'

export function useTodos() {
  const todos = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const { success, error: showError } = useNotifications()

  // Computed properties
  const activeTodos = computed(() => {
    return todos.value.filter(todo => !todo.done)
  })

  const completedTodos = computed(() => {
    return todos.value.filter(todo => todo.done)
  })

  const todosByTag = computed(() => {
    return todos.value.reduce((acc, todo) => {
      if (todo.tags && Array.isArray(todo.tags)) {
        todo.tags.forEach(tag => {
          if (!acc[tag]) {
            acc[tag] = []
          }
          acc[tag].push(todo)
        })
      }
      return acc
    }, {})
  })

  // Methods
  const loadTodos = async () => {
    try {
      isLoading.value = true
      error.value = null
      const data = await getTodos()
      todos.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err
      showError('Erreur lors du chargement des tâches')
      todos.value = []
    } finally {
      isLoading.value = false
    }
  }

  const addTodo = async (todoData) => {
    try {
      isLoading.value = true
      error.value = null
      const newTodo = await createTodoApi(todoData)
      todos.value.push(newTodo)
      success('Tâche créée avec succès !')
      return newTodo
    } catch (err) {
      error.value = err
      showError('Erreur lors de la création de la tâche')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateTodo = async (todoId, todoData) => {
    try {
      isLoading.value = true
      error.value = null
      const updatedTodo = await updateTodoApi(todoId, todoData)
      const index = todos.value.findIndex(t => t.id === todoId)
      if (index !== -1) {
        todos.value[index] = updatedTodo
      }
      success('Tâche modifiée avec succès !')
      return updatedTodo
    } catch (err) {
      error.value = err
      showError('Erreur lors de la modification de la tâche')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeTodo = async (todoId) => {
    try {
      isLoading.value = true
      error.value = null
      await deleteTodoApi(todoId)
      todos.value = todos.value.filter(t => t.id !== todoId)
      success('Tâche supprimée avec succès !')
    } catch (err) {
      error.value = err
      showError('Erreur lors de la suppression de la tâche')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleTodo = async (todo) => {
    try {
      await updateTodo(todo.id, { done: !todo.done })
    } catch (err) {
      // Erreur déjà gérée dans updateTodo
    }
  }

  return {
    // State
    todos,
    isLoading,
    error,
    
    // Computed
    activeTodos,
    completedTodos,
    todosByTag,
    
    // Methods
    loadTodos,
    addTodo,
    updateTodo,
    removeTodo,
    toggleTodo
  }
}

export default useTodos

