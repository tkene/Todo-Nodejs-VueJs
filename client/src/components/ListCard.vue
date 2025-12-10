<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  bgColor: {
    type: String,
    default: ''
  }
})

const headerStyle = computed(() => {
  // Si bgColor commence par "bg-", c'est une classe Tailwind, on la garde
  if (props.bgColor && props.bgColor.startsWith('bg-')) {
    return {}
  }
  // Sinon, on utilise la variable CSS correspondante
  if (props.bgColor) {
    return {
      backgroundColor: `var(--${props.bgColor})`,
      color: 'white'
    }
  }
  return {}
})

const headerClass = computed(() => {
  // Si c'est une classe Tailwind, on l'utilise
  if (props.bgColor && props.bgColor.startsWith('bg-')) {
    return ['text-h6', props.bgColor]
  }
  return ['text-h6']
})
</script>

<template>
  <q-card class="q-mt-lg">
    <q-card-section 
      :class="headerClass"
      :style="headerStyle"
    >
      {{ title }}
    </q-card-section>
    <q-list>
      <q-item 
        v-for="item in items" 
        :key="item.id" 
        class="hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <slot :item="item" />
      </q-item>
    </q-list>
  </q-card>
</template>

