<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '../components/StatCard.vue'
import ListCard from '../components/ListCard.vue'
import { getJobs } from '../api/Job'
import { getTodos } from '../api/Todos'
import { STATUS_COLORS } from '../constants/jobStatuses'
import { formatDate } from '../utils/function'

const router = useRouter()
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
      { label: 'Candidatures', value: jobs.value.length },
      { label: 'Réponses', value: jobs.value.filter(j => j.status === 'Offre').length },
      { label: 'Entretiens', value: jobs.value.filter(j => j.status === 'Entretien').length },
      { label: 'Tâches à faire', value: todos.value.length }
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
  <div class="q-pa-md">
    <div class="row q-col-gutter-lg">
      <StatCard
        v-for="card in stats"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        @click="handleCardClick"
      />
    </div>

    <ListCard 
      v-if="jobs.length > 0"
      title="Relances à faire"
      :items="jobs" bg-color="info">
      <template #default="{ item }">
        <router-link 
          :to="`/job-details/${item.id}`" 
          class="w-full text-decoration-none"
        >
          <div :key="item.id" class="row items-center w-full q-pa-sm">
            <q-item-section>
              <div class="flex items-center q-gutter-sm">
              <q-badge 
                :color="statusColors[item.status] || 'grey'" 
                :label="item.status || 'Non défini'" 
                class="text-body2"
              />
              <span class="text-body2">{{ item.company?.toUpperCase() }} / {{ item.job }}</span>
              </div>
            </q-item-section>
            <q-item-section side>{{ formatDate(item.date) }}</q-item-section>
          </div>
        </router-link>
      </template>
    </ListCard>

    <ListCard 
      v-if="todos.length > 0"
      title="Liste des Tâches à faire"
      :items="todos" bg-color="accent">
      <template #default="{ item }">
        <router-link :to="`/todo`" class="w-full">
          <div :key="item.id" class="w-full flex items-center justify-between">
            <q-item-section>
              <q-item-label>{{ item.text }}</q-item-label>
            </q-item-section>
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="tag in item.tags"
                :key="tag"
                class="px-3 py-1 rounded-md bg-gray-100">
                {{ tag }}
              </div>
            </div>
          </div>
        </router-link>
      </template>
    </ListCard>
  </div>
</template>
