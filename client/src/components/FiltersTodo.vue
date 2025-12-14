<script setup>
import { computed } from 'vue';

const props = defineProps({
    filter: {
        type: String,
        required: true,
    },
    search: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['update:filter', 'update:search']);

const localFilter = computed({
    get: () => props.filter,
    set: (value) => emit('update:filter', value)
});

const localSearch = computed({
    get: () => props.search,
    set: (value) => emit('update:search', value)
});
</script>

<template>
    <div class="mt-4">
      <select
        v-model="localFilter"
        class="p-2 border border-gray-300 rounded-md"
      >
        <option value="all">All</option>
        <option value="todo">Todo</option>
        <option value="done">Done</option>
      </select>
      <input
       v-model="localSearch"
       placeholder="search text or tag"
       class="p-2 border border-gray-300 rounded-md ml-2"
      />
    </div>
</template>
