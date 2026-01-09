<script setup>
import { onMounted } from 'vue'
import { useElearning } from './composables/useElearning'
import SelectionScreen from './components/SelectionScreen.vue'
import LearningHeader from './components/LearningHeader.vue'
import SectionsSidebar from './components/SectionsSidebar.vue'
import QuestionCard from './components/QuestionCard.vue'
import QuickNavigation from './components/QuickNavigation.vue'
import SectionHeader from './components/SectionHeader.vue'

const {
  contentLoaded,
  loading,
  loadingTechnologies,
  learningContent,
  selectedTechnology,
  currentSectionIndex,
  currentQuestionIndex,
  showAnswer,
  viewedQuestions,
  technologyOptions,
  currentSection,
  currentQuestion,
  totalQuestions,
  completedQuestions,
  loadTechnologies,
  loadContent,
  selectSection,
  nextQuestion,
  previousQuestion,
  nextSection,
  goToQuestion,
  resetContent,
  revealAnswer
} = useElearning()

onMounted(() => {
  loadTechnologies()
})
</script>

<template>
  <div class="q-pa-md" style="max-width: 1400px; margin: 0 auto;">
    <div class="row items-center q-mb-md">
      <q-icon name="school" size="md" color="primary" class="q-mr-sm" />
      <h1 class="text-h4 q-ma-none">Fast E-learning</h1>
    </div>

    <!-- Écran de sélection -->
    <SelectionScreen
      v-if="!contentLoaded"
      v-model:selectedTechnology="selectedTechnology"
      :technology-options="technologyOptions"
      :loading-technologies="loadingTechnologies"
      :loading="loading"
      @start="loadContent"
    />

    <!-- Contenu d'apprentissage -->
    <div v-if="contentLoaded && learningContent" class="learning-content">
      <!-- En-tête avec progression -->
      <LearningHeader
        :technology="learningContent.technology"
        :total-questions="totalQuestions"
        :total-sections="learningContent.sections.length"
        :completed-questions="completedQuestions"
        @back="resetContent"
      />

      <div class="row q-col-gutter-md items-stretch">
        <!-- Sidebar avec sections -->
        <div class="col-12 col-md-3 column">
          <SectionsSidebar
            :sections="learningContent.sections"
            :current-section-index="currentSectionIndex"
            @select-section="selectSection"
          />
        </div>

        <!-- Zone principale de contenu -->
        <div class="col-12 col-md-9 column">
          <q-card v-if="currentSection" class="rounded-borders column" style="min-height: 500px;" flat>
            <q-card-section class="column col">
              <!-- En-tête de section -->
              <SectionHeader
                :topic="currentSection.topic"
                :current-question-index="currentQuestionIndex"
                :total-questions="currentSection.questions.length"
              />

              <!-- Question actuelle -->
              <QuestionCard
                :question="currentQuestion"
                :show-answer="showAnswer"
                :has-previous="currentQuestionIndex > 0"
                :has-next="currentQuestionIndex < currentSection.questions.length - 1"
                :has-next-section="currentQuestionIndex === currentSection.questions.length - 1 && currentSectionIndex < learningContent.sections.length - 1"
                @reveal-answer="revealAnswer"
                @previous="previousQuestion"
                @next="nextQuestion"
                @next-section="nextSection"
              />

              <!-- Navigation rapide -->
              <QuickNavigation
                :questions="currentSection.questions"
                :current-question-index="currentQuestionIndex"
                :current-section-index="currentSectionIndex"
                :viewed-questions="viewedQuestions"
                @go-to-question="goToQuestion"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>


