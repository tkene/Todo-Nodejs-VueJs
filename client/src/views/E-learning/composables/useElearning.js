import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { getTechnologies, getLearningContent } from '../../../api/Elearning'

export function useElearning() {
  const $q = useQuasar()

  const contentLoaded = ref(false)
  const loading = ref(false)
  const loadingTechnologies = ref(false)
  const learningContent = ref(null)
  const technologies = ref([])
  const selectedTechnology = ref(null)
  const currentSectionIndex = ref(0)
  const currentQuestionIndex = ref(0)
  const showAnswer = ref(false)
  const viewedQuestions = ref(new Set())

  const technologyOptions = computed(() => {
    return technologies.value.map(tech => ({
      id: tech.id,
      name: tech.name
    }))
  })

  const currentSection = computed(() => {
    return learningContent.value?.sections[currentSectionIndex.value] || null
  })

  const currentQuestion = computed(() => {
    return currentSection.value?.questions[currentQuestionIndex.value] || null
  })

  const totalQuestions = computed(() => {
    return learningContent.value?.totalQuestions || 0
  })

  const completedQuestions = computed(() => {
    return viewedQuestions.value.size
  })

  async function loadTechnologies() {
    try {
      loadingTechnologies.value = true
      const response = await getTechnologies()
      if (response.success) {
        technologies.value = response.technologies
        if (technologies.value.length > 0) {
          selectedTechnology.value = technologies.value[0].id
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des technologies:', error)
      $q.notify({
        message: 'Erreur lors du chargement des technologies',
        color: 'negative',
        icon: 'error',
        position: 'top-right'
      })
    } finally {
      loadingTechnologies.value = false
    }
  }

  async function loadContent() {
    if (!selectedTechnology.value) {
      $q.notify({
        message: 'Veuillez sélectionner une technologie',
        color: 'warning',
        icon: 'warning',
        position: 'top-right'
      })
      return
    }

    try {
      loading.value = true
      const response = await getLearningContent(selectedTechnology.value)
      
      if (response.success) {
        learningContent.value = response
        contentLoaded.value = true
        currentSectionIndex.value = 0
        currentQuestionIndex.value = 0
        showAnswer.value = false
        viewedQuestions.value.clear()
        markQuestionAsViewed()
      } else {
        $q.notify({
          message: 'Erreur lors du chargement du contenu',
          color: 'negative',
          icon: 'error',
          position: 'top-right'
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      $q.notify({
        message: error.response?.data?.error || 'Erreur lors du chargement du contenu',
        color: 'negative',
        icon: 'error',
        position: 'top-right'
      })
    } finally {
      loading.value = false
    }
  }

  function selectSection(index) {
    currentSectionIndex.value = index
    currentQuestionIndex.value = 0
    showAnswer.value = false
    markQuestionAsViewed()
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < currentSection.value.questions.length - 1) {
      currentQuestionIndex.value++
      showAnswer.value = false
      markQuestionAsViewed()
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
      showAnswer.value = false
      markQuestionAsViewed()
    }
  }

  function nextSection() {
    if (currentSectionIndex.value < learningContent.value.sections.length - 1) {
      currentSectionIndex.value++
      currentQuestionIndex.value = 0
      showAnswer.value = false
      markQuestionAsViewed()
    } else {
      $q.notify({
        message: 'Félicitations ! Vous avez terminé toutes les sections !',
        color: 'positive',
        icon: 'celebration',
        position: 'top-right',
        timeout: 3000
      })
    }
  }

  function goToQuestion(index) {
    currentQuestionIndex.value = index
    showAnswer.value = false
    markQuestionAsViewed()
  }

  function markQuestionAsViewed() {
    const key = `${currentSectionIndex.value}-${currentQuestionIndex.value}`
    viewedQuestions.value.add(key)
  }

  function resetContent() {
    contentLoaded.value = false
    learningContent.value = null
    currentSectionIndex.value = 0
    currentQuestionIndex.value = 0
    showAnswer.value = false
    viewedQuestions.value.clear()
  }

  function revealAnswer() {
    showAnswer.value = true
  }

  return {
    // State
    contentLoaded,
    loading,
    loadingTechnologies,
    learningContent,
    technologies,
    selectedTechnology,
    currentSectionIndex,
    currentQuestionIndex,
    showAnswer,
    viewedQuestions,
    // Computed
    technologyOptions,
    currentSection,
    currentQuestion,
    totalQuestions,
    completedQuestions,
    // Methods
    loadTechnologies,
    loadContent,
    selectSection,
    nextQuestion,
    previousQuestion,
    nextSection,
    goToQuestion,
    markQuestionAsViewed,
    resetContent,
    revealAnswer
  }
}

