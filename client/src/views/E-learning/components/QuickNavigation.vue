<script setup>  
  const props = defineProps({
    questions: {
      type: Array,
      required: true
    },
    currentQuestionIndex: {
      type: Number,
      required: true
    },
    currentSectionIndex: {
      type: Number,
      required: true
    },
    viewedQuestions: {
      type: Set,
      required: true
    }
  })
  
  defineEmits(['go-to-question'])
  
  function getButtonColor(index) {
    if (index === props.currentQuestionIndex) {
      return 'primary'
    }
    const key = `${props.currentSectionIndex}-${index}`
    if (props.viewedQuestions.has(key)) {
      return 'green'
    }
    return 'grey-4'
  }
  
  function getButtonTextColor(index) {
    if (index === props.currentQuestionIndex) {
      return 'white'
    }
    const key = `${props.currentSectionIndex}-${index}`
    if (props.viewedQuestions.has(key)) {
      return 'white'
    }
    return 'grey-8'
  }
</script>

<template>
  <div class="q-mt-lg q-pt-md" style="border-top: 1px solid #e0e0e0;">
    <div class="text-caption text-grey-7 q-mb-sm">Navigation rapide</div>
    <div class="row q-gutter-xs">
      <q-btn
        v-for="(q, index) in questions"
        :key="index"
        :label="index + 1"
        :color="getButtonColor(index)"
        :text-color="getButtonTextColor(index)"
        size="sm"
        round
        @click="$emit('go-to-question', index)"
        :outline="index !== currentQuestionIndex"
      />
    </div>
  </div>
</template>
