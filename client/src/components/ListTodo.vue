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
  emit('create-todo', {
    text: localText.value,
    tags: selectedTagIds.value // Envoyer les IDs sélectionnés
  })
  // Réinitialiser après création
  selectedTagIds.value = []
}
</script>

<template>
  <div class="inline-flex gap-2 items-center">
    <input
     v-model="localText"
     placeholder="New todo"
     class="p-2 border border-gray-300 rounded-md"
    />
    <select
      class="p-2 border border-gray-300 rounded-md"
      v-model="selectedTagIds" multiple>
      <option 
        v-for="tag in tags" 
        :key="tag.id"
        :value="tag.id">
        {{ tag.name }} - {{ tag.id }}
      </option>
    </select>
    <button 
    type="submit"
    class="bg-blue-500 text-white px-4 py-2 rounded-md"
    @click="createTodo"
    >
      Create
    </button>
  </div>
</template>
