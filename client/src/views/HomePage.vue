<script setup>
import { ref, onMounted } from 'vue'
import StatCard from '../components/StatCard.vue'
import ListCard from '../components/ListCard.vue'
import { getJobs } from '../api/Job'
import { getTodos } from '../api/todos'
import { STATUS_COLORS } from '../constants/jobStatuses'
import { formatDate } from '../utils/function'

const statusColors = STATUS_COLORS

const jobs = ref([])
const todos = ref([])
const stats = ref([])

onMounted(async () => {
  try {
    jobs.value = await getJobs()
    todos.value = await getTodos()

    jobs.value = jobs.value.filter(j => j.status !== 'Refusée')
    todos.value = todos.value.filter(t => !t.done)
    stats.value = [
      { 
        label: 'Candidatures', 
        value: jobs.value.length, 
        icon: 'work',
        iconColor: 'blue',
        statusText: 'Total des candidatures',
        statusIcon: 'info'
      },
      { 
        label: 'En attente', 
        value: jobs.value.filter(j => j.status === 'En attente').length, 
        icon: 'mail',
        iconColor: 'pink',
        statusText: 'En attente de réponse',
        statusIcon: 'schedule'
      },
      { 
        label: 'Entretiens', 
        value: jobs.value.filter(j => j.status === 'Entretien').length, 
        icon: 'event',
        iconColor: 'purple',
        statusText: 'Entretiens programmés',
        statusIcon: 'calendar_today'
      },
      { 
        label: 'Tâches à faire', 
        value: todos.value.length, 
        icon: 'checklist',
        iconColor: 'green',
        statusText: 'Tâches en cours',
        statusIcon: 'pending_actions'
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
})

function handleCardClick(card) {
  alert("non disponible pour le moment")
}
</script>

<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <h1 class="flex items-center gap-3 text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      <q-icon name="dashboard" class="text-indigo-600 text-4xl md:text-5xl" />
      <span>Tableau de bord</span>
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <StatCard
        v-for="card in stats"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :icon-color="card.iconColor"
        :status-text="card.statusText"
        :status-icon="card.statusIcon"
        @click="handleCardClick"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Relances à faire -->
      <div v-if="jobs.length > 0" class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 md:p-6 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
          <div class="flex items-center gap-3 relative z-10">
            <q-icon name="schedule" class="text-2xl opacity-90" />
            <h2 class="text-xl font-semibold m-0">Relances à faire</h2>
            <q-badge 
              :label="jobs.length" 
              color="white" 
              text-color="primary"
              class="font-semibold px-3 py-1 rounded-xl text-sm"
            />
          </div>
        </div>
        <div class="p-4">
          <transition-group name="list-fade" tag="div" class="flex flex-col gap-2">
            <router-link 
              v-for="item in jobs"
              :key="item.id"
              :to="`/job-details/${item.id}`" 
              class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 text-decoration-none transition-all duration-300 ease-out relative overflow-hidden group hover:from-blue-100 hover:to-blue-200 hover:border-blue-500 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-500/15"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-500 transition-all duration-300"></div>
              <div class="flex items-center gap-3 flex-1">
                <q-badge 
                  :color="statusColors[item.status] || 'grey'" 
                  :label="item.status || 'Non défini'" 
                  class="font-semibold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wide shadow-sm"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-sm text-gray-800 tracking-wide">{{ item.company?.toUpperCase() }} / {{ item.job }}</div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 text-gray-400 text-xs font-medium whitespace-nowrap ml-4">
                <q-icon name="event" size="16px" class="opacity-70" />
                <span>{{ formatDate(item.date) }}</span>
              </div>
            </router-link>
          </transition-group>
        </div>
      </div>

      <!-- Liste des Tâches à faire -->
      <div v-if="todos.length > 0" class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 md:p-6 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
          <div class="flex items-center gap-3 relative z-10">
            <q-icon name="checklist" class="text-2xl opacity-90" />
            <h2 class="text-xl font-semibold m-0">Liste des Tâches à faire</h2>
            <q-badge 
              :label="todos.length" 
              color="white" 
              text-color="negative"
              class="font-semibold px-3 py-1 rounded-xl text-sm"
            />
          </div>
        </div>
        <div class="p-4">
          <transition-group name="list-fade" tag="div" class="flex flex-col gap-2">
            <router-link 
              v-for="item in todos"
              :key="item.id"
              :to="`/todo`" 
              class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 text-decoration-none transition-all duration-300 ease-out relative overflow-hidden group hover:from-orange-50 hover:to-amber-100 hover:border-amber-500 hover:translate-x-1 hover:shadow-lg hover:shadow-amber-500/15"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-amber-500 transition-all duration-300"></div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm text-gray-800 mb-2">{{ item.text }}</div>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in item.tags"
                    :key="tag"
                    class="px-2 py-1 rounded-md bg-white text-xs font-medium text-gray-700 shadow-sm"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <q-icon name="chevron_right" size="20px" class="text-gray-400 transition-all duration-300 ml-4 group-hover:text-amber-600 group-hover:translate-x-1" />
            </router-link>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.list-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.list-fade-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
