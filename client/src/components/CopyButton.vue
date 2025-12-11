<script setup>
import { useQuasar } from 'quasar'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary'
  },
  flat: {
    type: Boolean,
    default: true
  },
  round: {
    type: Boolean,
    default: true
  },
  dense: {
    type: Boolean,
    default: true
  },
  tooltip: {
    type: String,
    default: 'Copier dans le presse-papiers'
  },
  successMessage: {
    type: String,
    default: 'Texte copié dans le presse-papiers !'
  }
})

const $q = useQuasar()

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.text)
    $q.notify({
      message: props.successMessage,
      color: 'positive',
      icon: 'check',
      position: 'top-right',
      timeout: 2000
    })
  } catch (err) {
    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea')
    textArea.value = props.text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      $q.notify({
        message: props.successMessage,
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 2000
      })
    } catch (fallbackErr) {
      $q.notify({
        message: 'Erreur lors de la copie',
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 2000
      })
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
</script>

<template>
  <q-btn
    icon="content_copy"
    :flat="flat"
    :round="round"
    :dense="dense"
    :color="color"
    :size="size"
    @click="copyToClipboard"
  >
    <q-tooltip>{{ tooltip }}</q-tooltip>
  </q-btn>
</template>

