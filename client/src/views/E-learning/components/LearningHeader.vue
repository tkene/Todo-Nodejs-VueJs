<script setup>
  defineProps({
    technology: {
      type: String,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    totalSections: {
      type: Number,
      required: true
    },
    completedQuestions: {
      type: Number,
      required: true
    }
  })
  
  defineEmits(['back'])
</script>

<template>
  <q-card class="q-mb-md rounded-borders text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" flat>
    <q-card-section class="row items-center justify-between">
      <div class="row items-center q-gutter-md">
        <q-btn
          flat
          round
          icon="arrow_back"
          @click="$emit('back')"
          color="white"
          text-color="white"
        />
        <div>
          <div class="text-h6 text-weight-bold text-white">{{ technology }}</div>
          <div class="text-caption text-white">
            {{ totalQuestions }} questions • {{ totalSections }} sections
          </div>
        </div>
      </div>
      <q-chip color="primary" text-color="white" size="md">
        <q-icon name="check_circle" class="q-mr-xs" />
        {{ completedQuestions }} / {{ totalQuestions }}
      </q-chip>
    </q-card-section>
  </q-card>
</template>
