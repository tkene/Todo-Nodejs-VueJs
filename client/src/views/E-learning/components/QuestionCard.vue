<script setup>
  import { getLevelColor, getLevelIcon, getLevelLabel } from '../utils/levelUtils'
  
  defineProps({
    question: {
      type: Object,
      default: null
    },
    showAnswer: {
      type: Boolean,
      default: false
    },
    hasPrevious: {
      type: Boolean,
      default: false
    },
    hasNext: {
      type: Boolean,
      default: false
    },
    hasNextSection: {
      type: Boolean,
      default: false
    }
  })
  
  defineEmits(['reveal-answer', 'previous', 'next', 'next-section'])
</script>

<template>
  <div v-if="question" class="question-container">
    <!-- Niveau de difficulté -->
    <div class="q-mb-md">
      <q-chip 
        :color="getLevelColor(question.level)" 
        text-color="white"
        size="sm"
        :icon="getLevelIcon(question.level)"
      >
        {{ getLevelLabel(question.level) }}
      </q-chip>
    </div>

    <!-- Question -->
    <div class="q-pa-lg q-mb-md rounded-borders row items-center" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-left: 4px solid #1976d2; min-height: 100px;">
      <div class="text-h6 text-weight-medium">
        {{ question.question }}
      </div>
    </div>

    <!-- Réponse (révélée) -->
    <transition name="fade">
      <div v-if="showAnswer" class="q-pa-lg q-mb-md rounded-borders" style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-left: 4px solid #28a745; animation: slideIn 0.3s ease-out;">
        <div class="row items-center q-mb-sm">
          <q-icon name="lightbulb" color="green" size="md" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold text-green-8">Réponse</div>
        </div>
        <div class="text-body1" style="line-height: 1.8; color: #155724;">
          {{ question.answer }}
        </div>
      </div>
    </transition>

    <!-- Actions -->
    <div class="q-mt-lg row justify-center" style="padding: 1rem 0;">
      <q-btn
        v-if="!showAnswer"
        color="primary"
        label="Révéler la réponse"
        icon="visibility"
        @click="$emit('reveal-answer')"
        unelevated
        rounded
        size="md"
        class="q-px-xl"
      />
      <div v-else class="row q-gutter-sm">
        <q-btn
          v-if="hasPrevious"
          color="grey-7"
          label="Précédent"
          icon="arrow_back"
          @click="$emit('previous')"
          outline
          rounded
        />
        <q-btn
          v-if="hasNext"
          color="primary"
          label="Suivant"
          icon-right="arrow_forward"
          @click="$emit('next')"
          unelevated
          rounded
        />
        <q-btn
          v-else-if="hasNextSection"
          color="green"
          label="Section suivante"
          icon-right="check_circle"
          @click="$emit('next-section')"
          unelevated
          rounded
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
