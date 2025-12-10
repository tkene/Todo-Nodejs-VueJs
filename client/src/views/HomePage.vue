<script setup>
import { useRouter } from 'vue-router'
import StatCard from '../components/StatCard.vue'
import ListCard from '../components/ListCard.vue'

const router = useRouter()

const stats = [
  { label: 'Candidatures', value: 12 },
  { label: 'Réponses', value: 4 },
  { label: 'Entretiens', value: 2 },
  { label: 'Offres', value: 1 }
]

const reminders = [
  { id: 1, company: 'Google', date: '12/01' },
  { id: 2, company: 'Amazon', date: '14/01' }
]

const todos = [
  { id: 1, text: 'Tâche 1', tags: ['Tag 1', 'Tag 2'] },
  { id: 2, text: 'Tâche 2', tags: ['Tag 3', 'Tag 4'] }
]

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
      v-if="reminders.length > 0"
      title="Relances à faire"
      :items="reminders" bg-color="info">
      <template #default="{ item }">
        <router-link :to="`/job-details/${item.id}`" class="w-full">
          <div :key="item.id" class="w-full">
            <q-item-section>{{ item.company }}</q-item-section>
            <q-item-section side>{{ item.date }}</q-item-section>
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
