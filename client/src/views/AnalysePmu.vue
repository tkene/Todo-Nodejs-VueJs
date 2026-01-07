
<script setup>
  import { ref, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { getAvailableRaces, analyzeRace, evaluateRace } from '../api/Analysis';
  import RaceResult from '../components/RaceResult.vue';
  
  const $q = useQuasar();
  
  const availableRaces = ref([]);
  const selectedCourse = ref(null);
  const selectedDate = ref(new Date().toISOString().split('T')[0]); // Date du jour par défaut
  const loadingRaces = ref(false);
  const isAnalyzing = ref(false);
  const isEvaluating = ref(false);
  const analysisResult = ref(null);
  const evaluationResult = ref(null);
  
  // Charger les courses disponibles au montage
  onMounted(async () => {
    await loadRaces();
  });
  
  // Charger les courses pour la date sélectionnée
  async function loadRaces() {
    try {
      loadingRaces.value = true;
      const races = await getAvailableRaces(selectedDate.value);
      
      // S'assurer que races est toujours un tableau
      if (Array.isArray(races)) {
        availableRaces.value = races;
      } else {
        console.warn('Les courses reçues ne sont pas un tableau:', races);
        availableRaces.value = [];
      }
      
      // Réinitialiser la sélection de course
      selectedCourse.value = null;
    } catch (error) {
      console.error('Erreur lors du chargement des courses:', error);
      // S'assurer qu'on a toujours un tableau même en cas d'erreur
      availableRaces.value = [];
      $q.notify({
        message: 'Erreur lors du chargement des courses',
        color: 'negative',
        icon: 'error',
        position: 'top-right'
      });
    } finally {
      loadingRaces.value = false;
    }
  }
  
  // Lancer l'analyse
  async function launchAnalysis() {
    if (!selectedCourse.value) return;
  
    try {
      isAnalyzing.value = true;
      analysisResult.value = null;
      evaluationResult.value = null; // Réinitialiser l'évaluation
  
      const result = await analyzeRace(selectedCourse.value);
      analysisResult.value = result;
  
      $q.notify({
        message: 'Analyse terminée avec succès ! Vous pouvez maintenant calculer les probabilités.',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 3000
      });
      
      // Proposer automatiquement l'évaluation probabiliste après l'analyse
      // (optionnel, peut être commenté si on préfère que l'utilisateur clique manuellement)
      // await launchEvaluation();
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      $q.notify({
        message: error?.response?.data?.error || 'Erreur lors de l\'analyse',
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 3000
      });
    } finally {
      isAnalyzing.value = false;
    }
  }
  
  // Fonctions utilitaires pour le style
  function getPodiumClass(index) {
    const classes = [
      'bg-gradient-to-br from-yellow-900 to-yellow-700 border-yellow-500',
      'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-400',
      'bg-gradient-to-br from-orange-900 to-orange-700 border-orange-500'
    ];
    return classes[index] || 'bg-gray-800 border-gray-600';
  }
  
  function getOrdinal(num) {
    const ordinals = ['er', 'ème', 'ème'];
    return ordinals[num - 1] || 'ème';
  }
  
  function getScoreColor(score) {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  }
  
  function getScoreColorClass(score) {
    if (!score) return 'grey';
    if (score >= 70) return 'positive';
    if (score >= 50) return 'warning';
    return 'negative';
  }
  
  function getSentimentColor(sentiment) {
    const colors = {
      'très_positif': 'positive',
      'positif': 'positive',
      'neutre': 'grey',
      'négatif': 'negative',
      'très_négatif': 'negative'
    };
    return colors[sentiment] || 'grey';
  }
  
  function formatSentiment(sentiment) {
    const labels = {
      'très_positif': 'Très Positif',
      'positif': 'Positif',
      'neutre': 'Neutre',
      'négatif': 'Négatif',
      'très_négatif': 'Très Négatif'
    };
    return labels[sentiment] || sentiment;
  }
  
  function getAlertBorderColor(severity) {
    return severity === 'high' ? 'border-orange-500' : 'border-yellow-500';
  }
  
  function getAlertIcon(type) {
    return type === 'sentiment' ? 'forum' : 'trending_down';
  }
  
  function getAlertIconColor(severity) {
    return severity === 'high' ? 'orange' : 'yellow';
  }
  
  function formatInsight(text) {
    if (!text) return '';
    // Convertir les markdown basiques en HTML
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
  
  // Lancer l'évaluation avec probabilités
  async function launchEvaluation() {
    if (!selectedCourse.value) return;
    
    // D'abord, s'assurer que l'analyse a été lancée
    if (!analysisResult.value) {
      $q.notify({
        message: 'Veuillez d\'abord lancer une analyse',
        color: 'warning',
        icon: 'warning',
        position: 'top-right'
      });
      return;
    }
    
    try {
      isEvaluating.value = true;
      evaluationResult.value = null;
      
      const result = await evaluateRace(selectedCourse.value);
      evaluationResult.value = result;
      
      $q.notify({
        message: 'Évaluation terminée avec succès !',
        color: 'positive',
        icon: 'check',
        position: 'top-right',
        timeout: 2000
      });
    } catch (error) {
      console.error('Erreur lors de l\'évaluation:', error);
      $q.notify({
        message: error?.response?.data?.error || 'Erreur lors de l\'évaluation',
        color: 'negative',
        icon: 'error',
        position: 'top-right',
        timeout: 3000
      });
    } finally {
      isEvaluating.value = false;
    }
  }
</script>

<template>
  <div class="analyse-pmu-container">
    <!-- Header avec sélecteur de date et course -->
    <div class="header-section bg-gray-900 p-6 rounded-lg mb-6">
      <h1 class="text-3xl font-bold text-white mb-4">🏇 Analyse PMU</h1>
      <div class="flex flex-col gap-4">
        <!-- Sélecteur de date -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Sélectionner une date
          </label>
          <q-input
            v-model="selectedDate"
            type="date"
            filled
            dark
            bg-color="gray-800"
            color="primary"
            label="Date de la course"
            class="w-full"
            :min="new Date().toISOString().split('T')[0]"
            @update:model-value="loadRaces"
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>
        </div>
        
        <!-- Sélecteur de course -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Sélectionner une course
            </label>
            <q-select
              v-model="selectedCourse"
              :options="Array.isArray(availableRaces) ? availableRaces : []"
              option-label="label"
              option-value="courseId"
              emit-value
              map-options
              filled
              dark
              bg-color="gray-800"
              color="primary"
              label="Choisir une course"
              class="w-full"
              :loading="loadingRaces"
              :disable="loadingRaces || !Array.isArray(availableRaces) || availableRaces.length === 0"
            >
              <template v-slot:no-option>
                <div class="text-center text-gray-400 py-4">
                  <q-icon name="info" size="md" class="mb-2" />
                  <div>Aucune course disponible pour cette date</div>
                </div>
              </template>
            </q-select>
          </div>
          <div class="flex items-end">
            <q-btn
              :label="isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'Analyse'"
              color="primary"
              size="lg"
              :loading="isAnalyzing"
              :disable="!selectedCourse || isAnalyzing || loadingRaces"
              @click="launchAnalysis"
              class="px-8"
              icon="analytics"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Résultats de l'analyse -->
    <div v-if="analysisResult" class="results-section">
      <!-- Informations de la course -->
      <div class="race-info bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-3">
              {{ analysisResult.race.name }}
            </h2>
            <div class="flex flex-wrap gap-3 text-sm">
              <span class="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded">
                <q-icon name="location_on" size="sm" color="blue-300" />
                <span class="font-semibold text-white">{{ analysisResult.race.hippodrome }}</span>
              </span>
              <span class="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded">
                <q-icon name="landscape" size="sm" color="green-300" />
                <span class="text-gray-200">Surface: <span class="font-semibold text-white">{{ analysisResult.race.surface }}</span></span>
              </span>
              <span class="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded">
                <q-icon name="straighten" size="sm" color="yellow-300" />
                <span class="text-gray-200">Corde: <span class="font-semibold text-white">{{ analysisResult.race.corde }}</span></span>
              </span>
              <span class="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded">
                <q-icon name="people" size="sm" color="purple-300" />
                <span class="text-gray-200">{{ analysisResult.horses?.length || 0 }} partants</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 3 Favoris -->
      <div class="top3-section mb-6">
        <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <q-icon name="emoji_events" size="md" color="yellow" />
          Podium
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(horse, index) in analysisResult.top3"
            :key="horse.id"
            class="horse-card"
            :class="getPodiumClass(index)"
          >
            <div class="podium-badge">
              {{ index + 1 }}<sup>{{ getOrdinal(index + 1) }}</sup>
            </div>
            <div class="horse-info">
              <h3 class="text-lg font-bold text-white mb-1">
                {{ horse.name }}
              </h3>
              <p class="text-sm text-gray-400 mb-2">N°{{ horse.numero }}</p>
              
              <!-- Score de performance -->
              <div class="score-section mb-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-400">Score Performance</span>
                  <span class="text-lg font-bold" :class="getScoreColor(horse.performanceScore)">
                    {{ horse.performanceScore?.toFixed(1) || 'N/A' }}
                  </span>
                </div>
                <q-linear-progress
                  :value="(horse.performanceScore || 0) / 100"
                  :color="getScoreColorClass(horse.performanceScore)"
                  class="h-2 rounded"
                />
              </div>

              <!-- Détails -->
              <div class="details-grid text-xs text-gray-300 space-y-1">
                <div v-if="horse.musique" class="flex justify-between">
                  <span>Musique:</span>
                  <span class="font-semibold">{{ horse.musique }}</span>
                </div>
                <div v-if="horse.poids" class="flex justify-between">
                  <span>Poids:</span>
                  <span class="font-semibold">{{ horse.poids }} kg</span>
                </div>
                <div v-if="horse.cote" class="flex justify-between">
                  <span>Cote:</span>
                  <span class="font-semibold">{{ horse.cote.toFixed(2) }}</span>
                </div>
                <div v-if="horse.aptitudPSF && analysisResult.race.surface === 'PSF'" class="flex items-center gap-1 text-green-400">
                  <q-icon name="check_circle" size="xs" />
                  <span>Apte PSF</span>
                </div>
              </div>

              <!-- Sentiment Forum -->
              <div v-if="horse.forumInsight" class="mt-3 pt-3 border-t border-gray-700">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-400">Sentiment Forum</span>
                  <q-badge
                    :color="getSentimentColor(horse.forumInsight.sentiment)"
                    :label="formatSentiment(horse.forumInsight.sentiment)"
                  />
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ horse.forumInsight.commentCount }} commentaires
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expert Insight -->
      <div class="expert-insight-section mb-6">
        <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <q-icon name="psychology" size="md" color="blue" />
          Expert Insight
        </h2>
        <div class="bg-gray-800 p-6 rounded-lg border-l-4 border-blue-500">
          <div class="text-gray-200 whitespace-pre-line leading-relaxed" v-html="formatInsight(analysisResult.expertInsight)"></div>
        </div>
      </div>

      <!-- Section Évaluation Probabiliste -->
      <div class="evaluation-section mb-6">
        <div class="bg-gradient-to-r from-green-900 to-green-800 p-6 rounded-lg border-l-4 border-green-500">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <q-icon name="calculate" size="md" color="green-300" />
                Évaluation Probabiliste
              </h2>
              <p class="text-gray-200 text-sm">
                Algorithme mathématique calculant les probabilités de victoire, Top 3 et fin de course
                pour chaque cheval basé sur : forme récente, affinité terrain/distance, jockey, entraîneur et cotes PMU.
              </p>
            </div>
            <q-btn
              label="Calculer les Probabilités"
              color="green"
              size="lg"
              :loading="isEvaluating"
              :disable="isEvaluating || !analysisResult"
              @click="launchEvaluation"
              icon="calculate"
              class="px-6"
            >
              <q-tooltip v-if="!analysisResult">
                Lancez d'abord une analyse pour calculer les probabilités
              </q-tooltip>
            </q-btn>
          </div>
          
          <!-- Indicateur si l'évaluation est disponible -->
          <div v-if="analysisResult && !evaluationResult" class="bg-gray-800/50 p-3 rounded text-xs text-gray-300">
            <q-icon name="info" size="sm" class="mr-2" />
            L'analyse est terminée. Cliquez sur le bouton pour calculer les probabilités détaillées.
          </div>
        </div>

        <!-- Résultats de l'évaluation -->
        <div v-if="evaluationResult" class="evaluation-results-section mt-6">
          <RaceResult
            :race-data="evaluationResult.race"
            :evaluations="evaluationResult.evaluations"
          />
        </div>
      </div>

      <!-- Smart Money Alerts -->
      <div v-if="analysisResult.smartMoneyAlerts && analysisResult.smartMoneyAlerts.length > 0" class="alerts-section">
        <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <q-icon name="notifications_active" size="md" color="orange" />
          Alerte "Smart Money"
        </h2>
        <div class="space-y-3">
          <div
            v-for="alert in analysisResult.smartMoneyAlerts"
            :key="`${alert.horse.numero}-${alert.alerts[0].type}`"
            class="alert-card bg-gray-800 p-4 rounded-lg border-l-4"
            :class="getAlertBorderColor(alert.alerts[0].severity)"
          >
            <div class="flex items-start gap-3">
              <q-icon
                :name="getAlertIcon(alert.alerts[0].type)"
                size="md"
                :color="getAlertIconColor(alert.alerts[0].severity)"
              />
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-white mb-1">
                  {{ alert.horse.name }} (N°{{ alert.horse.numero }})
                </h3>
                <div class="space-y-1">
                  <p
                    v-for="(alertItem, idx) in alert.alerts"
                    :key="idx"
                    class="text-sm text-gray-300"
                  >
                    {{ alertItem.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else-if="!isAnalyzing" class="empty-state text-center py-12">
      <q-icon name="analytics" size="80px" color="gray-600" />
      <p class="text-gray-400 text-lg mt-4">
        Sélectionnez une course et lancez l'analyse pour voir les prédictions
      </p>
    </div>
  </div>
</template>

<style scoped>
.analyse-pmu-container {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.header-section {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.horse-card {
  position: relative;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.horse-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4);
}

.podium-badge {
  position: absolute;
  top: -12px;
  right: 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 2rem;
  font-weight: bold;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
}

.podium-badge sup {
  font-size: 0.6rem;
  margin-left: 2px;
}

.horse-info {
  margin-top: 1rem;
}

.score-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.details-grid {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.expert-insight-section {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.alert-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.alert-card:hover {
  transform: translateX(4px);
}

.empty-state {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.75rem;
  margin-top: 4rem;
}

/* Responsive */
@media (max-width: 768px) {
  .analyse-pmu-container {
    padding: 1rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

