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
  return tagsData.value
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

async function editTag(tagId, tagName){
  try {
    await updateTagApi(tagId, { name: tagName.value })
    tagsData.value = await getTags()
  } catch (error) {
    console.error('Erreur lors de la modification du tag:', error)
  }
}
</script>

<template>
  <div class="mx-auto font-sans p-4">
    <h1 class="text-2xl font-bold mb-4">Gestion des Tags</h1>
    <Tags 
      :tags="tagNames" 
      @add-tag="addTag" 
      @remove-tag="removeTag" 
      @edit-tag="editTag"
    />
  </div>
</template>

