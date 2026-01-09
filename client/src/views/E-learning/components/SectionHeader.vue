<script setup>
  defineProps({
    topic: {
      type: String,
      required: true
    },
    currentQuestionIndex: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    }
  })
</script>

<template>
  <div class="q-mb-lg q-pb-md" style="border-bottom: 2px solid #e0e0e0;">
    <div class="text-h5 text-weight-bold q-mb-sm">
      {{ topic }}
    </div>
    <div class="text-caption text-grey-7">
      Question {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
    </div>
  </div>
</template>
