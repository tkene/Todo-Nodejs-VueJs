<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click', { label: props.label, value: props.value })
}
</script>

<template>
  <div class="col-6 col-md-3">
    <q-card 
      class="q-pa-md hover:bg-gray-100 transition-colors cursor-pointer"
      @click="handleClick"
    >
      <q-card-section class="q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-icon v-if="icon" :name="icon" size="md" class="text-grey-7" />
          <div class="text-h6">{{ value }}</div>
        </div>
        <div class="text-caption q-mt-xs">{{ label }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

