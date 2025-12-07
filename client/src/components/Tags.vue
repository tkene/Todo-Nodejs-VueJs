<script setup>
import { ref } from 'vue'

/**
 * Feature :
 * - Edit tag 🕰️
 */

const props = defineProps({
  tags: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:tags', 'add-tag', 'remove-tag']);

const newTag = ref('')

function addTag(){
  const t = newTag.value && newTag.value.trim()
  if(t && !props.tags.some(tag => tag.name === t)){ 
    emit('add-tag', t)
  }
  newTag.value = ''
}

function removeTag(tagId){ 
  emit('remove-tag', tagId)
}
</script>

<template>
  <div class="inline-flex w-full justify-center items-center flex-col mt-4">
    <div class="flex flex-wrap gap-2">
      <input v-model="newTag" placeholder="Add a tag" class="p-2 border border-gray-300 rounded-md" />
      <button type="button" @click="addTag" class="bg-blue-500 text-white px-4 py-2 rounded-md">Add Tag</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-4">
      <template v-for="t in tags" :key="t.id">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100">{{ t.name }}
          <button type="button" @click="removeTag(t.id)" class="ml-2 bg-red-500 text-white px-2 py-1 rounded-md">x</button>
        </span>
      </template>
    </div>
  </div>
</template>
