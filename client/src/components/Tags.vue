<script setup>
import { ref } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:tags', 'add-tag', 'remove-tag', 'edit-tag']);

const newTag = ref('')

function addTag(){
  const t = newTag.value && newTag.value.trim()
  if(t && !props.tags.some(tag => tag.name === t)){ 
    emit('add-tag', t)
  }
  newTag.value = ''
}

function editTag(tagId, tagName){
  emit('edit-tag', tagId, tagName)
}

function removeTag(tagId){ 
  emit('remove-tag', tagId)
}
</script>

<template>
  <div class="inline-flex w-full justify-center items-center flex-col mt-4 grid grid-cols-2 gap-2">
    <div class="flex flex-wrap gap-2">
      <input v-model="newTag" placeholder="Add a tag" class="p-2 border border-gray-300 rounded-md" />
      <button type="button" @click="addTag" class="bg-blue-500 text-white px-4 py-2 rounded-md">Add Tag</button>
    </div>
    <table class="col-span-2 mt-4 w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-200">
          <th class="border border-gray-300 px-4 py-2 text-left">Nom du tag</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tags" :key="t.id" class="hover:bg-gray-50">
          <td class="border border-gray-300 px-4 py-2">{{ t.name.toUpperCase() }}</td>
          <td class="border border-gray-300 px-4 py-2">
            <div class="flex gap-2">
              <button 
                type="button" 
                @click="removeTag(t.id)" 
                class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">
                Delete
              </button>
              <button
                type="button" 
                @click="editTag(t.id, newTag)"
                :class="newTag == '' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-600'"
                class="bg-yellow-500 text-white px-2 py-1 rounded-md">
                Edit
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
