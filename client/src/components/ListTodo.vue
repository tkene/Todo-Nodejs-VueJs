<script setup>
import { computed, ref } from 'vue'

/**
 * Feature :
 * - Champs Commentaire 🕰️
 */
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
  },
});

const emit = defineEmits(['update:text', 'create-todo']);

const localText = computed({
  get: () => props.text,
  set: (value) => emit('update:text', value)
});

// Utiliser une ref locale pour stocker les IDs sélectionnés
const selectedTagIds = ref([]);

function createTodo(){
  // Extraire les IDs des tags (au cas où q-select retourne des objets complets)
  const tagIds = selectedTagIds.value.map(tag => {
    // Si c'est déjà un ID numérique, le garder
    if (typeof tag === 'number') {
      return tag;
    }
    // Si c'est un objet avec un id, extraire l'ID
    if (typeof tag === 'object' && tag !== null && tag.id) {
      return tag.id;
    }
    return tag;
  });
  
  emit('create-todo', {
    text: localText.value,
    tags: tagIds
  })

  selectedTagIds.value = []
}
</script>

<template>
  <div class="inline-flex gap-2 items-center">
    <label for="text">Text</label>
    <q-input
    v-model="localText"
    placeholder="New todo"
    class="p-2 border border-gray-300 rounded-md w-full"
    />
    <label for="tags">Tags</label>
    <q-select
      v-model="selectedTagIds"
      :options="tags"
      option-label="name"
      option-value="id"
      multiple
      style="min-width: 200px;"
      class="p-2 border border-gray-300 rounded-md w-full"
    />
    <q-btn 
      type="submit"
      color="primary"
      @click="createTodo"
    >
      Create
    </q-btn>
  </div>
</template>
