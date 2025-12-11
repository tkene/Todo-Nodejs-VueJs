<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmer'
  },
  message: {
    type: String,
    required: true
  },
  headerColor: {
    type: String,
    default: 'negative'
  },
  confirmLabel: {
    type: String,
    default: 'Confirmer'
  },
  cancelLabel: {
    type: String,
    default: 'Annuler'
  },
  persistent: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :persistent="persistent">
    <q-card style="min-width: 350px">
      <q-card-section 
        class="text-h6 text-white"
        :style="{ backgroundColor: `var(--${headerColor})` }"
      >
        {{ title }}
      </q-card-section>

      <q-card-section class="q-pt-md">
        {{ message }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn 
          flat 
          :label="cancelLabel" 
          color="secondary" 
          @click="handleCancel" 
        />
        <q-btn 
          flat 
          :label="confirmLabel" 
          :color="headerColor" 
          @click="handleConfirm" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

