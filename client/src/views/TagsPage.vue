<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  getTags,
  createTag as createTagApi,
  deleteTag as deleteTagApi,
  updateTag as updateTagApi,
} from '../api/tags'
import Tags from '../components/Tags.vue'

const tagsData = ref([])

const tagNames = computed(() => {
  return tagsData.value.sort((a, b) => a.name.localeCompare(b.name))
})

onMounted(async () => {
  try {
    tagsData.value = await getTags()
  } catch (error) {
    console.error('Erreur lors du chargement des tags:', error)
  }
})

async function addTag(tagName) {
  try {
    await createTagApi({ name: tagName })
    tagsData.value = await getTags()
  } catch (error) {
    console.error('Erreur lors de la création du tag:', error)
  }
}

async function removeTag(tagId) {
  try {
    await deleteTagApi(tagId)
    tagsData.value = await getTags()
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error)
  }
}

async function editTag(tagId, tagName) {
  try {
    await updateTagApi(tagId, { name: tagName.value })
    tagsData.value = await getTags()
  } catch (error) {
    console.error('Erreur lors de la modification du tag:', error)
  }
}
</script>

<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <h1 class="flex items-center gap-3 text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      <q-icon name="label" class="text-indigo-600 text-4xl md:text-5xl" />
      <span>Gestion des Tags</span>
    </h1>
    <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
      <Tags 
        :tags="tagNames" 
        @add-tag="addTag" 
        @remove-tag="removeTag"
        @edit-tag="editTag"
      />
    </div>
  </div>
</template>

