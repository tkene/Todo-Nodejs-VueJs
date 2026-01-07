<template>
  <div class="race-result-container">
    <!-- En-tête avec informations de la course -->
    <div v-if="raceData" class="race-header bg-gray-800 p-4 rounded-lg mb-6">
      <h2 class="text-2xl font-bold text-white mb-2">
        {{ raceData.name }}
      </h2>
      <div class="flex flex-wrap gap-4 text-sm text-gray-300">
        <span class="flex items-center gap-2">
          <q-icon name="location_on" size="sm" />
          {{ raceData.hippodrome }}
        </span>
        <span class="flex items-center gap-2">
          <q-icon name="landscape" size="sm" />
          Surface: {{ raceData.surface }}
        </span>
        <span class="flex items-center gap-2">
          <q-icon name="people" size="sm" />
          {{ raceData.nbPartants }} partants
        </span>
      </div>
    </div>

    <!-- Tableau des résultats -->
    <div class="results-table bg-gray-900 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-800 border-b border-gray-700">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Rang
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                % Victoire
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                % Top 3
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                % Finir
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Explication
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr
              v-for="(horse, index) in evaluations"
              :key="horse.id"
              class="hover:bg-gray-800 transition-colors"
              :class="getRowClass(index)"
            >
              <!-- Rang -->
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    :class="getRankBadgeClass(index)"
                  >
                    {{ horse.rank || index + 1 }}
                  </span>
                </div>
              </td>

              <!-- Nom -->
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-white">
                  {{ horse.name }}
                </div>
                <div class="text-xs text-gray-400">
                  N°{{ horse.numero }}
                </div>
              </td>

              <!-- % Victoire -->
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-lg font-bold" :class="getProbabilityColor(horse.probWin)">
                    {{ formatPercentage(horse.probWin) }}
                  </span>
                  <q-linear-progress
                    :value="horse.probWin"
                    :color="getProbabilityProgressColor(horse.probWin)"
                    class="w-20 h-2 mt-2 rounded"
                  />
                  <span class="text-xs text-gray-500 mt-1">
                    Cote implicite: {{ horse.probWin > 0 ? (1 / horse.probWin).toFixed(2) : 'N/A' }}
                  </span>
                </div>
              </td>

              <!-- % Top 3 -->
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-lg font-bold" :class="getProbabilityColor(horse.probTop3)">
                    {{ formatPercentage(horse.probTop3) }}
                  </span>
                  <q-linear-progress
                    :value="horse.probTop3"
                    :color="getProbabilityProgressColor(horse.probTop3)"
                    class="w-20 h-2 mt-2 rounded"
                  />
                  <span class="text-xs text-gray-500 mt-1">
                    {{ horse.rank <= 3 ? 'Favori Top 3' : 'Chances modérées' }}
                  </span>
                </div>
              </td>

              <!-- % Finir -->
              <td class="px-4 py-3 text-center">
                <div class="flex flex-col items-center">
                  <span class="text-lg font-bold" :class="getProbabilityColor(horse.probFinish)">
                    {{ formatPercentage(horse.probFinish) }}
                  </span>
                  <q-linear-progress
                    :value="horse.probFinish"
                    :color="getProbabilityProgressColor(horse.probFinish)"
                    class="w-20 h-2 mt-2 rounded"
                  />
                  <span class="text-xs text-gray-500 mt-1">
                    {{ horse.probFinish < 0.9 ? 'Risque d\'abandon' : 'Très fiable' }}
                  </span>
                </div>
              </td>

              <!-- Explication -->
              <td class="px-4 py-3">
                <div class="text-sm text-gray-300 max-w-md">
                  <div class="flex flex-wrap gap-1">
                    <q-badge
                      v-for="(part, idx) in horse.explanation.split(' • ')"
                      :key="idx"
                      :color="getExplanationBadgeColor(part)"
                      :label="part"
                      class="mb-1"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Statistiques globales -->
    <div v-if="evaluations.length > 0" class="stats-section mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
        <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Somme probabilités victoire</div>
        <div class="text-2xl font-bold text-white">
          {{ formatPercentage(sumProbabilities('probWin')) }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ sumProbabilities('probWin').toFixed(4) === '1.0000' ? '✓ Normalisé' : '⚠ À vérifier' }}
        </div>
      </div>
      <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
        <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Moyenne probabilité Top 3</div>
        <div class="text-2xl font-bold text-white">
          {{ formatPercentage(averageProbability('probTop3')) }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Sur {{ evaluations.length }} partants
        </div>
      </div>
      <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
        <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Moyenne probabilité finir</div>
        <div class="text-2xl font-bold text-white">
          {{ formatPercentage(averageProbability('probFinish')) }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Taux d'abandon estimé
        </div>
      </div>
      <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
        <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Favori</div>
        <div class="text-lg font-bold text-white" v-if="evaluations.length > 0">
          {{ evaluations[0].name }}
        </div>
        <div class="text-xs text-yellow-400 mt-1">
          {{ formatPercentage(evaluations[0].probWin) }} de gagner
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  raceData: {
    type: Object,
    default: null
  },
  evaluations: {
    type: Array,
    default: () => []
  }
});

// Formater un pourcentage
function formatPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

// Obtenir la couleur selon la probabilité
function getProbabilityColor(prob) {
  if (prob >= 0.3) return 'text-green-400';
  if (prob >= 0.15) return 'text-yellow-400';
  if (prob >= 0.05) return 'text-orange-400';
  return 'text-gray-400';
}

// Obtenir la couleur de la barre de progression
function getProbabilityProgressColor(prob) {
  if (prob >= 0.3) return 'green';
  if (prob >= 0.15) return 'yellow';
  if (prob >= 0.05) return 'orange';
  return 'grey';
}

// Obtenir la classe du badge de rang
function getRankBadgeClass(index) {
  if (index === 0) return 'bg-yellow-500 text-yellow-900';
  if (index === 1) return 'bg-gray-400 text-gray-900';
  if (index === 2) return 'bg-orange-500 text-orange-900';
  return 'bg-gray-700 text-gray-300';
}

// Obtenir la classe de la ligne
function getRowClass(index) {
  if (index === 0) return 'bg-yellow-900/20';
  if (index === 1) return 'bg-gray-800/50';
  if (index === 2) return 'bg-orange-900/20';
  return '';
}

// Calculer la somme des probabilités
function sumProbabilities(field) {
  return props.evaluations.reduce((sum, horse) => sum + (horse[field] || 0), 0);
}

// Calculer la moyenne des probabilités
function averageProbability(field) {
  if (props.evaluations.length === 0) return 0;
  return sumProbabilities(field) / props.evaluations.length;
}

// Obtenir la couleur du badge d'explication
function getExplanationBadgeColor(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('favori') || lowerText.includes('excellent')) return 'positive';
  if (lowerText.includes('modéré') || lowerText.includes('performant')) return 'warning';
  if (lowerText.includes('décevant') || lowerText.includes('fautif') || lowerText.includes('attention')) return 'negative';
  if (lowerText.includes('outsider')) return 'grey';
  return 'primary';
}
</script>

<style scoped>
.race-result-container {
  @apply w-full;
}

.results-table {
  @apply shadow-lg;
}

/* Styles pour les barres de progression */
:deep(.q-linear-progress__track) {
  @apply bg-gray-700;
}

:deep(.q-linear-progress__model) {
  @apply rounded-full;
}
</style>

