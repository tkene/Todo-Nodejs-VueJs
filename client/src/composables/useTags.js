/**
 * Composable pour la gestion des tags
 */
import { ref, computed } from 'vue'
import { 
  getTags,
  createTag as createTagApi,
  updateTag as updateTagApi,
  deleteTag as deleteTagApi
} from '../api/tags'
import { useNotifications } from './useNotifications'

export function useTags() {
  const tags = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const { success, error: showError } = useNotifications()

  // Computed properties
  const sortedTags = computed(() => {
    return [...tags.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const tagsByName = computed(() => {
    return tags.value.reduce((acc, tag) => {
      acc[tag.name] = tag
      return acc
    }, {})
  })

  // Methods
  const loadTags = async () => {
    try {
      isLoading.value = true
      error.value = null
      const data = await getTags()
      tags.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err
      showError('Erreur lors du chargement des tags')
      tags.value = []
    } finally {
      isLoading.value = false
    }
  }

  const addTag = async (tagName) => {
    try {
      isLoading.value = true
      error.value = null
      await createTagApi({ name: tagName })
      await loadTags()
      success('Tag créé avec succès !')
    } catch (err) {
      error.value = err
      showError('Erreur lors de la création du tag')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateTag = async (tagId, tagData) => {
    try {
      isLoading.value = true
      error.value = null
      await updateTagApi(tagId, tagData)
      await loadTags()
      success('Tag modifié avec succès !')
    } catch (err) {
      error.value = err
      showError('Erreur lors de la modification du tag')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeTag = async (tagId) => {
    try {
      isLoading.value = true
      error.value = null
      await deleteTagApi(tagId)
      tags.value = tags.value.filter(t => t.id !== tagId)
      success('Tag supprimé avec succès !')
    } catch (err) {
      error.value = err
      showError('Erreur lors de la suppression du tag')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getTagById = (id) => {
    return tags.value.find(t => t.id === id)
  }

  const getTagByName = (name) => {
    return tags.value.find(t => t.name === name)
  }

  return {
    // State
    tags,
    isLoading,
    error,
    
    // Computed
    sortedTags,
    tagsByName,
    
    // Methods
    loadTags,
    addTag,
    updateTag,
    removeTag,
    getTagById,
    getTagByName
  }
}

export default useTags

